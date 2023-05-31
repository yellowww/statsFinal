const meta = require("./meta.js");

module.exports = {
  go: function(itemData,cb) {
    module.exports.decodeItem(itemData,function(decodedItem) {
      module.exports.parseItem(decodedItem, function(parsed) {
        cb(parsed);
      });
    });
  },
  decodeItem: function(string,cb) {
    string = string.replace(/ /g,'+');
    // var buff = base64arraybuffer.decode(string);
    // var newData = pako.inflate(buff);
    // var decodedString = String.fromCharCode.apply(null, new Uint16Array(newData));
    cb(string);
  },
  parseItem: function(stringData,cb) {
    for(let i=0;i<meta.enchants.length;i++) {
      if(!stringData.includes(meta.enchants[i])) continue;
      const split = stringData.split(meta.enchants[i])[1];
      if(meta.numerals.includes(split[1])) return cb(false);
    }
    const split = stringData.split("\n");
    for(let i=0;i<split.length;i++) {
      if(!module.exports.lineIncludesStat(split[i])) continue;
      if(split[i].includes("§e(+") || split[i].includes("§e(-")) return cb(false);
      if(split[i].includes("§9(+") || split[i].includes("§9(-")) return cb(false);
      if(split[i].includes("§d(+") || split[i].includes("§d(-")) return cb(false);
    }
    cb(true);
  },
  getAccString: function(encodedString, encode) {
    var buff = Buffer.from(encodedString, encode)
    return String.fromCharCode.apply(null, new Uint16Array(buff));
  },
  lineIncludesStat: function(line) {
    for(let i=0;i<meta.stats.length;i++) if(line.includes(meta.stats[i])) return true;
    return false;
  }
}
