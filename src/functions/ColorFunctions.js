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

export function getPathwayColorMask() {
    return [255, 10, 10];
}

export function adjustScore(score) {
    return Math.log10(100 * score);
}

/**
 * label is just for density
 * @param score
 * @param numSamples
 * @param geneCount
 * @returns {*}
 */
export function scoreData(score, numSamples, geneCount) {
    if(score === 0){
        return 0 ;
    }
    let inputScore = score / (numSamples * geneCount);
    return adjustScore(inputScore);
}

