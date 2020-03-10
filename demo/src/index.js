import React from 'react'
import {render} from 'react-dom'

import PureComponent from '../../src/components/PureComponent'
import {Helmet} from 'react-helmet'
import ReactGA from 'react-ga'
import QueryString from 'querystring'
import { ApplicationWrapper } from '../../src/components/ApplicationWrapper'


function initializeReactGA() {
  ReactGA.initialize('UA-136203053-1')
  ReactGA.pageview('/')
}

class XenaGeneSetPage extends PureComponent {

  constructor(props) {
    super(props)

    const urlVariables = QueryString.parse(location.hash.substr(1))
    console.log('url variables', urlVariables)
    this.state = {
      wizard: urlVariables.wizard ? urlVariables.wizard : undefined
    }
  }


  render() {

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Xena Gene Set Viewer Dev environment')
    } else {
      // production code
      // eslint-disable-next-line no-console
      console.log('Xena Gene Set Viewer Initialized')
      initializeReactGA()
    }

    return (
      <div>
        <Helmet
          link={[
            {
              'rel': 'icon',
              'type': 'image/png',
              'href': 'https://raw.githubusercontent.com/ucscXena/XenaGoWidget/develop/src/images/xenalogo_hfz_icon.ico'
            }
          ]}
          meta={[
            {name: 'description', content: 'Xena Gene Set Viewer'}
          ]}
          title="Xena Gene Set Comparison"
        />
        <ApplicationWrapper/>
      </div>)
  }
}

render(<XenaGeneSetPage/>, document.querySelector('#demo'))
