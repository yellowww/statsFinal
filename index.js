//const parser = require("./data/parser.js");
//const labeling = require("./data/labeling/label.js");
//const format = require("./data/formated/formatPrices.js");
// const fs = require("fs");
// const DiffMeanTest = require("./analysis/DiffMeanTest.js");

// const formated = JSON.parse(fs.readFileSync("./data/formated/formated.json"));
// const keys = Object.keys(formated);

// for(let i=0;i<keys.length;i++) {
//     //if(keys[i] !== "mithril coat") continue;
    
//     const thisItem = formated[keys[i]];
//     const test = new DiffMeanTest(thisItem.sellPrice, thisItem.craftCost,0.95);
//     console.log(test.rejectTest(),test.getTestStat(), keys[i]);
// }
const generateDistributions = require("./visual/generateDistributions.js");
const testWriteup = require("./visual/testWriteup.js");


const index = 8
for(let i=0;i<156;i++) {
    generateDistributions(i)
    //testWriteup(i)

}
