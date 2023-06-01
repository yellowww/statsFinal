function fromPercentiles(data, percentile) {
    const sorted = data.sort((a,b)=>a-b);
    if(percentile === 1) return sorted[sorted.length-1]
    const index = Math.floor(percentile*data.length);
    return sorted[index];
}

function toPercentile(data, value,alreadyUsed) {
    if(alreadyUsed == undefined) alreadyUsed = [];
    const sorted = data.sort((a,b)=>a-b);
    let removed = 0;
    for(let i=0;i<alreadyUsed.length;i++) {
        if(alreadyUsed[i] == value) {
            sorted.splice(sorted.indexOf(alreadyUsed[i]),1);
            removed++;
        }
    }
    let index = sorted.indexOf(value)+removed;
    if(index == 0) index = 0.1;
    return index/data.length;
}

function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

function seperateOutliers(data) {
    const p75 = fromPercentiles(data,0.75) , p25 = fromPercentiles(data,0.25)
    const iqr = p75 - p25;
    const max = p75+1.5*iqr, min = p25-1.5*iqr;
    const outliers = [];
    const nonOutliers = [];
    for(let i=0;i<data.length;i++) {
        if(data[i]>max || data[i]<min) outliers.push(data[i]);
        else nonOutliers.push(data[i]);
    }
    return [nonOutliers, outliers];
}

function getValueDimentions(Odataset0, Odataset1, removeOutliers) {
    const dataset0 = seperateOutliers(Odataset0)[0];
    const numberSummery0 = [fromPercentiles(dataset0, 0), fromPercentiles(dataset0, 0.25), fromPercentiles(dataset0, 0.5), fromPercentiles(dataset0, 0.75), fromPercentiles(dataset0,1)];
    const min0 = removeOutliers?numberSummery0[0]:Math.min(...Odataset0);
    const max0 = removeOutliers?numberSummery0[4]:Math.max(...Odataset0);

    const dataset1 = seperateOutliers(Odataset1)[0];
    const numberSummery1 = [fromPercentiles(dataset1, 0), fromPercentiles(dataset1, 0.25), fromPercentiles(dataset1, 0.5), fromPercentiles(dataset1, 0.75), fromPercentiles(dataset1,1)];
    const min1 = removeOutliers?numberSummery1[0]:Math.min(...Odataset1);
    const max1 = removeOutliers?numberSummery1[4]:Math.max(...Odataset1);

    const min = min0<min1?min0:min1;
    const max = max0>max1?max0:max1;
    return [min,max];
}

