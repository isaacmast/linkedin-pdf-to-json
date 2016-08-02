// Recursive descent parser for LinkedIn profile PDFs written in JavaScript.
// Author: Isaac Mast <isaac.k.mast@gmail.com> [https://github.com/isaacmast]

var pdfText = require('pdf-text');

var linkedinPdfToJson = module.exports = {},
    CONTENT, // the string array retrieved from pdf-text module, but after the removal of page numbers
    index = 0, // the CONTENT array index
    jobCount = 0, // the number of jobs in the current section
    json = {}, // the JSON object to hold the parsed data
    jobProperty, // the json object job key (dynamically generated using generateJobKey())
    last, // the previously parsed text string
    section, // the current section of the PDF
    text, // the current text string being parsed
    token = 'START', // the current token
    PATH_TO_PDF = process.argv[2]; // the path to be parsed PDF passed from the command line

var SECTION_HEADERS = {
    summary: 'Summary',
    education: 'Education',
    experience: 'Experience',
    skills: 'Skills & Expertise',
    volunteerXP: 'Volunteer Experience',
    personHasRecommended: 'person has recommended',
    peopleHaveRecommended: 'people have recommended'
};

// available token values
var EOF_TOKEN = 'EOF',
    SECTION_HEADER_TOKEN = 'SECTION HEADER',
    JOB_TOKEN = 'JOB',
    JOB_DATE_TOKEN = 'JOB DATE',
    JOB_DURATION_TOKEN = 'JOB DURATION',
    SECTION_CONTENT_TOKEN = 'SECTION CONTENT';

// Retrieves the text from the PDF, storing each line as an element in the chunks string array.
pdfText(PATH_TO_PDF, function(error, chunks) {
    if (error) {
        console.log(error);
        return;
    }

    console.log(chunks);
    linkedinPdfToJson.parse(chunks);
});

//===========================
// GRAMMAR LOGIC
//===========================

linkedinPdfToJson.parse = function(chunks) {
    this.removePageNumbers(chunks);
    CONTENT = chunks;
    this.setBasicInfo();
    this.getNextToken();
    while (token) {
        if (token === SECTION_HEADER_TOKEN) {
            this.sectionHeader();
            this.resetJobCount();
        }
        this.getNextToken();
    }
};

linkedinPdfToJson.sectionHeader = function() {
    if (json[CONTENT[index].toLowerCase()]) {
        throw 'JSON property (' + CONTENT[index] + ') already exists.';
    }
    json[CONTENT[index].toLowerCase()] = {};
    console.log(json);
    this.getNextToken();
    if (section === SECTION_HEADERS.summary) {

    } else if (section === SECTION_HEADERS.experience) {
        while (token === JOB_TOKEN) {
            jobCount++;
            this.job();
            this.getNextToken();
        }
    } else {
        error();
    }
};

// Creates and populates a new JSON job property under the appropriate section header.
linkedinPdfToJson.job = function() {
    jobProperty = this.generateJobKey();
    json[section][jobProperty] = json[section][jobProperty] || {};
    this.setJobTitle();
    if (token === JOB_DATE_TOKEN) {
        this.setJobDate();
        this.getNextToken();
        if (token === JOB_DURATION_TOKEN) {
            this.setJobDuration();
            this.getNextToken();
            while (token === SECTION_CONTENT_TOKEN) {

            }
        } else {
            this.error();
        }
    } else {
        this.error();
    }
};

// Determines the next token based on the next text chunk
linkedinPdfToJson.getNextToken = function() {
    console.log('Setting token...');
    index++;
    text = CONTENT[index];
    console.log('text = ' + text);
    if (this.isSectionHeader(text)) {
        token = SECTION_HEADER_TOKEN;
        section = text;
    } else if (this.isJobTitle(text)) {
        text = text.replace(/\s{2}at\s{2}/, ' at ');
        token = JOB_TOKEN;
    } else if (this.isJobDate(text)) {
        text = text.trim();
        token = JOB_DATE_TOKEN;
    } else if (this.isJobPeriod(text)) {
        token = JOB_DURATION_TOKEN;
    } else if (this.isSectionContent(text)) {
        token = SECTION_CONTENT_TOKEN;
    } else if (this.isEndOfFile(text)) {
        token = EOF_TOKEN;
    } else {
        this.error();
    }
    console.log('current token = ' + token);
};

//===========================
// GENERATORS AND SETTERS
//===========================

