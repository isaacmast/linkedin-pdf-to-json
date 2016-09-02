#! /usr/bin/env node

'use strict';

var chalk = require('chalk'),
    LinkedInPdfToJson = require('../index.js'),
    path = require('path'),
    program = require('commander');

var linkedinPdfToJson = new LinkedInPdfToJson();

program
    .version('1.2.2')
    .usage('[options] <source> [<target>]')
    .description('Output parsed text from LinkedIn profile PDFs to the console in JSON format or save in a JSON file.')
    .option('-s, --space <n>', 'the amount of white space in the output JSON, default is 4', parseInt)
    .parse(process.argv);

var fileName = path.basename(__filename),
    inputFilePath = program.args[0],
    outputFilePath = program.args[1],
    options = {};

if (!inputFilePath || !inputFilePath.match(/.pdf$/)) {
    return console.error(chalk.red(fileName + '::ArgumentError: ') + chalk.yellow(path.basename(inputFilePath)) + ' is not a valid filename (must have a ' + chalk.green('.pdf') + ' file extension).');
} else if (outputFilePath && !outputFilePath.match(/.json$/)) {
    return console.error(chalk.red(fileName + '::ArgumentError: ') + chalk.yellow(path.basename(outputFilePath)) + ' is not a valid filename (must have a ' + chalk.green('.json') + ' file extension).');
}
options.space = program.space;
linkedinPdfToJson.run(inputFilePath, outputFilePath, options);