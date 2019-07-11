import expect from 'expect'
import React from 'react'
import {unmountComponentAtNode} from 'react-dom'
import {
  clusterSort,
  diffSort,
  scoreColumns,
  sortByType,
  synchronizedSort,
  transpose
} from "../../src/functions/SortFunctions";

describe('Sort Functions', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });

  it('Transpose', () => {
    let input = [[{"total":1,"mutation":0,"cnv":1,"mutation4":0,"mutation3":0,"mutation2":0,"cnvHigh":1,"cnvLow":0},{"total":0,"mutation":0,"cnv":0,"mutation4":0,"mutation3":0,"mutation2":0,"cnvHigh":0,"cnvLow":0}]];
    let output = [[{"total":1,"mutation":0,"cnv":1,"mutation4":0,"mutation3":0,"mutation2":0,"cnvHigh":1,"cnvLow":0}],[{"total":0,"mutation":0,"cnv":0,"mutation4":0,"mutation3":0,"mutation2":0,"cnvHigh":0,"cnvLow":0}]];
    expect(output).toEqual(transpose(input))
  })

  it('Score columns', () => {
    expect(scoreColumns([0.8,0.05])).toEqual([[0.8],[0.05]])
  })

  it('Sort by type', () => {
    expect(sortByType([0.8,0.05])).toEqual([[0.8],[0.05]])
  })

  it('Cluster sort', () => {
    expect(clusterSort([0.8,0.05])).toEqual([[0.8],[0.05]])
  })

  it('Diff sort', () => {
    expect(diffSort([0.8,0.05])).toEqual([[0.8],[0.05]])
  })

  it('Cluster sample sort', () => {
    expect(clusterSort([0.8,0.05])).toEqual([[0.8],[0.05]])
  })
  it('Synchrozine sort', () => {
    expect(synchronizedSort([0.8,0.05])).toEqual([[0.8],[0.05]])
  })
});