function generateBoxplot(ctx, originalDataset,dimentions, removeOutliers, color, valueDimentions) {
    const dataset = seperateOutliers(originalDataset)[0];
    const numberSummery = [fromPercentiles(dataset, 0), fromPercentiles(dataset, 0.25), fromPercentiles(dataset, 0.5), fromPercentiles(dataset, 0.75), fromPercentiles(dataset,1)];
    const min = valueDimentions[0];
    const max = valueDimentions[1];
    const range = max-min;
    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = color;
    const linePositions = [];
    for(let i=0;i<5;i++) { 
        const x = ((numberSummery[i]-min)/range)*dimentions[2]+dimentions[0];
        ctx.moveTo(x, dimentions[1]);
        ctx.lineTo(x, dimentions[1]+dimentions[3]);
        linePositions.push(x);
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(linePositions[0], dimentions[1]+dimentions[3]/2);
    ctx.lineTo(linePositions[1], dimentions[1]+dimentions[3]/2);
    ctx.moveTo(linePositions[3], dimentions[1]+dimentions[3]/2);
    ctx.lineTo(linePositions[4], dimentions[1]+dimentions[3]/2);
    ctx.moveTo(linePositions[1], dimentions[1]);
    ctx.lineTo(linePositions[3], dimentions[1]);
    ctx.moveTo(linePositions[1], dimentions[1]+dimentions[3]);
    ctx.lineTo(linePositions[3], dimentions[1]+dimentions[3]);
    ctx.stroke();



    if(removeOutliers) return;
    ctx.beginPath();
    ctx.lineWidth = 2;
    const outliers = seperateOutliers(originalDataset)[1];
    for(let i=0;i<outliers.length;i++) {
        const x = ((outliers[i]-min)/range)*dimentions[2]+dimentions[0];
        const y = dimentions[1] + dimentions[3]/2;
        ctx.rect(x-5,y-5,10,10);
    }
    ctx.stroke();
}

function generateBoxplotDesc(ctx,title, dimentions, roundingRule, valueDimentions) {
    const range = valueDimentions[1] - valueDimentions[0];
    ctx.textAlign = "center";
    ctx.font = `33px sans-serif`;
    ctx.fillStyle = "black";
    ctx.fillText(title, dimentions[0]+dimentions[2]/2, dimentions[1]-35);

    ctx.beginPath();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.moveTo(dimentions[0], dimentions[1]+dimentions[3]+6);
    ctx.lineTo(dimentions[0]+dimentions[2], dimentions[1]+dimentions[3]+6);
    ctx.stroke();

    const markers = 10;
    ctx.font = `25px sans-serif`;
    ctx.textAlign = "left";
    let maxPriceLength;
    for(let i=0;i<=markers;i++) {
        const x = (i/markers)*dimentions[2]+dimentions[0]-12;
        const price = (i/markers)*range + valueDimentions[0];
        ctx.save();
        ctx.translate(x, dimentions[1]+dimentions[3]+10);
        ctx.rotate(Math.PI/2);
        const text = numberWithCommas(Math.round(price/roundingRule[0]));
        ctx.fillText(text, 0, 0);
        ctx.restore();
        if(i==markers-1) maxPriceLength = ctx.measureText(text).width;
    }

    ctx.textAlign = "center";
    ctx.font = `30px sans-serif`;
    ctx.fillText("("+roundingRule[1]+")", dimentions[0]+dimentions[2]/2, dimentions[1]+dimentions[3]+maxPriceLength+43);
}

function drawKey(ctx,dimentions, color0, color1, text0, text1) {
    ctx.fillStyle = color0;
    ctx.textAlign = "left";
    ctx.font = `35px sans-serif`;
    ctx.fillRect(dimentions[0],dimentions[1], 40, 40);
    ctx.fillText(text0, dimentions[0] + 50, dimentions[1]+33);
    ctx.fillStyle = color1;
    ctx.fillRect(dimentions[0],dimentions[1]+60, 40, 40);
    ctx.fillText(text1, dimentions[0] + 50, dimentions[1]+93);
    ctx.fillStyle = "black";
    ctx.font = `40px sans-serif`;
    ctx.fillText("Key: ", dimentions[0], dimentions[1]-20);
}

function numberSummery(ctx, dimentions, data, color,roundingRule) {
    let text  = "";
    const withoutOutliers = seperateOutliers(data)[0];
    const percentiles = [[0,"min"],[0.25, "q1"], [0.5, "median"], [0.75, "q3"], [1, "max"]];
    for(let i=0;i<percentiles.length;i++) {
        text += percentiles[i][1] +": "+numberWithCommas(Math.round(fromPercentiles(withoutOutliers,percentiles[i][0])/roundingRule[0]));
        if(i!==percentiles.length-1) text += ", ";
    }
    ctx.fillStyle = color;
    ctx.font = `35px sans-serif`;
    ctx.fillText(text, dimentions[0], dimentions[1]);
}

module.exports.seperateOutliers = seperateOutliers;
module.exports.draw = generateBoxplot;
module.exports.getValueDimentions = getValueDimentions;
module.exports.drawDesc = generateBoxplotDesc;
module.exports.drawKey = drawKey;
module.exports.fromPercentiles = fromPercentiles;
module.exports.summery = numberSummery;
module.exports.toPercentile = toPercentile;