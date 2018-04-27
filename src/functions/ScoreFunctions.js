import {sum, reduceByKey, map2, /*partition, */partitionN} from './util';
import {range, times} from 'underscore';
import React from "react";
import ReactDOM from 'react-dom';
import {HeaderLabel} from "../components/HeaderLabel";

function clearScreen(vg, width, height) {
    vg.save();
    vg.fillStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
    vg.strokeStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
    vg.fillRect(0, 0, width, height);
}

// TODO: review vgmixed
function drawOverviewLabels(div, width, height, layout, pathways, labelHeight, labelOffset) {
    // console.log('parent div')
    // console.log(div)

    if (layout[0].size <= 1) {
        // div.fillStyle = 'rgb(100,200,100)'; // sets the color to fill in the rectangle with
        // div.fillRect(0, labelOffset, width, labelHeight);
        return;
    }

    let maxColor = 256;

    // find the max
    let highestScore = 0;
    pathways.forEach(p => {
        highestScore = p.density > highestScore ? p.density : highestScore;
    });

    // console.log(layout.length + ' vs ' + pathways.length)
    // console.log('output layout -> pathway ')
    // console.log(layout)
    // console.log(pathways)
    if (pathways.length === layout.length) {
        let labels = layout.map((el, i) => {
            let d = pathways[i];

            let color = Math.round(maxColor * (1.0 - (d.density / highestScore)));
            let colorString = 'rgb(256,' + color + ',' + color + ')'; // sets the color to fill in the rectangle with
            // div.fillRect(el.start, labelOffset, el.size, labelHeight);
            // div.strokeRect(el.start, labelOffset, el.size, labelHeight);


            // draw the text
            // div.save();
            // div.fillStyle = 'rgb(0,0,0)'; // sets the color to fill in the rectangle with
            // div.rotate(-Math.PI / 2);
            // div.font = "bold 10px Arial";
            // div.translate(-labelHeight-labelOffset, el.start, labelHeight);

            if (false && el.size < 10) {
                return (
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: el.start,
                        height: labelHeight,
                        width: el.size,
                        color: 'black',
                        backgroundColor: colorString,
                        strokeWidth: 1,
                    }}>
                        return (
                        <p>None</p>
                        )
                    </div>
                );
            }
            else {
                let geneLength = d.gene.length;
                let labelString;
                if (geneLength === 1) {
                    labelString = d.gene[0];
                }
                else {
                    labelString = '(' + d.gene.length + ') ';
                    // pad for 1000, so 4 + 2 parans
                    while (labelString.length < 5) {
                        labelString += ' ';
                    }

                    labelString += d.golabel;
                }
                return (
                    <HeaderLabel
                        labelHeight={labelHeight}
                        labelOffset={labelOffset}
                        colorString={colorString}
                        left={el.start}
                        width={el.size}
                        labelString={labelString}
                        label={d.golabel}
                    />
                )
            }


        });
        // console.log('output labels')
        // console.log(labels)
        ReactDOM.render(<div style={{textAlign: 'center'}}>{labels}</div>, div);
        // ReactDOM.render(<div style={{color:'blue',fontSize:100}}>PUPPIES</div>, div);
    }
}

function drawPathwayLabels(vg, width, height, layout, pathways, labelHeight, labelOffset) {
    if (layout[0].size <= 1) {
        vg.fillStyle = 'rgb(100,200,100)'; // sets the color to fill in the rectangle with
        vg.fillRect(0, labelOffset, width, labelHeight);
        return;
    }

    let maxColor = 256;

    // find the max
    let highestScore = 0;
    pathways.forEach(p => {
        highestScore = p.density > highestScore ? p.density : highestScore;
    });

    // console.log(layout.length + ' vs ' + pathways.length)
    // console.log('output layout -> pathway ')
    // console.log(layout)
    // console.log(pathways)
    if (pathways.length === layout.length) {
        layout.forEach((el, i) => {
            let d = pathways[i];

            let color = Math.round(maxColor * (1.0 - (d.density / highestScore)));
            vg.fillStyle = 'rgb(256,' + color + ',' + color + ')'; // sets the color to fill in the rectangle with
            vg.fillRect(el.start, labelOffset, el.size, labelHeight);
            vg.strokeRect(el.start, labelOffset, el.size, labelHeight);


            // draw the text
            vg.save();
            vg.fillStyle = 'rgb(0,0,0)'; // sets the color to fill in the rectangle with
            vg.rotate(-Math.PI / 2);
            vg.font = "bold 10px Arial";
            vg.translate(-labelHeight - labelOffset, el.start, labelHeight);

            let geneLength = d.gene.length;
            let labelString;
            if (geneLength === 1) {
                labelString = d.gene[0];
            }
            else {
                labelString = '(' + d.gene.length + ') ';
                // pad for 1000, so 4 + 2 parans
                while (labelString.length < 5) {
                    labelString += ' ';
                }

                labelString += d.golabel;
            }

            if (el.size >= 10) {
                vg.fillText(labelString, 3, 10);
            }
            vg.restore();
        });
    }
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
    let c = 255 - 255 * p / scale;
    return [255, c, c];
}

