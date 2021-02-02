import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'

import XenaGeneSetApp from '../../../src/components/XenaGeneSetApp'

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

describe('Render XenaGeneSet App', () => {
  let node

  beforeEach(() => {
    node = document.createElement('div')
    localStorage.clear()
  })

  afterEach(() => {
    unmountComponentAtNode(node)
  })

  it('Displays main menu', (done) => {
    render(<XenaGeneSetApp/>, node, () => {
      done()
      sleep(1000)
      expect(node.innerHTML).toContain('Xena Gene Set Viewer')
    })
  })
})
