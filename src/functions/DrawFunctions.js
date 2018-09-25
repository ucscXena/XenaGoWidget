import {sum, reduceByKey, map2, /*partition, */partitionN} from './util';
import {range} from 'underscore';
import React from "react";
import {getGeneColorMask,getPathwayColorMask} from '../functions/ColorFunctions'
import PathwayScoresViewCache, {GENE_LABEL_HEIGHT, GENESET_LABEL_HEIGHT} from "../components/PathwayScoresView";

function clearScreen(vg, width, height) {
    vg.save();
    vg.fillStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
    vg.strokeStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
    vg.fillRect(0, 0, width, height);
}

function findRegions(index, height, count) {
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

function drawExpressionData(ctx, width, totalHeight, layout, data, labelHeight, colorMask) {
    let height = totalHeight - labelHeight;
    let tissueCount = data[0].length;
    let regions = findRegions(0, height, tissueCount);
    let img = ctx.createImageData(width, totalHeight);

    layout.forEach(function (el, i) {
        let rowData = data[i];

        // XXX watch for poor iterator performance in this for...of.
        for (let rs of regions.keys()) {
            let r = regions.get(rs);
            let d = rowData.slice(r.start, r.end + 1);

            let color = regionColor(d);

            for (let y = rs + labelHeight; y < rs + r.height + labelHeight; ++y) {
                let pxRow = y * width,
                    buffStart = (pxRow + el.start) * 4,
                    buffEnd = (pxRow + el.start + el.size) * 4;
                for (let l = buffStart; l < buffEnd; l += 4) {
                    img.data[l] = colorMask[0];
                    img.data[l + 1] = colorMask[1];
                    img.data[l + 2] = colorMask[2];
                    img.data[l + 3] = color ;
                }
            }
        }

        ctx.putImageData(img, 0, 0);
    });
}


export default {



    drawTissueView(vg, props) {
        let {width, height, layout, associateData, data: { referencePathways}} = props;

        clearScreen(vg, width, height);

        if (associateData.length === 0) {
            return;
        }

        if (referencePathways) {
            drawExpressionData(vg, width, height, layout, associateData, GENE_LABEL_HEIGHT, getGeneColorMask());
        }
        else {
            drawExpressionData(vg, width, height, layout, associateData, GENESET_LABEL_HEIGHT, getPathwayColorMask());
        }

    },

}