function drawExpressionData(ctx, width, totalHeight, layout, data, labelHeight) {
    let height = totalHeight - labelHeight;
    let pathwayCount = data.length;
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
                    img.data[l] = color[0];
                    img.data[l + 1] = color[1];
                    img.data[l + 2] = color[2];
                    img.data[l + 3] = 255;
                }
            }
        }

        ctx.putImageData(img, 0, 0);
    });
}

function drawExpressionData2(vg, width, height, data) {
    let pathwayCount = data.length;
    let tissueCount = data[0].length;
    let pixelsPerPathway = Math.trunc(width / pathwayCount);
    let pixelsPerTissue = Math.trunc(height / tissueCount);

    let thresholdScore = 5;
    // TODO :do a separate pass to calculate different maxes?

    let xPixel = 0;
    let yPixel;
    let maxColorScore = 0;
    let colorScoreCount = 0;
    let totalColorScore = 0;
    vg.save();
    for (let pathwayIndex in data) {
        yPixel = labelHeight;
        for (let tissueIndex in data[pathwayIndex]) {
            let colorScore = data[pathwayIndex][tissueIndex];
            ++colorScoreCount;
            totalColorScore += colorScore;
            maxColorScore = colorScore > maxColorScore ? colorScore : maxColorScore;
            colorScore = Math.min(Math.round(colorScore / thresholdScore * 256), 256);
            vg.fillStyle = 'rgb(' + (256) + ',' + (256 - colorScore) + ',' + (256 - colorScore) + ')';
            vg.fillRect(xPixel, yPixel, pixelsPerPathway, pixelsPerTissue);
            yPixel += pixelsPerTissue;
        }
        xPixel += pixelsPerPathway;
    }
    vg.restore();
    // console.log('max: ' + maxColorScore + ' total scores: ' + colorScoreCount + ' total: ' + totalColorScore + ' avg: ' + (totalColorScore / colorScoreCount));
}

export function getCopyNumberValue(copyNumberValue) {
    return (!isNaN(copyNumberValue) && Math.abs(copyNumberValue) === 2) ? 1 : 0;
}

export default {

    drawTissueView(vg, props) {
        let {width, height, layout, referenceLayout, associateData, data: {pathways, referencePathways}} = props;

        clearScreen(vg, width, height);

        if (associateData.length === 0) {
            // console.log('Clicked on an empty cell?');
            return;
        }

        if (referencePathways) {
            drawExpressionData(vg, width, height, layout, associateData, 300);
            // drawPathwayLabels(vg, width, height, referenceLayout, referencePathways, 150, 0);
            // drawPathwayLabels(vg, width, height, layout, pathways, 150, 150);
        }
        else {
            drawExpressionData(vg, width, height, layout, associateData, 150);
            // drawPathwayLabels(vg, width, height, layout, pathways, 150, 0);
        }

    },

    drawTissueOverlay(div, props) {
        let {width, height, layout, referenceLayout, associateData, data: {pathways, referencePathways}} = props;

        if (associateData.length === 0) {
            // console.log('Clicked on an empty cell?');
            return;
        }

        if (referencePathways) {
            drawOverviewLabels(div, width, height, layout, pathways, 150, 150);
            drawOverviewLabels(div, width, height, referenceLayout, referencePathways, 150, 0);
        }
        else {
            drawOverviewLabels(div, width, height, layout, pathways, 150, 0);
        }

    }
}
