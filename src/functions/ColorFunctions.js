export function getSelectColor() {
    return '#113871';
}

export function getHighlightedColor() {
    return '#DD55DD';
}

export function getWhiteColor() {
    return '#F7FFF7';
}

export function getDarkColor() {
    return '#1A535C';
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

    let chiSquaredValue = (expected - observed) * (expected - observed) / expected + (expected2 - observed2) / expected2;

    chiSquaredValue = chiSquaredValue * ((expected > observed) ? -1 : 1);

    // if(expected > observed){
    //     console.log('expected ',expected,'>',observed);
    // }

    return chiSquaredValue;
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
    let inputScore = score / (numSamples * geneCount);
    return adjustScore(inputScore);
}

