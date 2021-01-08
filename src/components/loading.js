import React, {Component} from 'react'
import loading_gif from '../images/loading.jpg'

class Loader extends Component{

  render() {
    return (  
      <div>
        <img height="100" width="100" src={loading_gif} alt=""/>
      </div>
    )
  }
}

export default Loader