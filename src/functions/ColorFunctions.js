export function getSelectColor() {
    return '#113871';
}

export function getHighlightedColor() {
    return '#DD55DD';
}

export function getWhiteColor() {
    return '#F7FFF7';
}

export function getCNVColorMask() {
    return [250, 0, 0];
}

export function getMutationColorMask() {
    return [0, 0, 200];
}

export function getCNVHighColorMask() {
    return [255, 0, 0];
}

export function getCNVLowColorMask() {
    return [0, 0, 255];
}

export function getMutation4ColorMask() { // same as CNV deleteion, loss of function
    // return [155, 100, 0];
    return [0, 0, 255];
}

export function getMutation3ColorMask() { //same as Xena VS, splice
    // return [150, 165, 0];
    return [255, 127, 14]
}

export function getMutation2ColorMask() { // same as Xena VS, missense/in_frame
    //return [0, 100, 155];
    return [31, 119, 180];
}

export function getGeneColorMask() {
    return [26, 83, 92];
}


export function getGeneSetColorMask() {
    return [255, 10, 10];
}

export function adjustScore(score) {
    return Math.log10(100 * score);
}

/**
 *
 * https://github.com/jingchunzhu/wrangle/blob/master/xenaGo/chiSquare.py#L62
 * @returns {*}
 * @param observed
 * @param expected
 * @param total
 *
 */
export function scoreChiSquaredData(observed, expected, total) {
    let expected2 = total - expected;
    let observed2 = total - observed;
    let chiSquaredValue = Math.pow(expected - observed,2.0)  / expected + Math.pow(expected2 - observed2,2.0) / expected2;
    chiSquaredValue = chiSquaredValue * ((expected > observed) ? -1 : 1);
    return chiSquaredValue;
}

// https://en.wikipedia.org/wiki/Chi-squared_test
export function scoreChiSquareTwoByTwo (observed11, observed12, observed21, observed22) {
    let rowTotal1 = observed11 + observed12,
        rowTotal2 = observed21 + observed22,
        columnTotal1 = observed11 + observed21,
        columnTotal2 = observed12 + observed22,
        total = rowTotal1 + rowTotal2,
        expected11 = columnTotal1 * rowTotal1 / total,
        expected12 = columnTotal2 * rowTotal1 / total,
        expected21 = columnTotal1 * rowTotal2 / total,
        expected22 = columnTotal2 * rowTotal2 / total;

    let chiSquareValue = Math.pow(observed11 - expected11, 2.0) / expected11 +
        Math.pow(observed12 - expected12, 2.0) / expected12 +
        Math.pow(observed21 - expected21, 2.0) / expected21 +
        Math.pow(observed22 - expected22, 2.0) / expected22;

    return chiSquareValue;
}

/**
 * label is just for density
 * @param score
 * @param numSamples
 * @param geneCount
 * @returns {*}
 */
export function scoreData(score, numSamples, geneCount) {
    if (score === 0) {
        return 0;
    }
    // let inputScore = score / (numSamples * geneCount);
    // return adjustScore(inputScore);
    return score / (numSamples * geneCount);
}

