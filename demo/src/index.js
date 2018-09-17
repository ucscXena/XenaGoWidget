import React from 'react'
import {render} from 'react-dom'

import PureComponent from "../../src/components/PureComponent";
import XenaGeneSetViewer from "../../src/components/XenaGeneSetViewer";

class Demo extends PureComponent {

    render() {
        return (
            <div>

            <XenaGeneSetViewer/>


        </div>)
    }

}

render(<Demo/>, document.querySelector('#demo'));
