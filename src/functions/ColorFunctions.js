
const DEFAULT_MAX_COLOR = 256 ;

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

export function fontColor(selected,hovered,colorDensity) {

    // console.log('COLOR BE',selected,hovered,colorDensity);
    if (hovered) {
        // return !selected ? getDarkColor() : getHoverColor(colorDensity);
        return  getDarkColor() ;
    }

    // if (selected) {
    //     return getWhiteColor();
    // }


    let finalColor = colorDensity < 0.7 ? 'black' : getWhiteColor();
    // console.log('FIONAL color',finalColor);
    return finalColor
}

/**
 *
 * @param density
 * @param geneLength
 * @param highScore
 * @returns {number}
 */
export function getColorDensity(density, geneLength, highScore) {
    if(highScore===0) return 1 ;

    let color = Math.round(DEFAULT_MAX_COLOR * (1.0 - (density / geneLength / highScore)));
    return 1 - color / DEFAULT_MAX_COLOR;
}

/**
 *
 * @param density
 * @param highScore
 * @returns {number}
 *
 * Should return a number from 1 to 256 based on the density.
 *
 * If the high score is 0 (nothing is there), thit it will return 1 for no alpha.
 *
 * As the density approaches 1, it should go to t.
 *
 */
export function normalizedColor(density,  highScore) {
    if(highScore===0) return 1 ;

    // let color = Math.round(DEFAULT_MAX_COLOR * (1.0 - (density /  highScore)));
    // return 1 - color / DEFAULT_MAX_COLOR;

    return density;
}
