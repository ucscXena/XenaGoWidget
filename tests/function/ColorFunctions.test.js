import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import XenaGeneSetApp from "../../src/components/XenaGeneSetApp";
import {scoreChiSquaredData, scoreData} from "../../src/functions/ColorFunctions";

describe('Main App', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });

  it('Score Chi Square Data', () => {
      expect(scoreChiSquaredData(10,5,3)).toEqual(20)
  });

  it('Score Chi Square Data Two by Two', () => {
    expect(scoreChiSquaredData(10,5,3,2)).toEqual(20)
  });

  it('Score Data', () => {
    expect(scoreData(10,5,3)).toEqual(20)
  });
});
