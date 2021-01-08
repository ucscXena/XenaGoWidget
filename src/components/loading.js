import React, {Component} from 'react'
import loading_gif from '../images/loading.jpg'

class Loader extends Component{

  render() {
    return (
      <div>
        <img alt="" height="100" src={loading_gif} width="100"/>
      </div>
    )
  }
}

export default Loader
