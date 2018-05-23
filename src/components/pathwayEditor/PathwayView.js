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

    getItems(){
        return this.state.pathway.map( p => {
            console.log(p.golabel)
            return <li> {p.golabel} </li>
        })
    }

    render(){
        console.log('render');
        console.log(this.state);
        if(this.state.pathway.pathways){
            console.log(this.state.pathway.pathways)
            return this.state.pathway.pathways.map( p => {
                console.log(p)
                return <li key={p.golabel+p.goid}> {p.golabel} </li>
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
