import PureComponent from "./PureComponent";
import React from 'react'
import PropTypes from 'prop-types';



export default class VerticalPathwaySetScoresView extends PureComponent {

    constructor(props){
        super(props);
    }

    render(){
        return (
            <div>Left or Right Details</div>
        )
    }
}

VerticalPathwaySetScoresView.propTypes = {
    data: PropTypes.any,
};
