import expect from 'expect'
import {calculateGeneSetActivity} from '../../src/service/AnalysisService'

describe('Analysis Service Test', () => {

  beforeEach(function(done) {
    sessionStorage.clear()
    window.setTimeout(function() {
      done()
    }, 0)
  })

  it('Convert gmt and analyzed data into gene set', () => {
    const selectedCohort = {}
    const gmtData = {}
    const analyzedData1 = {}
    const analyzedData2 = {}
    const outputData = calculateGeneSetActivity(selectedCohort,gmtData,analyzedData1,analyzedData2)
    console.log(outputData)
  })

})

