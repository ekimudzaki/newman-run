const newman = require('newman');
const files = require('../lib/files');
const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
var randomstring = require("randomstring");

class NewmanConfig{

    constructor(){
        this.current_path = path.dirname(fs.realpathSync(__filename))
        this.reporters_list = ['cli', 'json', 'html', 'allure', 'htmlextra']
        this.allure_report_path = './reports/allure'
        this.newman_json_report_path = './reports/json/'
        this.newman_html_report_path = './reports/html/'
    }

    looprun(root_json_file){
        console.log('Feed file taken is: ' + root_json_file);
        if (`${root_json_file}`.includes('\\')) {
            console.log('newman-run is supported only in mac and linux environments, please try to use the package directly in a CI environment by mentioning the file path in linux format.')
            process.exit(1);
        }
        var root_json = this.get_relative_path(root_json_file)
        var root_file = require(root_json)
        var run_list = root_file.runs
        console.log("!----------------------------------Files Taken to run---------------------------------------!")
        run_list.map(value => {
            console.log(value)
                this.runCollection(value.collection,value.environment,value.iterationCount,value.data,value.globals)
        })
        console.log("!-------------------------------------------------------------------------------------------!")
    }

    get_relative_path(abs_path) {
        if (abs_path.startsWith('.')) {
            return path.relative(this.current_path, files.getCurrentDirectoryBase() + abs_path.substring(2))
        } else {
            return path.relative(this.current_path, files.getCurrentDirectoryBase() + abs_path)
        }
    }

    runCollection(collection,environment,iterationCount,data,globals){
        // call newman.run to pass `options` object and wait for callback
        console.log('Collection file taken to run: ' + collection)
        if (`${collection}`.includes('\\')) {
            console.log('newman-run is supported only in mac and linux environments, please try to use the package directly in a CI environment by mentioning the file path in linux format.')
            process.exit(1);
        }else if (!`${collection}`.includes('http')){
            collection = require(this.get_relative_path(collection))
        }
        var file_name = randomstring.generate()
        console.log("env : "+environment)
        console.log("iteration : "+iterationCount)
        console.log("data : "+data)
        console.log("globals : "+globals)

        newman.run({
            collection: collection,
            environment: environment,
            iterationCount: iterationCount,
            globals: globals,
            iterationData: data,
            reporters: this.reporters_list,
            reporter: {
                html: {
                    export: this.newman_html_report_path.concat(file_name).concat('.html') // If not specified, the file will be written to `newman/` in the current working directory.
                },
                allure: {
                    export: this.allure_report_path
                },
                json: {
                    export: this.newman_json_report_path.concat(file_name).concat('.json')
                }
            },
            insecure: true,
        }, function(err, summary) { 
            if (err || summary.run.error || summary.run.failures.length) { 
                console.log('collection run complete!');
            }
        });
    }

    removeDirectory(directory) {
        // directory = this.get_relative_path(directory)
        try {
            fs.readdir(directory, (err, files) => {
                if (err) throw err;
                console.log('Removing files from: ' + directory)
                for (const file of files) {
                    if (file != '.keep') {
                        fs.unlink(path.join(directory, file), err => {
                            if (err) {
                                console.log("Cannot clear the files from the directory using rimraf");
                                rimraf(directory + '/*', function () { console.log('done'); });
                            }
                        });
                    }
                }
            });
        }
        catch (e) {
            console.log("Cannot clear the files from the directory using rimraf");
            rimraf(directory + '/*', function () { console.log('done'); });
        }
    }

    clearResultsFolder() {
        this.removeDirectory(files.getCurrentDirectoryBase() + this.allure_report_path)
        this.removeDirectory(files.getCurrentDirectoryBase() + this.newman_html_report_path)
        this.removeDirectory(files.getCurrentDirectoryBase() + this.newman_json_report_path)
    }

}

module.exports = NewmanConfig
