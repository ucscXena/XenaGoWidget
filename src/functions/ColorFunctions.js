const DEFAULT_MAX_COLOR = 256;

export function getSelectColor() {
    return '#113871';
}

export function getHoverColor(score) {
    return 'rgba(255, 230, 109, ' + score + ')';
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
    // return [255, 107, 107];
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
 * @param label
 * @returns {*}
 */
export function scoreData(score, numSamples, geneCount) {
    if(score === 0){
        return 0 ;
    }
    let inputScore = score / (numSamples * geneCount);
    return adjustScore(inputScore);
}

