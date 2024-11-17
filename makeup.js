const Decimal = require("decimal.js");

function MakeUp(total, prices) {
    this.total = total;
    this.pricesFormatted = prices
        .reduce((accumulator, { price, max }) => {
            accumulator.push(
                ...Array(max || Math.ceil(this.total / price)).fill(price)
            );
            return accumulator;
        }, [])
        .toSorted((a, b) => a - b);
    this.totalCalculated = Number.MAX_SAFE_INTEGER;
    this.groups = [];
    dfs.call(this, [], 0, new Decimal(0));
    this.groupsCoefficientBased = Array(this.groups.length)
        .fill()
        .map(() => []);
    for (let i = 0; i < this.groups.length; i++) {
        for (let j = 0; j < this.groups[i].length; j++) {
            const currentPrice = this.groups[i][j];
            if (this.groupsCoefficientBased[i].at(-1)?.price === currentPrice) {
                this.groupsCoefficientBased[i].at(-1).quantity++;
            } else {
                this.groupsCoefficientBased[i].push({
                    price: currentPrice,
                    quantity: 1,
                });
            }
        }
    }
}

function dfs(nums, index, sum) {
    if (sum.equals(this.total)) {
        this.groups = [nums.slice()];
        this.totalCalculated = this.total;
        return true;
    }
    if (sum.greaterThan(this.totalCalculated)) {
        return true;
    }
    if (sum.equals(this.totalCalculated)) {
        this.groups.push(nums.slice());
        return true;
    }
    if (sum.greaterThan(this.total)) {
        this.groups = [nums.slice()];
        this.totalCalculated = sum.toNumber();
        return true;
    }
    for (let i = index; i < this.pricesFormatted.length; i++) {
        if (
            i === index ||
            this.pricesFormatted[i] !== this.pricesFormatted[i - 1]
        ) {
            nums.push(this.pricesFormatted[i]);
            if (
                dfs.call(this, nums, i + 1, sum.plus(this.pricesFormatted[i]))
            ) {
                if (this.totalCalculated === this.total) {
                    return true;
                }
                nums.pop();
                break;
            }
            nums.pop();
        }
    }
}

module.exports = MakeUp;
