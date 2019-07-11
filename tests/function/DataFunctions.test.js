import expect from 'expect'
import React from 'react'
import { unmountComponentAtNode} from 'react-dom'
import {
  addIndepProb,
  associateData, createEmptyArray,
  getCopyNumberHigh,
  getCopyNumberLow,
  getCopyNumberValue, getGenePathwayLookup,
  getMutationScore, pruneColumns
} from "../../src/functions/DataFunctions";
import {times} from "underscore";



const AMP_THRESHOLD = 2 ;
const DEL_THRESHOLD = -2 ;

describe('Data Functions', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });

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
    let effect, min;
    expect(getMutationScore(effect,min)).toEqual('Xena Gene Set Viewer')
  });

  it('Gene Pathway Look', () => {
    let pathways;
    expect(getGenePathwayLookup(pathways)).toEqual('Xena Gene Set Viewer')
  });

  it('Prune columns', () => {
    let data,pathways,min;
    expect(pruneColumns(data,pathways,min)).toEqual('Xena Gene Set Viewer')
  });

  it('Associated Data', () => {
    let  expression, copyNumber, geneList, pathways, samples, filter, min, selectedCohort;
    expect(associateData(expression, copyNumber, geneList, pathways, samples, filter, min, selectedCohort)).toEqual('Xena Gene Set Viewer')
  });

  describe('Test statistical function', () => {
    let node;

    beforeEach(() => {
      node = document.createElement('div')
    });

    afterEach(() => {
      unmountComponentAtNode(node)
    });

    it('Calculates single function properly', () => {
      expect([addIndepProb([3])]).toContain(3)
    });
    it('Calculates multiple function properly 1', () => {
      expect([addIndepProb([3,3])]).toContain(-3)
    });
    it('Calculates multiple function properly 2', () => {
      expect([addIndepProb([0.2,0.6])]).toContain(0.68)
    });
    it('Calculates multiple function properly 3', () => {
      expect([addIndepProb([0.8,0.05])]).toContain(0.81)
    });
  });


  it('Create a simple array', () => {
    let returnArray = createEmptyArray(20,5);
    expect(returnArray.length).toEqual(20);
    expect(returnArray[0].length).toEqual(5);
    // expect(returnArray[5][3]).toEqual({total:0,mutation:0,cnv:0});
    expect(returnArray[5][3]).toEqual({total:0,mutation4:0,mutation3:0,mutation2:0,mutation:0,cnv:0,cnvLow:0,cnvHigh:0});
    returnArray[5][3] = {total:7,mutation:3,cnv:1};
    expect(returnArray[5][3]).toEqual({total:7,mutation:3,cnv:1});
    returnArray = new Array(20).fill(0).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
    expect(returnArray[5][3]).toEqual({total:0,mutation:0,cnv:0});

  });

  it('Calculates single function properly', () => {
    // let returnArray = new Array(20).fill([]).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
    // let returnArray = times(20,fill([]).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
    let returnArray = times(20, () => times(5, () => DEFAULT_DATA_VALUE));
    expect(returnArray.length===20);
    expect(returnArray[0].length===5);
    expect(returnArray[5][3]).toEqual({total:0,mutation4:0,mutation3:0,mutation2:0,mutation:0,cnv:0,cnvLow:0,cnvHigh:0});
    returnArray[5][3] = {total:7,mutation:3,cnv:1};
    expect(returnArray[5][3]).toEqual({total:7,mutation:3,cnv:1});
    returnArray = new Array(20).fill(0).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
    expect(returnArray[5][3]).toEqual({total:0,mutation:0,cnv:0});

  });


});

