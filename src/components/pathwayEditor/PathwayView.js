import React from 'react'
import PureComponent from "../PureComponent";
import PropTypes from 'prop-types';


export default class PathwayView extends PureComponent {

    constructor(props) {
        super(props);
        console.log(this.props)
        this.state = {
            pathway: this.props.selectedPathway
        }
    }


    render(){
        if(this.state.pathway.pathways){
            console.log(this.state.pathway.pathways)
            return this.state.pathway.pathways.map( p => {
                return (
                    <li key={p.golabel+p.goid}>
                        {p.golabel} <b>{p.goid ? p.goid :''}</b>
                        <button>(X) Remove</button>
                    </li>
                )
            })
        }
        else{
            <div></div>
        }
    }


}

PathwayView.propTypes = {
    selectedPathway: PropTypes.any.isRequired,
};
