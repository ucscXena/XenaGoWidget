import expect from 'expect';
import {
  createEmptyArray,
  DEFAULT_DATA_VALUE,
  getCopyNumberHigh,
  getCopyNumberLow,
  getCopyNumberValue,
  getGenePathwayLookup,
  getMutationScore,
  scoreChiSquareTwoByTwo,
  scoreData,
  scoreChiSquaredData,
} from '../../src/functions/DataFunctions';
import {times} from 'underscore';
import DefaultPathways from '../../src/data/genesets/tgac';

const AMP_THRESHOLD = 2 ;
const DEL_THRESHOLD = -2 ;
const MUTATION_MIN = 2 ;

describe('Data Lookup Functions', () => {

  it('Copy Number Value', () => {
    expect(0).toEqual(getCopyNumberValue('NOTANUMBER',AMP_THRESHOLD,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberValue(undefined,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberValue(-3,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberValue(-2,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberValue(-1,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberValue(0,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberValue(1,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberValue(2,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberValue(3,AMP_THRESHOLD,DEL_THRESHOLD));
  });

  it('Copy Number High', () => {
    expect(0).toEqual(getCopyNumberHigh('NOTANUMBER',AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(undefined,AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(-3,AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(-2,AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(-1,AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(0,AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(1,AMP_THRESHOLD));
    expect(1).toEqual(getCopyNumberHigh(2,AMP_THRESHOLD));
    expect(1).toEqual(getCopyNumberHigh(3,AMP_THRESHOLD));
  });

  it('Copy Number Low', () => {
    expect(0).toEqual(getCopyNumberLow('NOTANUMBER',DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(undefined,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberLow(-3,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberLow(-2,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(-1,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(0,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(1,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(2,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(3,DEL_THRESHOLD));
  });

  it('Mutation Score', () => {
    expect(1).toEqual(getMutationScore('Frame_Shift_Ins',MUTATION_MIN));
    expect(1).toEqual(getMutationScore('SpliceDonorDeletion',MUTATION_MIN));
    expect(1).toEqual(getMutationScore('InFrameInsertion',MUTATION_MIN));
    expect(0).toEqual(getMutationScore('synonymous_variant',MUTATION_MIN));
    expect(0).toEqual(getMutationScore('downstream_gene_variant',MUTATION_MIN));
    expect(0).toEqual(getMutationScore('Copy Number',MUTATION_MIN));
  });

  it('Gene Pathway Look', () => {
    let genePathwayLookup = getGenePathwayLookup(DefaultPathways);
    expect([9,23,24]).toEqual(genePathwayLookup('BRCA1'));
    expect([19,23,27,28,30,39]).toEqual(genePathwayLookup('TP53'));
    expect([]).toEqual(genePathwayLookup('ATPK1'));
    expect([]).toEqual(genePathwayLookup('CDC1'));
  });



  it('Create a simple array', () => {
    let returnArray = createEmptyArray(20,5);
    expect(returnArray.length).toEqual(20);
    expect(returnArray[0].length).toEqual(5);
    expect(returnArray[5][3]).toEqual({total:0,mutation4:0,mutation3:0,mutation2:0,mutation:0,cnv:0,cnvLow:0,cnvHigh:0});
    returnArray[5][3] = {total:7,mutation:3,cnv:1};
    expect(returnArray[5][3]).toEqual({total:7,mutation:3,cnv:1});
    returnArray = new Array(20).fill(0).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
    expect(returnArray[5][3]).toEqual({total:0,mutation:0,cnv:0});
  });

  it('Calculates single function properly', () => {
    let returnArray = times(20, () => times(5, () => DEFAULT_DATA_VALUE));
    expect(returnArray.length===20);
    expect(returnArray[0].length===5);
    expect(returnArray[5][3]).toEqual({total:0,mutation4:0,mutation3:0,mutation2:0,mutation:0,cnv:0,cnvLow:0,cnvHigh:0});
    returnArray[5][3] = {total:7,mutation:3,cnv:1};
    expect(returnArray[5][3]).toEqual({total:7,mutation:3,cnv:1});
    returnArray = new Array(20).fill(0).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
    expect(returnArray[5][3]).toEqual({total:0,mutation:0,cnv:0});

  });

  it('Score Chi Square Data', () => {
    expect(-7.5).toEqual(scoreChiSquaredData(10,5,3));
  });

  it('Score Chi Square Data Two by Two', () => {
    expect(0.07326007326007325).toEqual(scoreChiSquareTwoByTwo(10,5,3,2));
  });

  it('Score Data', () => {
    expect(0.6666666666666666).toEqual(scoreData(10,5,3));
  });


});

