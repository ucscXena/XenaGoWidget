import React, {Component} from 'react'
import {render} from 'react-dom'

import SampleApp from '../../src/ExampleApp'

class Demo extends Component {
  render() {
    return <div>
      <h1>XenaGoWidget Demo</h1>
      <SampleApp/>
    </div>
  }
}

render(<Demo/>, document.querySelector('#demo'))
