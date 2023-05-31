module.exports = {
  stats: ["Damage", "Strength", "Crit_Damage", "Crit_Chance", "Bonus_Attack_Speed", "Intelligence", "Health", "Defense", "True Protection", "Speed", "Mining_Speed", "Sea_Creature_Chance", "Magic_Find", "Pet_Luck", "Ferocity", "Ability_Damage", "Mining_Fortune", "Farming_Fortune", "Foraging_Fortune", "Pristine"],
  statExps:["traps_may_increase_your_"],

  enchants: ["Angler", "Big Brain", "Caster", "Compact", "Cubism", "Efficiency", "Experience", "Flame", "Harvesting", "Life Steal", "Luck of the Sea", "Magnet", "Power", "Protection", "Rejuvenate", "Respite", "Silk Touch", "Smite", "Sugar Rush", "Thorns", "Titan Killer",
  "Turbo-Wheat", "Turbo-Carrot", "Turbo-Potato", "Turbo-Pumpkin", "Turbo-Melon", "Turbo-Mushrooms", "Turbo-Cocoa", "Turbo-Cactus", "Turbo-Cane", "Turbo-Warts", "Vicious", "Aqua Affinity", "Bane of Arthropods", "Blessing", "Cleave", "Critical", "Delicate", "Aiming", "Execute", "Feather Falling", "First Strike", "Frail", "Growth",
  "Impaling", "Lethality", "Luck", "Mana Steal", "Piercing", "Prosecute", "Respiration", "Smarty Pants", "Spiked Hook", "Thunderloard", "True Protection", "Venomous", "Blast Protection", "Chance", "Counter-Strike", "Cultivating", "Dragon Hunter", "Ender Slayer", "Expertise", "Fire Protection",
  "Fortune", "Giant Killer", "Pristine", "Knockback", "Looting", "Lure", "Overload", "Projectile Protection", "Punch", "Replenish", "Smelting Touch", "Snipe", "Syphon", "Thunderbolt", "Triple-Strike", "Vampirism", "Chimera", "Combo", "Last Stand", "Legion", "No Pain No Gain", "One For All", "Rend", "Soul Eater",
  "Swarm", "Ultimate Jerry", "Ultimate Wise", "Wisdom"],

  allReforges: ["Gentle", "Odd", "Fast", "Fair", "Epic", "Sharp", "Heroic", "Spicy", "Legendary", "Deadly", "Fine", "Grand", "Hasty", "Neat", "Rapid", "Unreal", "Awkward", "Rich", "Clean", "Fierce", "Heavy", "Light", "Mythic", "Pure", "Smart", "Titanic", "Wise", "Candied", "Bizarre", "Itchy", "Ominous", "Pleasant", "Pretty",
  "Shiny", "Simple", "Strange", "Vivid", "Godly", "Demonic", "Forceful", "Hurtful", "Keen", "Strong", "Superior", "Unpleasant", "Zealous", "Moil", "Toil", "Blessed", "Bountiful", "Magnetic", "Fruitful", "Refined", "Stellar", "Mithraic", "Auspicious", "Fleet", "Heated", "Ambered", "Dirty", "Fabled",
  "Suspicious", "Gilded", "Warped", "Withered", "Bulky", "Salty", "Treacherous", "Stiff", "Lucky", "Precise", "Spiritual", "Headstrong", "Perfect", "Necrotic", "Ancient", "Spiked", "Renowned", "Cubic", "Reinforced", "Loving", "Ridiculous", "Empowered", "Giant", "Submerged", "Jaded", "Silky", "Bloody",
  "Shaded", "Sweet", "Undead"],

  numerals:['I',"II","III","IV","V","VI","VII","VIII","IX","X"],
  numbers: [1,2,3,4,5,6,7,8,9,10],
  rarities:["COMMON","UNCOMMON","RARE","EPIC","LEGENDARY","MYTHIC","DIVINE","SPECIAL","VERY SPECIAL"],

  checkIfIncludesStat: function(stat) {
    stat = stat.replace(/ /g, '_')
    if(module.exports.checkForRarities(stat,module.exports.statExps)) {
      return 0;
    }

    if(!stat.includes("+") && !stat.includes("-") || stat.includes("Grants")) return 0;
    if(module.exports.stats.includes(stat.split(':')[0])) return stat.split(':')[0].replace(/_/,' ');
    return 0;
  },
  removeNonNumbers: function(string) {
    var numbers = ["-",".","0","1","2","3","4","5","6","7","8","9"];
    string = string.split('');
    for(var i=0;i<string.length;i++) {
     if(!numbers.includes(string[i].toString())) {string.splice(i,1);i--;}
    }
    return string.join('');
  },
  checkForEnchants: function(stat) {
    var enchantList = [];
    for(var i=0;i<module.exports.enchants.length;i++) {
      if(stat.includes(module.exports.enchants[i])) {
        var startingIndex = module.exports.findAllIndices(stat, module.exports.enchants[i]);
        var newString = stat.slice(startingIndex,stat.length-1);
        newString = newString.split("Ã")[0];
        newString = module.exports.removeSpecialChars(newString)
        if(newString[newString.length-1] == ' ') {
          newString = newString.split('');
          newString.pop();
          newString = newString.join('');
        }
        newString+='|';
        if(module.exports.checkIfStringIncludesArrayEntry(newString, module.exports.numerals)) {
          var enchant = module.exports.seperateNumeral(newString);
          enchantList.push(enchant);
        }

      };
    }
    if(enchantList.length>0) {
      return enchantList;
    } else {
      return false;
    }
  },
  getNameAndRarity: function(stat) {
    if(stat.includes("Name")) {
      var clipped = stat.split("Name")[1];
      clipped = module.exports.removeSpecialChars(clipped.slice(19,clipped.length-1).split('Ã')[0]);
      var reforge = module.exports.reforge.removeReforge(clipped);
      clipped = reforge.clipped;
      var stars = stat.split("Name")[1];
      var startingIndex = stars.indexOf(clipped);
      stars = stars.substring(startingIndex+clipped.length);
      stars = stars.replace(/[^ª]/g, "").length;
      if(clipped[clipped.length-1] == ' ') {
        clipped = clipped.split('');
        clipped.pop();
        clipped = clipped.join('');
      }
      var rarityUpgraded = stat.split("Name")[0].includes("§ka");
      var rarity = module.exports.checkForRarities(stat,module.exports.rarities);
      if(rarity) {
        return {name:clipped,rarity:rarity,rarityUpgraded:rarityUpgraded,stars:stars,reforge:reforge.ref};
      } else {
        return {name:clipped,rarity:undefined,rarityUpgraded:undefined,stars:stars,reforge:reforge.ref};
      }

    }
    return 0;
  },
  removeSpecialChars: function(str) {
    var keepChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v','w', 'x', 'y', 'z', ' ', '-']
    var newStr = str.split('');
    for(var i=0;i<newStr.length;i++) {
      if(newStr[i] == "§") {
        newStr.splice(i,2);
        i--;
        continue;
      }
      if(!keepChars.includes(newStr[i].toLowerCase())) {
        newStr.splice(i,1);
        i--;
      }
    }
    return newStr.join('');
  },
  seperateNumeral: function(str) {
    var numeral = module.exports.checkIfStringIncludesArrayEntry(str, module.exports.numerals);
    var value = module.exports.numbers[module.exports.numerals.indexOf(numeral)];
    return {enchant:str.split(' '+numeral)[0], value};
  },
  checkIfStringIncludesArrayEntry:function(str,arr) {
    for(var i=0;i<arr.length;i++) {
      if(str.includes(' '+arr[i]+'|')) return arr[i];
    }
    return false;
  },
  checkForRarities:function(str,arr) {
    for(var i=0;i<arr.length;i++) {
      if(str.includes(arr[i])) return arr[i];
    }
    return false;
  },
  findAllIndices: function(str, keyword) {
    var regex = new RegExp(keyword, "gi"), result, indices = [];
    while ( (result = regex.exec(str)) ) {
      indices.push(result.index);
    }
    return indices;
  },
  checkIfArrInStr: function(str,arr) {
    for(var i=0;i<arr.length;i++) {
      if(str.includes(arr[i])) return true;
    }
    return false;
  },
  reforge: {
    removeReforge: function(str) {
      var newStr,reforge=undefined;
      if(str.includes('Very ') || str.includes("Absolutly ") || str.includes("Even More ") && !str.includes('Very Special')) {
        if(str.includes('Very ')) {
          newStr = str.split("Very ")[1];
        } else if(str.includes("Absolutly ")){
          newStr = str.split("Absolutly ")[1];
        } else {
          newStr = str.split("Even More ")[1]
        }
        reforge = newStr.split(' ')[0];
      } else {
        reforge = module.exports.reforge.checkAllReforges(str);
        if(reforge != false) {
          newStr = str.replace(reforge+" ", "")
        } else {
          newStr = str;
        }
      }
      if(reforge == false) reforge = undefined;
      return {clipped:newStr,ref:reforge};
    },
    checkAllReforges: function(str) {
      for(var i=0;i<module.exports.allReforges.length;i++) {
        if(str.includes(module.exports.allReforges[i]+" ")) {
          if(this.checkContra(str, module.exports.allReforges[i]))  return module.exports.allReforges[i];
        }
      }
      return false;
    },
    checkContra: function(str, ref) {
      if(str.includes("Wise Dragon") && ref == "Wise") {
        return false;
      }
      if(str.includes("Suspicious Vial") && ref == "Suspicious") {
        return false;
      }
      if(str.includes("Strong Dragon") && ref == "Strong") {
        return false;
      }
      if(str.includes("Perfect Chestplate") && ref == "Perfect") {
        return false;
      }
      if(str.includes("Superior Dragon") && ref == "Superior") {
        return false;
      }
      if(str.includes("Perfect Leggings") && ref == "Perfect") {
        return false;
      }
      if(str.includes("Perfect Helmet") && ref == "Perfect") {
        return false;
      }
      if(str.includes("Perfect Boots") && ref == "Perfect") {
        return false;
      }
      if(str.includes("Super Heavy") && ref == "Heavy") {
        return false;
      }
      if(str.includes("Heavy Helmet") && ref == "Heavy") {
        return false;
      }
      if(str.includes("Heavy Chestplate") && ref == "Heavy") {
        return false;
      }
      if(str.includes("Heavy Leggings") && ref == "Heavy") {
        return false;
      }
      if(str.includes("Heavy Boots") && ref == "Heavy") {
        return false;
      }
      if(str.includes("Refined Titanium Pickaxe") && ref == "Refined") {
        return false;
      }
      return true;
    }
  }
}
