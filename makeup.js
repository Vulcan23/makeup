const Decimal = require("decimal.js");
/**
 *  总价total，数组arrChild
 *  先过滤arrChild：
 *      1.成倍数的直接不要
 *      2.关注最后一位有效数字，判断过了的放入新arr
 *      3.还不确定的，用二叉树判断求和判断是否放入新arr
 *      4.得到新arr
 *  关注total：
 *      1.可以提前得到新total……
 *  二叉树求得结果
 */
function MakeUp(total, arrChild) {
    this.total = new Decimal(total);
    if (this.total.decimalPlaces() > 2) {
        throw new Error("总价不可能小数点后超过两位");
    } else if (this.total.lessThanOrEqualTo(0)) {
        throw new Error("总价必须大于0");
    }

    // 小数点后超过两位的都不要，必须大于0
    this.arrChild = arrChild.map(value => new Decimal(value))
        .filter(value => value.decimalPlaces() <= 2 && value.greaterThan(0))
        .sort((a, b) => a.comparedTo(b));

    if (this.arrChild.length < 1) {
        throw new Error("过滤后arrChild没有元素");
    }

    // 经过计算后的明确可能性的total（预计比原先的total大）
    this.totalFormatted = undefined;

    // 经过计算后的明确可能性的arrChild（预计比原先的arrChild有更少的元素）
    this.arrChildFormatted = [];

    // 最终得到价格
    this.totalCombinations;

    // 最终得到的与arrChildFormatted匹配的系数（也就是凑单的件数）
    this.arrCoefficient = [];

    let result = isMultiple(this.total, this.arrChild);
    if (result[0]) {
        this.totalFormatted = this.total;
        this.arrChildFormatted.push(result[1]);
        this.totalCombinations = this.totalFormatted;
        this.arrCoefficient.push({
            key: result[1],
            number: this.totalFormatted.dividedBy(result[1]),
        });
        return toNumber(this);
    }
}

/**
 *  格式化得到arrChildFormatted
 */
MakeUp.prototype.fnFormatArr = function () {
    let arr = this.arrChild,
        arrNew = this.arrChildFormatted;

    if (arrNew.length > 0) {
        return;
    }

    arrNew.push(arr[0]);
    for (let i = 1; i < arr.length; i++) {
        let j = fnFormatArr_Preliminary(arr[i], arrNew);
        if (j > 0 || j === 0 && !fnFormatArr_Final(arr[i], arrNew)) {
            arrNew.push(arr[i]);
        }
    }
}

/**
 *  格式化得到totalFormatted
 */
MakeUp.prototype.fnFormatTotal = function () {
    let total = this.total,
        arr = this.arrChildFormatted;

    if (this.totalFormatted !== undefined) {
        return;
    }

    if (arr.length === 0) {
        this.fnFormatArr();
        return this.fnFormatTotal();
    }

    let [key, number] = getDigitsOfLastNonzeroEffectiveFigure(total),
        numUp = Number.MAX_SAFE_INTEGER,
        bIncrement = true,
        yesFive = false,
        yesEven = false;
    for (let i = 0; i < arr.length; i++) {
        let [ikey, inumber] = getDigitsOfLastNonzeroEffectiveFigure(arr[i]);
        if (key > ikey) {
            this.totalFormatted = total;
            break;
        } else if (key === ikey) {
            if (inumber === 5) {
                if (number === 5 || !isEven(number) && yesEven) {
                    bIncrement = false;
                } else {
                    if (!yesFive) {
                        yesFive = true;
                    }
                    numUp = 1;
                }
            } else {
                if (numUp > 0) {
                    numUp = 0;
                }
                if (!yesEven && isEven(inumber)) {
                    yesEven = true;
                }
                if (isEven(number) || !isEven(inumber)) {
                    bIncrement = false;
                }
            }
        } else {
            numUp = Math.min(numUp, ikey - key);
        }
        if (!bIncrement) {
            this.totalFormatted = total;
            break;
        }
        if (i === arr.length - 1) {
            if (numUp > 0) {
                if (yesFive && number < 5) {
                    this.totalFormatted = getBecomeFive(total);
                    break;
                } else {
                    total = getRoundUp(total, key, numUp);
                    [key, number] = getDigitsOfLastNonzeroEffectiveFigure(total);
                    i = -1;
                    // 此处可以思考：为什么numUp不用复原呢？
                    if (yesFive) {
                        yesFive = false;
                    }
                    if (yesEven) {
                        yesEven = false;
                    }
                }
            } else {
                this.totalFormatted = getSelfIncreasing(total, key);
                break;
            }
        }
    }
}

