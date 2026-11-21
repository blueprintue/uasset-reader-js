require("../src/js/_namespace_");
require("../src/js/enums/enums");
require("../src/js/main");
const fs = require("fs");
const path = require("path");

function parseBigIntPayload(key, value) {
    if (["PayloadTocOffset", "BulkDataStartOffset"].indexOf(key) !== -1) {
        value = value.replace("n", "");
        value = BigInt(value);
    }

    return value;
}

describe("complete", function() {
    // region constructor
    it("should be defined", () => {
        expect(window.blueprintUE.uasset.ReaderUasset).toBeDefined();
    });
    // endregion

    const ueVersionEntries = fs.readdirSync(path.resolve(__dirname, "uassets"), {withFileTypes: true});

    for (const ueVersionEntry of ueVersionEntries) {
        if (!ueVersionEntry.isDirectory()) {
            continue;
        }

        /* eslint-disable-next-line jest/valid-title */
        describe(ueVersionEntry.name, function() {
            const blueprintsEntries = fs.readdirSync(path.resolve(__dirname, "uassets", ueVersionEntry.name), {withFileTypes: true});

            for (const blueprintsEntry of blueprintsEntries) {
                if (!blueprintsEntry.isDirectory()) {
                    continue;
                }

                const files = fs.readdirSync(path.resolve(__dirname, "uassets", ueVersionEntry.name, blueprintsEntry.name));

                const uassetFile = files.find((file) => path.extname(file) === ".uasset");
                const expectedFile = files.find((file) => path.extname(file) === ".json");

                if (!uassetFile || !expectedFile) {
                    continue;
                }

                const uassetFilePath = path.resolve(__dirname, "uassets", ueVersionEntry.name, blueprintsEntry.name, uassetFile);
                const expectedFilePath = path.resolve(__dirname, "uassets", ueVersionEntry.name, blueprintsEntry.name, expectedFile);

                /* eslint-disable-next-line jest/valid-title */
                it(blueprintsEntry.name, function() {
                    const bytesInput = new Uint8Array(fs.readFileSync(uassetFilePath));
                    const bytesOutput = JSON.parse(fs.readFileSync(expectedFilePath).toString(), parseBigIntPayload);
                    const uasset = new window.blueprintUE.uasset.ReaderUasset().analyze(bytesInput, false);

                    expect(uasset.header).toStrictEqual(bytesOutput.header);
                    expect(uasset.names).toStrictEqual(bytesOutput.names);
                    expect(uasset.gatherableTextData).toStrictEqual(bytesOutput.gatherableTextData);
                });
            }
        });
    }
});
