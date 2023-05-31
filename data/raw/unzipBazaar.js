const zlib = require("zlib");
const fs = require("fs");
function unzip() {
    const unZip = zlib.createUnzip();
    const inp = fs.createReadStream("./data/raw/bazaarCompressed.json.gz");
    const out = fs.createWriteStream("./data/raw/bazaar.json");
    inp.pipe(unZip).pipe(out);
}

module.exports = unzip;