MakeUp.prototype.getCoefficient = function () {
    let total = this.totalFormatted,
        arr = this.arrChildFormatted;

    if (this.arrCoefficient.length > 0) {
        return;
    }

    if (total === undefined) {
        this.fnFormatTotal();
        return this.getCoefficient();
    }

    if (!total.equals(this.total)) {
        let result = isMultiple(total, arr);
        if (result[0]) {
            this.totalCombinations = total;
            this.arrCoefficient.push({
                key: result[1],
                number: total.dividedBy(result[1]),
            });
            return toNumber(this);
        }
    }

    let firstCoefficient = total.dividedBy(arr[0]).trunc();
    if (firstCoefficient.equals(0) || firstCoefficient.equals(1) || arr.length === 1) {
        this.totalCombinations = arr[0].times(firstCoefficient.plus(1));
        this.arrCoefficient.push({
            key: arr[0],
            number: firstCoefficient.plus(1),
        });
        return toNumber(this);
    }

    let arrMaximumCoefficient = [firstCoefficient].concat(arr.slice(1).map(value => total.dividedBy(value).trunc().plus(1))),
        /**
         *  缺省第一个系数
         */
        arrCoefficient = [new Decimal(1)].concat(getArray(arrMaximumCoefficient.length - 2)),
        markLimitsOfInspection = arrCoefficient.length - 1;

    // 预设第一个系数最大其余为零的情况，为下文（①处）省去判断
    this.totalCombinations = arr[0].times(arrMaximumCoefficient[0].plus(1));
    this.arrCoefficient = [arrMaximumCoefficient[0].plus(1)].concat(arrCoefficient).map((value, index) => ({
        key: arr[index],
        number: value,
    }));
    
    while (true) {
        let min = arrCoefficient.reduce((accumulator, currentValue, currentIndex) => accumulator.plus(arr[currentIndex + 1].times(currentValue)), new Decimal(0)),
            markLastChange,
            markLastChange0;

        if (min.greaterThanOrEqualTo(this.totalCombinations)) {
            markLastChange = (() => {
                let i = 0;
                for (; i < markLimitsOfInspection; i++) {
                    if (arrCoefficient[i].toNumber() !== 0) {
                        break;
                    }
                }
                return i;
            })();
            if (markLastChange === markLimitsOfInspection) {
                return toNumber(this);
            }
            markLastChange0 = ++markLastChange;
        } else {
            let max = arr[0].times(arrMaximumCoefficient[0]).plus(min);
            // 此处可以思考：会出现等于的情况吗？不会！
            if (max.greaterThan(total)) {
                // 于是不用判断等于的情况
                if (min.greaterThanOrEqualTo(total)) {
                    this.totalCombinations = min;
                    this.arrCoefficient = [new Decimal(0)].concat(arrCoefficient).map((value, index) => ({
                        key: arr[index],
                        number: value,
                    }));
                    if (this.totalCombinations.equals(total)) {
                        return toNumber(this);
                    }
                } else {// （①）此处可以思考：为什么省去else if max小于this.totalCombinations的判断
                    let from = new Decimal(1),
                        to = arrMaximumCoefficient[0].minus(1);
                    while (from.lessThanOrEqualTo(to)) {
                        let mid = from.plus(to).dividedBy(2).trunc();
                        let sum = arr[0].times(mid).plus(min);
                        if (sum.lessThan(total)) {
                            from = mid.plus(1);
                        } else if (sum.greaterThanOrEqualTo(this.totalCombinations)) {
                            to = mid.minus(1);
                        } else {
                            this.totalCombinations = sum;
                            this.arrCoefficient = [mid].concat(arrCoefficient).map((value, index) => ({
                                key: arr[index],
                                number: value,
                            }));
                            if (this.totalCombinations.equals(total)) {
                                return toNumber(this);
                            }
                        }
                    }
                }
            }
            markLastChange0 = markLastChange = 0;
        }
        while (arrCoefficient[markLastChange].equals(arrMaximumCoefficient[markLastChange + 1])) {
            if (markLastChange === markLimitsOfInspection) {
                if (markLimitsOfInspection-- === 0) {
                    return toNumber(this);
                }
                break;
            }
            arrCoefficient[++markLastChange] = arrCoefficient[markLastChange].plus(1);
        }
        markLastChange === markLastChange0 && (arrCoefficient[markLastChange0] = arrCoefficient[markLastChange0].plus(1));
        for (let i = 0; i < markLastChange; i++) {
            arrCoefficient[i] = new Decimal(0);
        }
    }
}


function isMultiple(total, arr) {
    for (let value of arr) {
        if (total.mod(value).toNumber() === 0) {
            return [true, value];
        }
    }
    return [false];
}

/**
 *  获取最后一位非零有效数字及其位数
 *  位数：0表示个位
 */
