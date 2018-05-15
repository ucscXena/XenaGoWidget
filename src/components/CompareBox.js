import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import XenaGoApp from './XenaGoApp';
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
import {Chip, Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";


export default class CompareBox extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        console.log('render Compare Box props')
        console.log(this.props)
        let {statBox: {commonGenes, commonPathways}} = this.props;
        console.log(commonGenes)
        console.log(commonPathways)
        // // return <div>Compare box</div>
        if (commonGenes) {
            console.log('has common genes')
            commonGenes.map((s) => {
                console.log(s)
                // return (
                //     <div>dogs</div>
                // )
            })
        }
        // else{
        return <div>Nada</div>
        // }
    }
}

CompareBox.propTypes = {
    statBox: PropTypes.any.isRequired,
};

