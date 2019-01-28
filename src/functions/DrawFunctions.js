import {sum, reduceByKey, map2, /*partition, */partitionN} from './util';
import {range} from 'underscore';
import React from "react";
import {getGeneColorMask, getGeneSetColorMask} from '../functions/ColorFunctions'
import {GENE_LABEL_HEIGHT} from "../components/PathwayScoresView";

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

function regionColor(data) {
    let p = sum(data) / data.length;
    let scale = 5;
    return 255 * p / scale;
}

function drawExpressionData(ctx, width, totalHeight, layout, data, labelHeight, colorMask, cohortIndex) {
    let height = totalHeight - labelHeight;
    let tissueCount = data[0].length;
    let regions = findRegions(height, tissueCount);
    let img = ctx.createImageData(width, totalHeight);

    let offsetHeight = cohortIndex === 0 ? 0 : labelHeight;

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

            let color = regionColor(d);

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

    let img = ctx.createImageData(width, totalHeight);
    let sampleRegions = findPathwayData(width, tissueCount);

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
            let color = regionColor(d);
            color = color > 255 ? 255 : color;

            let pxRow = el.start * 4 * img.width; // first column and row in the block

            // start buffer at the correct column
            for(let xPos = 0 ; xPos < r.width ; ++xPos){
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
        let {width, height, layout, cohortIndex, associateData} = props;

        clearScreen(vg, width, height);

        if (associateData.length === 0) {
            return;
        }
        drawExpressionData(vg, width, height, layout, associateData, GENE_LABEL_HEIGHT, getGeneColorMask(), cohortIndex);

    },

    drawGeneSetView(vg, props) {
        let {width, layout, labelHeight, cohortIndex, associatedData} = props;
        let totalHeight = labelHeight * layout.length;
        clearScreen(vg, width, totalHeight);
        drawGeneSetData(vg, width, totalHeight, layout, associatedData, labelHeight, getGeneSetColorMask(), cohortIndex);
    },

}
