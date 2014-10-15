
var fs = require("fs")
,   prompt = require("prompt")
,   chalk = require("chalk")
,   jn = require("path").join
,   exec = require("child_process").exec
,   openurl = require("openurl")
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
//  - add Travis + package.json for linting?
//      - webspec check should run the checks (and Travis can run that, using devDependencies)
//      - https://gist.github.com/sideshowbarker/8284404#file-travis-yml

// Helpers
function die (msg) {
    console.error(chalk.red(msg));
    process.exit(1);
}
function booleanVal (val) {
    return val && val.toLowerCase() === "y";
}
function interpolateAndCopy (src, target, obj) {
    var content = fs.readFileSync(src, "utf8")
                    .replace(/###(\w+)###/g, function (m, p1) {
                        if (typeof obj[p1] !== "undefined") return obj[p1];
                        console.error(chalk.red("Could not interpolate template variable: " + p1));
                        return "###" + p1 + "###";
                    });
    fs.writeFileSync(target, content, { encoding: "utf8" });
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
                interpolateAndCopy(src, target, obj);
            }
        );
    }
    else {
        interpolateAndCopy(src, target, obj);
    }
}

// indicate all good, ready to be added to git
function allOk () {
    console.log([
    ,   ""
    ,   chalk.green("Everything seems to have been generated OK!")
    ,   ""
    ,   "You can now push your WebSpec into git."
    ].join("\n"));
    // process.exit(0);
}

// - check presence of index.html, offer to overwrite
// - run run.sh
// - open index.html in browser
function buildHTML (obj) {
    var oldCwd = process.cwd();
    process.chdir(obj.dir);
    exec("./run.sh", function (err, stdout, stderr) {
        if (err) {
            console.error("Failed to produce HTML: " + err + "\n" + stderr);
        }
        else {
            try {
                openurl.open(jn(obj.dir, "index.html"));
            }
            catch (e) {}
        }
        process.chdir(oldCwd);
        allOk(obj);
    });
}

// path to Bikeshed
function askBikeshedPath (obj) {
    prompt.get({
            description:    chalk.blue("What is the path to your " + chalk.bold("bikeshed.py") + "?")
        ,   type:           "string"
        ,   default:        "../bikeshed/bikeshed.py"
        }
    ,   function (err, res) {
            if (err) die("Can't find Bikeshed!");
            obj.bikeshed = res.question;
            if (res.question) {
                copyTemplated("run.sh", obj);
                copyTemplated("nodemon.sh", obj);
                fs.chmodSync(jn(obj.dir, "run.sh"), 0755);
                fs.chmodSync(jn(obj.dir, "nodemon.sh"), 0755);
                if (fs.existsSync(jn(obj.dir, "index.html"))) {
                    prompt.get({
                            description:    chalk.blue("File " + chalk.bold("index.html") + " already exists, overwrite? [y/N]")
                        ,   type:           "string"
                        ,   default:        false
                        ,   before:         booleanVal
                        }
                    ,   function (err, res) {
                            if (err) die("Aborting due to error: " + err);
                            if (!res.question) return allOk(obj);
                            buildHTML(obj);
                        }
                    );
                }
                else buildHTML(obj);
            }
            else allOk(obj);
        }
    );
    
}

// ask about Python
function askPython (obj) {
    prompt.get({
            description:    chalk.blue("What is the path to your " + chalk.bold("Python 2") + "?")
        ,   type:           "string"
        ,   default:        obj.python
        }
    ,   function (err, res) {
            if (err) die("Can't find Python!");
            obj.python = res.question;
            if (res.question) askBikeshedPath(obj);
            else allOk(obj);
        }
    );
    
}

// find the right Python2
function findPython (obj) {
    exec("which python2", function (err, stdout) {
        if (err) return askPython(obj);
        if (stdout) {
            var res = stdout.replace(/\n+$/g, "");
            obj.python = res;
            askPython(obj);
        }
        else {
            exec("which python", function (err, stdout) {
                if (err || !stdout) return askPython(obj);
                var res = stdout.replace(/\n+$/g, "");
                obj.python = res;
                askPython(obj);
            });
        }
    });
}

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
    console.log([
    ,   ""
    ,   "WebSpecs are generated using a tool called " + chalk.bold("Bikeshed") + "."
    ,   "It is not required in order to create specs, but is however highly recommended."
    ,   "Bikeshed also requires Python 2."
    ,   "If you do use Bikeshed, the recommendation location for it is in a directory parallel to"
    ,   "the one in which you create your specifications."
    ].join("\n"));
    prompt.get({
            description:    chalk.blue("Are you planning to use your own Bikeshed? [Y/n]")
        ,   type:           "string"
        ,   default:        "y"
        ,   before:         booleanVal
        }
    ,   function (err, res) {
            if (err) die("Concerned scripts demand to know!");
            if (res.question) findPython(obj);
            else allOk(obj);
        }
    );
}

// ask group this belongs to (multiple choice)
//     - for LICENSE, CONTRIBUTING.md
//         - check presence of $file, offer to overwrite
//         - write $file using owner group
function askGroup (obj) {
    console.log([
        ""
    ,   chalk.bgYellow.black("CAUTION!")
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
            askTitle(obj);
        }
    );
}
function isDir (obj) {
    if (!fs.statSync(obj.dir).isDirectory()) die("Not a directory: " + chalk.bold(obj.dir));
    askTitle(obj);
}
function checkDirExists (obj) {
    // console.log("exists:", obj.dir);
    (fs.existsSync(obj.dir) ? isDir : createDir)(obj);
}

exports.run = function (parsed) {
    prompt.start();
    checkDirExists(parsed);
};
