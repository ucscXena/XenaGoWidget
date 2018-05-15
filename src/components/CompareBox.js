import React from 'react'
import PureComponent from './PureComponent';
import XenaGoApp from './XenaGoApp';
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
import {Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";



export default class CompareBox extends PureComponent {
    constructor(props) {
        super(props);
    }

    render(){
        return <div>Compare box</div>
        // this.state.statsBox.commonGenes.map( (s) => {
        //     return <Chip>{s}</Chip>
        // })
    }
}
