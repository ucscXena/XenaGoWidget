import React from 'react'
import {render} from 'react-dom'

import PureComponent from "../../src/components/PureComponent";
import XenaGeneSetApp from "../../src/components/XenaGeneSetApp";
import {Helmet} from "react-helmet";


class Demo extends PureComponent {

    render() {
        return (
            <div>
                <Helmet>
                    <title>Xena Gene Set Viewer</title>
                    <meta name="description" content="Xena Gene Set Viewer" />
                </Helmet>
                <XenaGeneSetApp/>
            </div>)
    }

}

render(<Demo/>, document.querySelector('#demo'));
