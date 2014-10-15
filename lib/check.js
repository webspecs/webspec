
var sua = require("superagent")
// ,   fs = require("fs")
,   jn = require("path").join
;

// XXX
//  - nice reporting for people
//  - tap reporting option (used by specs) for Travis

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
                    for (var i = 0, n = res.body.messages.length; i < n; i++) {
                        var msg = res.body.messages[i];
                        if (msg.type !== "error") continue;
                        console.log("INVALID: " + msg.message + " (" + msg.lastLine + "#" + msg.firstColumn + ")");
                    }
                }
            }
            else {
                console.log("FAILED request to validate: " + res.text);
            }
        })
        ;
        
}

exports.run = function (parsed) {
    validate(parsed);
};
