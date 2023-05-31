const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
app.use(express.static('./public'));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true}));

const fs = require("fs");
const named = JSON.parse(fs.readFileSync("./data/filtered/named.json"));
const namedKeys = Object.keys(named);
const bz = JSON.parse(fs.readFileSync("./data/raw/bazaar.json"));
const bzKeys = Object.keys(bz[0].products);
const state = JSON.parse(fs.readFileSync("./data/labeling/labelingState.json"));
const labeled = JSON.parse(fs.readFileSync("./data/labeling/labeledItems.json"));
const awaitingIndexes = [];

function initExit() {
    process.on('SIGINT', forceFlush);
    process.on('SIGUSR1', forceFlush);
    process.on('SIGUSR2', forceFlush);
}

function initState() {
    state.remainingIndexes = [];
    for(let i=0;i<namedKeys.length;i++) {
        state.remainingIndexes.push(i);
    }
    fs.writeFileSync("./data/labeling/labelingState.json", JSON.stringify(state));
}

function getNextItem() {
    if(state.remainingIndexes.length == 0) return {remaining:0};
    const index = state.remainingIndexes[0];
    state.remainingIndexes.splice(0,1);
    awaitingIndexes.push({index:index,date:new Date().getTime()});
    return {index:index, name:namedKeys[index], remaining:state.remainingIndexes.length+awaitingIndexes.length, bzKeys:bzKeys};
}

function forceFlush() {
    flushAwaiting(true);
    process.exit(0);
}

function flushAwaiting(force) {
    const date = new Date().getTime();
    for(let i=0;i<awaitingIndexes.length;i++) {
        if(date - awaitingIndexes[i].date > 5*60*1000 || force) {
            state.remainingIndexes.push(awaitingIndexes[i].index);
            awaitingIndexes.splice(i,1);
            i--;
        }
    }
    fs.writeFileSync("./data/labeling/labelingState.json", JSON.stringify(state));
    if(!force) setTimeout(()=>{flushAwaiting(false)},60000);
}



app.get('/getItem', (req, res) => {
    res.send(JSON.stringify(getNextItem()));
});

app.post("/submitMats", (req,res) => {
    const parsed = JSON.parse(req.body.formInput);
    const i = awaitingIndexes.map(e=> e.index).indexOf(parsed.itemIndex);
    if(i>=0) {
        awaitingIndexes.splice(i, 1);
        labeled.push(parsed);
    }
    fs.writeFileSync("./data/labeling/labeledItems.json", JSON.stringify(labeled));
    fs.readFile(path.join(__dirname, './public/home.html'), 'utf-8', (err,html) => {
        if(err) return console.error(err);
        res.set('Content-Type', 'text/html')
        res.send(html);
    });
});

app.get('/*', (req, res) => {
    fs.readFile(path.join(__dirname, './public/home.html'), 'utf-8', (err,html) => {
        if(err) return console.error(err);
        res.set('Content-Type', 'text/html')
        res.send(html);
    });
});

// initState();
// flushAwaiting(false);
// app.listen(3321, ()=>console.log("running on port 3321"));
// initExit();
