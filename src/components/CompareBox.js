import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Chip, Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";

const MAX_COLOR = 256  ;

export default class CompareBox extends PureComponent {


    constructor(props) {
        super(props);
    }

    style(s,length,colorMask) {
        let color = Math.round(MAX_COLOR * (1.0 - (length * s.score)));

        let colorString = 'rgb(';
        colorString += (colorMask[0] === 0 ? 256 : color) + ',';
        colorString += (colorMask[1] === 0 ? 256 : color) + ',';
        colorString += (colorMask[2] === 0 ? 256 : color) + ')';

        return {
            backgroundColor: colorString,
            width: '100%',
            height: 20,
        }

    }

    render() {
        let {statBox: {commonGenes}} = this.props;

        if (commonGenes) {
            return (
                commonGenes.map((s) => {
                    return (
                        <Chip style={this.style(s,commonGenes.length,[0,1,1])} key={s.name}>
                            <div style={{lineHeight:"normal",fontSize:"x-small",marginLeft: "auto",marginRight:"auto",fontWeight:"bolder"}}>
                            {s.name}
                            </div>
                        </Chip>
                    )
                })
            )
        }
        // else{
        return <div></div>
        // }
    }
}

CompareBox.propTypes = {
    statBox: PropTypes.any.isRequired,
};

