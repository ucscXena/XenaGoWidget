import {sum, reduceByKey, map2, /*partition, */partitionN} from './util';
import {range} from 'underscore';
import React from "react";
import {transpose} from '../functions/SortFunctions'
import {getGeneColorMask, getPathwayColorMask} from '../functions/ColorFunctions'
import {GENE_LABEL_HEIGHT} from "../components/PathwayScoresView";

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

function pathwayColor(data, geneCount) {
    let p = sum(data) / geneCount;
    let scale = 5;
    return 255 * p / scale;
}

function drawExpressionData(ctx, width, totalHeight, layout, data, labelHeight, colorMask, cohortIndex) {
    let height = totalHeight - labelHeight;
    let tissueCount = data[0].length;
    let regions = findRegions(0, height, tissueCount);
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
                if (buffStart < 500) {
                    console.log('expression bit', buffStart, buffEnd, el, rs, r, pxRow, y, width)
                }
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
 * @param pathwayHeight
 * @param count
 */
function findPathwayRegions(index, pathwayHeight, count) {
    // Find pixel regions having the same set of samples, e.g.
    // 10 samples in 1 px, or 1 sample over 10 px. Record the
    // range of samples in the region.
    let regions = reduceByKey(range(count),
        i => ~~(i * pathwayHeight / count),
        (i, y, r) => r ? {...r, end: i} : {y, start: i, end: i});
    let starts = Array.from(regions.keys());
    let se = partitionN(starts, 2, 1, [pathwayHeight]);

    // XXX side-effecting map
    map2(starts, se, (start, [s, e]) => regions.get(start).height = e - s);

    return regions;
}


function drawPathwayStub(ctx, width, totalHeight, layout, data, labelHeight, colorMask, cohortIndex) {
    // let height = totalHeight - labelHeight;
    console.log('height: ', totalHeight, layout.length, labelHeight)
    let tissueCount = data[0].length;
    let pathwayCount = data.length;
    console.log('input data : ', tissueCount, pathwayCount, data)
    console.log('total height: ', totalHeight)

    let transposedData = transpose(data);
    console.log('transpoed', transposedData)


    let img = ctx.createImageData(width, totalHeight);

    // let offsetHeight = cohortIndex === 0 ? 0 : labelHeight;
    // ctx.save();
    // ctx.fillStyle = '#333333'; // sets the color to fill in the rectangle with
    // ctx.strokeStyle = '#AAAAAA'; // sets the color to fill in the rectangle with
    // console.log('width',width);
    // console.log('totalHeight',totalHeight);
    // ctx.fillRect(0, 0, width, totalHeight);

    let sampleRegions = findPathwayRegions(0, totalHeight, tissueCount);
    // let sampleRegions = findRegions(0, totalHeight,  pathwayCount);
    console.log('regions', sampleRegions)

    layout.forEach(function (el, i) {
        //     // TODO: may be faster to transform the whole data cohort at once
        let rowData = data[i];
        // let rowData = transposedData[i];
        // console.log('el',el)
        // console.log('row data',rowData)
        // if (cohortIndex === 0) {
        //     rowData = data[i].reverse();
        // }
        // let pathway =

        // let color = i % 2 === 0 ? 250 : 0;
        // color = color % 255 ;
        let color = 255 ;

        // write out a single row
        // console.log('rs',rs,r,d,el)
        // let pxRowStart = rs.y * img.width * 4 ;

        let pxRowStart = el.start * 4 * img.width;
        let buffStart = pxRowStart;
        let buffEnd = pxRowStart + (img.width * 4);

        console.log('el',i,el,pxRowStart,buffStart,buffEnd);

        // var buf8 = new Uint8ClampedArray(buf);
        // var data = new Uint32Array(buf);
        for (let l = buffStart; l < buffEnd; l += 4) {

            // data[y * canvasWidth + x] =
            //     (255   << 24) |	// alpha
            //     (value << 16) |	// blue
            //     (value <<  8) |	// green
            //     value;		// red

            // imageData.data.set(buf8);

            img.data[l] = colorMask[0];
            img.data[l + 1] = colorMask[1];
            img.data[l + 2] = colorMask[2];
            img.data[l + 3] = color;
        }


        // XXX watch for poor iterator performance in this for...of.
        //     for (let rs of sampleRegions.keys()) {
        //         let r = sampleRegions.get(rs);
        //         let d = rowData.slice(r.start, r.end + 1);
        //
        //         // TODO: should pass in geneList for each pathway and amortize over that . . .
        //         // let color = regionColor(d);
        //         // color = color > 255 ? 255 : color ;
        //         let color  = i % 2 === 0 ? 250 : 0 ;
        //         // color = color % 255 ;
        //         // let color =
        //
        //         // write out a single row
        //         console.log('rs',rs,r,d,el)
        //         let pxRowStart = rs.y * img.width * 4 ;
        //
        //         // console.log('setting for color',color, rs, r)
        //         // for (let y = rs ; y < rs + r.height ; ++y) {
        //         //     // for (let y = rs + offsetHeight; y < rs + r.height + offsetHeight; ++y) {
        //         //     // console.log('in y, etc.',x)
        //         //     let pxRow = y * width ,
        //         //         buffStart = (pxRow + el.start) * 4,
        //         //         buffEnd = (pxRow + el.start + labelHeight) * 4;
        //         //     if(buffStart< 500){
        //         //         console.log('overview bit',buffStart,buffEnd, el,rs, r,pxRow, y, width,d,color)
        //         //     }
        //         //     // TODO: use a shift here
        //         //     for (let l = buffStart; l < buffEnd; l += 4) {
        //         //         img.data[l] = colorMask[0];
        //         //         img.data[l + 1] = colorMask[1];
        //         //         img.data[l + 2] = colorMask[2];
        //         //         img.data[l + 3] = color  ;
        //         //     }
        //         // }
        //     }
        // //
        });
        ctx.putImageData(img, 0, 0);
    }


    export default {


        drawTissueView(vg, props) {
            let {width, height, layout, cohortIndex, associateData} = props;

            clearScreen(vg, width, height);

            if (associateData.length === 0) {
                return;
            }

            drawExpressionData(vg, width, height, layout, associateData, GENE_LABEL_HEIGHT, getGeneColorMask(), cohortIndex);

        },

        drawPathwayView(vg, props) {
            let {width, layout, labelHeight, cohortIndex, associatedData} = props;

            console.log('draw pathway view', props)
            let totalHeight = labelHeight * layout.length;
            clearScreen(vg, width, totalHeight);
            //
            // if (associateData.length === 0) {
            //     return;
            // }
            //
            // drawPathwayData(vg, width, height, layout, associateData, GENE_LABEL_HEIGHT, getPathwayColorMask(), cohortIndex);
            drawPathwayStub(vg, width, totalHeight, layout, associatedData, labelHeight, getPathwayColorMask(), cohortIndex);

        },

    }
