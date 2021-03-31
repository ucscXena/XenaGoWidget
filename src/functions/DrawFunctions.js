import { range } from 'underscore'
import { reduceByKey, map2, /* partition, */partitionN } from './MathFunctions'
import {
  getGeneSetColorMask,
  getCNVHighColorMask,
  getCNVLowColorMask,
  getMutation2ColorMask,
  getMutation3ColorMask,
  getMutation4ColorMask,
} from './ColorFunctions'
import * as d3 from 'd3'
import {VIEW_ENUM} from '../data/ViewEnum'
import {isViewGeneExpression} from './DataFunctions'

// CACHE
let colorArrayGeneExpressionCache = {}

function clearScreen(vg, width, height) {
  vg.save()
  // eslint-disable-next-line no-param-reassign
  vg.fillStyle = '#FFFFFF' // sets the color to fill in the rectangle with
  vg.strokeStyle = '#FFFFFF' // sets the color to fill in the rectangle with
  vg.fillRect(0, 0, width, height)
}

// function findRegions(height, count) {
//   // Find pixel regions having the same set of samples, e.g.
//   // 10 samples in 1 px, or 1 sample over 10 px. Record the
//   // range of samples in the region.
//   const regions = reduceByKey(range(count),
//     (i) => ~~(i * height / count),
//     (i, y, r) => (r ? { ...r, end: i } : { y, start: i, end: i }))
//   const starts = Array.from(regions.keys())
//   const se = partitionN(starts, 2, 1, [height])
//
//   // XXX side-effecting map
//   map2(starts, se, (start, [s, e]) => regions.get(start).height = e - s)
//
//   return regions
// }

export function sumDataByType(data, type) {
  let total = 0
  data.forEach((d) => total += d[type])
  return total
}

export function meanDataByType(data, type) {
  let total = 0
  data.forEach((d) => total += d[type])
  return total / data.length
}

function generateMask(mutation4Score, mutation4ColorMask,
  mutation3Score, mutation3ColorMask, mutation2ColorMask) {
  if (mutation4Score) return mutation4ColorMask
  if (mutation3Score) return mutation3ColorMask
  return mutation2ColorMask
}

function regionColor(data, type) {
  // let total = data.reduce(sumDataTotal(0));
  const total = sumDataByType(data, type)
  if (total === 0) return 0
  const p = total / data.length
  const scale = 5
  return 255 * p / scale
}

export function getColorArray(colorString){
  return colorString ? colorString.replace('rgb(','').replace(')','').split(',').map( c => parseInt(c.trim())) : [0,0,0]
}

export const interpolateGeneExpressionFunction = d3.scaleLinear().domain([-2,0,2]).range(['blue','white','red']).interpolate(d3.interpolateRgb.gamma(1.0))
export const interpolateCnvMutationFunction = d3.scaleLinear().domain([-50, 0, 50]).range(['blue','white','red']).interpolate(d3.interpolateRgb)

const interpolationTable = {}

export const interpolateGenesetScoreFunction = max => {
  if(!interpolationTable[max]){
    interpolationTable[max] = d3.scaleLinear().domain([-max,0,max]).range(['blue','white','red']).interpolate(d3.interpolateRgb)
  }
  return interpolationTable[max]
}


export let interpolateGeneExpression = (score) => score==='NaN' ? 'gray' : interpolateGeneExpressionFunction(score)
export let interpolateGeneExpressionFont = (score) => score==='NaN' ? 'gray' : ( score < -1 ? 'white' : 'black')
export let interpolateCnvMutationColor = (score) => score==='NaN' ? 'gray' : interpolateCnvMutationFunction(score)

