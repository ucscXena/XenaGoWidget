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
    return [255, 107, 107];
}

export function fontColor(colorDensity, selected, hovered) {
    // let {selected, hovered} = this.props;

    if (hovered) {
        return !selected ? getDarkColor() : getHoverColor(colorDensity);
    }

    if (selected) {
        return getWhiteColor();
    }


    return colorDensity < 0.7 ? 'black' : getWhiteColor();
}

/**
 *
 * @param density
 * @param geneLength
 * @param highScore
 * @param maxColor
 * @returns {number}
 */
export function getColorDensity(density, geneLength, highScore,maxColor) {
    let color = Math.round(maxColor * (1.0 - (density / geneLength / highScore)));
    return 1 - color / 256;
}

