const MakeUp = require("./makeup.js");

let map = new MakeUp(4444, [{ price: 17.8, restriction: 1 }, { price: 19.9, restriction: 99 }, { price: 29.9, restriction: 125 }]);
map.getCoefficient();
console.log(map.totalCombinations);
console.log(map.arrCoefficient);