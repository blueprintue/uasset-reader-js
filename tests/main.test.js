require("../src/js/_namespace_");
require("../src/js/enums/enums");
require("../src/js/main");
const fs = require("fs");
const path = require("path");
const datacases = require("./datacases.json");

function parseBigIntPayload(key, value) {
    if (["PayloadTocOffset", "BulkDataStartOffset"].indexOf(key) !== -1) {
        value = value.replace("n", "");
        value = BigInt(value);
    }

    return value;
}

describe("main", function(){
    // region constructor
    it("should be defined", () => {
        expect(window.blueprintUE.uasset.ReaderUasset).toBeDefined();
    });
    // endregion

    describe("datacases", function(){
        describe("simple", function(){
            describe("UE 5.0", function(){
                /* eslint-disable-next-line no-unused-vars */
                it.each(datacases.simple.ue50)('$name', ({name, input, expected}) => {
                    const bytesInput = new Uint8Array(fs.readFileSync(path.resolve(__dirname, input)));
                    const bytesOutput = JSON.parse(fs.readFileSync(path.resolve(__dirname, expected)).toString(), parseBigIntPayload);

                    const uasset = new window.blueprintUE.uasset.ReaderUasset().analyze(bytesInput, false);

                    expect(uasset.header).toStrictEqual(bytesOutput.header);
                    expect(uasset.names).toStrictEqual(bytesOutput.names);
                    expect(uasset.gatherableTextData).toStrictEqual(bytesOutput.gatherableTextData);
                });
            });
        });
    });
});
