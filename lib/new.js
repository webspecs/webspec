
var fs = require("fs")
,   prompt = require("prompt")
,   chalk = require("chalk")
;


// XXX
//  - have res dir with all useful data
//  - ask if user wants to run their own bikeshed, get path
//  - add Travis + package.json for linting?

// Helpers
function die (msg) {
    console.error(chalk.red(msg));
    process.exit(1);
}
function booleanVal (val) {
    return val && val.toLowerCase() === "y";
}


/*
    ask group this belongs to (multiple choice)
        - for LICENSE, CONTRIBUTING.md
            - check presence of $file, offer to overwrite
            - write $file using owner group
    ask if want to use own bikeshed
        - if yes
            - ask for path (try to find it?)
            - for run.sh, nodemon.sh
                - check presence of $file, offer to overwrite
                - write $file using path to BS
            - check presence of index.html, offer to overwrite
            - run run.sh
            - open index.html in browser
    indicate all good, ready to be added to git
*/


// ask title of spec (markup allowed, but don't go crazy either)
//     - for README, index.bs:
//         - check presence of $file, offer to overwrite
//         - write $file using title of spec
function askTitle (dir) {
    prompt.get({
            description:    chalk.blue("WebSpec title?")
        ,   type:           "string"
        ,   required:       true
        }
    ,   function (err, res) {
            if (err || !res.question) die("You must have a title!");
            var shortname = dir.replace(/\/$/, "").replace(/.*\//, "");
            console.log(chalk.bold("Using '" + chalk.green(shortname) +
                            "' as the shortname, change that in " + 
                            chalk.underline("index.bs") + " if needed."));
            
            // XXX
            //  use the directory name as the short name (ask to check)
            //  generate the files and move on to licensing
        }
    );
}

// check for existence of directory
//     - offer to exist if not
//     - if neither exists nor created, die
function createDir (dir) {
    prompt.get({
            description:    chalk.blue("Directory '" + dir + "' does not exist. Create it? [Y/n]")
        ,   type:           "string"
        ,   default:        "y"
        ,   before:         booleanVal
        }
    ,   function (err, res) {
            if (err || !res.question) die("Cannot create WebSpec in non-existing directory.");
            fs.mkdirSync(dir);
            askTitle(dir);
        }
    );
}
function isDir (dir) {
    if (!fs.statSync(dir).isDirectory()) die("Not a directory: " + chalk.bold(dir));
    askTitle(dir);
}
function checkDirExists (dir) {
    (fs.existsSync(dir) ? isDir : createDir)(dir);
}

exports.run = function (parsed) {
    var dir = parsed.dir;
    prompt.start();
    checkDirExists(dir);
};
