import expect from 'expect'
import React from 'react'
import { unmountComponentAtNode} from 'react-dom'
import {scoreChiSquaredData, scoreChiSquareTwoByTwo, scoreData} from "../../src/functions/ColorFunctions";

describe('Color Functions', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });

  it('Score Chi Square Data', () => {
      expect(-7.5).toEqual(scoreChiSquaredData(10,5,3))
  });

  it('Score Chi Square Data Two by Two', () => {
    expect(0.07326007326007325).toEqual(scoreChiSquareTwoByTwo(10,5,3,2))
  });

  it('Score Data', () => {
    expect(0.6666666666666666).toEqual(scoreData(10,5,3))
  });
});
