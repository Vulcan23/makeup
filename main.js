const MakeUp = require("./makeup.js");

const map = new MakeUp(700, [
    {
        price: 19.9,
        max: 19,
    },
    {
        price: 29.9,
        // max: 1,
    },
    {
        price: 38.9,
        max: 17,
    },
]);
console.log(map.total);
console.log(map.totalCalculated);
console.log(map.groupsCoefficientBased);
