import React from 'react'
import {render} from 'react-dom'

import PureComponent from "../../src/components/PureComponent";
import XenaGeneSetApp from "../../src/components/XenaGeneSetApp";


class Demo extends PureComponent {

    render() {
        return (
            <div>
                <XenaGeneSetApp/>
            </div>)
    }

}

render(<Demo/>, document.querySelector('#demo'));
