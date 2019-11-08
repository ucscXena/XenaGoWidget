import { range } from 'underscore';
import { reduceByKey, map2, /* partition, */partitionN } from './MathFunctions';
import {
  getGeneSetColorMask,
  getCNVHighColorMask,
  getCNVLowColorMask,
  getMutation2ColorMask,
  getMutation3ColorMask,
  getMutation4ColorMask,
} from './ColorFunctions';
import { GENE_LABEL_HEIGHT } from '../components/PathwayScoresView';
import * as d3 from 'd3';
import {VIEW_ENUM} from '../data/ViewEnum';

function clearScreen(vg, width, height) {
  vg.save();
  // eslint-disable-next-line no-param-reassign
  vg.fillStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
  vg.strokeStyle = '#FFFFFF'; // sets the color to fill in the rectangle with
  vg.fillRect(0, 0, width, height);
}

function findRegions(height, count) {
  // Find pixel regions having the same set of samples, e.g.
  // 10 samples in 1 px, or 1 sample over 10 px. Record the
  // range of samples in the region.
  const regions = reduceByKey(range(count),
    (i) => ~~(i * height / count),
    (i, y, r) => (r ? { ...r, end: i } : { y, start: i, end: i }));
  const starts = Array.from(regions.keys());
  const se = partitionN(starts, 2, 1, [height]);

  // XXX side-effecting map
  map2(starts, se, (start, [s, e]) => regions.get(start).height = e - s);

  return regions;
}

export function sumDataByType(data, type) {
  let total = 0;
  data.forEach((d) => total += d[type]);
  return total;
}

export function meanDataByType(data, type) {
  let total = 0;
  data.forEach((d) => total += d[type]);
  return total / data.length;
}

function generateMask(mutation4Score, mutation4ColorMask,
  mutation3Score, mutation3ColorMask, mutation2ColorMask) {
  if (mutation4Score) return mutation4ColorMask;
  if (mutation3Score) return mutation3ColorMask;
  return mutation2ColorMask;
}

function regionColor(data, type) {
  // let total = data.reduce(sumDataTotal(0));
  const total = sumDataByType(data, type);
  if (total === 0) return 0;
  const p = total / data.length;
  const scale = 5;
  return 255 * p / scale;
}

export function getColorArray(colorString){
  return colorString.replace('rgb(','').replace(')','').split(',').map( c => parseInt(c.trim()));
}

export const interpolateGeneExpressionFunction = d3.scaleLinear().domain([-2,0,2]).range(['blue','white','red']).interpolate(d3.interpolateRgb.gamma(1.0));

export let interpolateGeneExpression = (score) => interpolateGeneExpressionFunction(score);
export let interpolateGeneExpressionFont = (score) => {
  let colorArray = getColorArray(interpolateGeneExpressionFunction(score));
  return colorArray[0]+colorArray[2]>255 ? 'black' : 'white';
};