// function drawGeneWithManyColorTypes(ctx, width, totalHeight, layout, data,
//   labelHeight, cohortIndex,view) {
//   const height = totalHeight - labelHeight
//   const tissueCount = data[0].length
//   const regions = findRegions(height, tissueCount)
//   const img = ctx.createImageData(width, totalHeight)
//
//   const cnvHighColorMask = getCNVHighColorMask()
//   const cnvLowColorMask = getCNVLowColorMask()
//   const mutation4ColorMask = getMutation4ColorMask()
//   const mutation3ColorMask = getMutation3ColorMask()
//   const mutation2ColorMask = getMutation2ColorMask()
//
//
//   // for each row / geneSet
//   layout.forEach((el, i) => {
//     // TODO: may be faster to transform the whole data cohort at once
//     let rowData = data[i]
//     if (cohortIndex === 0) {
//       rowData = data[i].reverse()
//     }
//
//     // let reverseMap = new Map(Array.from(regions).reverse());
//     // XXX watch for poor iterator performance in this for...of.
//     // eslint-disable-next-line no-restricted-syntax
//     for (const rs of regions.keys()) {
//       const r = regions.get(rs)
//       const d = rowData.slice(r.start, r.end + 1)
//
//       const offsetHeight = cohortIndex === 0 ? 9 : labelHeight-2
//       if(isViewGeneExpression(view)){
//         const geneExpressionScore = meanDataByType(d, 'geneExpression')
//         for (let y = rs + offsetHeight; y < rs + r.height + offsetHeight; ++y) {
//           const pxRow = y * width
//           const buffStart = (pxRow + el.start) * 4
//           const buffEnd = (pxRow + el.start + el.size) * 4
//           for (let l = buffStart; l < buffEnd ; l += 4) {
//             let colorArray = getColorArray(interpolateGeneExpressionFunction(geneExpressionScore))
//             img.data[l] = colorArray[0]
//             img.data[l + 1] = colorArray[1]
//             img.data[l + 2] = colorArray[2]
//             img.data[l + 3] = 255
//           }
//         }
//       }
//       else{
//         const cnvHighScore = sumDataByType(d, 'cnvHigh')
//         const cnvLowScore = sumDataByType(d, 'cnvLow')
//         const cnvScore = sumDataByType(d, 'cnv')
//         const mutation4Score = sumDataByType(d, 'mutation4')
//         const mutation3Score = sumDataByType(d, 'mutation3')
//         // const mutation2Score = sumDataByType(d, 'mutation2');
//         const mutationScore = sumDataByType(d, 'mutation')
//         const cnvColorMask = cnvHighScore > cnvLowScore ? cnvHighColorMask : cnvLowColorMask
//         // take the highest one
//         const mutationColorMask = generateMask(mutation4Score,mutation4ColorMask,mutation3Score,mutation3ColorMask,mutation2ColorMask)
//         const cnvColor = cnvScore === 0 ? 0 : 255
//         const mutationColor = mutationScore === 0 ? 0 : 255
//         const offsetHeight = cohortIndex === 0 ? 9 : labelHeight-2
//         for (let y = rs + offsetHeight; y < rs + r.height + offsetHeight; ++y) {
//           const pxRow = y * width
//           const buffStart = (pxRow + el.start) * 4
//           const buffEnd = (pxRow + el.start + el.size) * 4
//           let buffMid = (buffEnd - buffStart) / 2 + buffStart
//           // buffMid has to be a multiple of 4
//           buffMid += buffMid % 4
//           for (let l = buffStart, m = buffMid; l < buffMid; l += 4, m += 4) {
//             img.data[l] = cnvColorMask[0]
//             img.data[l + 1] = cnvColorMask[1]
//             img.data[l + 2] = cnvColorMask[2]
//             img.data[l + 3] = cnvColor
//
//             img.data[m] = mutationColorMask[0]
//             img.data[m + 1] = mutationColorMask[1]
//             img.data[m + 2] = mutationColorMask[2]
//             img.data[m + 3] = mutationColor
//           }
//         }
//       }
//     }
//     ctx.putImageData(img, 0, 0)
//   })
// }


/**
 * TODO: handle for other type
 * @param pathwayWidth
 * @param count
 */
