import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import XenaGeneSetApp from "../../src/components/XenaGeneSetApp";
import {sumDataByType} from "../../src/functions/DrawFunctions";

describe('Draw Functions', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });

  // it('Displays main menu', () => {
  //   render(<XenaGeneSetApp/>, node, () => {
  //     expect(node.innerHTML).toContain('Xena Gene Set Viewer')
  //   })
  // })

  it('Test simple reduce of JSON',() => {
    let inputArray = [ {total:8,mutation:0,cnv:4},{total:2,mutation:0,cnv:2},{total:5,mutation:0,cnv:2},{total:7,mutation:0,cnv:3}];
    let total = sumDataByType(inputArray,'total');
    // console.log(JSON.stringify(total))
    // console.log(3)
    expect(total===8+2+5+7);
  });
});

