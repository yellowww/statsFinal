const tDist = require("./tDistribution.js");

class DiffMeanTest {
    sample1 = [];
    sample2 = [];
    testStat;
    significanceLevel;
    constructor(_sample1, _sample2,significanceLevel) {
        this.sample1 = _sample1;
        this.sample2 = _sample2;
        this.significanceLevel = significanceLevel;
    }
    mean(data) {
        let sum = 0;
        for(let i=0;i<data.length;i++) sum+=data[i];
        return sum/data.length;
    }
    sigma(data) {
        const mean = this.mean(data);
        let meanDiff = 0;
        for(let i=0;i<data.length;i++) meanDiff += (data[i] - mean) ** 2;
        return Math.sqrt(meanDiff/data.length);
    }
    sx(data) {
        const mean = this.mean(data);
        let meanDiff = 0;
        for(let i=0;i<data.length;i++) meanDiff += (data[i] - mean) ** 2;
        return Math.sqrt(meanDiff/(data.length-1));
    }
    getTestStat() {
        const sampleMeanDifference = this.mean(this.sample1) - this.mean(this.sample2);
        const standardError = Math.sqrt( (this.sx(this.sample1)**2/this.sample1.length) + (this.sx(this.sample2)**2/this.sample2.length) );
        this.testStat = sampleMeanDifference / standardError;
        return sampleMeanDifference / standardError; 
    }
    rejectTest() { // right tail test [reject?, cv, p-value]
        if(this.testStat == undefined) this.getTestStat();
        if(isNaN(this.testStat)) return;
        let df = (this.sample1.length < this.sample2.length? this.sample1.length:this.sample2.length) - 1;
        const cv = tDist.invCDF(this.significanceLevel,df, 0.00001);
        let pValue = 1 - tDist.CDF(this.testStat,df);
        return [this.testStat>cv, cv, pValue];
    }
}

module.exports = DiffMeanTest;