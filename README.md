# linkedin-pdf-to-json

linkedin-pdf-to-json is a JavaScript recursive descent parser Node.js command line tool for storing text retrieved from LinkedIn profile PDFs in a JSON object and storing it in a file or printing it to the console.

## Installation

### Global install

```
npm install -g linkedin-pdf-to-json
```

Global installation will create the `lptj` command and add it to your `/usr/local/bin/` directory for use outside of your project directory.

### Local install

```
npm install --save-dev linkedin-pdf-to-json
```

Local installation will only add the `lptj` command to your project's `node_modules/.bin/` directory. See the [npm docs](https://docs.npmjs.com/files/package.json#bin) for more details.

## Usage

Use the `lptj` command followed by the path to a LinkedIn profile PDF to parse it and output the JSON to the console.

Note: If linkedin-pdf-to-json is installed locally, you'll have to substitue `lptj` with the path to the `lptj` command in your project's `node_modules/.bin/` directory.

```
lptj <path to linkedin-pdf-to-json>/test/spec/profiles/IsaacMast.pdf
```

Passing the path and name of a JSON file as an additional argument will write and save the parsed JSON to the file.

```
lptj <path to linkedin-pdf-to-json>/test/spec/profiles/IsaacMast.pdf ./IsaacMast.json
```

## Testing

Run `npm test` to run the Jasmine specs.

The test suite consists of a Jasmine file in the [linkedin_pdf_to_json](./test/spec/linkedin_pdf_to_json) subdirectory that will simply compare the contents of the JSON files in the [actual](./test/spec/actual) and [expected](./test/spec/expected) subdirectories.

The *actual* directory houses the JSON files that are *actual*ly created by the parser.

The *expected* directory contains files with the same names as the files in the *actual* directory, but the contents of these files is what the parsed JSON is *expected* to be.

linkedin_pdf_to_json.sh is a bash script that will run the parser against all of the PDFs in the [profiles](./test/spec/profiles) subdirectory.

Run `./linkedin_pdf_to_json.sh -h` to see documentation on the available command line arguments.

### A Typical Test Flow

```
# Make some changes

# Alter the JSON files in test/spec/expected to reflect the expected output

# Run the bash script to update the JSON files in test/spec/actual/ and run the test suite
$ ./linkedin_pdf_to_json.sh -at
```

## Supported Sections

* Summary
* Experience
* Education
* Volunteer Experience
* Languages
* Skills & Expertise

## Unsupported Sections

Currently unsupported sections include:

* Publications
* Projects
* Certifications
* Specialties
* Honors and Awards
* Interests
* Courses
* Recommendations
* Patents

## Example

Example JSON output file

