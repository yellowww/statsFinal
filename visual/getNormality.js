const fs = require('fs');
const normalityMap = JSON.parse(fs.readFileSync("./data/formated/normality.json"));
const transformed = normalityMap.map(e=>e.i);

module.exports.isNormal = function(i) {
    const index = transformed.indexOf(i);
    if(index == -1) return true;
    return normalityMap[index].normal;
}

module.exports.getIndex = function(index) {
    let total = 0;
    for(let i=1;i<transformed.length;i++) {
        if(normalityMap[i].i >= index) {
            total = i;
            break
        }
    }
    let numberOfFalse = 0;
    for(let i=0;i<total;i++) {
        if(!normalityMap[i].normal) numberOfFalse++;
    }
    return index - numberOfFalse;
}