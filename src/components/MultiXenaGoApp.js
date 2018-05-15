import React from 'react'
import PureComponent from './PureComponent';
import XenaGoApp from './XenaGoApp';
import {Grid, Row, Col} from 'react-material-responsive-grid';


export default class MultiXenaGoApp extends PureComponent {
    constructor(props) {
        super(props);
    }


    render() {
        return (
            <div>
                <XenaGoApp/>
            </div>
        )

    }
}
