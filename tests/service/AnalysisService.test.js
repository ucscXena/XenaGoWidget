import expect from 'expect'
// import {calculateCustomGeneSetActivity, getSamples} from '../../src/service/AnalysisService'
import {
  createMeanMap,
  getDataStatisticsForGeneSet, getDataStatisticsPerGeneSet,
  getGeneSetNames,
  getSamples, getValues, getValuesForCohort,
  getValuesForGeneSet, getZPathwayScores, getZSampleScores,
} from '../../src/service/AnalysisService'
import TEST_ANALYZED_DATA_COHORT_A from '../data/AnalzedTestDataOvarianCohort.json'
import TEST_ANALYZED_DATA_COHORT_B from '../data/AnalzedTestDataProstateCohort.json'
import {average} from '../../src/functions/DataFunctions'


describe('Analysis Service Test', () => {

  beforeEach(function(done) {
    sessionStorage.clear()
    window.setTimeout(function() {
      done()
    }, 0)
  })

  it('Get gene set names', () => {
    const geneSetNames = getGeneSetNames(TEST_ANALYZED_DATA_COHORT_A)
    expect(geneSetNames.length).toEqual(50)
    expect(geneSetNames[0]).toEqual('HALLMARK_TNFA_SIGNALING_VIA_NFKB')
    expect(geneSetNames[49]).toEqual('HALLMARK_PANCREAS_BETA_CELLS')
  })

  it('Get samples', () => {
    const samples = getSamples(TEST_ANALYZED_DATA_COHORT_A)
    expect(samples.length).toEqual(379)
    expect(samples[0]).toEqual('TCGA.04.1331.01')
    expect(samples[378]).toEqual('TCGA.WR.A838.01')
  })

  it('Get values', () => {
    const values = getValuesForGeneSet(TEST_ANALYZED_DATA_COHORT_A[0])
    expect(values.length).toEqual(379)
    expect(values[0]).toEqual(17.5313)
    expect(values[378]).toEqual(16.6648)
  })

  it('Get data statistics', () => {
    const values = getValuesForGeneSet(TEST_ANALYZED_DATA_COHORT_A[0])
    expect(values.length).toEqual(379)
    const {mean, variance} = getDataStatisticsForGeneSet(values)
    expect(Math.abs(mean-18.539003693931388)).toBeLessThan(0.0000001)
    expect(Math.abs(variance-2.301772809115643)).toBeLessThan(0.0000001)
  })

  it('Get values per cohort', () => {
    const valuesForCohort = getValuesForCohort(TEST_ANALYZED_DATA_COHORT_A)
    expect(valuesForCohort.length).toEqual(50)
    expect(valuesForCohort[0].length).toEqual(379)
  })

  it('Get data statistics PER Gene set', () => {
    const values = getValues([TEST_ANALYZED_DATA_COHORT_A,TEST_ANALYZED_DATA_COHORT_A])
    const statisticsPerGeneSet = getDataStatisticsPerGeneSet(values)
    expect(statisticsPerGeneSet.length).toEqual(50)
    expect(Math.abs(statisticsPerGeneSet[0].mean-18.539003693931388)).toBeLessThan(0.0000001)
    expect(Math.abs(statisticsPerGeneSet[0].variance-2.301772809115643)).toBeLessThan(0.0000001)
    expect(Math.abs(statisticsPerGeneSet[49].mean-2.9006319261213696)).toBeLessThan(0.0000001)
    expect(Math.abs(statisticsPerGeneSet[49].variance-0.22969930929734556)).toBeLessThan(0.0000001)
  })

  it('Get sample Z scores', () => {
    const values = getValues([TEST_ANALYZED_DATA_COHORT_A,TEST_ANALYZED_DATA_COHORT_A])
    const statisticsPerGeneSet = getDataStatisticsPerGeneSet(values)
    const zSamplesScores = getZSampleScores(values[0],statisticsPerGeneSet)
    expect(zSamplesScores.length).toEqual(50)
    expect(zSamplesScores[0].length).toEqual(379)
    expect(zSamplesScores[49].length).toEqual(379)
    expect(zSamplesScores[0][0]!==values[0][0][0]).toBeTruthy()
    expect(zSamplesScores[49][0]!==values[0][49][0]).toBeTruthy()
    expect(Math.abs(zSamplesScores[0][0]+0.4377945946448785)).toBeLessThan(0.00001)
    expect(Math.abs(zSamplesScores[49][0]+0.6766756356248463)).toBeLessThan(0.00001)

  })

  it('Calculate mean', () => {
    const inputArray = [ -0.9034939058206737, -0.32404070499409926, 0.13394935305966119, -1.2169471774924474, 1.159638114252303, -1.2408915246340415, 1.510096286051997]
    const outputValue = average(inputArray)
    expect(outputValue).toBeGreaterThan(-0.126)
    expect(outputValue).toBeLessThan(-0.125)
  })

  it('Get Sample Z pathways', () => {
    const values = getValues([TEST_ANALYZED_DATA_COHORT_A,TEST_ANALYZED_DATA_COHORT_B])
    const dataStatisticsPerGeneSet = getDataStatisticsPerGeneSet(values)
    const zSampleScores = [getZSampleScores(values[0],dataStatisticsPerGeneSet),getZSampleScores(values[1],dataStatisticsPerGeneSet)]
    const zPathwayScores = getZPathwayScores(zSampleScores)
    expect(zPathwayScores.length).toEqual(2)
    expect(zPathwayScores[0].length).toEqual(50)
    expect(zPathwayScores[1].length).toEqual(50)

    // these will be close to 0
    expect(Math.abs(zPathwayScores[0][0])).toBeLessThan(0.00001)
    expect(Math.abs(zPathwayScores[0][49])).toBeLessThan(0.00001)

  })

  it('Create mean map', () => {
    const returnMap = createMeanMap([TEST_ANALYZED_DATA_COHORT_A,TEST_ANALYZED_DATA_COHORT_A])
    // expect(returnMap.length).toEqual(2)
    expect(returnMap.samples.length).toEqual(2)
    expect(returnMap.geneSetNames.length).toEqual(50)
    expect(returnMap.zSampleScores.length).toEqual(2)
    expect(returnMap.zPathwayScores.length).toEqual(2)

    expect(returnMap.zPathwayScores[0].length).toEqual(50)
    expect(returnMap.zSampleScores[0].length).toEqual(50)
    expect(returnMap.zSampleScores[0][0].length).toEqual(379)
    expect(returnMap.samples[0].length).toEqual(379)
    // console.log('return map B',returnMap)
  })
})



