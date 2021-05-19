const MakeUp = require("./makeup.js");

let map = new MakeUp(4444, [{ price: 17.8, restriction: 999 }, { price: 19.9, restriction: 33 }, 29.9]);
map.getCoefficient();
console.log(map.totalCombinations);
console.log(map.arrCoefficient);