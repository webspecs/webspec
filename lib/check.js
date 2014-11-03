
var sua = require("superagent")
,   jn = require("path").join
,   chalk = require("chalk")
;

// validation
function validate (obj) {
    sua
        .post("http://validator.w3.org/nu/")
        .accept("json")
        .field("out", "json")
        .attach("doc", jn(obj.dir, "index.html"), "index.html")
        .end(function (res) {
            if (res.ok) {
                if (res.body.messages) {
                    if (!obj.tap) console.log(chalk.bold.blue("URL: ") + chalk.blue(res.body.url));
                    var seenError = false;
                    for (var i = 0, n = res.body.messages.length; i < n; i++) {
                        var msg = res.body.messages[i];
                        if (!obj.tap) {
                            if (msg.type === "info") console.log(chalk.blue(msg.message));
                            if (msg.type === "warning") console.log(chalk.orange(msg.message));
                        }
                        if (msg.type !== "error") continue;
                        if (!seenError && obj.tap) {
                            console.log("not ok 1 - validation errors");
                            seenError = true;
                        }
                        var err = msg.message + " (" + msg.lastLine + "#" + msg.firstColumn + ")";
                        if (obj.tap) console.log("# " + err);
                        else console.log(chalk.red(chalk.bold("INVALID: ") + err));
                    }
                    if (obj.tap && !seenError) console.log("ok 1");
                }
            }
            else {
                var msg = "FAILED request to validate: " + res.text;
                if (obj.tap) console.log("not ok 1 - " + msg);
                else console.log(chalk.bold.red(msg));
            }
        })
        ;
}

exports.run = function (parsed) {
    if (parsed.tap) console.log("1..1");
    validate(parsed);
};
