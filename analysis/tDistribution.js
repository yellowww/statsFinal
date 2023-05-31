const T = require( '@stdlib/stats-base-dists-t' ).T;


module.exports.CDF = (cv, df)=>{return new T(df).cdf(cv)};

module.exports.invCDF = (p, df,accuracy) => {
    if(p == 0.5) return 0;
    if(accuracy === undefined) accuracy = 0.00001;
    const dist = new T(df);
    let lb = -5;
    let rb = 5;
    for(let i=0;i<2000;i++) {
        const mean = (lb+rb) / 2;
        const cdf = dist.cdf(mean);
        if(cdf < p) lb = mean;
        else rb = mean;
        if(Math.round(p / accuracy)*accuracy === Math.round(cdf / accuracy)*accuracy) break;
    }
    return (lb+rb) / 2;
}
