const MakeUp = require("./makeup.js");

let map = new MakeUp(700.11, [{ price: 19.9, restriction: 100 }, 29.9, { price: 38.9, restriction: 17 }, 9.95, { price: 0.01, restriction: 75 }]);
map.getCoefficient();
console.log(map.totalCombinations);
console.log(map.arrCoefficient);