// Generates a new JSON job key by concatenating the job count to the string 'job_'.
// @return the generated JSON job key.
linkedinPdfToJson.generateJobKey = function() {
    return 'job_' + jobCount.toString();
};

// Resets the job count to 0.
linkedinPdfToJson.resetJobCount = function() {
    jobCount = 0;
};

// Sets the title for the currently parsed job under the appropriate section.
linkedinPdfToJson.setJobTitle = function() {
    json[section][jobProperty].title = text;
};

// Sets the date for the currently parsed job under the appropriate section.
linkedinPdfToJson.setJobDate = function() {
    json[section][jobProperty].date = text;
};

// Sets the duration for the currently parsed job under the appropriate section.
linkedinPdfToJson.setJobDuration = function() {
    json[section][jobProperty].duration = text;
};

//===========================
// INITIAL HELPERS
//===========================

// Removes unnecessary 'Page' and '{0}' elements from chunks string array.
// @param chunks - array of string elements representing the top-to-bottom
//              flow of text from the PDF.
linkedinPdfToJson.removePageNumbers = function(chunks) {
    for (var i = 0; i < chunks.length; i++) {
        if (chunks[i] === 'Page' && chunks[i + 1].match(/\d+/)) {
            chunks.splice(i, 2);
        }
    }
};

// Sets the name, current job, and potentially email properties of the json object
// based on the PDF text.
// The email property may not be set if it's not provided in the PDF.
// These properties can just be assumed since it's standard across all LinkedIn profile PDFs.
linkedinPdfToJson.setBasicInfo = function() {
    json.name = CONTENT[0];
    json.currentJob = CONTENT[1];
    json.email = '';
    index += 2;
    if (!this.isSectionHeader(CONTENT[2])) {
        json.email = CONTENT[2];
    }
};

//===========================
// ERRORS
//===========================

linkedinPdfToJson.error = function() {
    throw 'Unable to parse "' + text + '".';
};

//===========================
// TOKEN CHECKS
//===========================

// Determines whether the passed in text chunk is a LinkedIn profile section header.
// @param chunk - the current text chunk from the PDF.
// @return true if chunk is present in SECTION_HEADERS array.
// @return false if chunk is not present in SECTION_HEADERS array.
linkedinPdfToJson.isSectionHeader = function(chunk) {
    return SECTION_HEADERS.indexOf(chunk) !== -1 ? true : false;
};

// Checks if the chunk is a job title e.g. 'Software Developer  at  Foobar'.
// Job titles follow this general format: 'job_title  at  company'.
// NOTE: LinkedIn PDF job titles have two spaces before and after the 'at'.
// @param chunk - the current text chunk from the PDF.
// @return true if the current token is 'HEADER' and chunk matches the regex.
// @return false otherwise.
linkedinPdfToJson.isJobTitle = function(chunk) {
    return (token === SECTION_HEADER_TOKEN && !!chunk.match(/\s{2}at\s{2}/)) ? true : false;
};

// Checks if the chunk is a job date range e.g. 'September 2014  -  December 2014'.
// Job dates follow this general format: '[month_name] year  -  [present|[[month_name] year]]]'.
// @param chunk - the current text chunk from the PDF.
// @return true if the current token is 'JOB TITLE' and chunk matches the regex.
// @return false otherwise.
linkedinPdfToJson.isJobDate = function(chunk) {
    return (token === JOB_TOKEN && !!chunk.match(/\w*\s*\d+\s{2}\-\s{2}\w*\s*\d*/)) ? true : false;
};

// Checks if the chunk is a job period e.g. '(1 year 2 months)'.
// Job periods follow this general format: '(number month(s)|year)|(number year(s)[ number month(s)])'.
// @param chunk - the current text chunk from the PDF.
// @return true if the current token is 'JOB DATE' and chunk matches the regex.
// @return false otherwise.
linkedinPdfToJson.isJobPeriod = function(chunk) {
    return (token === JOB_DATE_TOKEN && !!chunk.match(/\(\d+\s\w+\s*\d*\s*\w*\)/)) ? true : false;
};

linkedinPdfToJson.isSectionContent = function(chunk) {
    return (token === JOB_DURATION_TOKEN && !this.isSectionHeader(chunk)) ? true : false;
};

linkedinPdfToJson.isEndOfFile = function(chunk) {
    return !chunk ? true : false;
};

// return linkedinPdfToJson;