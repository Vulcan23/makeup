const MakeUp = require("./makeup.js");

let map = new MakeUp(700, [{ price: 19.9, restriction: 1 }, 29.9, { price: 38.9, restriction: 17 }]);
map.getCoefficient();
console.log(map.totalCombinations);
console.log(map.arrCoefficient);