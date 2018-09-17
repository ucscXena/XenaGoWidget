import React from 'react'
import {render} from 'react-dom'

import PureComponent from "../../src/components/PureComponent";
import XenaGeneSetApp from "../../src/components/XenaGeneSetApp";



const LOCAL_STORAGE_STRING = "default-xena-go-key";

class Demo extends PureComponent {

    static storePathway(pathway) {
        if (pathway) {
            localStorage.setItem(LOCAL_STORAGE_STRING, JSON.stringify(pathway));
        }
    }



    render() {
        return (
            <div>

            <XenaGeneSetApp/>


        </div>)
    }

}

render(<Demo/>, document.querySelector('#demo'));
