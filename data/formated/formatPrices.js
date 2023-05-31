const fs = require("fs");
const named = JSON.parse(fs.readFileSync("./data/filtered/named.json"));
const bz = JSON.parse(fs.readFileSync("./data/raw/bazaar.json"));
const labeled = JSON.parse(fs.readFileSync("./data/labeling/labeledItems.json"));

function getBzPrices(mats) {
    const prices = [];
    for(let i=0;i<bz.length;i++) {
        let thisPrice = 0;
        for(let j=0;j<mats.length;j++) {
            thisPrice+=bz[i].products[mats[j].name] * mats[j].amount;
        }
        prices.push(Math.round(thisPrice*10)/10);
    }
    return prices;
}

function getAuctionPrices(key) {
    return named[key].map(e=>e[0]);
}

function formatPrices() {
    let formated = {};
    for(let i=0;i<labeled.length;i++) {
        const item = labeled[i];
        if(!item.craftable) continue;
        formated[item.name] = {
            craftCost:getBzPrices(item.materials),
            sellPrice:getAuctionPrices(item.name)
        }
    }
    fs.writeFileSync("./data/formated/formated.json", JSON.stringify(formated));
}

formatPrices();