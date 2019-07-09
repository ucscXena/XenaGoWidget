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

describe('Main App', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });

  it('Transpose', () => {
    expect([transpose([0.8,0.05])]).toEqual([[0.8],[0.05]])
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

