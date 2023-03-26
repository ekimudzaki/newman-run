#!/usr/bin/env node

const NewmanConfig = require('../lib/core')
version = require('../package.json').version
const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const files = require('../lib/files');
const inquirer  = require('../lib/inquirer');
const yargs = require("yargs");
const { option } = require('yargs');
var feedFilePath = ""

clear()
console.log(
    chalk.rgb(220, 120, 60)(
        figlet.textSync('Newman-Run', { 
            font: 'Doom', 
            horizontalLayout: 'full', 
            whitespaceBreak: true 
        })
    )
);

const file_error_message = chalk.red.bold('Need either feed file (-f) or collections (-c) file to run the tests or atleast (-r) to remove the files from reports directory!!!\n')

const options = yargs
        .usage("Usage: newman-run -f <feed_file_path>")
        .option("f", { alias: "feed", describe: "Feed file path", type: "string"})
        .option("c", { alias: "collection", describe: "Collection file path", type: "string"})
        .option("e", { alias: "environment", describe: "Environment file path", type: "string"})
        .option("g", { alias: "globals", describe: "Global variables file path", type: "string"})
        .option("i", { alias: "iterationCount", describe: "Iteration count"})
        .option("d", { alias: "data", describe: "data file path", type:"string"})
        .option("r", { alias: "remove", describe: "To remove the files from reporting directory"})
        .check(argv => { if(argv.f == undefined && argv.c == undefined && argv.r == undefined) { console.log(file_error_message); return false } else { return true }})
        .argv

const NC = new NewmanConfig()

if (options.remove) {
    NC.clearResultsFolder()
}
if (options.version) {
    console.log(version)
}
if (options.feed != undefined) {
    NC.looprun(options.feed)
} else{
    NC.runCollection(options.collection,options.environment,options.iterationCount, options.data, options.globals)
}
