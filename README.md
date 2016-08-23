# linkedin-pdf-to-json

linkedin-pdf-to-json is a JavaScript recursive descent parser Node.js command line tool for storing text retrieved from LinkedIn profile PDFs in a JSON object and storing it in a file or printing it to the console.

## Installation

```
npm install --save-dev linkedin-pdf-to-json
```

## Usage

Specifying a file to store the retrieved JSON in is optional and if none is given, the JSON is printed to the console.

```
node node_modules/linkedin-pdf-to-json/index.js JohnnyAppleseed.pdf
```

If a JSON output file is passed as an argument the parsed JSON will be written and saved to the file.

```
node node_modules/linkedin-pdf-to-json/index.js JohnnyAppleseed.pdf JohnnyAppleseed.json
```

## Supported Sections

* Summary
* Experience
* Volunteer Experience
* Languages
* Skills & Expertise

## Unsupported Sections

Currently unsupported sections include:

* Education
* Publications
* Projects
* Certifications
* Specialties
* Honors and Awards
* Interests
* Courses
* Recommendations