const boxplot = require('./boxplot.js');
const histogram = require('./histogram.js');

function generateInterpretation(rawDataset) {
    dataset = boxplot.seperateOutliers(rawDataset)[0];
    const percentiles = [boxplot.fromPercentiles(dataset, 0), boxplot.fromPercentiles(dataset, 0.25), boxplot.fromPercentiles(dataset, 0.5), boxplot.fromPercentiles(dataset, 0.75), boxplot.fromPercentiles(dataset,1)];
    const iqr = percentiles[3] - percentiles[1];
    const center = `The distribution is centered around ${numberWithCommas(Math.round(percentiles[2]))} coins (median).`;
    const relativeVariability = iqr / percentiles[2];
    let variabilityDescription;
    if(relativeVariability > 3)  variabilityDescription = "high";
    else if(relativeVariability > 2) variabilityDescription = "moderate";
    else variabilityDescription = "low";
    const variability = `It has a ${variabilityDescription} variability (IQR of ${numberWithCommas(Math.round(iqr))} coins)`
    
    const relativeSkew = mean(dataset) / percentiles[2];
    let skewDescription;
    if(relativeSkew > 1.05) skewDescription = "skewed right";
    else if(relativeSkew < 1/1.05) skewDescription = "skewed left";
    else skewDescription = "mostly symmetrical";

    const gaps = histogram.gapTest(dataset,12);
    let gapsDescription = "There are many large gaps in the distribution";
    if(gaps.length <= 4) {
        gapsDescription = gaps.length==1?"There is a large gap between ":"There are large gaps between ";
        for(let i=0;i<gaps.length;i++) {
            gapsDescription += numberWithCommas(Math.round(gaps[i][0])) + " - " + numberWithCommas(Math.round(gaps[i][1])) + " coins"
            if(i<gaps.length-1) gapsDescription+= (i==gaps.length-2?(gaps.length==2?" and ":", and "):", ");
        }
    }
    if(gaps.length == 0) {
        gapsDescription = "There are no large gaps in the distribution";
    }

    const outliers = boxplot.seperateOutliers(rawDataset)[1];
    const lowOutliers = [], highOutliers = [];
    for(let i=0;i<outliers.length;i++) {
        if(outliers[i]<percentiles[2]) lowOutliers.push(outliers[i]);
        else highOutliers.push(outliers[i]);
    }
    let outlierDescription = `There are ${lowOutliers.length} outliers on the low end`;
    if(lowOutliers.length > 0) outlierDescription+= ", the lowest being "+numberWithCommas(Math.round(Math.min(...lowOutliers)))+" coins";
    outlierDescription += ` and ${highOutliers.length} outliers on the high end`;
    if(highOutliers.length > 0) outlierDescription+= ", the highest being "+numberWithCommas(Math.round(Math.max(...highOutliers)))+" coins";
    const interpretation = `${center} ${variability} and is ${skewDescription}. ${gapsDescription}. ${outlierDescription}.`;
    return interpretation;
}

function splitOnLines(ctx, string, width) {
    let split = [];
    let currentStr = "";
    let spaceSplit = string.split(' ');
    for(let i=0;i<spaceSplit.length;i++) {
        if(ctx.measureText(currentStr+spaceSplit[i]).width > width) {
            split.push(currentStr);
            currentStr="";
        };
        currentStr+=spaceSplit[i]+" ";
    }
    split.push(currentStr);
    return split.join("\n");
}

function drawInterpretation(ctx,data,dimentions) {
    const string = generateInterpretation(data); 
    const split = splitOnLines(ctx, string, dimentions[2]);
    ctx.fillStyle = "black";
    ctx.font = `40px sans-serif`;
    ctx.fillText(split, dimentions[0], dimentions[1]);
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function mean(dataset) {
    let sum=0;
    for(let i=0;i<dataset.length;i++)sum+=dataset[i];
    return sum/dataset.length;
}

module.exports.bigFive = generateInterpretation;
module.exports.draw = drawInterpretation;
