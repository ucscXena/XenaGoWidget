import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Dropdown} from "react-toolbox";

export class HeaderLabel extends PureComponent {

    constructor(props) {
        super(props);
        console.log(this.props.label)
        let label = this.props.label ;
        this.state = {
            hovered:false,
            selected:label==='DNA strand break joining'
        };
    }

    onMouseOver = (item) => {
        this.setState({ hovered:true });
    };

    onMouseOut = (item) => {
        this.setState({ hovered:false });
    };

    style(){
        let { labelOffset, left,width,labelHeight,colorString } = this.props;

        if(this.state.selected){
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
        else
        if(this.state.hovered){
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
        else{
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

    fontColor(){
        if(this.state.hovered){
            return 'brown';
        }
        if(this.state.selected ){
            return 'white';
        }
        return 'black';
    }

    render() {
        let { labelString,labelHeight } = this.props;
        return (
            <svg
                style={this.style()}
                onMouseOver={this.onMouseOver}
                onMouseOut={this.onMouseOut}
            >
                <text x={-labelHeight + 2} y={10} fontFamily='Arial' fontSize={10} fill={this.fontColor()}
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
    label: PropTypes.string,
};
