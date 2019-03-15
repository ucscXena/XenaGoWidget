import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import XenaGeneSetApp from "../src/components/XenaGeneSetApp";
import {addIndepProb, createEmptyArray, DEFAULT_DATA_VALUE} from "../src/functions/DataFunctions";
import { sumDataTotalSimple} from "../src/functions/DrawFunctions";
import {times} from "underscore";

describe('Main App', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });

  it('Displays main menu', () => {
    render(<XenaGeneSetApp/>, node, () => {
      expect(node.innerHTML).toContain('Xena Gene Set Viewer')
    })
  })
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


describe('Test array fill', () => {
    let node;

    beforeEach(() => {
        node = document.createElement('div')
    });

    afterEach(() => {
        unmountComponentAtNode(node)
    });

    it('Calculates single function properly', () => {
        // let returnArray = new Array(20).fill([]).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
        // let returnArray = times(20,fill([]).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
        let returnArray = times(20, () => times(5, () => DEFAULT_DATA_VALUE));
        expect(returnArray.length,20);
        expect(returnArray[0].length,5);
        expect(returnArray[5][3],{total:0,mutation:0,cnv:0});
        returnArray[5][3] = {total:7,mutation:3,cnv:1};
        expect(returnArray[5][3],{total:7,mutation:3,cnv:1});
        returnArray = new Array(20).fill(0).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
        expect(returnArray[5][3],{total:0,mutation:0,cnv:0});

    });

    it('Create a simple array', () => {
        let returnArray = createEmptyArray(20,5);
        expect(returnArray.length,20);
        expect(returnArray[0].length,5);
        expect(returnArray[5][3],{total:0,mutation:0,cnv:0});
        returnArray[5][3] = {total:7,mutation:3,cnv:1};
        expect(returnArray[5][3],{total:7,mutation:3,cnv:1});
        returnArray = new Array(20).fill(0).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
        expect(returnArray[5][3],{total:0,mutation:0,cnv:0});

    });

    it('Test simple reduce of JSON',() => {
        let inputArray = [ {total:8,mutation:0,cnv:4},{total:2,mutation:0,cnv:2},{total:5,mutation:0,cnv:2},{total:7,mutation:0,cnv:3}];
        let total = sumDataTotalSimple(inputArray,'total');
        // console.log(JSON.stringify(total))
        // console.log(3)
        expect(total===8+2+5+7);
    });
});