```json
{
    "name": "Johnny Appleseed",
    "currentJob": "Software Development Intern at Smartly by Pedago, LLC",
    "email": "johnny.appleseed@foobar.com",
    "bio": [
        "- Graduated from Eastern Mennonite University with a Bachelor of Science degree in computer science in May of 2016.",
        "- 4 years of programming experience and website management. ",
        "- Self-starter who enjoys learning in a fast-paced environment. ",
        "- Always excited to learn a new skill to help create the best possible product. "
    ],
    "educationExperience": [
        {
            "school": "Eastern Mennonite University",
            "basicInfo": [
                "Computer Science"
            ],
            "degree": "Bachelor of Science (B.S.)",
            "startDate": "2012",
            "endDate": "2016",
            "grade": "Career GPA: 3.49",
            "activitiesAndSocieties": "Association for Computing Machinery (ACM) Club, Table Tennis Club, intramural sports"
        },
        {
            "school": "Lancaster Mennonite School"
        }
    ],
    "workExperience": [
        {
            "jobTitle": "Software Development Intern",
            "organization": "Smartly by Pedago, LLC",
            "startDate": "June 2016",
            "endDate": "Present",
            "duration": "4 months",
            "responsibilities": [
                "- Helped maintain and implement new features for Smartly, a mobile-friendly online learning platform by Pedago.",
                "- Operated in an agile software development environment using the scrum management framework coupled with a continuous integration workflow for a very communicative and efficient working atmosphere. ",
                "- Created and published a Node.js module to npm for Smartly called linkedin-pdf-to-json, a JavaScript recursive descent parser Node.js command line tool for storing extracted LinkedIn profile PDF text in JSON format, which can then be printed to the console or written and saved in a file.",
                "- Utilized development tools and programming techniques such as Gulp.js, bower, npm, and test-driven development to help create scalable and maintainable code. ",
                "- Gained valuable experience with AngularJS, Ruby on Rails, PostrgreSQL, Cordova, Node.js, Chrome DevTools, Facebook JavaScript SDK & Graph API, AWS, Git, Bitbucket, and Unix. "
            ]
        },
        {
            "jobTitle": "Software Engineer",
            "organization": "BruCrew",
            "startDate": "September 2015",
            "endDate": "December 2015",
            "duration": "4 months",
            "responsibilities": [
                "- Learned and studied common techniques and best practices of software engineering through a hands-on semester long course project for a local business.",
                "- Applied learned knowledge to create real world applications using the agile software development methodology.",
                "- Developed skills in both front-end and back-end development. ",
                "- Gained valuable experience with PHP, Twitter Bootstrap, HTML, CSS, MVC, UI, UX, Git, and GitHub. "
            ]
        },
        {
            "jobTitle": "Software Development Intern",
            "organization": "VistaShare, LLC",
            "startDate": "May 2015",
            "endDate": "June 2015",
            "duration": "2 months",
            "responsibilities": [
                "- Responsible for helping to create and maintain several cloud based software features for the company.",
                "- Attended weekly developer meetings to discuss the implementation status of recent and current projects with other developers. ",
                "- Participated in pair programming sessions to learn from experienced software developers and to offer ideas and suggestions when appropriate. ",
                "- Gained valuable experience with the Django framework, Python, HTML, JavaScript, PostgreSQL, Git, and the Linux environment. "
            ]
        },
        {
            "jobTitle": "Community Advisor",
            "organization": "Eastern Mennonite University",
            "startDate": "August 2013",
            "endDate": "April 2014",
            "duration": "9 months",
            "responsibilities": [
                "- Lived in and supervised the living situation of one of the residence halls.",
                "- Planned weekly activities for residence to engage in to help build community among the residents on the hall as well as providing an outlet for students to be a part of the university. ",
                "- Represented the university's ideals and morals through daily interactions with residents and guests. "
            ]
        },
        {
            "jobTitle": "Website Manager",
            "organization": "Lancaster Mennonite Conference",
            "startDate": "June 2013",
            "endDate": "December 2013",
            "duration": "7 months",
            "responsibilities": [
                "- Updated and maintained the Shalom News magazine website, www.shalomnews.net, which is a part of the Lancaster Mennonite Conference.",
                "- Gained valuable experience with HTML, CSS, Adobe Dreamweaver CS6, and Adobe Photoshop CS6. "
            ]
        },
        {
            "jobTitle": "Yearbook Computer Editor",
            "organization": "Lancaster Mennonite School",
            "startDate": "August 2011",
            "endDate": "June 2012",
            "duration": "11 months",
            "responsibilities": [
                "- Responsible for the creation of the index and sports sections of the school yearbook. ",
                "- Worked in correspondence with the section editor to obtain necessary content for the section pages. ",
                "- Gained valuable experience with Adobe InDesign and Adobe Photoshop. "
            ]
        }
    ],
    "skills": [
        "Project Management",
        "Leadership",
        "Java",
        "JavaScript",
        "Python",
        "Git",
        "AngularJS",
        "Node.js",
        "Ruby",
        "Ruby on Rails",
        "npm",
        "Bower",
        "Gulp.js",
        "PostgreSQL",
        "HTML5",
        "CSS3",
        "Apache Cordova",
        "MVC",
        "GitHub",
        "Bitbucket",
        "PHP",
        "MySQL",
        "Apache",
        "Linux Desktop",
        "Unix",
        "Teamwork",
        "Community Outreach",
        "Team Leadership",
        "Nonprofits",
        "Leadership Development",
        "Event Management",
        "Dreamweaver",
        "Photoshop",
        "Social Networking",
        "Public Speaking"
    ],
    "volunteerExperience": [
        {
            "jobTitle": "Bar",
            "organization": "Foo",
            "startDate": "January 2013",
            "endDate": "Present",
            "responsibilities": [
                "Baz"
            ]
        }
    ],
    "unsupported": [
        "Projects",
        "linkedin-pdf-to-json",
        "August 2016 to Present",
        "Members:Johnny Appleseed",
        "linkedin-pdf-to-json is a JavaScript recursive descent parser Node.js command line tool for storing extracted",
        " text from LinkedIn profile PDFs in JSON format that can be either printed to the console or written and",
        " saved in a JSON file. ",
        "npm webpage: https://www.npmjs.com/package/linkedin-pdf-to-json",
        "The BruCrew Project Database",
        "September 2015 to December 2015",
        "The BruCrew Project Database is a central hub for BruCrew employees to log their work hours and any",
        " details about the tasks that they worked on during those hours. ",
        "GitHub repository: https://github.com/brucrew/brucrew",
        "Courses",
        "Bachelor of Science (B.S.), Computer Science",
        "Eastern Mennonite University",
        "Software Engineering",
        "370",
        "Programming Languages",
        "420",
        "Analysis of Algorithms",
        "340",
        "System Administration",
        "350",
        "Networking and Data Communications",
        "230",
        "Computer Science Internship",
        "499",
        "Android App Development",
        "333",
        "Architecture and Operating Systems",
        "250",
        "Data Structures",
        "320",
        "Honors and Awards",
        "PIAA Class AA State Soccer Champion",
        "PIAA",
        "November 2011",
        "- Had the honor of being on the soccer team for Lancaster Mennonite High School that won the PIAA class",
        " AA 2011 boys soccer state championship.",
        "Student of the Month",
        "Paradise Rotary Club",
        "May 2010",
        "- One of six students from schools in the Lancaster county area recognized for academic excellence by the",
        " Paradise Rotary Club. ",
        "Organizations",
        "ACM",
        "September 2015 to Present",
        "Johnny Appleseed",
        "Software Development Intern at Smartly by Pedago, LLC",
        "johnny.appleseed@foobar.com"
    ]
}
```
