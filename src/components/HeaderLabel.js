import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from "react-toolbox";

export class HeaderLabel extends PureComponent {

    maxColor = 256;

    constructor(props) {
        super(props);
        // console.log(this.props.label)
        // let label = this.props.label ;
        this.state = {
            hovered: false,
            selected: this.props.selected,
        };
    }

    onMouseOver = (item) => {
        this.setState({hovered: true});
    };

    onMouseOut = (item) => {
        this.setState({hovered: false});
    };

    style() {
        let {score,highScore,labelOffset, left, width, labelHeight,colorMask} = this.props;

        let color = Math.round(this.maxColor * (1.0 - (score / highScore)));
        // let colorString = 'rgb(256,' + color + ',' + color + ')'; // sets the color to fill in the rectangle with


        let colorString = 'rgb(' ;
        colorString += (colorMask[0]===0  ? 256 : color) + ',' ;
        colorString += (colorMask[1]===0  ? 256 : color) + ',' ;
        colorString += (colorMask[2]===0  ? 256 : color) + ')' ;


        if (this.state.selected) {
            return {
                position: 'absolute',
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                backgroundColor: 'blue',
                strokeWidth: 1,
                cursor: 'pointer'
            }
        }
        else if (this.state.hovered) {
            return {
                position: 'absolute',
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                backgroundColor: 'yellow',
                strokeWidth: 1,
                cursor: 'pointer'
            }
        }
        else {
            return {
                position: 'absolute',
                top: labelOffset,
                left: left,
                height: labelHeight,
                width: width,
                backgroundColor: colorString,
                strokeWidth: 1,
            }
        }
    }

    fontColor() {
        if (this.state.hovered) {
            return 'brown';
        }
        if (this.state.selected) {
            return 'white';
        }
        return 'black';
    }

    render() {
        let {width, labelString, labelHeight} = this.props;
        return (
            <svg
                style={this.style()}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
            >
                <text x={-labelHeight + 2} y={10} fontFamily='Arial' fontSize={10} fill={this.fontColor()}
                      transform='rotate(-90)'
                >
                    {width < 10 ? '' : labelString}
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
    score: PropTypes.number,
    highScore: PropTypes.number,
    selected: PropTypes.any,
    colorMask: PropTypes.any,
};
