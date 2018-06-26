import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from "react-toolbox";

export class HeaderLabel extends PureComponent {

    maxColor = 256;

    constructor(props) {
        super(props);
        this.state = {
            hovered: false,
        };
    }

    onMouseOver = (item) => {
        this.setState({hovered: true});
    };

    onMouseOut = (item) => {
        this.setState({hovered: false});
    };

    style() {
        let {item: {density, golabel}, geneLength,selectedPathways, highScore, labelOffset, left, width, labelHeight, colorMask} = this.props;

        let color = Math.round(this.maxColor * (1.0 - (density / geneLength / highScore)));

        let colorString = 'rgb(';
        colorString += (colorMask[0] === 0 ? 256 : color) + ',';
        colorString += (colorMask[1] === 0 ? 256 : color) + ',';
        colorString += (colorMask[2] === 0 ? 256 : color) + ')';

        let selected = selectedPathways.indexOf(golabel) >= 0;

        if (selected) {
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
        let {item: {golabel}, selectedPathways} = this.props;

        let selected = selectedPathways.indexOf(golabel) >= 0;
        if (this.state.hovered) {
            return !selected ? 'brown' : 'yellow';
        }

        if (selected) {
            return 'white';
        }


        return 'black';
    }

    render() {
        // let {width, labelString, labelHeight, onMouseClick, item} = this.props;
        let {width, labelString, labelHeight, item} = this.props;
        let className = (item.gene.length === 1 ? item.gene[0] : item.golabel).replace(/ /g,'-');
        return (
            <svg
                style={this.style()}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
                className={className}
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
    highScore: PropTypes.number,
    item: PropTypes.any,
    selectedPathways: PropTypes.any,
    colorMask: PropTypes.any,
    geneLength: PropTypes.any,
    // onMouseClick: PropTypes.any,
};
