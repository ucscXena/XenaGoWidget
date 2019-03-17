import {reduceByKey, map2, /*partition, */partitionN} from './util';
import {range} from 'underscore';
import React from "react";
import {getCNVColorMask, getGeneColorMask, getGeneSetColorMask, getMutationColorMask} from '../functions/ColorFunctions'
import {GENE_LABEL_HEIGHT} from "../components/PathwayScoresView";
import {
    getCNVHighColorMask,
    getCNVLowColorMask,
    getMutation2ColorMask,
    getMutation3ColorMask,
    getMutation4ColorMask
} from "./ColorFunctions";

export const COLOR_BY_TYPE = 'COLOR_BY_TYPE';

function clearScreen(vg, width, height) {
    vg.save();
    vg.fillStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
    vg.strokeStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
    vg.fillRect(0, 0, width, height);
}

function findRegions(height, count) {
    // Find pixel regions having the same set of samples, e.g.
    // 10 samples in 1 px, or 1 sample over 10 px. Record the
    // range of samples in the region.
    let regions = reduceByKey(range(count),
        i => ~~(i * height / count),
        (i, y, r) => r ? {...r, end: i} : {y, start: i, end: i});
    let starts = Array.from(regions.keys());
    let se = partitionN(starts, 2, 1, [height]);

    // XXX side-effecting map
    map2(starts, se, (start, [s, e]) => regions.get(start).height = e - s);

    return regions;
}

function regionColor(data, type) {
    // let total = data.reduce(sumDataTotal(0));
    let total = sumDataByType(data, type);
    if (total === 0) return 0;
    let p = total / data.length;
    let scale = 5;
    return 255 * p / scale;
}

export function sumDataByType(data, type) {
    let total = 0;
    data.forEach(d => total += d[type]);
    return total;
}


function drawGeneDataTotal(ctx, width, totalHeight, layout, data, labelHeight, colorMask, cohortIndex) {
    let height = totalHeight - labelHeight;
    let tissueCount = data[0].length;
    let regions = findRegions(height, tissueCount);
    let img = ctx.createImageData(width, totalHeight);

    let offsetHeight = cohortIndex === 0 ? 0 : labelHeight - 11;

    // for each row / geneSet
    layout.forEach(function (el, i) {
        // TODO: may be faster to transform the whole data cohort at once
        let rowData = data[i];
        if (cohortIndex === 0) {
            rowData = data[i].reverse();
        }

        // let reverseMap = new Map(Array.from(regions).reverse());
        // XXX watch for poor iterator performance in this for...of.
        for (let rs of regions.keys()) {
            let r = regions.get(rs);
            let d = rowData.slice(r.start, r.end + 1);

            let color = regionColor(d, 'total');


            for (let y = rs + offsetHeight; y < rs + r.height + offsetHeight; ++y) {
                let pxRow = y * width,
                    buffStart = (pxRow + el.start) * 4,
                    buffEnd = (pxRow + el.start + el.size) * 4;
                // if (buffStart < 500) {
                // console.log('expression bit', buffStart, buffEnd, el, rs, r, pxRow, y, width)
                // }
                for (let l = buffStart; l < buffEnd; l += 4) {
                    img.data[l] = colorMask[0];
                    img.data[l + 1] = colorMask[1];
                    img.data[l + 2] = colorMask[2];
                    img.data[l + 3] = color;
                }
            }
        }

        ctx.putImageData(img, 0, 0);
    });
}


