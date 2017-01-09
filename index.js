// JavaScript recursive descent parser for storing text retrieved from LinkedIn profile PDFs in JSON format.
// Author: Isaac Mast <isaac.k.mast@gmail.com> [https://github.com/isaacmast]
// GitHub repo: https://github.com/isaacmast/linkedin-pdf-to-json

var jsonfile = require('jsonfile');

module.exports = LinkedInPdfToJson;

function LinkedInPdfToJson() {

    this.bold = false; // a boolean variable that determines if the current text chunk is bold
    this.content = []; // the array of objects retrieved from pdf-text module
    this.count = -1; // a count variable for keeping track of the number of entries in a section
    this.index = 0; // the current index of the content array
    this.json = {}; // the object to hold the parsed data
    this.last = {}; // object to hold data about the previous chunk
    this.parsingErrorMsg = 'LinkedInPdfToJson ParsingError: could not successfully parse the following text chunk: ';
    this.pdf = undefined; // the path to the PDF to parse
    this.pdfText = require('pdf-text'); // import pdf-text module
    this.section = undefined; // the current section of the PDF
    this.target = undefined; // the target path for the JSON file
    this.text = undefined; // the current text string being parsed
    this.token = 'START'; // the current token
    this.tokenErrorMsg = 'LinkedInPdfToJson TokenError: could not successfully set the token for the following text chunk: ';
    this.whiteSpace = 4; // white space amount in output JSON
    this.y = undefined;

    // possible section headers that are currently supported
    this.SECTION_HEADERS = {
        'Summary': 'bio',
        'Languages': 'languages',
        'Education': 'educationExperience',
        'Experience': 'workExperience',
        'Skills & Expertise': 'skills',
        'Volunteer Experience': 'volunteerExperience',
        'Unsupported': 'unsupported'
    };

    // currently unsupported sections
    this.UNSUPPORTED_SECTIONS = ['Publications', 'Projects', 'Certifications', 'Organizations', 'Test Scores', 'Specialties', 'Honors and Awards', 'Interests', 'Courses', 'recommendations', 'Patents'];

    // available token values
    this.TOKENS = {
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
}

// Main runner function
LinkedInPdfToJson.prototype.run = function(source, target, options) {
    this.pdf = source;
    this.target = target;
    this.whiteSpace = options.space || this.whiteSpace;
    var linkedinPdfToJson = this;

    // Callback function for the pdf-text module.
    // This function starts the first call to actually parse the chunks array.
    this.pdfText(source, function(error, chunks) {
        if (error) {
            throw new Error('LinkedInPdfToJson: invalid PDF file');
        }

        // console.log(chunks);
        // console.log();
        // console.log('Parsing (' + linkedinPdfToJson.pdf + ')...');
        linkedinPdfToJson.parse(chunks);

        if (linkedinPdfToJson.target) {
            jsonfile.writeFile(linkedinPdfToJson.target, linkedinPdfToJson.json, {
                spaces: linkedinPdfToJson.whiteSpace
            }, function(err) {
                if (err) {
                    throw new Error('LinkedInPdfToJson: could not successfully write JSON to file');
                }
                return;
            });
        } else {
            return console.log(JSON.stringify(linkedinPdfToJson.json, null, linkedinPdfToJson.whiteSpace));
        }
    });
};

//===========================
// GRAMMAR LOGIC
//===========================

// Parses the PDF using the chunks array retrieved from the pdf-text node module
LinkedInPdfToJson.prototype.parse = function(chunks) {
    // console.log('ZZZ PARSE');
    this.sanitize(chunks);
    this.content = chunks;
    this.setBasicInfo();
    this.getNextToken();
    while (this.token !== this.TOKENS.EOF) {
        if (this.token === this.TOKENS.SECTION_HEADER || this.token === this.TOKENS.UNSUPPORTED || this.token === this.TOKENS.UNKNOWN) {
            this.parseSection();
        } else {
            throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
        }
    }
    // console.log('ZZZ END PARSE');
};

// Parses a section of the PDF.
LinkedInPdfToJson.prototype.parseSection = function() {
    // console.log('ZZZ SECTION');
    // console.log('section = ' + this.section);
    if (this.section !== 'unsupported') {
        this.json[this.section] = this.json[this.section] || {};
    }
    if (this.section === this.SECTION_HEADERS.Summary) {
        this.getNextToken();
        if (this.token === this.TOKENS.SECTION_CONTENT) {
            this.json[this.section] = [];
            this.parseSummary();
        } else {
            throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
        }
    } else if (this.section === this.SECTION_HEADERS.Education) {
        this.getNextToken();
        if (this.token === this.TOKENS.SCHOOL) {
            this.json[this.section] = [];
            while (this.token === this.TOKENS.SCHOOL) {
                this.count++;
                this.parseEducation();
            }
            this.resetCount();
        } else {
            throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
        }
    } else if (this.section === this.SECTION_HEADERS.Experience || this.section === this.SECTION_HEADERS['Volunteer Experience']) {
        this.getNextToken();
        if (this.token === this.TOKENS.JOB_TITLE) {
            this.json[this.section] = [];
            while (this.token === this.TOKENS.JOB_TITLE) {
                this.count++;
                this.parseJob();
            }
            this.resetCount();
        } else {
            throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
        }
    } else if (this.section === this.SECTION_HEADERS.Languages) {
        this.getNextToken();
        if (this.token === this.TOKENS.LANGUAGE) {
            while (this.section === this.SECTION_HEADERS.Languages) {
                this.parseLanguages();
            }
        } else {
            throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
        }
    } else if (this.section === this.SECTION_HEADERS['Skills & Expertise']) {
        this.getNextToken();
        if (this.token === this.TOKENS.SKILL) {
            this.parseSkillsAndExpertise();
        } else {
            throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
        }

        // TODO: Implement the rest of the unsupported this.sections
        // This marks the start of the unsupported this.sections
        // See global UNSUPPORTED_SECTIONS variable at the top for a list of
        // all the unsupported this.sections.
    } else if (this.token === this.TOKENS.UNSUPPORTED || this.token === this.TOKENS.UNKNOWN) {
        this.json[this.section] = this.json[this.section] || [];
        while (this.token === this.TOKENS.UNSUPPORTED || this.token === this.TOKENS.UNKNOWN) {
            if (this.json[this.section].indexOf(this.text) === -1) { // check is mainly for '...........' section separators to avoid redundant '.' elements
                this.json[this.section].push(this.text);
            }
            this.getNextToken();
        }
    } else {
        throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
    }
    // console.log('ZZZ END SECTION');
};

// Parses the summary section of the PDF.
// For description fields in a LinkedIn profile section, the user may choose to format their descriptions
// by outlining them with letters or numbers or by using bullet points/bullet-like symbols e.g. 1., a., -, •, #, ~, * .
// The goal of this function is to retain that user defined formatting by putting each bulleted line in its own object property.
// For non-formatted descriptions the text is simply concatenated into a single string.
LinkedInPdfToJson.prototype.parseSummary = function() {
    // console.log('ZZZ SUMMARY');
    var textCount = -1;
    var inBulleted = false;
    // var hasBulleted = this.hasBulletedText();
    if (this.hasBulletedText()) {
        while (this.token === this.TOKENS.SECTION_CONTENT) {
            var bulleted = this.isBulleted();
            var newline = this.isSeparatedByNewline();
            if (bulleted || newline) {
                inBulleted = true;
                textCount++;
                this.json[this.section][textCount] = this.text;
            } else if (inBulleted && this.text.match(/^\s\S/)) {
                this.json[this.section][textCount] = this.json[this.section][textCount] + this.text;
            } else {
                textCount = textCount === -1 ? 0 : textCount;
                inBulleted = false;
                var text = this.json[this.section][textCount];
                if (text && text.match(/\S$/) && this.text.match(/^\S/)) {
                    text = text + ' ';
                }
                this.json[this.section][textCount] = text ? text + this.text : this.text;
            }
            this.getNextToken();
        }
    } else {
        textCount = 0;
        while (this.token === this.TOKENS.SECTION_CONTENT) {
            var summaryText = this.json[this.section][textCount];
            this.json[this.section][textCount] = summaryText ? summaryText + this.text : this.text;
            this.getNextToken();
        }
    }
    // console.log('ZZZ END SUMMARY');
};

// Parses the Education section of the PDF.
// Individual education sections only require an institution name, so any additional section info needs
// to be parsed in separate IF statements since none of it is guaranteed to be present.
LinkedInPdfToJson.prototype.parseEducation = function() {
    // console.log('ZZZ EDUCATION');
    var currentSection = this.section;
    this.json[currentSection][this.count] = this.json[currentSection][this.count] || {};
    this.json[currentSection][this.count].school = this.text;
    this.getNextToken();
    if (this.token === this.TOKENS.EDU_BASIC_INFO) {
        var basicInfo = '';
        while (this.token === this.TOKENS.EDU_BASIC_INFO) {
            basicInfo += this.text;
            this.getNextToken();
        }
        this.json[currentSection][this.count].basicInfo = basicInfo.split(/\,\s*/);
        if (this.json[currentSection][this.count].basicInfo[0].match(/(Bachelor|B\.?A\.?|B\.?S\.?|A\.?B\.?|Master|Ph\.D\.)/)) {
            this.json[currentSection][this.count].degree = this.json[currentSection][this.count].basicInfo[0];
            this.json[currentSection][this.count].basicInfo.splice(0, 1);
        }
        var length = this.json[currentSection][this.count].basicInfo.length;
        if (this.json[currentSection][this.count].basicInfo[length - 1].match(/^\w*\s*\d+\s+\-\s+\w*\s*\d*/)) {
            var dates = this.json[currentSection][this.count].basicInfo[length - 1].split(/\s\-\s/);
            this.json[currentSection][this.count].startDate = dates[0];
            this.json[currentSection][this.count].endDate = dates[1];
            this.json[currentSection][this.count].basicInfo.splice(length - 1, 1);
        }
    }
    if (this.token === this.TOKENS.EDU_GRADE_LABEL) {
        this.getNextToken();
        if (this.token === this.TOKENS.EDU_GRADE) {
            this.json[currentSection][this.count].grade = this.text;
        } else {
            throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
        }
        this.getNextToken();
    }
    if (this.token === this.TOKENS.EDU_ACTIVITIES_SOCIETIES_LABEL) {
        this.getNextToken();
        if (this.token === this.TOKENS.EDU_ACTIVITY_OR_SOCIETY) {
            this.json[currentSection][this.count].activitiesAndSocieties = '';
            while (this.token === this.TOKENS.EDU_ACTIVITY_OR_SOCIETY) {
                this.json[currentSection][this.count].activitiesAndSocieties += this.text;
                this.getNextToken();
            }
        } else {
            throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
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
LinkedInPdfToJson.prototype.parseJob = function() {
    // console.log('ZZZ JOB');
    var currentSection = this.section;
    var currentTitle = '';
    this.json[currentSection][this.count] = this.json[this.section][this.count] || {};
    // TODO: Look into volunteer experience with job title, organization, and description,
    // but no date range specified. See JacobStelman.pdf for example.
    while (this.token === this.TOKENS.JOB_TITLE && this.token !== this.TOKENS.JOB_DATE) {
        currentTitle += this.text;
        this.getNextToken();
    }
    var titleAndOrganization = currentTitle.trim().split(/\s{2,}at\s{2,}/);
    if (titleAndOrganization.length === 2) {
        this.json[currentSection][this.count].jobTitle = titleAndOrganization[0];
        this.json[currentSection][this.count].organization = titleAndOrganization[1];
    } else {
        throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
    }
    if (this.token === this.TOKENS.JOB_DATE) {
        var dates = this.text.trim().split(/\s{2,}\-\s{2,}/);
        if (dates.length === 2) {
            this.json[this.section][this.count].startDate = dates[0];
            this.json[this.section][this.count].endDate = dates[1];
        } else {
            throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
        }
        this.getNextToken();
        if (this.token === this.TOKENS.JOB_DURATION) {
            var splits = this.text.split(/[()]/);
            if (splits.length === 3) {
                var amount = splits[1];
                this.json[this.section][this.count].duration = amount;
            } else {
                throw new Error(this.parsingErrorMsg + '\'' + this.text + '\'');
            }
            this.getNextToken();
        }
    }
    if (this.token === this.TOKENS.SECTION_CONTENT) {
        this.json[this.section][this.count].responsibilities = this.json[this.section][this.count].responsibilities || [];
        var textCount = -1;
        var inBulleted = false;
        if (this.hasBulletedText()) {
            while (this.token === this.TOKENS.SECTION_CONTENT) {
                var bulleted = this.isBulleted();
                var newline = this.isSeparatedByNewline();
                if (bulleted || newline) {
                    inBulleted = true;
                    textCount++;
                    this.json[this.section][this.count].responsibilities[textCount] = this.text;
                } else if (inBulleted && this.text.match(/^\s\S/)) {
                    this.json[this.section][this.count].responsibilities[textCount] = this.json[this.section][this.count].responsibilities[textCount] + this.text;
                } else {
                    textCount = textCount === -1 ? 0 : textCount;
                    inBulleted = false;
                    // var text = this.text.match(/^\S/) ? this.json[this.section][this.count].responsibilities[textCount] + ' ' : this.json[this.section][this.count].responsibilities[textCount];
                    var text = this.json[this.section][this.count].responsibilities[textCount];
                    if (text && text.match(/\S$/) && this.text.match(/^\S/)) {
                        text = text + ' ';
                    }
                    this.json[this.section][this.count].responsibilities[textCount] = text ? text + this.text : this.text;
                }
                this.getNextToken();
            }
        } else {
            textCount = 0;
            while (this.token === this.TOKENS.SECTION_CONTENT) {
                var jobText = this.json[this.section][this.count].responsibilities[textCount];
                this.json[this.section][this.count].responsibilities[textCount] = jobText ? jobText + this.text : this.text;
                this.getNextToken();
            }
        }
    }
    // console.log('ZZZ END JOB');
};

// Parses the languages section of a LinkedIn profile PDF.
// The language section is fairly straightforward and simple with the name of the language listed
// and the proficiency immediately afterwards if it's available.
LinkedInPdfToJson.prototype.parseLanguages = function() {
    // console.log('ZZZ LANGUAGES');
    this.json[this.section] = [];
    var languageCount = -1;
    while (this.token === this.TOKENS.LANGUAGE) {
        languageCount++;
        this.json[this.section][languageCount] = this.json[this.section][languageCount] || {};
        this.json[this.section][languageCount][this.TOKENS.LANGUAGE] = this.text;
        this.getNextToken();
        if (this.token === this.TOKENS.LANGUAGE_PROFICIENCY) {
            this.json[this.section][languageCount][this.TOKENS.LANGUAGE_PROFICIENCY] = this.text;
            this.getNextToken();
        }
    }
    // console.log('ZZZ END LANGUAGES');
};

// Parses the skills section of a LinkedIn profile PDF.
LinkedInPdfToJson.prototype.parseSkillsAndExpertise = function() {
    // console.log('ZZZ SKILLS');
    this.json[this.section] = [];
    while (this.token === this.TOKENS.SKILL) {
        this.json[this.section].push(this.text);
        this.getNextToken();
    }
    // console.log('ZZZ END SKILLS');
};

//===========================
// GENERATORS/SETTERS/HELPERS
//===========================

// Resets count to -1.
LinkedInPdfToJson.prototype.resetCount = function() {
    this.count = -1;
};

// Removes unnecessary 'Page' and '{0}' elements and 'Contact {person} on LinkedIn' element from chunks array.
// @param chunks - array of string elements representing the top-to-bottom
//              flow of text from the PDF.
LinkedInPdfToJson.prototype.sanitize = function(chunks) {
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
LinkedInPdfToJson.prototype.setBasicInfo = function() {
    this.json.name = this.content[this.index].text;
    this.index++;
    this.json.currentJob = this.content[this.index].text;
    if (!this.isSectionHeader(this.content[this.index + 1].text) && this.UNSUPPORTED_SECTIONS.indexOf(this.content[this.index + 1].text) === -1) {
        this.index++;
        this.json.email = this.content[this.index].text;
    }
};

LinkedInPdfToJson.prototype.setLastInfo = function() {
    this.last.bold = this.bold;
    this.last.index = this.index;
    this.last.section = this.section;
    this.last.text = this.text;
    this.last.token = this.token;
    this.last.y = this.y;
};

// Searches through the current job description for bulleted text.
// @return true if a text chunk from the current job description is bulleted.
// @return false otherwise.
LinkedInPdfToJson.prototype.hasBulletedText = function() {
    // console.log('ZZZ HAS_BULLETED_TEXT');
    var currentBold = this.bold,
        currentToken = this.token,
        currentText = this.text,
        currentSection = this.section,
        currentIndex = this.index,
        currentY = this.y;
    while (this.token === this.TOKENS.SECTION_CONTENT) {
        if (this.isBulleted() || this.isSeparatedByNewline()) {
            this.bold = currentBold;
            this.token = currentToken;
            this.text = currentText;
            this.section = currentSection;
            this.index = currentIndex;
            this.y = currentY;
            // console.log('ZZZ END HAS_BULLETED_TEXT (true)');
            return true;
        }
        this.getNextToken();
    }
    this.bold = currentBold;
    this.token = currentToken;
    this.text = currentText;
    this.section = currentSection;
    this.index = currentIndex;
    this.y = currentY;
    // console.log('ZZZ END HAS_BULLETED_TEXT (false)');
    return false;
};

//===========================
// TOKEN CHECKS
//===========================

// TODO: Simplify by using subsections for grade, activities, etc.
// Determines the next token based on the next text chunk
LinkedInPdfToJson.prototype.getNextToken = function() {
    this.setLastInfo();
    this.index++;
    this.text = this.content[this.index] && this.content[this.index].text || undefined;
    this.bold = this.content[this.index] && this.content[this.index].bold || false;
    this.y = this.content[this.index] && this.content[this.index].y || undefined;
    // console.log();
    // console.log(JSON.stringify(this.json, null, this.whiteSpace));
    // console.log('Setting token...');
    // console.log('previous token = ' + this.token);
    // console.log('previous section = ' + this.section);
    // console.log('text = ' + '"' + this.text + '"');
    // console.log('this.bold = ' + this.bold);
    if (this.isEOF()) {
        this.token = this.section = this.TOKENS.EOF;
        this.section = this.SECTION_HEADERS.Unsupported;
    } else if (this.isSectionHeader()) {
        this.token = this.TOKENS.SECTION_HEADER;
        this.section = this.SECTION_HEADERS[this.text.trim()];
    } else if (this.isUnsupported()) {
        this.token = this.TOKENS.UNSUPPORTED;
        this.section = this.SECTION_HEADERS.Unsupported;
    } else if (this.isInUnsupported()) {
        this.token = this.TOKENS.UNKNOWN;
    } else if (this.section === this.SECTION_HEADERS.Summary) {
        if (this.isSectionContent()) {
            this.token = this.TOKENS.SECTION_CONTENT;
        } else {
            throw new Error(this.tokenErrorMsg + '\'' + this.text + '\'');
        }
    } else if (this.section === this.SECTION_HEADERS.Education) {
        if (this.isSchool()) {
            this.token = this.TOKENS.SCHOOL;
        } else if (this.isGradeLabel()) {
            this.token = this.TOKENS.EDU_GRADE_LABEL;
        } else if (this.isGrade()) {
            this.token = this.TOKENS.EDU_GRADE;
        } else if (this.isActivitiesAndSocietiesLabel()) {
            this.token = this.TOKENS.EDU_ACTIVITIES_SOCIETIES_LABEL;
        } else if (this.isActivityOrSociety()) {
            this.token = this.TOKENS.EDU_ACTIVITY_OR_SOCIETY;
        } else if (this.isEduBasicInfo()) {
            this.token = this.TOKENS.EDU_BASIC_INFO;
        } else {
            throw new Error(this.tokenErrorMsg + '\'' + this.text + '\'');
        }
    } else if (this.section === this.SECTION_HEADERS.Experience || this.section === this.SECTION_HEADERS['Volunteer Experience']) {
        if (this.isJobTitle()) {
            this.token = this.TOKENS.JOB_TITLE;
        } else if (this.isDateRange()) {
            this.token = this.TOKENS.JOB_DATE;
        } else if (this.isJobDuration()) {
            this.token = this.TOKENS.JOB_DURATION;
        } else if (this.isSectionContent()) {
            this.token = this.TOKENS.SECTION_CONTENT;
        } else {
            throw new Error(this.tokenErrorMsg + '\'' + this.text + '\'');
        }
    } else if (this.section === this.SECTION_HEADERS.Languages) {
        if (this.isLanguageProficiency()) {
            this.token = this.TOKENS.LANGUAGE_PROFICIENCY;
        } else if (this.isLanguage()) {
            this.token = this.TOKENS.LANGUAGE;
        } else {
            throw new Error(this.tokenErrorMsg + '\'' + this.text + '\'');
        }
    } else if (this.section === this.SECTION_HEADERS['Skills & Expertise']) {
        if (this.isSkill()) {
            this.token = this.TOKENS.SKILL;
        } else {
            throw new Error(this.tokenErrorMsg + '\'' + this.text + '\'');
        }
    } else {
        throw new Error(this.tokenErrorMsg + '\'' + this.text + '\'');
    }
    // console.log('new section = ' + this.section);
    // console.log('new token = ' + this.token);
    // console.log('Token set!');
};

// Determines if the text chunk is preceded by a bullet/bullet-like symbol or outlined with numbers or letters e.g. •, -, A., 1., etc.
// @param previous (optional) - a specific text chunk to evaluate.
// @return true if the chunk has been preceded by a bullet or bullet-like symbol.
// @return false otherwise.
LinkedInPdfToJson.prototype.isBulleted = function(previous) {
    var chunk = previous || this.text;
    return chunk.match(/^([A-z0-9](?=\.)|[\-\•\#\~\*])/);
};

LinkedInPdfToJson.prototype.isSeparatedByNewline = function() {
    return this.content[this.index].y - this.last.y > 2;
};

// Checks if the text chunk is the end of the file.
// @return true if the text chunk is the end of the file i.e. undefined.
// @return false otherwise.
LinkedInPdfToJson.prototype.isEOF = function() {
    return !this.text;
};

// Determines whether the passed in text chunk is a LinkedIn profile section header.
// @param chunk (optional) - a specific text chunk to evaluate.
// @return true if text chunk is present in this.SECTION_HEADERS object.
// @return false otherwise.
LinkedInPdfToJson.prototype.isSectionHeader = function(chunk) {
    chunk = chunk || this.text;
    return this.SECTION_HEADERS.hasOwnProperty(chunk.trim());
};

// Checks if the text chunk is a section that is currently unsupported
// @return true if the text chunk is the section header of an unsupported section.
// @return false otherwise.
LinkedInPdfToJson.prototype.isUnsupported = function() {
    var chunk = this.text;
    if (chunk === this.json.name && this.content[this.index + 1].text === this.json.currentJob) {
        chunk = 'recommendations';
    }
    return chunk ? this.UNSUPPORTED_SECTIONS.indexOf(chunk.trim()) !== -1 : false;
};

// Checks if the text chunk is in a section that is currently unsupported
// @return true if the text chunk is in an unsupported section.
// @return false otherwise.
LinkedInPdfToJson.prototype.isInUnsupported = function() {
    return this.token === this.TOKENS.UNSUPPORTED || this.token === this.TOKENS.UNKNOWN;
};

// Checks if the text chunk is a skill.
// @return true if the text chunk is a skill under the Skills & Expertise section.
// @return false otherwise.
LinkedInPdfToJson.prototype.isSkill = function() {
    return (this.token === this.TOKENS.SKILL || this.token === this.TOKENS.SECTION_HEADER) && this.section === this.SECTION_HEADERS['Skills & Expertise'];
};

// Checks if the text chunk is a school.
// @return true if the text chunk is a school.
// @return false otherwise.
LinkedInPdfToJson.prototype.isSchool = function() {
    return this.bold && this.section === this.SECTION_HEADERS.Education;
};

// Checks if the text chunk is the grade label.
// @return true if the text chunk is the grade label in an Education experience section.
// @return false otherwise.
LinkedInPdfToJson.prototype.isGradeLabel = function() {
    return this.text.match(/^Grade:/);
};

// Checks if the text chunk a grade.
// @return true if the text chunk is the grade in an Education experience section.
// @return false otherwise.
LinkedInPdfToJson.prototype.isGrade = function() {
    return this.token === this.TOKENS.EDU_GRADE_LABEL;
};

// Checks if the text chunk is the Actvities and Societies label.
// @return true if the text chunk is the Activites and Societies label in an Education experience section.
// @return false otherwise.
LinkedInPdfToJson.prototype.isActivitiesAndSocietiesLabel = function() {
    return this.text.match(/^Activities and Societies:/);
};

// Checks if the text chunk is an activity or society.
// @return true if the text chunk is an activity or society listed in the Activities and Societies section of an Education section.
// @return false otherwise.
LinkedInPdfToJson.prototype.isActivityOrSociety = function() {
    return this.token === this.TOKENS.EDU_ACTIVITIES_SOCIETIES_LABEL || this.token === this.TOKENS.EDU_ACTIVITY_OR_SOCIETY;
};

// Checks if the text chunk is the basic info of an education section
// NOTE: This token check needs to come after all the other education section token checks because of it's simplicity.
// @return true if the text chunk is the basic info of an Education experience section.
// @return false otherwise.
LinkedInPdfToJson.prototype.isEduBasicInfo = function() {
    return this.token === this.TOKENS.SCHOOL || this.token === this.TOKENS.EDU_BASIC_INFO;
};

// Checks if the text chunk is a job title.
// Job titles follow this general format: 'job_title  at   company'.
// NOTE: LinkedIn PDF job titles have two spaces before and three spaces after the 'at'.
// Job titles are also required by LinkedIn to fill out an Experience or Volunteer Experience section.
// @return true if the text chunk is the job title of the currently parsed job.
// @return false otherwise.
LinkedInPdfToJson.prototype.isJobTitle = function() {
    if (this.section === this.SECTION_HEADERS.Experience) {
        return this.bold && (this.token === this.TOKENS.SECTION_HEADER || this.token === this.TOKENS.JOB_DURATION || this.token === this.TOKENS.SECTION_CONTENT || this.token === this.TOKENS.JOB_TITLE);
    } else if (this.section === this.SECTION_HEADERS['Volunteer Experience']) {
        return this.bold && (this.token === this.TOKENS.SECTION_HEADER || this.token === this.TOKENS.JOB_DATE || this.token === this.TOKENS.SECTION_CONTENT || this.token === this.TOKENS.JOB_TITLE);
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
LinkedInPdfToJson.prototype.isDateRange = function(chunk) {
    chunk = chunk || this.text;
    return (this.token === this.TOKENS.JOB_TITLE || this.token === this.TOKENS.EDU_BASIC_INFO) && chunk.match(/^\w*\s*\d+\s+\-\s+\w*\s*\d*/);
};

// Checks if the text chunk is a job period e.g. '(1 year 2 months)'.
// Job periods follow this general format: '(number month(s)|year)|(number year(s)[ number month(s)])'.
// NOTE: Job durations are always present for jobs since they are calculated by LinkedIn based on the job date,
// which is required by LinkedIn to fill out an Experience or Volunteer Experience section.
// @return true if the text chunk is a time duration of the currently parsed job.
// @return false otherwise.
LinkedInPdfToJson.prototype.isJobDuration = function() {
    return this.token === this.TOKENS.JOB_DATE && this.text.match(/\(\d+\s\w+\s*\d*\s*\w*\)|^\(less than a year\)/);
};

// Checks if the text chunk is the proficiency level of a language.
// @return true if the text chunk is the proficiency level of a language in the Languages section.
// @return false otherwise.
LinkedInPdfToJson.prototype.isLanguageProficiency = function() {
    return this.token === this.TOKENS.LANGUAGE && this.text.match(/proficiency\)$/);
};

// Checks if the text chunk is a language.
// @return true if the text chunk is a language listed under the Languages section.
// @return false otherwise.
LinkedInPdfToJson.prototype.isLanguage = function() {
    return (this.section === this.SECTION_HEADERS.Languages || this.token === this.TOKENS.LANGUAGE);
};

// Checks if the text chunk is part of a section.
// @return true if the text chunk is part the current sections text content
// @return false otherwise.
LinkedInPdfToJson.prototype.isSectionContent = function() {
    if (this.section === this.SECTION_HEADERS['Volunteer Experience']) {
        return !this.bold && (this.token === this.TOKENS.JOB_TITLE || this.token === this.TOKENS.JOB_DURATION || this.token === this.TOKENS.JOB_DATE || this.token === this.TOKENS.SECTION_CONTENT || this.token === this.TOKENS.SECTION_HEADER);
    }
    return !this.bold && (this.token === this.TOKENS.JOB_DURATION || this.token === this.TOKENS.JOB_DATE || this.token === this.TOKENS.SECTION_CONTENT || this.token === this.TOKENS.SECTION_HEADER);
};
