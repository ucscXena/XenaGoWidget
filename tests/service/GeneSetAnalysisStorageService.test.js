import expect from 'expect'
import {VIEW_ENUM} from '../../src/data/ViewEnum'
import {
  addCustomGeneSet,
  getAllCustomGeneSets,
  getCustomGeneSetNames
} from '../../src/service/GeneSetAnalysisStorageService'


describe('GeneSet Analysis Storage Service Test', () => {

  beforeEach(function(done) {
    sessionStorage.clear()
    window.setTimeout(function() {
      done()
    }, 0)
  })

  it('add custom gene set', async () => {
    const addedCustomGeneSet = await addCustomGeneSet(VIEW_ENUM.GENE_EXPRESSION,'test123.gmt',{input:'data'})
    expect(addedCustomGeneSet).toBeDefined()
  })

  it('Find all custom gene sets', async () => {
    const customGeneSetNames = await getAllCustomGeneSets()
    console.log(customGeneSetNames)
    expect(customGeneSetNames).toBeDefined()
    // mostly we want to make sure its just an array
  })
  //
  it('Find custom gene sets', async () => {
    const customGeneSetNames = await getCustomGeneSetNames(VIEW_ENUM.GENE_EXPRESSION)
    console.log(customGeneSetNames)
    // mostly we want to make sure its just an array
  })
})


