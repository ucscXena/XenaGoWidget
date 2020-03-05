import React from 'react';
import {render} from 'react-dom';

import PureComponent from '../../src/components/PureComponent';
import XenaGeneSetApp from '../../src/components/XenaGeneSetApp';
import {Helmet} from 'react-helmet';
import ReactGA from 'react-ga';
import QueryString from 'querystring';


function initializeReactGA() {
  ReactGA.initialize('UA-136203053-1');
  ReactGA.pageview('/');
}

class XenaGeneSetPage extends PureComponent {

  constructor(props) {
    super(props);

    const urlVariables = QueryString.parse(location.hash.substr(1));
    console.log('url variables', urlVariables);
    this.state = {
      wizard: urlVariables.wizard ? urlVariables.wizard : undefined
    };
  }


  render() {

    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log('Xena Gene Set Viewer Dev environment');
    } else {
      // production code
      // eslint-disable-next-line no-console
      console.log('Xena Gene Set Viewer Initialized');
      initializeReactGA();
    }

    if (this.state.wizard) {
      if (this.state.wizard === 'analysis') {
        return (
          <div>
            Analysis Wizard
            <button onClick={() => this.setState({wizard:'genesets'})}>Next</button>
          </div>
        );
      }
      if (this.state.wizard === 'genesets') {
        return (
          <div>
            <button onClick={() => this.setState({wizard:'analysis'})}>Previous</button>;
            GeneSets Wizard
            <button onClick={() => this.setState({wizard:undefined})}>Next</button>;
            <button onClick={() => this.setState({wizard:undefined})}>Open in a new window (somehow)</button>;
          </div>
        );
      }


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
          title="Xena Gene Set Viewer"
        />
        <XenaGeneSetApp/>
      </div>);
  }

}

render(<XenaGeneSetPage/>, document.querySelector('#demo'));
