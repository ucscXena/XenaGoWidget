import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import XenaGeneSetApp from "../src/components/XenaGeneSetApp";
import {addIndepProb} from "../src/functions/DataFunctions";

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
      expect(node.innerHTML).toContain('Xena Geneset Widget Demo')
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
