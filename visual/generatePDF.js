const fs = require('fs');


function generatePDF(totalItems, name) {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(`./writeUp/${name}.pdf`));
    for(let i=0;i<totalItems;i++) {
        if(i>0) doc.addPage();
        doc.image(`./writeUp/displays/display${i}.png`,0,0,{width:doc.page.width,height:doc.page.height});
        doc.addPage();
        doc.image(`./writeUp/tests/test${i}.png`,0,0,{width:doc.page.width,height:doc.page.height});
    }
    doc.end();
}

function generatePDFBrief(name) {
    const PDFDocument = require('pdfkit');
    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(`./writeUp/${name}.pdf`));
    doc.image(`./writeUp/displays/display${21}.png`,0,0,{width:doc.page.width,height:doc.page.height});
    doc.addPage();
    doc.image(`./writeUp/tests/test${21}.png`,0,0,{width:doc.page.width,height:doc.page.height});
    doc.end();
}

module.exports.extended = generatePDF;
module.exports.brief = generatePDFBrief;