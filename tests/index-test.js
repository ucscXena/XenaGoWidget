import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import XenaGeneSetApp from "../src/components/XenaGeneSetApp";

describe('Component', () => {
  let node

  beforeEach(() => {
    node = document.createElement('div')
  })

  afterEach(() => {
    unmountComponentAtNode(node)
  })

  it('displays a welcome message', () => {
    render(<XenaGeneSetApp/>, node, () => {
      expect(node.innerHTML).toContain('Welcome to React components')
    })
  })
})
