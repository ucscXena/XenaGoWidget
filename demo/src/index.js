import React from 'react';
import {render} from 'react-dom';

import PureComponent from '../../src/components/PureComponent';
import XenaGeneSetApp from '../../src/components/XenaGeneSetApp';
import {Helmet} from 'react-helmet';
import ReactGA from 'react-ga';


function initializeReactGA() {
  ReactGA.initialize('UA-150650247-1');
  ReactGA.pageview('/');
}

class XenaGeneSetPage extends PureComponent {


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

    return (
      <div>
        <Helmet
          link={[
            {'rel': 'icon',
              'type': 'image/png',
              'href': 'https://raw.githubusercontent.com/ucscXena/XenaGoWidget/develop/src/images/xenalogo_hfz_icon.ico'
            }
          ]}
          meta={[
            { name: 'description', content: 'Xena Gene Set Viewer' }
          ]}
          title="Xena Gene Set Viewer"
        />
        <XenaGeneSetApp/>
      </div>);
  }

}

render(<XenaGeneSetPage/>, document.querySelector('#demo'));
