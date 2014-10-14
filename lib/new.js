
var fs = require("fs")
,   prompt = require("prompt")
,   chalk = require("chalk")
,   jn = require("path").join
,   groups = [
        {
            name:   "Web Platform CG"
        ,   type:   "CLA"
        }
    ,   {
            name:   "HTML WG"
        ,   type:   "PP"
        }
    ,   {
            name:   "WebApps WG"
        ,   type:   "PP"
        }
    ,   {
            name:   "Responsive Images CG"
        ,   type:   "CLA"
        }
    ]
,   terms = {
        CLA:    "W3C Community Contributor License Agreement (CLA) which can be read at\nhttp://www.w3.org/community/about/agreements/cla/."
    ,   PP:     "W3C Patent Policy (PP), including agreement to the licensing terms as\nper section 3.2, which can be read at http://www.w3.org/Consortium/Patent-Policy-20040205/"
    }
;


// XXX
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
function copyTemplated (file, obj) {
    var target = jn(obj.dir, file)
    ,   src = jn(__dirname, "../res", file)
    ;
    if (fs.existsSync(target)) {
        prompt.get({
                description:    chalk.blue("File " + chalk.bold(file) + " already exists, overwrite? [y/N]")
            ,   type:           "string"
            ,   default:        false
            ,   before:         booleanVal
            }
        ,   function (err, res) {
                if (err) die("Aborting due to error: " + err);
                if (!res.question) return;
                var content = fs.readFileSync(src, "utf8")
                                .replace(/###(\w+)###/g, function (m, p1) {
                                    if (typeof obj[p1] !== "undefined") return obj[p1];
                                    console.error(chalk.red("Could not interpolate template variable: " + p1));
                                    return "###" + p1 + "###";
                                });
                fs.writeFileSync(target, content, { encoding: "utf8" });
            }
        );
        
    }
}

/*
    indicate all good, ready to be added to git
*/


// ask if want to use own bikeshed
//     - if yes
//         - ask for path (try to find it?)
//         - for run.sh, nodemon.sh
//             - check presence of $file, offer to overwrite
//             - write $file using path to BS
//         - check presence of index.html, offer to overwrite
//         - run run.sh
//         - open index.html in browser
function askBikeshed (obj) {
    /// XXX
    obj;
}

// ask group this belongs to (multiple choice)
//     - for LICENSE, CONTRIBUTING.md
//         - check presence of $file, offer to overwrite
//         - write $file using owner group
function askGroup (obj) {
    console.log([
        chalk.bgYellow.black("CAUTION!")
    ,   ""
    ,   "Having to pick a group at this time may seem like boring legalese."
    ,   "It certainly is both boring and legalese."
    ,   "However, tying this work to a group is the way in which the Web is"
    ,   "kept free by ensuring that contributions are made under a Royalty-Free"
    ,   "policy. Don't hesitate to ask for guidance!"
    ,   ""
    ,   "If you are unsure what to choose, " + chalk.bold("stay with the default.")
    ,   ""
    ,   "The options are:"
    ].join("\n"));
    for (var i = 0, n = groups.length; i < n; i++) {
        var group = groups[i];
        console.log("\t" + (i + 1) + ". " + group.name + (i === 0 ? " [default]" : ""));
    }
    console.log("");
    prompt.get({
            description:    chalk.blue("Under which group's contribution policy does this document fall? [1]")
        ,   type:           "number"
        ,   default:        1
        }
    ,   function (err, res) {
            if (err || !res.question) die("You must pick a group!");
            var group = groups[res.question - 1];
            if (!group) die("Wrong group number!");
            obj.groupName = group.name;
            obj.terms = terms[group.type];
            copyTemplated("LICENSE", obj);
            copyTemplated("CONTRIBUTING.md", obj);
            askBikeshed(obj);
        }
    );
    
}

// ask title of spec (markup allowed, but don't go crazy either)
//     - for README, index.bs:
//         - check presence of $file, offer to overwrite
//         - write $file using title of spec
function askTitle (obj) {
    prompt.get({
            description:    chalk.blue("WebSpec title?")
        ,   type:           "string"
        ,   required:       true
        }
    ,   function (err, res) {
            if (err || !res.question) die("You must have a title!");
            obj.title = res.question;
            obj.shortname = obj.dir.replace(/\/$/, "").replace(/.*\//, "");
            console.log(chalk.bold("Using '" + chalk.green(obj.shortname) +
                            "' as the shortname, change that in " + 
                            chalk.underline("index.bs") + " if needed."));
            copyTemplated("README.md", obj);
            copyTemplated("index.bs", obj);
            askGroup(obj);
        }
    );
}

// check for existence of directory
//     - offer to exist if not
//     - if neither exists nor created, die
function createDir (obj) {
    prompt.get({
            description:    chalk.blue("Directory '" + obj.dir + "' does not exist. Create it? [Y/n]")
        ,   type:           "string"
        ,   default:        "y"
        ,   before:         booleanVal
        }
    ,   function (err, res) {
            if (err || !res.question) die("Cannot create WebSpec in non-existing directory.");
            fs.mkdirSync(obj.dir);
            askTitle(obj.dir);
        }
    );
}
function isDir (obj) {
    if (!fs.statSync(obj.dir).isDirectory()) die("Not a directory: " + chalk.bold(obj.dir));
    askTitle(obj.dir);
}
function checkDirExists (obj) {
    (fs.existsSync(obj.dir) ? isDir : createDir)(obj.dir);
}

exports.run = function (parsed) {
    prompt.start();
    checkDirExists(parsed);
};
