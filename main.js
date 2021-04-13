const MakeUp = require("./makeup.js");

let map = new MakeUp(700, [19.9, 29.9, 38.9]);
map.getCoefficient();
console.log(map.totalCombinations);
console.log(map.arrCoefficient);