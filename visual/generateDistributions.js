const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const histogram = require("./graphs/histogram.js");
const boxplot = require("./graphs/boxplot.js");
const interpret = require("./graphs/interpretation.js");

const formated = JSON.parse(fs.readFileSync("./data/formated/formated.json"));
const keys = Object.keys(formated);



function getRoundingRule(data) {
    let places = [1,100,1000,100000,1000000,10000000];
    let state = [true, true, true, true, true, true];
    let names = ["coins", "hundreds of coins", "thousands of coins", "hundreds of thousands of coins", "millions of coins", "tens of millions of coins"];
    for(let i=0;i<data.length;i++) {
        for(let j=0;j<places.length;j++) {
            if(data[i]/10<places[j]) state[j] = false;
        }
    }
    for(let i=state.length-1;i>=0;i--) {
        if(state[i]) return [places[i], names[i]];
    }
}

function generateDistributionPage(index) {
    const sellPrices = formated[keys[index]].sellPrice, craftCosts = formated[keys[index]].craftCost;
    const histogramRoundingRule = getRoundingRule([...sellPrices, ...craftCosts]);
    
    const canvas = createCanvas(1700,2200);
    const ctx = canvas.getContext('2d');


    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "left";
    ctx.font = `50px sans-serif`;
    ctx.fillStyle = "black";
    const titleConnector = ["a","e","i","o","u"].includes(keys[index].toLowerCase()[0])?"an":"a";
    ctx.fillText(`Selling prices and material costs of ${titleConnector} `+ keys[index],40,80);
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.moveTo(ctx.measureText(`Selling prices and material costs of ${titleConnector} `).width+40,90);
    ctx.lineTo(ctx.measureText(`Selling prices and material costs of ${titleConnector} `+ keys[index]).width+40,90)
    ctx.stroke();

    histogram(ctx, boxplot.seperateOutliers(sellPrices)[0], 12, [150,230,600,400], histogramRoundingRule, "Sell price distribution (outliers not shown)", "Sell price");
    histogram(ctx, boxplot.seperateOutliers(craftCosts)[0], 12, [150,960,600,400], histogramRoundingRule, "Material cost distribution (outliers not shown)", "Material cost");

    const boxplotValueDimentions = boxplot.getValueDimentions(sellPrices, craftCosts, true);
    boxplot.draw(ctx, sellPrices,[150,1690,600,80],true,"rgb(0,0,100)", boxplotValueDimentions);
    boxplot.draw(ctx, craftCosts,[150,1780,600,80],true,"rgb(100,0,0)", boxplotValueDimentions);

    const boxplotValueDimentionsOutliers = boxplot.getValueDimentions(sellPrices, craftCosts, false);
    boxplot.draw(ctx, sellPrices,[950,1690,600,80],false,"rgb(0,0,100)", boxplotValueDimentionsOutliers);
    boxplot.draw(ctx, craftCosts,[950,1780,600,80],false,"rgb(100,0,0)", boxplotValueDimentionsOutliers);

    boxplot.drawDesc(ctx,"Price and cost distributions (outliers not shown)", [150,1690,600,170], histogramRoundingRule, boxplotValueDimentions);
    boxplot.drawDesc(ctx,"Price and cost distributions (outliers shown)", [950,1690,600,170], histogramRoundingRule, boxplotValueDimentionsOutliers)

    boxplot.drawKey(ctx, [150, 2065], "rgb(0,0,100)", "rgb(100,0,0)", "Sell Price", "Material Cost");

    ctx.font = `40px sans-serif`;
    ctx.fillStyle = "black";
    ctx.fillText("5 number summeries ("+histogramRoundingRule[1]+"):", 550, 2045);
    boxplot.summery(ctx, [550, 2108], sellPrices, "rgb(0,0,100)", histogramRoundingRule);
    boxplot.summery(ctx, [550, 2158], craftCosts, "rgb(100,0,0)", histogramRoundingRule);

    interpret.draw(ctx, sellPrices, [950, 230, 600,400]);
    interpret.draw(ctx, craftCosts, [950, 960, 630,400]);
    //interpret.bigFive(craftCosts);
    const buffer = canvas.toBuffer("image/png");
    fs.writeFileSync(`./writeUp/displays/display${0}.png`, buffer);   
}

module.exports = generateDistributionPage;