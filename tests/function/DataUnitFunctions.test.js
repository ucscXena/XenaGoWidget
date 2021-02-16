import expect from 'expect'
import {
  createEmptyArray,
  DEFAULT_DATA_VALUE,
  DEFAULT_AMPLIFICATION_THRESHOLD,
  DEFAULT_DELETION_THRESHOLD,
  getCopyNumberHigh,
  getCopyNumberLow,
  getCopyNumberValue,
  getGenePathwayLookup,
  getMutationScore,
  scoreChiSquareTwoByTwo,
  scoreData,
  scoreChiSquaredData, cleanData, average, generateStats, stdev, generateZScore, tTestGeneExpression,
} from '../../src/functions/DataFunctions'
import { MIN_FILTER } from '../../src/components/XenaGeneSetApp'
import {times} from 'underscore'
import DefaultPathways from '../../src/data/genesets/DefaultPathways'

describe('Data Unit Functions', () => {

  it('Copy Number Value', () => {
    expect(0).toEqual(getCopyNumberValue('NOTANUMBER',DEFAULT_AMPLIFICATION_THRESHOLD,DEFAULT_DELETION_THRESHOLD))
    expect(0).toEqual(getCopyNumberValue(undefined,DEFAULT_AMPLIFICATION_THRESHOLD,DEFAULT_DELETION_THRESHOLD))
    expect(1).toEqual(getCopyNumberValue(-3,DEFAULT_AMPLIFICATION_THRESHOLD,DEFAULT_DELETION_THRESHOLD))
    expect(1).toEqual(getCopyNumberValue(-2,DEFAULT_AMPLIFICATION_THRESHOLD,DEFAULT_DELETION_THRESHOLD))
    expect(0).toEqual(getCopyNumberValue(-1,DEFAULT_AMPLIFICATION_THRESHOLD,DEFAULT_DELETION_THRESHOLD))
    expect(0).toEqual(getCopyNumberValue(0,DEFAULT_AMPLIFICATION_THRESHOLD,DEFAULT_DELETION_THRESHOLD))
    expect(0).toEqual(getCopyNumberValue(1,DEFAULT_AMPLIFICATION_THRESHOLD,DEFAULT_DELETION_THRESHOLD))
    expect(1).toEqual(getCopyNumberValue(2,DEFAULT_AMPLIFICATION_THRESHOLD,DEFAULT_DELETION_THRESHOLD))
    expect(1).toEqual(getCopyNumberValue(3,DEFAULT_AMPLIFICATION_THRESHOLD,DEFAULT_DELETION_THRESHOLD))
  })

  it('Copy Number High', () => {
    expect(0).toEqual(getCopyNumberHigh('NOTANUMBER',DEFAULT_AMPLIFICATION_THRESHOLD))
    expect(0).toEqual(getCopyNumberHigh(undefined,DEFAULT_AMPLIFICATION_THRESHOLD))
    expect(0).toEqual(getCopyNumberHigh(-3,DEFAULT_AMPLIFICATION_THRESHOLD))
    expect(0).toEqual(getCopyNumberHigh(-2,DEFAULT_AMPLIFICATION_THRESHOLD))
    expect(0).toEqual(getCopyNumberHigh(-1,DEFAULT_AMPLIFICATION_THRESHOLD))
    expect(0).toEqual(getCopyNumberHigh(0,DEFAULT_AMPLIFICATION_THRESHOLD))
    expect(0).toEqual(getCopyNumberHigh(1,DEFAULT_AMPLIFICATION_THRESHOLD))
    expect(1).toEqual(getCopyNumberHigh(2,DEFAULT_AMPLIFICATION_THRESHOLD))
    expect(1).toEqual(getCopyNumberHigh(3,DEFAULT_AMPLIFICATION_THRESHOLD))
  })

  it('Copy Number Low', () => {
    expect(0).toEqual(getCopyNumberLow('NOTANUMBER',DEFAULT_DELETION_THRESHOLD))
    expect(0).toEqual(getCopyNumberLow(undefined,DEFAULT_DELETION_THRESHOLD))
    expect(1).toEqual(getCopyNumberLow(-3,DEFAULT_DELETION_THRESHOLD))
    expect(1).toEqual(getCopyNumberLow(-2,DEFAULT_DELETION_THRESHOLD))
    expect(0).toEqual(getCopyNumberLow(-1,DEFAULT_DELETION_THRESHOLD))
    expect(0).toEqual(getCopyNumberLow(0,DEFAULT_DELETION_THRESHOLD))
    expect(0).toEqual(getCopyNumberLow(1,DEFAULT_DELETION_THRESHOLD))
    expect(0).toEqual(getCopyNumberLow(2,DEFAULT_DELETION_THRESHOLD))
    expect(0).toEqual(getCopyNumberLow(3,DEFAULT_DELETION_THRESHOLD))
  })

  it('Mutation Score', () => {
    expect(1).toEqual(getMutationScore('Frame_Shift_Ins',MIN_FILTER))
    expect(1).toEqual(getMutationScore('SpliceDonorDeletion',MIN_FILTER))
    expect(1).toEqual(getMutationScore('InFrameInsertion',MIN_FILTER))
    expect(0).toEqual(getMutationScore('synonymous_variant',MIN_FILTER))
    expect(0).toEqual(getMutationScore('downstream_gene_variant',MIN_FILTER))
    expect(0).toEqual(getMutationScore('Copy Number',MIN_FILTER))
  })

  it('Gene Pathway Look', () => {
    let genePathwayLookup = getGenePathwayLookup(DefaultPathways)
    expect([0,3,5,8,9]).toEqual(genePathwayLookup('BRCA1'))
    expect([0,3,4,5,8,9,11,12]).toEqual(genePathwayLookup('TP53'))
    expect([]).toEqual(genePathwayLookup('ATPK1'))
    expect([]).toEqual(genePathwayLookup('CDC1'))
  })



  it('Create a simple array', () => {
    let returnArray = createEmptyArray(20,5)
    expect(returnArray.length).toEqual(20)
    expect(returnArray[0].length).toEqual(5)
    expect(returnArray[5][3]).toEqual({total:0,mutation4:0,mutation3:0,mutation2:0,mutation:0,cnv:0,cnvLow:0,cnvHigh:0,geneExpression:0})
    returnArray[5][3] = {total:7,mutation:3,cnv:1}
    expect(returnArray[5][3]).toEqual({total:7,mutation:3,cnv:1})
    returnArray = new Array(20).fill(0).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}))
    expect(returnArray[5][3]).toEqual({total:0,mutation:0,cnv:0})
  })

  it('Calculates single function properly', () => {
    let returnArray = times(20, () => times(5, () => DEFAULT_DATA_VALUE))
    expect(returnArray.length===20)
    expect(returnArray[0].length===5)
    expect(returnArray[5][3]).toEqual({total:0,mutation4:0,mutation3:0,mutation2:0,mutation:0,cnv:0,cnvLow:0,cnvHigh:0,geneExpression:0})
    returnArray[5][3] = {total:7,mutation:3,cnv:1}
    expect(returnArray[5][3]).toEqual({total:7,mutation:3,cnv:1})
    returnArray = new Array(20).fill(0).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}))
    expect(returnArray[5][3]).toEqual({total:0,mutation:0,cnv:0})

  })

  it('Score Chi Square Data', () => {
    expect(-7.5).toEqual(scoreChiSquaredData(10,5,3))
  })

  it('Score Chi Square Data Two by Two', () => {
    expect(0.07326007326007325).toEqual(scoreChiSquareTwoByTwo(10,5,3,2))
  })

  it('Score Data', () => {
    expect(0.6666666666666666).toEqual(scoreData(10,5,3))
  })

  it('Clean data', () => {
    expect([3,7,11]).toEqual(cleanData([3,'NaN',7],['NaN',11]))
  })

  it('Calculate mean', () => {
    expect(7).toEqual(average([3,7,11]))
  })

  it('Calculate stdev', () => {
    expect(7).toEqual(average([3,7,11]))
    expect(Math.abs(stdev([3,7,11],average([3,7,11]))-3.2659863237109)).toBeLessThan(0.00001)
  })

  it('Generate Gene Expression Stats', () => {
    // 2 genes with 4 samples in A and 3 samples in B
    const inputA = [[5,3,8,9],[2,11,'Nan',9]]
    const inputB = [[2,'NaN',9],[4,'Nan',9]]
    const geneStats = generateStats(inputA,inputB)
    expect(geneStats[0].mean).toEqual(6)
    expect(geneStats[1].mean).toEqual(7)
    expect(Math.abs(geneStats[0].stdev-2.8284271247462)).toBeLessThan(0.00001)
    expect(Math.abs(geneStats[1].stdev-3.4058772731853)).toBeLessThan(0.00001)

    // calculate zScore
    const zScoreA = generateZScore(inputA,geneStats)
    const zScoreB = generateZScore(inputB,geneStats)
    expect([ [ -0.35355339059327373, -1.0606601717798212, 0.7071067811865475, 1.0606601717798212 ], [ -1.4680505487867588, 1.174440439029407, 'Nan', 0.5872202195147035 ] ]).toEqual(zScoreA)
    expect([ [ -1.414213562373095, 'NaN', 1.0606601717798212 ], [ -0.8808303292720553, 'Nan', 0.5872202195147035 ] ]).toEqual(zScoreB)
  })

  it('Calculate Z-Score', () => {
    expect(generateZScore([[3,5]],[{mean:4,stdev:1}])).toEqual([[-1,1]])
    expect(generateZScore([[3,5],[11,7]],[{mean:4,stdev:1},{mean:9,stdev: 2}])).toEqual([[-1,1],[1,-1]])
    expect(generateZScore([[3,5,'Nan'],['Nan',11,7]],[{mean:4,stdev:1},{mean:9,stdev: 2}])).toEqual([[-1,1,'Nan'],['Nan',1,-1]])
  })

  it('TTest from two sets', () => {
    let element1 = {geneExpressionMean: 5, geneExpressionVariance: Math.pow(1,2.0), total: 100 } 
    let element2 = {geneExpressionMean: 8, geneExpressionVariance: Math.pow(2,2.0), total: 200} 
    expect(Math.abs(tTestGeneExpression( element1,element2)+14.134)).toBeLessThan(0.001)

    element1 = {geneExpressionMean: -5, geneExpressionVariance: Math.pow(1.5,2.0), total: 100 } 
    element2 = {geneExpressionMean: 8, geneExpressionVariance: Math.pow(2,2.0), total: 200} 
    expect(Math.abs(tTestGeneExpression( element1,element2)+57.408)).toBeLessThan(0.001)

    element1 = {geneExpressionMean: 8, geneExpressionVariance: Math.pow(1.5,2.0), total: 100 } 
    element2 = {geneExpressionMean: -2, geneExpressionVariance: Math.pow(2,2.0), total: 200} 
    expect(Math.abs(tTestGeneExpression( element1,element2)-44.160)).toBeLessThan(0.001)
  })

})
