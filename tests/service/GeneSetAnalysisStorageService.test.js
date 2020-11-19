import expect from 'expect'
import {VIEW_ENUM} from '../../src/data/ViewEnum'
import {getAllCustomGeneSets, getCustomGeneSetNames} from '../../src/service/GeneSetAnalysisStorageService'


describe('GeneSet Analysis Storage Service Test', () => {

  beforeEach(function(done) {
    sessionStorage.clear()
    window.setTimeout(function() {
      done()
    }, 0)
  })

  it('Find all custom gene sets', async () => {
    const customGeneSetNames = await getAllCustomGeneSets()
    console.log(customGeneSetNames)
    // mostly we want to make sure its just an array
  })

  it('Find custom gene sets', async () => {
    const customGeneSetNames = await getCustomGeneSetNames(VIEW_ENUM.GENE_EXPRESSION)
    console.log(customGeneSetNames)
    // mostly we want to make sure its just an array
  })
})