function getDigitsOfLastNonzeroEffectiveFigure(value) {
    let key = value.precision(true) - value.precision() - value.decimalPlaces(),
        number = parseInt(value.toString().match(/[1-9](?=0*$)/)[0], 10);
    return [key, number];
}

function isEven(number) {
    return number % 2 === 0;
}

function getArray(count) {
    return Array(count).fill(new Decimal(0));
}

/**
 *  最后一位非零有效数字变成5
 */
function getBecomeFive(value) {
    return new Decimal(value.toString().replace(/[1-9](?=0*$)/, "5"));
}

/**
 *  最后一位非零有效数字自增1
 */
function getSelfIncreasing(value, index) {
    return getRoundUp(value, index, 0);
}

/**
 *   最后一位非零有效数字进位
 */
function getRoundUp(value, index, length) {
    let addend = Decimal.pow(10, index + length);
    return value.plus(addend).minus(value.mod(addend));
}

function toNumber(decimal) {
    decimal.totalCombinations = decimal.totalCombinations.toNumber();
    decimal.arrCoefficient = decimal.arrCoefficient.map(value => {
        value.key = value.key.toNumber();
        value.number = value.number.toNumber();
        return value;
    });
}

/**
 *  初步判断：
 *      1.成倍关系返回-1
 *      2.需要进一步判断返回0
 *      3.确定加入返回1
 */
function fnFormatArr_Preliminary(total, arr) {
    if (isMultiple(total, arr)[0]) {
        return -1;
    }

    if (arr.length === 1) {
        return 1;
    }

    let [key, number] = getDigitsOfLastNonzeroEffectiveFigure(total),
        yesEven = false;
    for (let i of arr) {
        let [ikey, inumber] = getDigitsOfLastNonzeroEffectiveFigure(i);
        if (key > ikey) {
            return 0;
        }
        if (key === ikey) {
            if (!yesEven && isEven(inumber)) {
                yesEven = true;
            }
            if (inumber === 5 && (number === 5 || !isEven(number) && yesEven) || inumber !== 5 && (isEven(number) || !isEven(inumber))) {
                return 0;
            }
        }
    }
    return 1;
}

/**
 *  最终判断：二叉树求和，返回是否凑到
 */
function fnFormatArr_Final(total, arr) {
    let firstCoefficient = total.dividedBy(arr[0]).trunc();
    if (firstCoefficient.equals(1)) {
        return false;
    }

    let arrMaximumCoefficient = [firstCoefficient].concat(arr.slice(1).map(value => total.dividedBy(value).trunc())),
        /**
         *  缺省第一个系数
         */
        arrCoefficient = [new Decimal(1)].concat(getArray(arrMaximumCoefficient.length - 2)),
        markLimitsOfInspection = arrCoefficient.length - 1;
    while (true) {
        let min = arrCoefficient.reduce((accumulator, currentValue, currentIndex) => accumulator.plus(arr[currentIndex + 1].times(currentValue)), new Decimal(0)),
            markLastChange,
            markLastChange0;
        if (min.greaterThan(total)) {
            markLastChange = (() => {
                let i = 0;
                for (; i < markLimitsOfInspection; i++) {
                    if (arrCoefficient[i].toNumber() !== 0) {
                        break;
                    }
                }
                return i;
            })();
            if (markLastChange === markLimitsOfInspection) {
                return false;
            }
            markLastChange0 = ++markLastChange;
        } else {
            let max = arr[0].times(arrMaximumCoefficient[0]).plus(min);
            // 此处可以思考：会出现等于的情况吗？不会！
            if (max.greaterThan(total)) {
                if (min.equals(total)) {// 于是不用判断等于的情况
                    return true;
                }
                let from = new Decimal(1),
                    to = arrMaximumCoefficient[0].minus(1);
                while (from.lessThanOrEqualTo(to)) {
                    let mid = from.plus(to).dividedBy(2).trunc();
                    let i = arr[0].times(mid).plus(min).comparedTo(total);
                    if (i === 0) {
                        return true;
                    } else if (i < 0) {
                        from = mid.plus(1);
                    } else {
                        to = mid.minus(1);
                    }
                }
            }
            markLastChange0 = markLastChange = 0;
        }
        while (arrCoefficient[markLastChange].equals(arrMaximumCoefficient[markLastChange + 1])) {
            if (markLastChange === markLimitsOfInspection) {
                if (markLimitsOfInspection-- === 0) {
                    return false;
                }
                break;
            }
            arrCoefficient[++markLastChange] = arrCoefficient[markLastChange].plus(1);
        }
        markLastChange === markLastChange0 && (arrCoefficient[markLastChange0] = arrCoefficient[markLastChange0].plus(1));
        for (let i = 0; i < markLastChange; i++) {
            arrCoefficient[i] = new Decimal(0);
        }
    }
}

module.exports = MakeUp;