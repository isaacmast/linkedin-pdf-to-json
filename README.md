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

Example JSON output file

```json
{
    "name": "Isaac Mast",
    "currentJob": "Software Development Intern at Smartly by Pedago, LLC",
    "email": "isaac.k.mast@gmail.com",
    "summary": [
        "- Graduated from Eastern Mennonite University with a Bachelor of Science degree in computer science in May of 2016.",
        "- 4 years of programming experience and website management. ",
        "- Self-starter who enjoys learning in a fast-paced environment. ",
        "- Always excited to learn a new skill to help create the best possible product. "
    ],
    "experience": [
        {
            "title": "Software Development Intern",
            "organization": "Smartly by Pedago, LLC",
            "startDate": "June 2016",
            "endDate": "Present",
            "duration": "3 months",
            "responsibilities": [
                "- Helped maintain and implement new features for Smartly, a mobile-friendly online learning platform by Pedago.",
                "- Operated in an agile software development environment using the scrum management framework coupled with a continuous integration workflow for a very communicative and efficient working atmosphere. ",
                "- Created and published a Node.js module to npm for Smartly called linkedin-pdf-to-json, which is a JavaScript recursive descent parser Node.js command line tool for storing extracted LinkedIn profile PDF text in JSON. View the source code at https://github.com/isaacmast/linkedin-pdf-to-json.",
                "- Utilized development tools and programming techniques such as Gulp.js, bower, npm, and test-driven development to help create scalable and maintainable code. ",
                "- Gained valuable experience with AngularJS, Ruby on Rails, PostrgreSQL, Cordova, Node.js, Chrome DevTools, AWS, Git, Bitbucket, and Unix. "
            ]
        },
        {
            "title": "Software Engineer",
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
            "title": "Software Development Intern",
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
            "title": "Community Advisor",
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
            "title": "Website Manager",
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
            "title": "Yearbook Computer Editor",
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
        "HTML5",
        "CSS3",
        "Ruby",
        "Ruby on Rails",
        "MVC",
        "Gulp.js",
        "PHP",
        "MySQL",
        "PostgreSQL",
        "Apache",
        "Linux Desktop",
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
    "unsupported": [
        "Education",
        "Eastern Mennonite University",
        "Bachelor of Science (B.S.), Computer Science, 2012 - 2016",
        "Grade:  ",
        "Career GPA: 3.49",
        "Activities and Societies:  ",
        "Association for Computing Machinery (ACM) Club, Table Tennis Club, intramural",
        " sports",
        "Courses",
        "Bachelor of Science (B.S.), Computer Science",
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
        "Isaac Mast",
        "Software Development Intern at Smartly by Pedago, LLC",
        "isaac.k.mast@gmail.com"
    ]
}
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