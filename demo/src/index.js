import React, {Component} from 'react'
import {render} from 'react-dom'

import XenaGoApp from '../../src/XenaGoApp'

class Demo extends Component {
  render() {
    return <div>
      <h3>XenaGoWidget Demo</h3>
      <XenaGoApp/>
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'));
