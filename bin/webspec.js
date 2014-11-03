#!/usr/bin/env node

var nopt = require("nopt")
,   chalk = require("chalk")
,   pth = require("path")
,   cmd = process.argv.splice(2, 1)[0]
,   version = require("../package.json").version
,   knownOpt = {
        dir:    pth
    ,   tap:    Boolean
    }
,   shorthand = {
        d:  ["--dir"]
    ,   t:  ["--tap"]
    }
,   parsed = nopt(knownOpt, shorthand)
,   cmdMap = {
        "new":  require("../lib/new")
    ,   check:  require("../lib/check")
    }
;

// XXX
//  - grab version of self, and version online, and compare — warn if outdated
//      - cache the online version


// defaults
if (!parsed.dir) parsed.dir = process.cwd();

// helpers
function exitOK () {
    process.exit(0);
}

function showHelp () {
    var help = [
    ,   ""
    ,   chalk.bold.green("webspec -- tools to handle WebSpecs")
    ,   "------------------------------------------------------------------------------------------"
    ,   ""
    ,   chalk.blue("Available commands: version, help, new")
    ,   ""
    ,   chalk.bold("version")
    ,   "Prints the version number and exits. No parameters."
    ,   ""
    ,   chalk.bold("help")
    ,   "Prints this help message and exits. No parameters."
    ,   ""
    ,   chalk.bold("new [--dir path/to/repo]")
    ,   "Initialises a directory with all that it needs to be a valid, workable WebSpec."
    ,   "Takes a path to the directory (expected but not required to be a git repository)."
    ,   "Defaults to the current directory."
    ,   ""
    ].join("\n");
    console.log(help);
}

// version
if (cmd === "version") {
    console.log(version);
    exitOK();
}

// help
if (cmd === "help") {
    showHelp();
    exitOK();
}

// delegated commands
if (cmdMap[cmd]) cmdMap[cmd].run(parsed);
else {
    console.error("\n" + chalk.red("Unknown command: " + chalk.bold(cmd)));
    showHelp();
    process.exit(1);
}
