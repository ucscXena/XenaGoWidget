import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick, groupBy, mapObject, pluck, flatten} from 'underscore';
import {Dropdown} from "react-toolbox";
import {LABEL_A, LABEL_B} from "./XenaGeneSetApp";


export class LabelTop extends PureComponent {

    constructor(props) {
        super(props);
    }

    render() {
        let fontSize = 15 ;
        let y = 12;
        let x = 7;
        return (
            <svg style={{height: 15,marginLeft: 10,width:this.props.width}}>
                <text x={x} y={y} fontFamily='Arial' fontSize={fontSize}
                >
                    Cohort {LABEL_A}
                </text>
                <text x={x+this.props.width/2} y={y} fontFamily='Arial' fontSize={fontSize}
                >
                    Cohort {LABEL_B}
                </text>
            </svg>
        );
    }
}

LabelTop.propTypes = {
    width: PropTypes.any.isRequired,
};
