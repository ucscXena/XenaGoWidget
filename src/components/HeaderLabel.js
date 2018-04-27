import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from "react-toolbox";

export class HeaderLabel extends PureComponent {

    constructor(props) {
        super(props);
        // this.state = {
        //     selectedCohort: props.selectedCohort
        // };
    }


    render() {
        let { labelOffset, top,left,width,labelString,labelHeight,colorString } = this.props;
        return (
            <svg
                style={{
                    position: 'absolute',
                    top: labelOffset,
                    left: left,
                    height: labelHeight,
                    width: width,
                    color: 'black',
                    backgroundColor: colorString,
                    strokeWidth: 1,
                }}
            >
                <text x={-labelHeight + 2} y={10} fontFamily='Arial' fontSize={10}
                      transform='rotate(-90)'
                >
                    {labelString}
                </text>
            </svg>
        );
    }
}

HeaderLabel.propTypes = {
    labelOffset: PropTypes.any,
    labelHeight: PropTypes.any,
    colorString: PropTypes.string,
    left: PropTypes.any,
    width: PropTypes.any,
    labelString: PropTypes.string,
};