function drawGeneWithManyColorTypes(ctx, width, totalHeight, layout, data, labelHeight, cohortIndex) {
    let height = totalHeight - labelHeight;
    let tissueCount = data[0].length;
    let regions = findRegions(height, tissueCount);
    let img = ctx.createImageData(width, totalHeight);

    let cnvHighColorMask = getCNVHighColorMask();
    let cnvLowColorMask = getCNVLowColorMask();
    let mutation4ColorMask = getMutation4ColorMask();
    let mutation3ColorMask = getMutation3ColorMask();
    let mutation2ColorMask = getMutation2ColorMask();

    let offsetHeight = cohortIndex === 0 ? 0 : labelHeight - 11;

    // for each row / geneSet
    layout.forEach(function (el, i) {
        // TODO: may be faster to transform the whole data cohort at once
        let rowData = data[i];
        if (cohortIndex === 0) {
            rowData = data[i].reverse();
        }


        // let reverseMap = new Map(Array.from(regions).reverse());
        // XXX watch for poor iterator performance in this for...of.
        for (let rs of regions.keys()) {
            let r = regions.get(rs);
            let d = rowData.slice(r.start, r.end + 1);

            let cnvHighScore = sumDataByType(d, 'cnvHigh');
            let cnvLowScore = sumDataByType(d, 'cnvLow');
            let cnvScore = sumDataByType(d, 'cnv');
            let mutation4Score = sumDataByType(d, 'mutation4');
            let mutation3Score = sumDataByType(d, 'mutation3');
            let mutation2Score = sumDataByType(d, 'mutation2');
            let mutationScore = sumDataByType(d, 'mutation');

            let cnvColorMask = cnvHighScore > cnvLowScore ? cnvHighColorMask : cnvLowColorMask;
            // take the mightest one
            let mutationColorMask = mutation4Score > mutation3Score ? mutation4ColorMask : (mutation3Score > mutation2Score ? mutation3ColorMask : mutation2ColorMask);
            let cnvColor = cnvScore === 0 ? 0 : 255;
            let mutationColor = mutationScore === 0 ? 0 : 255;

            // let totalColor = regionColor(d, 'total');


            for (let y = rs + offsetHeight; y < rs + r.height + offsetHeight; ++y) {
                let pxRow = y * width,
                    buffStart = (pxRow + el.start) * 4,
                    buffEnd = (pxRow + el.start + el.size) * 4,
                    buffMid = (buffEnd - buffStart) / 2 + buffStart;
                for (let l = buffStart; l < buffMid; l += 4) {
                    img.data[l] = cnvColorMask[0];
                    img.data[l + 1] = cnvColorMask[1];
                    img.data[l + 2] = cnvColorMask[2];
                    img.data[l + 3] = cnvColor;
                }
                for (let l = buffMid; l < buffEnd; l += 4) {
                    img.data[l] = mutationColorMask[0];
                    img.data[l + 1] = mutationColorMask[1];
                    img.data[l + 2] = mutationColorMask[2];
                    img.data[l + 3] = mutationColor;
                }
            }
        }

        ctx.putImageData(img, 0, 0);
    });
}

function drawGeneWithColorType(ctx, width, totalHeight, layout, data, labelHeight, cohortIndex) {
    let height = totalHeight - labelHeight;
    let tissueCount = data[0].length;
    let regions = findRegions(height, tissueCount);
    let img = ctx.createImageData(width, totalHeight);

    let cnvColorMask = getCNVColorMask();
    let mutationColorMask = getMutationColorMask();

    let offsetHeight = cohortIndex === 0 ? 0 : labelHeight - 11;

    // for each row / geneSet
    layout.forEach(function (el, i) {
        // TODO: may be faster to transform the whole data cohort at once
        let rowData = data[i];
        if (cohortIndex === 0) {
            rowData = data[i].reverse();
        }


        // let reverseMap = new Map(Array.from(regions).reverse());
        // XXX watch for poor iterator performance in this for...of.
        for (let rs of regions.keys()) {
            let r = regions.get(rs);
            let d = rowData.slice(r.start, r.end + 1);

            let mutationColor = regionColor(d, 'mutation');
            let cnvColor = regionColor(d, 'cnv');
            // let totalColor = regionColor(d, 'total');


            for (let y = rs + offsetHeight; y < rs + r.height + offsetHeight; ++y) {
                let pxRow = y * width,
                    buffStart = (pxRow + el.start) * 4,
                    buffEnd = (pxRow + el.start + el.size) * 4,
                    buffMid = (buffEnd - buffStart) / 2 + buffStart;
                for (let l = buffStart; l < buffMid; l += 4) {
                    img.data[l] = cnvColorMask[0];
                    img.data[l + 1] = cnvColorMask[1];
                    img.data[l + 2] = cnvColorMask[2];
                    img.data[l + 3] = cnvColor;
                }
                for (let l = buffMid; l < buffEnd; l += 4) {
                    img.data[l] = mutationColorMask[0];
                    img.data[l + 1] = mutationColorMask[1];
                    img.data[l + 2] = mutationColorMask[2];
                    img.data[l + 3] = mutationColor;
                }
            }
        }

        ctx.putImageData(img, 0, 0);
    });
}

