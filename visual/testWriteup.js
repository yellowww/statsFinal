const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");
const DiffMeanTest = require("../analysis/DiffMeanTest.js");
const tDistribution = require("../analysis/tDistribution.js");
const boxplot = require("./graphs/boxplot.js");
const normality = require("./getNormality.js");

const formated = JSON.parse(fs.readFileSync("./data/formated/formated.json"));
const keys = Object.keys(formated);

function generateTestWriteup(index) {
    if(!normality.isNormal(index)) return;
    const canvas = createCanvas(1700,2200);
    const ctx = canvas.getContext('2d');
    const data = formated[keys[index]];
    data.sellPrice = boxplot.seperateOutliers(data.sellPrice)[0];
    data.craftCost = boxplot.seperateOutliers(data.craftCost)[0];

    const test = new DiffMeanTest(data.sellPrice, data.craftCost, 0.95);

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = "left";
    ctx.font = `45px sans-serif`;
    ctx.fillStyle = "black";
    const titleConnector = ["a","e","i","o","u"].includes(keys[index].toLowerCase()[0])?"an":"a";
    ctx.fillText(`Statistical test comparing the selling prices and material costs of \n${titleConnector} `+ keys[index],40,80);
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.moveTo(ctx.measureText(`${titleConnector} `).width+40,140);
    ctx.lineTo(ctx.measureText(`${titleConnector} `+ keys[index]).width+40,140)
    ctx.stroke();

    drawLetStatments(ctx, getName(index));
    drawRequirements(ctx, data,test);
    drawTestStat(ctx, test);
    drawConclusion(ctx,test, getName(index));
    drawRejectionCritieria(ctx, data, 0.95, test, () => {
        const buffer = canvas.toBuffer("image/png");
        fs.writeFileSync(`./writeUp/tests/test${normality.getIndex(index)}.png`, buffer);   
    });

}

function getName(index) {
    return (['a','e','i','o','u'].includes(keys[index][0])?"an ":"a ") + keys[index];
}

function drawLetStatments(ctx, name) {
    ctx.font = `31px sans-serif`;
    ctx.fillStyle = "black";
    ctx.fillText(`Let group1 = Sell prices of ${name},  group2 = Material cost of ${name}`,50,200);
    ctx.fillText(`X₁ = Sell price of ${name} (coins),  X₂ = Material cost of ${name} (coins)`,50, 245);
    const text = `μ₁ = Mean sell price of ${name} (coins),  μ₂ = Mean material cost of ${name} (coins)`;
    if(ctx.measureText(text).width > 1600) {
        ctx.fillText(`μ₁ = Mean sell price of ${name} (coins), \nμ₂ = Mean material cost of ${name} (coins)`,50, 290);
    } else {
        ctx.fillText(text,50, 290);
    }
    ctx.font = `40px sans-serif`;
    ctx.fillText(`Hₒ: μ₁ = μ₂    Hₐ: μ₁ > μ₂`, 50, 380);
}

function drawRequirements(ctx, data,test) {
    ctx.font = `40px sans-serif`;
    ctx.fillStyle = "black";
    const title = "Requirements for a difference of means test (σ₁ and σ₂ unknown):"
    ctx.fillText(title, 50, 450);
    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.moveTo(50,450);
    ctx.lineTo(50+ctx.measureText(title).width,450);
    ctx.stroke();
    ctx.fillText(`1. 2 independent SRS's: ✓ n₁ = ${data.sellPrice.length} n₂ = ${data.craftCost.length}\n     One price/cost from either group will not affect any price/cost from either group`, 50, 510);
    ctx.fillText(`2. σ is not known, but Sₓ is: ✓ S₁ = ${numberWithCommas(Math.round(test.sx(data.sellPrice)*10000)/10000)} coins S₂ = ${numberWithCommas(Math.round(test.sx(data.craftCost)*10000)/10000)} coins`, 50, 610);
    let req3 = `3. ${data.sellPrice.length <= 30?"Group1 is normally distributed":"n₁ > 30"} and n₂ > 30: ✓`
    if(data.sellPrice.length > 30) {
        req3 += ` n₁ = ${data.sellPrice.length} > 30  n₂ = ${data.craftCost.length} > 30`
    } else {
        drawQuantilePlot(ctx, data.sellPrice, [90, 750, 350, 150]);
        ctx.fillText(`n₂ = ${data.craftCost.length} > 30`, 490, 718);
    }
    ctx.fillText(req3, 50, 660);
}

