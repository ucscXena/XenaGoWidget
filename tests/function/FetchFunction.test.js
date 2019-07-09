import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import XenaGeneSetApp from "../../src/components/XenaGeneSetApp";

describe('Main App', () => {
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
});

