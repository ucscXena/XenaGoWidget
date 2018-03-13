
let labelHeight = 150;

function clearScreen(vg, width, height) {
    vg.save();
    vg.fillStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
    vg.strokeStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
    vg.fillRect(0, 0, width, height);
}

function drawPathwayLabels(vg, width, height, pathways) {

    let pathwayCount = pathways.length;
    let pixelsPerPathway = Math.trunc(width / pathwayCount);

    if (pixelsPerPathway <= 1) {
        vg.fillStyle = 'rgb(100,200,100)'; // sets the color to fill in the rectangle with
        vg.fillRect(0, 0, width, labelHeight);
        return;
    }

    vg.fillStyle = 'rgb(0,200,0)'; // sets the color to fill in the rectangle with
    let pixelCount = 0;
    for (let d of pathways) {
        vg.fillRect(pixelCount, 0, pixelsPerPathway, labelHeight);
        vg.strokeRect(pixelCount, 0, pixelsPerPathway, labelHeight);


        // draw the text
        vg.save();
        vg.fillStyle = 'rgb(0,0,0)'; // sets the color to fill in the rectangle with
        vg.rotate(-Math.PI / 2);
        vg.font = "10px Courier";
        vg.translate(-labelHeight, pixelCount, labelHeight);

        let geneLength = d.gene.length ;
        let labelString ;
        if(geneLength===1){
            labelString = d.gene[0];
        }
        else{
            labelString = '(' + d.gene.length + ')';
            // pad for 1000, so 4 + 2 parans
            while (labelString.length < 5) {
                labelString += ' ';
            }

            labelString += d.golabel;
        }

        if (pixelsPerPathway >= 10) {
            vg.fillText(labelString, 3, 10);
        }
        vg.restore();
        pixelCount += pixelsPerPathway;
    }
}

function drawExpressionData(vg, width, height, data) {
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
    console.log('max: ' + maxColorScore + ' total scores: ' + colorScoreCount + ' total: ' + totalColorScore + ' avg: ' + (totalColorScore / colorScoreCount));
}



export default {

    drawTissueView(vg, props) {
        let {width, height, onClick, onHover, associateData, data: {pathways, samples}} = props;

        clearScreen(vg, width, height);

        if(associateData.length===0){
            console.log('Clicked on an empty cell?');
            return ;
        }

        drawPathwayLabels(vg, width, height, pathways);

        drawExpressionData(vg, width, height, associateData, pathways,samples,  onClick, onHover);
    }
}
