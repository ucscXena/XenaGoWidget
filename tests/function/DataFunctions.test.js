import expect from 'expect'
import React from 'react'
import { unmountComponentAtNode} from 'react-dom'
import {
  associateData,
  getCopyNumberHigh,
  getCopyNumberLow,
  getCopyNumberValue, getGenePathwayLookup,
  getMutationScore, pruneColumns
} from "../../src/functions/DataFunctions";

describe('Main App', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });

  it('Copy Number Value', () => {
    let copyNumberValue, ampThreshold, deletionThreshold;
    expect(getCopyNumberValue(copyNumberValue,ampThreshold,deletionThreshold)).toEqual('Xena Gene Set Viewer')
  });

  it('Copy Number High', () => {
    let copyNumberValue, ampThreshold, deletionThreshold;
    expect(getCopyNumberHigh(copyNumberValue,ampThreshold,deletionThreshold)).toEqual('Xena Gene Set Viewer')
  });

  it('Copy Number Low', () => {
    let copyNumberValue, ampThreshold, deletionThreshold;
    expect(getCopyNumberLow(copyNumberValue,ampThreshold,deletionThreshold)).toEqual('Xena Gene Set Viewer')
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




});