function drawQuantilePlot(ctx, data, dimentions) {
    const points = [];
    for(let i=0;i<data.length;i++) {
        const percentile = boxplot.toPercentile([...data],data[i], points.map(e=>e[0]));
        const cv = tDistribution.invCDF(percentile, 10000, 0.000001);
        points.push([data[i], cv]);
    }
    
    const minX = Math.min(...points.map(e=>e[0])), maxX = Math.max(...points.map(e=>e[0])), xRange = maxX - minX;
    const minY = Math.min(...points.map(e=>e[1])), maxY = Math.max(...points.map(e=>e[1])), yRange = maxY - minY;
    ctx.strokeStyle = "blue";
    ctx.strokeWidth = 2;
    ctx.beginPath();
    for(let i=0;i<points.length;i++) {
        const x = ((points[i][0] - minX)/xRange) * dimentions[2] + dimentions[0];
        const y = ((points[i][1] - minY)/-yRange) * dimentions[3] + dimentions[1]+dimentions[3];
        ctx.rect(x-5,y-5,10,10);   
    }
    ctx.stroke();
    ctx.strokeStyle = "black";
    ctx.strokeWidth = 4;
    ctx.beginPath();
    let xAxis = ((0 - minX)/xRange);
    if(xAxis < 0) xAxis = -300;
    ctx.moveTo(xAxis * dimentions[2] + dimentions[0], dimentions[1]);
    ctx.lineTo(xAxis * dimentions[2] + dimentions[0], dimentions[1]+dimentions[3]);

    let yAxis = ((0 - minY)/-yRange);
    if(xAxis < 0) xAxis = 0;
    ctx.moveTo(dimentions[0], yAxis * dimentions[3] + dimentions[1]+dimentions[3]);
    ctx.lineTo(dimentions[0] + dimentions[2], yAxis * dimentions[3] + dimentions[1]+dimentions[3]);
    //ctx.lineTo(dimentions[0]+dimentions[2], dimentions[1]+dimentions[3]);
    ctx.stroke();
    ctx.textAlign = "center";
    ctx.font = "30px sans-serif";
    ctx.fillText("Quantile plot of sell prices", dimentions[0]+dimentions[2]/2, dimentions[1]-30);
    ctx.textAlign = "left";
    ctx.font = "40px sans-serif";
}

function drawRejectionCritieria(ctx,data, significanceLevel, test, cb) {
    const title = "Rejection Critieria:";
    ctx.font = "40px sans-serif";
    ctx.fillText(title, 50, 970);
    ctx.beginPath();
    ctx.moveTo(50,970);
    ctx.lineTo(50+ctx.measureText(title).width, 970);
    ctx.stroke();
    ctx.font = "30px sans-serif";
    ctx.fillText(`α = ${Math.round((1-significanceLevel)*1000)/1000}   df = ${Math.min(data.sellPrice.length, data.craftCost.length) - 1}`, 50, 1000);
    
    ctx.font = "40px sans-serif";
    ctx.fillText(`Reject Hₒ if t > ${test.rejectTest()[1].toFixed(2)}`, 50, 1340);

    loadImage('./visual/images/normalCurve.png').then((data) => {
        ctx.drawImage(data, 50, 1010, 500, 250);
        ctx.beginPath();
        ctx.strokeStyle = "black";
        ctx.moveTo(400, 1200);
        ctx.lineTo(400, 1240);
        
        ctx.moveTo(410, 1225);
        ctx.lineTo(470, 1160);
        ctx.fillText(`α = ${Math.round((1-significanceLevel)*1000)/1000}`, 440, 1140);
        ctx.stroke();
        ctx.font = "35px sans-serif";
        ctx.fillText(`t      = ${test.rejectTest()[1].toFixed(2)}`, 410, 1275);
        ctx.font = "20px sans-serif";
        ctx.fillText(`α, df`, 430, 1275);
        cb();
    });
}

