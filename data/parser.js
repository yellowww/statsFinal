const fs = require("fs");
const dataParser = require("./parserUtils/parse.js");
const meta = require("./parserUtils/meta.js");
const namedAuctions = JSON.parse(fs.readFileSync("./data/filtered/named.json"));
const rawAuctions = JSON.parse(fs.readFileSync("./data/raw/auctions.json"));
const filteredAuctions = JSON.parse(fs.readFileSync("./data/filtered/auctions.json"));

function filterAuctiouns() {
    const filtered = [];
    for(let i=0;i<rawAuctions.auctions.length;i++) {
        dataParser.go(rawAuctions.auctions[i][2], (parsed) => {
            if(parsed) filtered.push(rawAuctions.auctions[i]);
        });
    }

    fs.writeFileSync("./data/filtered/auctions.json", JSON.stringify(filtered), "utf-8");
}



function organizeByName() {
    const obj = {};
    for(let i=0;i<filteredAuctions.length;i++) {
        const name = meta.removeSpecialChars(meta.reforge.removeReforge(filteredAuctions[i][1]).clipped).toLowerCase();
        const keys = Object.keys(obj);
        if(name.includes('lvl')) continue;
        if(keys.includes(name)) obj[name].push(filteredAuctions[i]);
        else obj[name] = [filteredAuctions[i]];
    }
    fs.writeFileSync("./data/filtered/named.json", JSON.stringify(obj), "utf-8");
}


//filterAuctiouns();
// let occourances = 0;
// for(let i=0;i<filteredAuctions.length;i++) if(filteredAuctions[i][1].toLowerCase().includes("unstable dragon leggings")) occourances++;
// console.log(occourances);
//console.log(Object.keys(namedAuctions).length);