/**
 * TODO: handle for other type
 * @param index
 * @param pathwayWidth
 * @param count
 */
function findPathwayData(pathwayWidth, count) {
    // Find pixel regions having the same set of samples, e.g.
    // 10 samples in 1 px, or 1 sample over 10 px. Record the
    // range of samples in the region.
    let regions = reduceByKey(range(count),
        i => ~~(i * pathwayWidth / count),
        (i, x, r) => r ? {...r, end: i} : {x, start: i, end: i});
    let starts = Array.from(regions.keys());
    let se = partitionN(starts, 2, 1, [pathwayWidth]);

    // XXX side-effecting map
    map2(starts, se, (start, [s, e]) => regions.get(start).width = e - s);

    return regions;
}


function drawGeneSetData(ctx, width, totalHeight, layout, data, labelHeight, colorMask, cohortIndex) {
    let tissueCount = data[0].length;

    // console.log('drawing gene set data',data)

    let img = ctx.createImageData(width, totalHeight);
    let sampleRegions = findPathwayData(width, tissueCount);


    console.log('regions', sampleRegions)

    layout.forEach(function (el, i) {
        //     // TODO: may be faster to transform the whole data cohort at once
        let rowData = data[i];
        if (cohortIndex === 0) {
            rowData = rowData.reverse();
        }

        // XXX watch for poor iterator performance in this for...of.
        for (let rs of sampleRegions.keys()) {
            let r = sampleRegions.get(rs);
            let d = rowData.slice(r.start, r.end + 1);
            //
            //         // TODO: should pass in geneList for each pathway and amortize over that . . .
            let color = regionColor(d, 'total');
            color = color > 255 ? 255 : color;

            if (i < 2) console.log(d, color);

            let pxRow = el.start * 4 * img.width; // first column and row in the block

            // start buffer at the correct column
            for (let xPos = 0; xPos < r.width; ++xPos) {
                let buffStart = pxRow + (xPos + r.x) * 4;
                let buffEnd = buffStart + (r.x + xPos + img.width * 4 * labelHeight);

                for (let l = buffStart; l < buffEnd; l += 4 * img.width) {
                    img.data[l] = colorMask[0];
                    img.data[l + 1] = colorMask[1];
                    img.data[l + 2] = colorMask[2];
                    img.data[l + 3] = color;
                }
            }
        }
    });
    ctx.putImageData(img, 0, 0);
}


export default {


    drawGeneView(vg, props) {
        let {width, height, layout, cohortIndex, associateData, viewType} = props;

        clearScreen(vg, width, height);

        if (associateData.length === 0) {
            return;
        }

        if (viewType && viewType === COLOR_BY_TYPE) {
            // drawGeneWithColorType(vg, width, height, layout, associateData, GENE_LABEL_HEIGHT, cohortIndex);
            drawGeneWithManyColorTypes(vg, width, height, layout, associateData, GENE_LABEL_HEIGHT, cohortIndex);
        } else {
            drawGeneDataTotal(vg, width, height, layout, associateData, GENE_LABEL_HEIGHT, getGeneColorMask(), cohortIndex);
        }

    },

    drawGeneSetView(vg, props) {
        let {width, layout, labelHeight, cohortIndex, associatedData} = props;
        let totalHeight = labelHeight * layout.length;
        clearScreen(vg, width, totalHeight);
        drawGeneSetData(vg, width, totalHeight, layout, associatedData, labelHeight, getGeneSetColorMask(), cohortIndex);
    },

}
