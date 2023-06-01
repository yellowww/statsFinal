function numberWithCommas(x) {
    return x.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}


function gapTest(dataset,bars) {
    const min = Math.min(...dataset), max  = Math.max(...dataset), range = max-min;
    const barWidth = range / bars;
    const barHeights = [];
    const barBounteries = []
    for(let i=0;i<bars;i++) {
        const barMin = i==0?(barWidth*i+min-1):(barWidth*i+min);
        const barMax = (barWidth*(i+1)+min);
        const frequency = getFrequency(dataset, barMin, barMax);
        barHeights.push(frequency);
        barBounteries.push([barMin,barMax]);
    }
    const gaps = []
    let tracker = -1;
    for(let i=1;i<bars;i++) {
        //console.log(barBounteries[i], barHeights[i]);
        if(barHeights[i-1] > 0 && barHeights[i] <= 0) tracker = i-1; 
        //console.log(tracker);
        if(barHeights[i] > 0) {
            if(tracker >= 0) {
                gaps.push([barBounteries[tracker][1], barBounteries[i][0]]);
                tracker = -1;
            };
        }
        
    }
    return gaps;
}


function generateHistogram(ctx, dataset, bars, dimentions, roundingRule, title, xLabel) {
    const min = Math.min(...dataset), max  = Math.max(...dataset), range = max-min;
    const barWidth = range / bars;
    const pxBarWidth = dimentions[2]/bars;
    const barHeights = [];
    const barBounteries = []
    for(let i=0;i<bars;i++) {
        const barMin = i==0?(barWidth*i+min-1):(barWidth*i+min);
        const barMax = (barWidth*(i+1)+min);
        const frequency = getFrequency(dataset, barMin, barMax);
        barHeights.push(frequency);
        barBounteries.push([barMin,barMax]);
    }
    if(bars > 1) {
        let only1Bar = true;
        for(let i=1;i<bars;i++) if(barHeights[i]>0) only1Bar = false;
        if(only1Bar) return generateHistogram(ctx, dataset, 1, dimentions, roundingRule, title, xLabel);
    }

    //bars
    const maxBarHeight = Math.max(...barHeights);
    for(let i=0;i<barHeights.length;i++) {
        const pxHeight = barHeights[i]/maxBarHeight * dimentions[3];
        const barVerticalOffset = dimentions[3] - pxHeight;
        ctx.fillStyle = i%2==0?"rgb(150,150,150)":"rgb(100,100,100)";
        const x = Math.round(dimentions[0]+i*pxBarWidth), y= Math.round(dimentions[1]+barVerticalOffset), w = Math.round(pxBarWidth), h = Math.round(pxHeight);
        ctx.fillRect(x,y,w,h);
    }

    // frequency markers
    let frequencyMarkers = 5;
    if(maxBarHeight<2*frequencyMarkers) frequencyMarkers=maxBarHeight;
    ctx.fillStyle = "black";
    ctx.font = `25px sans-serif`;
    for(let i=0;i<frequencyMarkers+1;i++) {
        const pxY = dimentions[1] + dimentions[3]/frequencyMarkers*(frequencyMarkers-i) + 25;
        const frequencyMarker = numberWithCommas(Math.round(i/frequencyMarkers * maxBarHeight));
        const pxX = dimentions[0] - ctx.measureText(frequencyMarker).width - 10;
        ctx.fillText(frequencyMarker, pxX, pxY);
    }

    //y axis label
    ctx.font = `35px sans-serif`;
    ctx.save();
    ctx.translate(dimentions[0]-130, dimentions[1]+dimentions[3]/2);
    ctx.rotate(Math.PI/2);
    ctx.textAlign = "center";
    ctx.fillText("Frequency", 0, 0);
    ctx.restore();

    // bottom line
    ctx.lineWidth = 2;
    ctx.strokeStyle = "black";
    ctx.moveTo(dimentions[0], dimentions[1]+dimentions[3]);
    ctx.lineTo(dimentions[0]+dimentions[2], dimentions[1]+dimentions[3]);
    ctx.stroke();

    // left line
    ctx.moveTo(dimentions[0], dimentions[1]);
    ctx.lineTo(dimentions[0], dimentions[1]+dimentions[3]);
    ctx.stroke();

    //bar intervals
    ctx.font = `25px sans-serif`;
    ctx.textAlign = "left";
    let maxPriceLength;
    for(let i=0;i<bars;i++) {
        const x = Math.round(dimentions[0]+i*pxBarWidth);
        ctx.save();
        ctx.translate(x + pxBarWidth/2.5, dimentions[1]+dimentions[3]+5);
        ctx.rotate(Math.PI/2);
        const text = `${numberWithCommas(Math.round(barBounteries[i][0]/roundingRule[0])+(i==0?0:1))} - ${numberWithCommas(Math.round(barBounteries[i][1]/roundingRule[0]))}`;
        ctx.fillText(text, 0, 0);
        ctx.restore();
        if(i==Math.ceil(bars/2)) maxPriceLength = ctx.measureText(text).width;
    }

    // x axis label
    ctx.textAlign = "center";
    ctx.font = `30px sans-serif`;
    ctx.fillText(xLabel+" ("+roundingRule[1]+")", dimentions[0]+dimentions[2]/2, dimentions[1]+dimentions[3]+maxPriceLength+50);

    //title
    ctx.font = `40px sans-serif`;
    ctx.fillText(title, dimentions[0]+dimentions[2]/2, dimentions[1]-35);
}

function getFrequency(dataset,min,max) {
    let f=0;
    for(let i=0;i<dataset.length;i++) if(dataset[i]>min && dataset[i]<=max) f++;
    return f;
}

module.exports = generateHistogram;
module.exports.gapTest = gapTest;