// import expect from 'expect'
import React from 'react'
import { unmountComponentAtNode} from 'react-dom'

describe('Color Functions', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });
});
