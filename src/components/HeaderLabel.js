import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from "react-toolbox";

export class HeaderLabel extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            hovered:false
        };
    }

    onMouseOver = (item) => {
        this.setState({ hovered:true });
    }

    onMouseOut = (item) => {
        this.setState({ hovered:false });
    }

    style(){
        let { labelOffset, left,width,labelHeight,colorString } = this.props;
        if(this.state.hovered){
            return {
                position: 'absolute',
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                color: 'red',
                backgroundColor: 'yellow',
                strokeWidth: 1,
                cursor: 'pointer'
            }
        }
        else{
            return {
                position: 'absolute',
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                color: 'black',
                backgroundColor: colorString,
                strokeWidth: 1,
            }
        }
    }

    render() {
        let { labelString,labelHeight } = this.props;
        return (
            <svg
                style={this.style()}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
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
