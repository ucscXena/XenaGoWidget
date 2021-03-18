import {isViewGeneExpression} from './DataFunctions'

export function getSelectColor() {
  return '#113871'
}

export function getHighlightedColor() {
  return '#DD55DD'
}

export function getWhiteColor() {
  return '#F7FFF7'
}

export function getCNVColorMask() {
  return [250, 0, 0]
}

export function getMutationColorMask() {
  return [0, 0, 200]
}

export function getCNVHighColorMask() {
  return [255, 0, 0]
}

export function getCNVLowColorMask() {
  return [0, 0, 255]
}

export function getMutation4ColorMask() { // same as CNV deleteion, loss of function
  // return [155, 100, 0];
  return [0, 0, 255]
}

export function getMutation3ColorMask() { // same as Xena VS, splice
  // return [150, 165, 0];
  return [255, 127, 14]
}

export function getMutation2ColorMask() { // same as Xena VS, missense/in_frame
  // return [0, 100, 155];
  return [31, 119, 180]
}

export function getGeneColorMask() {
  return [26, 83, 92]
}

export function RGBToHex(inputArray) {
  let [r,g,b] = inputArray
  r = r.toString(16)
  g = g.toString(16)
  b = b.toString(16)

  if (r.length === 1)
    r = '0' + r
  if (g.length === 1)
    g = '0' + g
  if (b.length === 1)
    b = '0' + b

  return '#' + r + g + b
}

export const GENE_EXPRESSION_GENE_SET_COLOR_MAX = [255, 10, 10]
export const CNV_MUTATION_GENE_SET_COLOR_MAX = [139,69,19]
export const CNV_MUTATION_GENE_SET_COLOR_MID = [231,142,79]

export function getGeneSetColorMask(view) {
  return isViewGeneExpression(view) ? GENE_EXPRESSION_GENE_SET_COLOR_MAX : CNV_MUTATION_GENE_SET_COLOR_MAX
}

export function standardizeColor(str,alpha){
  let ctx = document.createElement('canvas').getContext('2d')
  ctx.fillStyle = str
  ctx.fillRect(0,0,1,1)
  const colorArray = ctx.getImageData(0,0,1,1).data
  const rgb = `rgb(${colorArray[0]},${colorArray[1]},${colorArray[2]},${alpha})`
  return rgb
}