function findPathwayData(pathwayWidth, count) {
  // Find pixel regions having the same set of samples, e.g.
  // 10 samples in 1 px, or 1 sample over 10 px. Record the
  // range of samples in the region.
  const regions = reduceByKey(range(count),
    (i) => ~~(i * pathwayWidth / count),
    (i, x, r) => (r ? { ...r, end: i } : { x, start: i, end: i }))
  const starts = Array.from(regions.keys())
  const se = partitionN(starts, 2, 1, [pathwayWidth])

  // XXX side-effecting map
  map2(starts, se, (start, [s, e]) => regions.get(start).width = e - s)

  return regions
}

function drawGeneSetData(ctx, width, totalHeight, layout, data, labelHeight, colorMask, cohortIndex, view, maxValue) {
  const tissueCount = data[0].length
  const img = ctx.createImageData(width, totalHeight)
  const sampleRegions = findPathwayData(width, tissueCount)
  const colorFilter = view === VIEW_ENUM.GENE_EXPRESSION ? 'geneExpression': 'total'

  let hasSeenActiveRegion = false
  let isGene = false
  let isSelectedGeneSet = false
  const open = layout.filter( el => !el.active ).length > 0

  const cnvHighColorMask = getCNVHighColorMask()
  const cnvLowColorMask = getCNVLowColorMask()
  const mutation4ColorMask = getMutation4ColorMask()
  const mutation3ColorMask = getMutation3ColorMask()
  const mutation2ColorMask = getMutation2ColorMask()


  layout.forEach((el, i) => {
    //     // TODO: may be faster to transform the whole data cohort at once

    if(open){
      if(el.active && !hasSeenActiveRegion){
        isSelectedGeneSet = true
        isGene = false
        hasSeenActiveRegion = true
      }
      else
      if(el.active && hasSeenActiveRegion && isSelectedGeneSet){
        isGene = true
        isSelectedGeneSet = false
      }
      else
      if(!el.active && hasSeenActiveRegion){
        isGene = false
        isSelectedGeneSet = false
        hasSeenActiveRegion = false
      }
    }

    let rowData = data[i]
    if (cohortIndex === 0) {
      rowData = rowData.reverse()
    }

    // XXX watch for poor iterator performance in this for...of.
    for (const rs of sampleRegions.keys()) {
      const r = sampleRegions.get(rs)
      const d = rowData.slice(r.start, r.end + 1)
      const pxRow = el.start * 4 * img.width // first column and row in the block
      if(isViewGeneExpression(view)){
        // const geneExpressionScore = sumDataByType(d, 'geneExpression');
        const geneExpressionScore = meanDataByType(d, 'geneExpressionPathwayActivity')
        for (let xPos = 0; xPos < r.width; ++xPos) {
          const buffStart = pxRow + (xPos + r.x) * 4
          const buffEnd = buffStart + (r.x + xPos + img.width * 4 * labelHeight)
          for (let l = buffStart; l < buffEnd; l += 4 * img.width) {
            const colorArray = isNaN(geneExpressionScore) ? [128,128,128] : calculateColorArray(isGene ? 2 : maxValue ,geneExpressionScore)
            img.data[l] = colorArray[0]
            img.data[l + 1] = colorArray[1]
            img.data[l + 2] = colorArray[2]
            img.data[l + 3] = el.active ? 255 : 50
          }
        }
      }
      else{
        let color = regionColor(d, colorFilter)

        color = color > 255 ? 255 : color

        // start buffer at the correct column
        for (let xPos = 0; xPos < r.width; ++xPos) {
          const buffStart = pxRow + (xPos + r.x) * 4
          const buffEnd = buffStart + (r.x + xPos + img.width * 4 * labelHeight)

          // active geneset, inactive geneset, gene
          if(isGene){
            const cnvHighScore = sumDataByType(d, 'cnvHigh')
            const cnvLowScore = sumDataByType(d, 'cnvLow')
            const cnvScore = sumDataByType(d, 'cnv')
            const mutation4Score = sumDataByType(d, 'mutation4')
            const mutation3Score = sumDataByType(d, 'mutation3')
            // const mutation2Score = sumDataByType(d, 'mutation2');
            const mutationScore = sumDataByType(d, 'mutation')
            const cnvColorMask = cnvHighScore > cnvLowScore ? cnvHighColorMask : cnvLowColorMask
            // take the highest one
            const mutationColorMask = generateMask(mutation4Score,mutation4ColorMask,mutation3Score,mutation3ColorMask,mutation2ColorMask)
            const cnvColor = cnvScore === 0 ? 0 : 255
            const mutationColor = mutationScore === 0 ? 0 : 255
            // buffMid has to be a multiple of 4
            if(view===VIEW_ENUM.CNV_MUTATION){
              let buffMid = (buffEnd - buffStart) / 2 + buffStart
              buffMid += buffMid % 4
              for (let l = buffStart ; l < buffEnd ; l += 4 * img.width) {
                if(l < buffMid){
                  img.data[l] = cnvColorMask[0]
                  img.data[l + 1] = cnvColorMask[1]
                  img.data[l + 2] = cnvColorMask[2]
                  img.data[l + 3] = cnvColor
                }
                if(l >= buffMid){
                  img.data[l] = mutationColorMask[0]
                  img.data[l + 1] = mutationColorMask[1]
                  img.data[l + 2] = mutationColorMask[2]
                  img.data[l + 3] = mutationColor
                }
              }
            }
            else
            if(view===VIEW_ENUM.MUTATION) {
              for (let l = buffStart; l < buffEnd; l += 4 * img.width) {
                img.data[l] = mutationColorMask[0]
                img.data[l + 1] = mutationColorMask[1]
                img.data[l + 2] = mutationColorMask[2]
                img.data[l + 3] = mutationColor
              }
            }
            else
            if(view===VIEW_ENUM.COPY_NUMBER) {
              for (let l = buffStart; l < buffEnd; l += 4 * img.width) {
                img.data[l] = cnvColorMask[0]
                img.data[l + 1] = cnvColorMask[1]
                img.data[l + 2] = cnvColorMask[2]
                img.data[l + 3] = cnvColor
              }
            }
          }
          else
          if(el.active){
            for (let l = buffStart; l < buffEnd; l += 4 * img.width) {
              if(color===0){
                img.data[l] = 255
                img.data[l + 1] = 255
                img.data[l + 2] = 255
                img.data[l + 3] = 255
              }
              else{
                img.data[l] = colorMask[0]
                img.data[l + 1] = colorMask[1]
                img.data[l + 2] = colorMask[2]
                img.data[l + 3] = color
              }
            }
          }
          else{
            for (let l = buffStart; l < buffEnd; l += 4 * img.width) {
              img.data[l] = 0
              img.data[l + 1] = 0
              img.data[l + 2] = 0
              img.data[l + 3] = color * 0.3
            }
          }

        }
      }
    }
  })
  ctx.putImageData(img, 0, 0)
}


export function calculateColorArrayRgb(maxValue,score){
  return `rgb(${calculateColorArray(maxValue,score).join(',')})`
}

export function calculateColorArray(maxValue,score){
  const key = maxValue+'::'+score
  if(!colorArrayGeneExpressionCache[key]){
    colorArrayGeneExpressionCache[key] = getColorArray(interpolateGenesetScoreFunction(maxValue )(score))
  }
  return colorArrayGeneExpressionCache[key]
}


export default {

  drawGeneSetView(vg, props) {
    const {
      width, layout, labelHeight, cohortIndex, associatedData, filter, maxValue
    } = props
    const totalHeight = labelHeight * layout.length
    clearScreen(vg, width, totalHeight)
    if(associatedData.length!==layout.length) return
    drawGeneSetData(vg, width, totalHeight, layout, associatedData, labelHeight, getGeneSetColorMask(filter), cohortIndex,filter, maxValue)
  },

}