function drawGeneWithManyColorTypes(ctx, width, totalHeight, layout, data,
  labelHeight, cohortIndex,filter) {
  const height = totalHeight - labelHeight;
  const tissueCount = data[0].length;
  const regions = findRegions(height, tissueCount);
  const img = ctx.createImageData(width, totalHeight);

  const cnvHighColorMask = getCNVHighColorMask();
  const cnvLowColorMask = getCNVLowColorMask();
  const mutation4ColorMask = getMutation4ColorMask();
  const mutation3ColorMask = getMutation3ColorMask();
  const mutation2ColorMask = getMutation2ColorMask();

  const offsetHeight = cohortIndex === 0 ? 0 : labelHeight - 11;

  // for each row / geneSet
  layout.forEach((el, i) => {
    // TODO: may be faster to transform the whole data cohort at once
    let rowData = data[i];
    if (cohortIndex === 0) {
      rowData = data[i].reverse();
    }

    // let reverseMap = new Map(Array.from(regions).reverse());
    // XXX watch for poor iterator performance in this for...of.
    // eslint-disable-next-line no-restricted-syntax
    for (const rs of regions.keys()) {
      const r = regions.get(rs);
      const d = rowData.slice(r.start, r.end + 1);

      if(filter===VIEW_ENUM.GENE_EXPRESSION){
        const geneExpressionScore = sumDataByType(d, 'geneExpression');
        for (let y = rs + offsetHeight; y < rs + r.height + offsetHeight; ++y) {
          const pxRow = y * width;
          const buffStart = (pxRow + el.start) * 4;
          const buffEnd = (pxRow + el.start + el.size) * 4;
          for (let l = buffStart; l < buffEnd ; l += 4) {
            let colorArray = getColorArray(interpolateGeneExpressionFunction(geneExpressionScore));
            img.data[l] = colorArray[0];
            img.data[l + 1] = colorArray[1];
            img.data[l + 2] = colorArray[2];
            img.data[l + 3] = 255 ;
          }
        }
      }
      else
      if(filter===VIEW_ENUM.PARADIGM){
        const geneExpressionScore = sumDataByType(d, 'paradigm');
        for (let y = rs + offsetHeight; y < rs + r.height + offsetHeight; ++y) {
          const pxRow = y * width;
          const buffStart = (pxRow + el.start) * 4;
          const buffEnd = (pxRow + el.start + el.size) * 4;
          for (let l = buffStart; l < buffEnd ; l += 4) {
            let colorArray = getColorArray(interpolateGeneExpressionFunction(geneExpressionScore));
            img.data[l] = colorArray[0];
            img.data[l + 1] = colorArray[1];
            img.data[l + 2] = colorArray[2];
            img.data[l + 3] = 255 ;
          }
        }
      }
      else{
        const cnvHighScore = sumDataByType(d, 'cnvHigh');
        const cnvLowScore = sumDataByType(d, 'cnvLow');
        const cnvScore = sumDataByType(d, 'cnv');
        const mutation4Score = sumDataByType(d, 'mutation4');
        const mutation3Score = sumDataByType(d, 'mutation3');
        // const mutation2Score = sumDataByType(d, 'mutation2');
        const mutationScore = sumDataByType(d, 'mutation');
        const cnvColorMask = cnvHighScore > cnvLowScore ? cnvHighColorMask : cnvLowColorMask;
        // take the highest one
        const mutationColorMask = generateMask(mutation4Score,mutation4ColorMask,mutation3Score,mutation3ColorMask,mutation2ColorMask);
        const cnvColor = cnvScore === 0 ? 0 : 255;
        const mutationColor = mutationScore === 0 ? 0 : 255;
        for (let y = rs + offsetHeight; y < rs + r.height + offsetHeight; ++y) {
          const pxRow = y * width;
          const buffStart = (pxRow + el.start) * 4;
          const buffEnd = (pxRow + el.start + el.size) * 4;
          let buffMid = (buffEnd - buffStart) / 2 + buffStart;
          // buffMid has to be a multiple of 4
          buffMid += buffMid % 4;
          for (let l = buffStart, m = buffMid; l < buffMid; l += 4, m += 4) {
            img.data[l] = cnvColorMask[0];
            img.data[l + 1] = cnvColorMask[1];
            img.data[l + 2] = cnvColorMask[2];
            img.data[l + 3] = cnvColor;

            img.data[m] = mutationColorMask[0];
            img.data[m + 1] = mutationColorMask[1];
            img.data[m + 2] = mutationColorMask[2];
            img.data[m + 3] = mutationColor;
          }
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
  const regions = reduceByKey(range(count),
    (i) => ~~(i * pathwayWidth / count),
    (i, x, r) => (r ? { ...r, end: i } : { x, start: i, end: i }));
  const starts = Array.from(regions.keys());
  const se = partitionN(starts, 2, 1, [pathwayWidth]);

  // XXX side-effecting map
  map2(starts, se, (start, [s, e]) => regions.get(start).width = e - s);

  return regions;
}


function drawGeneSetData(ctx, width, totalHeight, layout, data, labelHeight, colorMask, cohortIndex,filter) {

  const tissueCount = data[0].length;
  const img = ctx.createImageData(width, totalHeight);
  const sampleRegions = findPathwayData(width, tissueCount);
  const colorFilter = filter === VIEW_ENUM.GENE_EXPRESSION ? 'geneExpression': 'total';


  layout.forEach((el, i) => {
    //     // TODO: may be faster to transform the whole data cohort at once
    let rowData = data[i];
    if (cohortIndex === 0) {
      rowData = rowData.reverse();
    }

    // XXX watch for poor iterator performance in this for...of.
    for (const rs of sampleRegions.keys()) {
      const r = sampleRegions.get(rs);
      const d = rowData.slice(r.start, r.end + 1);
      //
      const pxRow = el.start * 4 * img.width; // first column and row in the block
      if(filter===VIEW_ENUM.GENE_EXPRESSION){
        // const geneExpressionScore = sumDataByType(d, 'geneExpression');
        const geneExpressionScore = meanDataByType(d, 'geneExpressionPathwayActivity');
        for (let xPos = 0; xPos < r.width; ++xPos) {
          const buffStart = pxRow + (xPos + r.x) * 4;
          const buffEnd = buffStart + (r.x + xPos + img.width * 4 * labelHeight);
          for (let l = buffStart; l < buffEnd; l += 4 * img.width) {
            let colorArray = isNaN(geneExpressionScore) ? [0,0,0] : getColorArray(interpolateGeneExpressionFunction(geneExpressionScore));
            img.data[l] = colorArray[0];
            img.data[l + 1] = colorArray[1];
            img.data[l + 2] = colorArray[2];
            img.data[l + 3] = 255 ;
          }
        }
      }
      else
      if(filter===VIEW_ENUM.PARADIGM){
        // const geneExpressionScore = sumDataByType(d, 'geneExpression');
        const geneExpressionScore = meanDataByType(d, 'paradigmPathwayActivity');
        for (let xPos = 0; xPos < r.width; ++xPos) {
          const buffStart = pxRow + (xPos + r.x) * 4;
          const buffEnd = buffStart + (r.x + xPos + img.width * 4 * labelHeight);
          for (let l = buffStart; l < buffEnd; l += 4 * img.width) {
            let colorArray = isNaN(geneExpressionScore) ? [0,0,0] : getColorArray(interpolateGeneExpressionFunction(geneExpressionScore));
            img.data[l] = colorArray[0];
            img.data[l + 1] = colorArray[1];
            img.data[l + 2] = colorArray[2];
            img.data[l + 3] = 255 ;
          }
        }
      }
      else{
        let color = regionColor(d, colorFilter);
        color = color > 255 ? 255 : color;

        // start buffer at the correct column
        for (let xPos = 0; xPos < r.width; ++xPos) {
          const buffStart = pxRow + (xPos + r.x) * 4;
          const buffEnd = buffStart + (r.x + xPos + img.width * 4 * labelHeight);

          for (let l = buffStart; l < buffEnd; l += 4 * img.width) {
            img.data[l] = colorMask[0];
            img.data[l + 1] = colorMask[1];
            img.data[l + 2] = colorMask[2];
            img.data[l + 3] = color;
          }
        }
      }
    }
  });
  ctx.putImageData(img, 0, 0);
}


export default {

  drawGeneView(vg, props) {
    const {
      width, height, layout, cohortIndex, associatedData, filter
    } = props;


    clearScreen(vg, width, height);
    if (associatedData.length === 0) {
      return;
    }
    drawGeneWithManyColorTypes(vg, width, height, layout, associatedData, GENE_LABEL_HEIGHT, cohortIndex,filter);
  },

  drawGeneSetView(vg, props) {
    const {
      width, layout, labelHeight, cohortIndex, associatedData,filter
    } = props;
    const totalHeight = labelHeight * layout.length;
    clearScreen(vg, width, totalHeight);
    drawGeneSetData(vg, width, totalHeight, layout, associatedData, labelHeight, getGeneSetColorMask(), cohortIndex,filter);
  },

};
