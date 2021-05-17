const MakeUp = require("./makeup.js");

let map = new MakeUp(4444, [19.9, 29.9]);
map.getCoefficient();
console.log(map.totalCombinations);
console.log(map.arrCoefficient);