function drawTestStat(ctx, test) {
    ctx.font = "40px sans-serif";
    const title = `Test Statistic:`;
    ctx.beginPath();
    ctx.fillText(title, 800, 970);
    ctx.moveTo(800, 970);
    ctx.lineTo(ctx.measureText(title).width+800, 970);
    ctx.stroke();
    ctx.fillText("t = ", 800, 1050);
    ctx.font = "35px sans-serif";
    ctx.fillText("(x̄₁ - x̄₂) - (μ₁ - μ₂)", 860, 1020);
    ctx.font = "30px sans-serif";
    ctx.fillText("S₁²    S₂²", 950, 1070);
    ctx.fillText("N₁     N₂", 950, 1108);
    ctx.fillText("+", 997, 1090);
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(945,1079);
    ctx.lineTo(985,1079);
    ctx.moveTo(1029,1079);
    ctx.lineTo(1069,1079);
    ctx.stroke();

    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(860,1035);
    ctx.lineTo(1165,1035);

    ctx.moveTo(910,1090);
    ctx.lineTo(930,1110);
    ctx.lineTo(945,1043);
    ctx.lineTo(1090,1043);
    ctx.stroke();
    
    const rejectState = test.rejectTest();
    const testStat = test.testStat;
    ctx.font = "38px sans-serif";
    ctx.fillText(`t = ${numberWithCommas(testStat.toFixed(2))}`, 800, 1180);
    let pValue = rejectState[2].toFixed(4);
    if(pValue >= 1) pValue = " > 0.9999";
    else if(pValue <= 0 ) pValue = " < 0.0001";
    else pValue = " = " + numberWithCommas(pValue);
    ctx.fillText(`p-value ${pValue}`, 800, 1220);

    if(rejectState[0]) {
        rejectMessage = `Reject Hₒ since ${numberWithCommas(testStat.toFixed(2))} > ${numberWithCommas(rejectState[1].toFixed(2))}`;
    } else {
        rejectMessage = `Fail to reject Hₒ since ${numberWithCommas(testStat.toFixed(2))} < ${numberWithCommas(rejectState[1].toFixed(2))}`;
    }

    ctx.fillText(rejectMessage, 800, 1300);

    ctx.fillText("Inputs:", 1200, 970);
    ctx.font = "27px sans-serif";
    ctx.fillText(`x̄₁ = ${numberWithCommas(Math.round(test.mean(test.sample1)*10000)/10000)} (coins)`, 1200, 1020);
    ctx.fillText(`x̄₂ = ${numberWithCommas(Math.round(test.mean(test.sample2)*10000)/10000)} (coins)`, 1200, 1055);
    ctx.fillText(`S₁ = ${numberWithCommas(Math.round(test.sx(test.sample1)*10000)/10000)} (coins)`, 1200, 1090);
    ctx.fillText(`S₂ = ${numberWithCommas(Math.round(test.sx(test.sample2)*10000)/10000)} (coins)`, 1200, 1125);
    ctx.fillText(`n₁ = ${numberWithCommas(test.sample1.length)}`, 1200, 1160);
    ctx.fillText(`n₂ = ${numberWithCommas(test.sample2.length)}`, 1200, 1195);
}

function drawConclusion(ctx, test, itemName) {
    let interpretation;
    let conclusion;
    ctx.font = "40px sans-serif";
    if(test.rejectTest()[0]) {
        interpretation = `There is significant evidence at the α=${Math.round((1-test.significanceLevel)*1000)/1000} level of significance to support the \nclaim that the mean selling price of ${itemName} is greater than\nthe mean cost of the materials required to make it.`;
        conclusion = `Since we rejected Hₒ, it suggests that on average people earned more \ncoins from selling this item than it would have cost them to buy the materials.`;
        ctx.fillText(`Implication: the test suggests that on average we could make a profit from \nflipping this item.`, 50, 1900);
    } else {
        interpretation = `There is not significant evidence at the α=${Math.round((1-test.significanceLevel)*1000)/1000} level of significance to support the \nclaim that the mean selling price of ${itemName} is greater than\nthe mean cost of the materials required to make it.`;
        conclusion = `Since we failed to reject Hₒ, it suggests that on average people did not earn more\ncoins from selling this item than it would have cost them to buy the materials.`;
        ctx.fillText(`Implication: the test does not suggest that on average we could make a profit from \nflipping this item.`, 50, 1900);
    }
    ctx.fillText(interpretation, 50, 1500);
    ctx.fillText(conclusion, 50, 1750);

    
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}


module.exports = generateTestWriteup;
