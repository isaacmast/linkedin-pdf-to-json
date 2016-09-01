// JavaScript recursive descent parser for storing text retrieved from LinkedIn profile PDFs in JSON format.
// Author: Isaac Mast <isaac.k.mast@gmail.com> [https://github.com/isaacmast]
// GitHub repo: https://github.com/isaacmast/linkedin-pdf-to-json

var linkedinPdfToJson = (function() {

    var jsonfile = require('jsonfile');
    var pdfText = require('pdf-text');

    var CONTENT, // the string array retrieved from pdf-text module, but after the removal of page numbers
        bold, // a boolean variable that determines if the current text chunk is bold
        index = 0, // the current index of the CONTENT array
        count = -1, // a count variable for convenience
        json = {}, // the JSON object to hold the parsed data
        last, // the previously parsed text string
        section, // the current section of the PDF
        text, // the current text string being parsed
        token = 'START', // the current token
        PATH_TO_PDF = process.argv[2], // the path to be parsed PDF passed from the command line
        outputPath = process.argv[3]; // the path to the JSON file that will contain the parsed text from the PDF

    // possible section headers that are currently supported
    var SECTION_HEADERS = {
        'Summary': 'bio',
        'Languages': 'languages',
        'Education': 'education',
        'Experience': 'workExperience',
        'Skills & Expertise': 'skills',
        'Volunteer Experience': 'volunteerExperience',
        'Unsupported': 'unsupported'
    };

    // currently unsupported sections
    var UNSUPPORTED_SECTIONS = ['Publications', 'Projects', 'Certifications', 'Organizations', 'Test Scores', 'Specialties', 'Honors and Awards', 'Interests', 'Courses', 'recommendations'];

    // available token values
    var TOKENS = {
        'EOF': 'eof',
        'SECTION_HEADER': 'section_header',
        'NAME': 'name',
        'JOB_TITLE': 'job_title',
        'JOB_DATE': 'date_range',
        'JOB_DURATION': 'duration',
        'SECTION_CONTENT': 'section_content',
        'SCHOOL': 'school',
        'EDU_BASIC_INFO': 'basic_info',
        'EDU_GRADE_LABEL': 'grade',
        'EDU_GRADE': 'grade_received',
        'EDU_ACTIVITIES_SOCIETIES_LABEL': 'activities_and_societies',
        'EDU_ACTIVITY_OR_SOCIETY': 'activity_or_society',
        'SKILL': 'skill',
        'LANGUAGE': 'language',
        'LANGUAGE_PROFICIENCY': 'proficiency',
        'UNSUPPORTED': 'unsupported',
        'UNKNOWN': 'unknown'
    };

    if (!PATH_TO_PDF) {
        return console.error('linkedin-pdf-to-json NotFoundError: must specify a path to a file');
    }

    // Retrieves the text from the PDF, storing each line as an element in the chunks string array.
    pdfText(PATH_TO_PDF, function(error, chunks) {
        if (error) {
            return console.error(error);
        }

        // console.log(chunks);
        // console.log();
        console.log('Parsing (' + chunks[2].text + ')...');
        this.parse(chunks);

        if (outputPath) {
            jsonfile.writeFile(outputPath, json, {
                spaces: 4
            }, function(err) {
                return console.error(err);
            });
        } else {
            return console.log(JSON.stringify(json, null, 4));
        }
        console.log();
        console.log('...parsing complete');
    });

    //===========================
    // GRAMMAR LOGIC
    //===========================

    // Parses the PDF using the chunks array retrieved from the pdf-text node module
    this.parse = function(chunks) {
        // console.log('ZZZ PARSE');
        this.sanitize(chunks);
        CONTENT = chunks;
        this.setBasicInfo();
        this.getNextToken();
        while (token !== TOKENS.EOF) {
            if (token === TOKENS.SECTION_HEADER || token === TOKENS.UNSUPPORTED || token === TOKENS.UNKNOWN) {
                this.section();
            } else {
                this.error();
            }
        }
        // console.log('ZZZ END PARSE');
    };

    // Parses a section of the PDF.
    this.section = function() {
        // console.log('ZZZ SECTION');
        // console.log('section = ' + section);
        if (section !== 'unsupported') {
            json[section] = json[section] || {};
        }
        if (section === SECTION_HEADERS.Summary) {
            this.getNextToken();
            if (token === TOKENS.SECTION_CONTENT) {
                json[section] = [];
                this.summary();
            } else {
                this.error();
            }
        } else if (section === SECTION_HEADERS.Education) {
            this.getNextToken();
            if (token === TOKENS.SCHOOL) {
                json[section] = [];
                while (token === TOKENS.SCHOOL) {
                    count++;
                    console.log('count = ' + count);
                    this.education();
                }
                this.resetCount();
            } else {
                this.error();
            }
        } else if (section === SECTION_HEADERS.Experience || section === SECTION_HEADERS['Volunteer Experience']) {
            this.getNextToken();
            if (token === TOKENS.JOB_TITLE) {
                json[section] = [];
                while (token === TOKENS.JOB_TITLE) {
                    count++;
                    this.job();
                }
                this.resetCount();
            } else {
                this.error();
            }
        } else if (section === SECTION_HEADERS.Languages) {
            this.getNextToken();
            if (token === TOKENS.LANGUAGE) {
                while (section === SECTION_HEADERS.Languages) {
                    this.languages();
                }
            } else {
                this.error();
            }
        } else if (section === SECTION_HEADERS['Skills & Expertise']) {
            this.getNextToken();
            if (token === TOKENS.SKILL) {
                this.skillsAndExpertise();
            } else {
                this.error();
            }

            // TODO: Implement the rest of the unsupported sections
            // This marks the start of the unsupported sections
            // See global UNSUPPORTED_SECTIONS variable at the top for a list of
            // all the unsupported sections.
        } else if (token === TOKENS.UNSUPPORTED || token === TOKENS.UNKNOWN) {
            json[section] = json[section] || [];
            while (token === TOKENS.UNSUPPORTED || token === TOKENS.UNKNOWN) {
                if (json[section].indexOf(text) === -1) { // check is mainly for '...........' section separators to avoid redundant '.' elements
                    json[section].push(text);
                }
                this.getNextToken();
            }
        } else {
            this.error();
        }
        // console.log('ZZZ END SECTION');
    };

    // Parses the summary section of the PDF.
    // For description fields in a LinkedIn profile section, the user may choose to format their descriptions
    // by outlining them with letters or numbers or by using bullet points/bullet-like symbols e.g. 1., a., -, •, #, ~, * .
    // The goal of this function is to retain that user defined formatting by putting each bulleted line in its own object property.
    // For non-formatted descriptions the text is simply concatenated into a single string.
    this.summary = function() {
        // console.log('ZZZ SUMMARY');
        var textCount = -1;
        var inBulleted = false;
        var hasBulleted = this.hasBulletedText();
        if (hasBulleted) {
            while (token === TOKENS.SECTION_CONTENT) {
                var bulleted = this.isBulleted();
                if (bulleted) {
                    inBulleted = true;
                    textCount++;
                    json[section][textCount] = text;
                } else if (inBulleted && text.match(/^\s\S/)) {
                    json[section][textCount] = json[section][textCount] + text;
                } else {
                    inBulleted = false;
                    textCount++;
                    json[section][textCount] = text;
                }
                this.getNextToken();
            }
        } else {
            textCount++;
            while (token === TOKENS.SECTION_CONTENT) {
                var summaryText = json[section][textCount];
                json[section][textCount] = summaryText ? summaryText + text : text;
                this.getNextToken();
            }
        }
        // console.log('ZZZ END SUMMARY');
    };

    // Parses the Education section of the PDF.
    // Individual education sections only require an institution name, so any additional section info needs
    // to be parsed in separate IF statements since none of it is guaranteed to be present.
    this.education = function() {
        // console.log('ZZZ EDUCATION');
        var currentSection = section;
        json[currentSection][count] = json[currentSection][count] || {};
        json[currentSection][count].school = text;
        this.getNextToken();
        if (token === TOKENS.EDU_BASIC_INFO) {
            var basicInfo = '';
            while (token === TOKENS.EDU_BASIC_INFO) {
                basicInfo += text;
                this.getNextToken();
            }
            json[currentSection][count].basicInfo = basicInfo.split(/\,\s*/);
        }
        if (token === TOKENS.EDU_GRADE_LABEL) {
            this.getNextToken();
            if (token === TOKENS.EDU_GRADE) {
                json[currentSection][count].grade = text;
            } else {
                this.error();
            }
            this.getNextToken();
        }
        if (token === TOKENS.EDU_ACTIVITIES_SOCIETIES_LABEL) {
            this.getNextToken();
            if (token === TOKENS.EDU_ACTIVITY_OR_SOCIETY) {
                json[currentSection][count].activitiesAndSocieties = '';
                while (token === TOKENS.EDU_ACTIVITY_OR_SOCIETY) {
                    json[currentSection][count].activitiesAndSocieties += text;
                    this.getNextToken();
                }
            } else {
                this.error();
            }
        }
        // console.log('ZZZ END EDUCATION');
    };

    // Creates and populates a new JSON job object under the appropriate section header.
    // For description fields in a LinkedIn profile section, the user may choose to format their descriptions
    // by outlining them with letters or numbers or by using bullet points/bullet-like symbols e.g. 1., a., -, •, #, ~, * .
    // The goal of this function is to retain that user defined formatting by putting each text chunk in its own object property if the
    // job description contains bulleted text.
    // For non-formatted descriptions the text is simply concatenated into a single string.
    this.job = function() {
        // console.log('ZZZ JOB');
        var currentSection = section;
        var currentTitle = '';
        json[currentSection][count] = json[section][count] || {};
        // TODO: Look into volunteer experience with job title, organization, and description,
        // but no date range specified. See JacobStelman.pdf for example.
        while (token === TOKENS.JOB_TITLE && token !== TOKENS.JOB_DATE) {
            currentTitle += text;
            this.getNextToken();
        }
        var titleAndOrganization = currentTitle.trim().split(/\s{2,}at\s{2,}/);
        if (titleAndOrganization.length === 2) {
            json[currentSection][count].jobTitle = titleAndOrganization[0];
            json[currentSection][count].organization = titleAndOrganization[1];
        } else {
            this.error();
        }
        if (token === TOKENS.JOB_DATE) {
            var dates = text.trim().split(/\s{2,}\-\s{2,}/);
            if (dates.length === 2) {
                json[section][count].startDate = dates[0];
                json[section][count].endDate = dates[1];
            } else {
                this.error();
            }
            this.getNextToken();
            if (token === TOKENS.JOB_DURATION) {
                var splits = text.split(/[()]/);
                if (splits.length === 3) {
                    var amount = splits[1];
                    json[section][count].duration = amount;
                } else {
                    this.error();
                }
                this.getNextToken();
            }
        }
        if (token === TOKENS.SECTION_CONTENT) {
            json[section][count].responsibilities = json[section][count].responsibilities || [];
            var textCount = -1;
            var inBulleted = false;
            var hasBulleted = this.hasBulletedText();
            if (hasBulleted) {
                while (token === TOKENS.SECTION_CONTENT) {
                    var bulleted = this.isBulleted();
                    if (bulleted) {
                        inBulleted = true;
                        textCount++;
                        json[section][count].responsibilities[textCount] = text;
                    } else if (inBulleted && text.match(/^\s\S/)) {
                        json[section][count].responsibilities[textCount] = json[section][count].responsibilities[textCount] + text;
                    } else {
                        inBulleted = false;
                        textCount++;
                        json[section][count].responsibilities[textCount] = text;
                    }
                    this.getNextToken();
                }
            } else {
                textCount++;
                while (token === TOKENS.SECTION_CONTENT) {
                    var jobText = json[section][count].responsibilities[textCount];
                    json[section][count].responsibilities[textCount] = jobText ? jobText + text : text;
                    this.getNextToken();
                }
            }
        }
        // console.log('ZZZ END JOB');
    };

    // Parses the languages section of a LinkedIn profile PDF.
    // The language section is fairly straightforward and simple with the name of the language listed
    // and the proficiency immediately afterwards if it's available.
    this.languages = function() {
        // console.log('ZZZ LANGUAGES');
        json[section] = [];
        var languageCount = -1;
        while (token === TOKENS.LANGUAGE) {
            languageCount++;
            json[section][languageCount] = json[section][languageCount] || {};
            json[section][languageCount][TOKENS.LANGUAGE] = text;
            this.getNextToken();
            if (token === TOKENS.LANGUAGE_PROFICIENCY) {
                json[section][languageCount][TOKENS.LANGUAGE_PROFICIENCY] = text;
                this.getNextToken();
            }
        }
        // console.log('ZZZ END LANGUAGES');
    };

    // Parses the skills section of a LinkedIn profile PDF.
    this.skillsAndExpertise = function() {
        // console.log('ZZZ SKILLS');
        json[section] = [];
        while (token === TOKENS.SKILL) {
            json[section].push(text);
            this.getNextToken();
        }
        // console.log('ZZZ END SKILLS');
    };

    //===========================
    // GENERATORS/SETTERS/HELPERS
    //===========================

    // Resets the job count to 0.
    this.resetCount = function() {
        count = -1;
    };

    // Removes unnecessary 'Page' and '{0}' elements and 'Contact {person} on LinkedIn' element from chunks array.
    // @param chunks - array of string elements representing the top-to-bottom
    //              flow of text from the PDF.
    this.sanitize = function(chunks) {
        for (var i = 0; i < chunks.length; i++) {
            if (chunks[i].text === 'Page' && chunks[i + 1].text.match(/\d+/)) {
                chunks.splice(i, 2);
            }
        }
        chunks.splice(chunks.length - 1, 1);
    };

    // Sets the name, current job, and potentially email properties of the json object
    // based on the PDF text.
    // The email property may not be set if it's not provided in the PDF.
    // These properties can just be assumed since it's standard across all LinkedIn profile PDFs.
    this.setBasicInfo = function() {
        json.name = CONTENT[index].text;
        index++;
        json.currentJob = CONTENT[index].text;
        if (!this.isSectionHeader(CONTENT[index + 1].text) && UNSUPPORTED_SECTIONS.indexOf(CONTENT[index + 1].text) === -1) {
            index++;
            json.email = CONTENT[index].text;
        }
    };

    // Searches through the current job description for bulleted text.
    // @return true if a text chunk from the current job description is bulleted.
    // @return false otherwise.
    this.hasBulletedText = function() {
        // console.log('ZZZ HAS_BULLETED_TEXT');
        var currentToken = token,
            currentText = text,
            currentSection = section,
            currentIndex = index;
        while (token === TOKENS.SECTION_CONTENT) {
            if (this.isBulleted()) {
                token = currentToken;
                text = currentText;
                section = currentSection;
                index = currentIndex;
                // console.log('ZZZ END HAS_BULLETED_TEXT (true)');
                return true;
            }
            this.getNextToken();
        }
        token = currentToken;
        text = currentText;
        section = currentSection;
        index = currentIndex;
        // console.log('ZZZ END HAS_BULLETED_TEXT (false)');
        return false;
    };

    //===========================
    // TOKEN CHECKS
    //===========================

    // TODO: Simplify by using subsections for grade, activities, etc.
    // Determines the next token based on the next text chunk
    this.getNextToken = function() {
        index++;
        last = CONTENT[index];
        text = CONTENT[index] && CONTENT[index].text || undefined;
        bold = CONTENT[index] && CONTENT[index].bold || false;
        // console.log();
        // console.log(JSON.stringify(json, null, 4));
        // console.log('Setting token...');
        // console.log('previous token = ' + token);
        // console.log('previous section = ' + section);
        // console.log('text = ' + '"' + text + '"');
        // console.log('bold = ' + bold);
        if (this.isEndOfFile()) {
            token = section = TOKENS.EOF;
            section = SECTION_HEADERS.Unsupported;
        } else if (this.isSectionHeader()) {
            token = TOKENS.SECTION_HEADER;
            section = SECTION_HEADERS[text.trim()];
        } else if (this.isUnsupported()) {
            token = TOKENS.UNSUPPORTED;
            section = SECTION_HEADERS.Unsupported;
        } else if (this.isInUnsupported()) {
            token = TOKENS.UNKNOWN;
        } else if (section === SECTION_HEADERS.Summary) {
            if (this.isSectionContent()) {
                token = TOKENS.SECTION_CONTENT;
            } else {
                this.error(true);
            }
        } else if (section === SECTION_HEADERS.Education) {
            if (this.isSchool()) {
                token = TOKENS.SCHOOL;
            } else if (this.isGradeLabel()) {
                token = TOKENS.EDU_GRADE_LABEL;
            } else if (this.isGrade()) {
                token = TOKENS.EDU_GRADE;
            } else if (this.isActivitiesAndSocietiesLabel()) {
                token = TOKENS.EDU_ACTIVITIES_SOCIETIES_LABEL;
            } else if (this.isActivityOrSociety()) {
                token = TOKENS.EDU_ACTIVITY_OR_SOCIETY;
            } else if (this.isEduBasicInfo()) {
                token = TOKENS.EDU_BASIC_INFO;
            } else {
                this.error(true);
            }
        } else if (section === SECTION_HEADERS.Experience || section === SECTION_HEADERS['Volunteer Experience']) {

            if (this.isJobTitle()) {
                token = TOKENS.JOB_TITLE;
            } else if (this.isDateRange()) {
                token = TOKENS.JOB_DATE;
            } else if (this.isJobDuration()) {
                token = TOKENS.JOB_DURATION;
            } else if (this.isSectionContent()) {
                token = TOKENS.SECTION_CONTENT;
            } else {
                this.error(true);
            }
        } else if (section === SECTION_HEADERS.Languages) {
            if (this.isLanguageProficiency()) {
                token = TOKENS.LANGUAGE_PROFICIENCY;
            } else if (this.isLanguage()) {
                token = TOKENS.LANGUAGE;
            } else {
                this.error(true);
            }
        } else if (section === SECTION_HEADERS['Skills & Expertise']) {
            if (this.isSkill()) {
                token = TOKENS.SKILL;
            } else {
                this.error(true);
            }
        } else {
            this.error(true);
        }
        // console.log('new section = ' + section);
        // console.log('new token = ' + token);
        // console.log('Token set!');
    };

    // Determines if the text chunk is preceded by a bullet/bullet-like symbol or outlined with numbers or letters e.g. •, -, A., 1., etc.
    // @param previous (optional) - a specific text chunk to evaluate.
    // @return true if the chunk has been preceded by a bullet or bullet-like symbol.
    // @return false otherwise.
    this.isBulleted = function(previous) {
        var chunk = previous || text;
        return chunk.match(/^([A-z0-9](?=\.)|[\-\•\#\~\*])/);
    };

    // Checks if the text chunk is the end of the file.
    // @return true if the text chunk is the end of the file i.e. undefined.
    // @return false otherwise.
    this.isEndOfFile = function() {
        return !text;
    };

    // Determines whether the passed in text chunk is a LinkedIn profile section header.
    // @param chunk (optional) - a specific text chunk to evaluate.
    // @return true if text chunk is present in SECTION_HEADERS object.
    // @return false otherwise.
    this.isSectionHeader = function(chunk) {
        chunk = chunk || text;
        return SECTION_HEADERS.hasOwnProperty(chunk.trim());
    };

    // Checks if the text chunk is a section that is currently unsupported
    // @return true if the text chunk is the section header of an unsupported section.
    // @return false otherwise.
    this.isUnsupported = function() {
        var chunk = text;
        if (chunk === json.name && CONTENT[index + 1].text === json.currentJob) {
            chunk = 'recommendations';
        }
        return chunk ? UNSUPPORTED_SECTIONS.indexOf(chunk.trim()) !== -1 : false;
    };

    this.isInUnsupported = function() {
        return token === TOKENS.UNSUPPORTED || token === TOKENS.UNKNOWN;
    };

    // Checks if the text chunk is a skill.
    // @return true if the text chunk is a skill under the Skills & Expertise section.
    // @return false otherwise.
    this.isSkill = function() {
        return (token === TOKENS.SKILL || token === TOKENS.SECTION_HEADER) && section === SECTION_HEADERS['Skills & Expertise'];
    };

    // Checks if the text chunk is a school.
    this.isSchool = function() {
        // && (token === TOKENS.SCHOOL || token === TOKENS.EDU_BASIC_INFO || token === TOKENS.EDU_GRADE || token === TOKENS.EDU_ACTIVITY_OR_SOCIETY)
        return bold && section === SECTION_HEADERS.Education;
    };

    // Checks if the text chunk is the grade label.
    // @return true if the text chunk is the grade label in an Education experience section.
    // @return false otherwise.
    this.isGradeLabel = function() {
        return text.match(/^Grade:/);
    };

    // Checks if the text chunk a grade.
    // @return true if the text chunk is the grade in an Education experience section.
    // @return false otherwise.
    this.isGrade = function() {
        return token === TOKENS.EDU_GRADE_LABEL;
    };

    // Checks if the text chunk is the Actvities and Societies label.
    // @return true if the text chunk is the Activites and Societies label in an Education experience section.
    // @return false otherwise.
    this.isActivitiesAndSocietiesLabel = function() {
        return text.match(/^Activities and Societies:/);
    };

    // Checks if the text chunk is an activity or society.
    // @return true if the text chunk is an activity or society listed in the Activities and Societies section of an Education section.
    // @return false otherwise.
    this.isActivityOrSociety = function() {
        return token === TOKENS.EDU_ACTIVITIES_SOCIETIES_LABEL || token === TOKENS.EDU_ACTIVITY_OR_SOCIETY;
    };

    // Checks if the text chunk is the basic info of an education section
    // NOTE: This token check needs to come after all the other education section token checks because of it's simplicity.
    // @return true if the text chunk is the basic info of an Education experience section.
    // @return false otherwise.
    this.isEduBasicInfo = function() {
        return token === TOKENS.SCHOOL || token === TOKENS.EDU_BASIC_INFO;
    };

    // Checks if the text chunk is a job title.
    // Job titles follow this general format: 'job_title  at   company'.
    // NOTE: LinkedIn PDF job titles have two spaces before and three spaces after the 'at'.
    // Job titles are also required by LinkedIn to fill out an Experience or Volunteer Experience section.
    // @return true if the text chunk is the job title of the currently parsed job.
    // @return false otherwise.
    this.isJobTitle = function() {
        if (section === SECTION_HEADERS.Experience) {
            return bold && (token === TOKENS.SECTION_HEADER || token === TOKENS.JOB_DURATION || token === TOKENS.SECTION_CONTENT || token === TOKENS.JOB_TITLE);
            // return ((token === TOKENS.SECTION_HEADER || token === TOKENS.SECTION_CONTENT || token === TOKENS.JOB_DURATION || token === TOKENS.JOB_DATE) && text.match(/\s{2,}at\s{2,}/)) || (token === TOKENS.JOB_TITLE && !this.isDateRange());
        } else if (section === SECTION_HEADERS['Volunteer Experience']) {
            return bold && (token === TOKENS.SECTION_HEADER || token === TOKENS.JOB_DATE || token === TOKENS.SECTION_CONTENT || token === TOKENS.JOB_TITLE);
            // return (bold && text.match(/\s{2,}at\s{2,}/) && token === TOKENS.SECTION_HEADER || token === TOKENS.JOB_DATE || token === TOKENS.JOB_DURATION || token === TOKENS.SECTION_CONTENT) || (bold && token === TOKENS.JOB_TITLE);
        }
        return false;
    };

    // Checks if the text chunk is a job date range e.g. 'September 2014  -  December 2014'.
    // Job dates follow this general format: '[month_name] year  -  [present|[[month_name] year]]]'.
    // NOTE: Job dates are required by LinkedIn to fill out an Experience section, but not Volunteer Experience.
    // This is also used when parsing the Education section to gather basic education info.
    // @param chunk (optional) - a specific text chunk to evaluate.
    // @return true if the text chunk is a date range of the currently parse job.
    // @return false otherwise.
    this.isDateRange = function(chunk) {
        chunk = chunk || text;
        return (token === TOKENS.JOB_TITLE || token === TOKENS.EDU_BASIC_INFO) && chunk.match(/^\w*\s*\d+\s+\-\s+\w*\s*\d*/);
    };

    // Checks if the text chunk is a job period e.g. '(1 year 2 months)'.
    // Job periods follow this general format: '(number month(s)|year)|(number year(s)[ number month(s)])'.
    // NOTE: Job durations are always present for jobs since they are calculated by LinkedIn based on the job date,
    // which is required by LinkedIn to fill out an Experience or Volunteer Experience section.
    // @return true if the text chunk is a time duration of the currently parsed job.
    // @return false otherwise.
    this.isJobDuration = function() {
        return token === TOKENS.JOB_DATE && text.match(/\(\d+\s\w+\s*\d*\s*\w*\)|^\(less than a year\)/);
    };

    // Checks if the text chunk is the proficiency level of a language.
    // @return true if the text chunk is the proficiency level of a language in the Languages section.
    // @return false otherwise.
    this.isLanguageProficiency = function() {
        return token === TOKENS.LANGUAGE && text.match(/proficiency\)$/);
    };

    // Checks if the text chunk is a language.
    // @return true if the text chunk is a language listed under the Languages section.
    // @return false otherwise.
    this.isLanguage = function() {
        return (section === SECTION_HEADERS.Languages || token === TOKENS.LANGUAGE);
    };

    // Checks if the text chunk is part of a section.
    // @return true if the text chunk is part the current sections text content
    // @return false otherwise.
    this.isSectionContent = function() {
        if (section === SECTION_HEADERS['Volunteer Experience']) {
            return !bold && (token === TOKENS.JOB_TITLE || token === TOKENS.JOB_DURATION || token === TOKENS.JOB_DATE || token === TOKENS.SECTION_CONTENT || token === TOKENS.SECTION_HEADER);
        }
        return !bold && (token === TOKENS.JOB_DURATION || token === TOKENS.JOB_DATE || token === TOKENS.SECTION_CONTENT || token === TOKENS.SECTION_HEADER);
    };

    //===========================
    // ERROR HANDLING
    //===========================

    // Throws a runtime parsing error to the console.
    // @param tokenError (optional) - boolean flag for registering a token processing error rather than a normal parsing error.
    this.error = function(tokenError) {
        tokenError && this.tokenError() || this.parsingError();
    };

    // Throws an error resultant of an error during a call to getNextToken().
    // @throw TokenError with the name of the person and the text chunk that caused the error to be thrown.
    this.tokenError = function() {
        throw 'linkedin-pdf-to-json TokenError: (' + json.name + ') Unable to set token for the following text chunk: \'' + text + '\'';
    };

    // Throws an error resultant of an error during parsing.
    // @throw ParsingError with the name of the person and the text chunk that caused the error to be thrown.
    this.parsingError = function() {
        throw 'linkedin-pdf-to-json ParsingError: (' + json.name + ') Unable to parse the following text chunk: \'' + text + '\'';
    };
})();

module.exports = linkedinPdfToJson;