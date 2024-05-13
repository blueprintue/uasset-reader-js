const fs = require("fs");
const path = require("path");
const babel = require("@babel/core");

// region JS

function generateJS() {
    // list of JS files to concat
    const inputJSFiles = [
        path.join(__dirname, 'src/js/_namespace_.js'),
        path.join(__dirname, 'src/js/enums/enums.js'),
        path.join(__dirname, 'src/js/main.js')
    ];

    // output JS file
    const outputJSFilename = "dist/uasset-reader.js";

    let outputJSFileContent = concatJSFiles(inputJSFiles);
    outputJSFileContent = removeLines(outputJSFileContent);
    outputJSFileContent = removeDebug(outputJSFileContent);
    outputJSFileContent = addHeaderAndLicense(outputJSFileContent);
    saveFile(outputJSFilename, outputJSFileContent);
}

function concatJSFiles(files) {
    let outputFileContent = ["(function () {"];
    outputFileContent.push('"use strict";' + "\n");

    for(let idxFiles = 0, maxFiles = files.length; idxFiles < maxFiles; ++idxFiles) {
        outputFileContent.push(fs.readFileSync(files[idxFiles]).toString("utf8"));
    }

    outputFileContent.push("})();");

    return outputFileContent.join("\n");
}

function removeLines(content) {
    const lines = content.split(/\r\n|\r|\n/g);
    let idxLines = 0;
    let maxLines = lines.length;
    let newLines = [];

    for (; idxLines < maxLines; ++idxLines) {
        if (lines[idxLines].match("BUILD REMOVE LINE")) {
            continue;
        }

        newLines.push(lines[idxLines]);
    }

    return newLines.join("\n");
}

function removeDebug(content) {
    function getNode(node) {
        if (node.isMemberExpression()) {
            const object = node.get("object");
            if (object.isIdentifier() && node.has("property")) {
                return node.get("property");
            }
        }

        return node;
    }

    function isConsole(nodePath) {
        const callee = nodePath.get("callee");

        if (!callee.isMemberExpression()) {
            return;
        }

        return getNode(callee.get("object")).isIdentifier({name: "console"}) && callee.has("property");
    }

    function isAlert(nodePath) {
        return getNode(nodePath.get("callee")).isIdentifier({name: "alert"});
    }

    return babel.transformSync(content, {
        retainLines: true,
        plugins:[{
            visitor: {
                DebuggerStatement(nodePath) {
                    nodePath.remove();
                },
                CallExpression(nodePath) {
                    if (isConsole(nodePath) || isAlert(nodePath)) {
                        nodePath.remove();
                    }
                }
            },
        }]
    }).code;
}

generateJS();

// endregion

function addHeaderAndLicense(content) {
    const license = fs.readFileSync("./LICENSE", "utf8");
    const pkg = require("./package.json");

    let header = pkg.name + " (v" + pkg.version + ")\n" + pkg.homepage + "\n\n" + license;

    const lines = header.split("\n");
    for (let idx = 0, max = lines.length; idx < max; ++idx) {
        if (idx + 1 !== max) {
            lines[idx] = " * " + lines[idx];
        } else {
            lines[idx] = " */" + lines[idx];
        }
    }

    return "/**\n" + lines.join("\n") + "\n" + content;
}

function saveFile(filename, content) {
    fs.writeFileSync(filename, content);
}
