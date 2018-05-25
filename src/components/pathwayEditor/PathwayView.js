import React from 'react'
import PureComponent from "../PureComponent";
import PropTypes from 'prop-types';
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';


export default class PathwayView extends PureComponent {

    constructor(props) {
        super(props);
        console.log(this.props)
        this.state = {
            pathwaySet: this.props.selectedPathwaySet
        }
    }

    selectPathway = (p) => {
        console.log('child selecting pathway ');
        this.props.clickPathwayHandler(p);
    }

    render() {
        if (this.state.pathwaySet.pathwaySets) {
            console.log(this.state.pathwaySet.pathwaySets)
            return this.state.pathwaySet.pathwaySets.map(p => {
                return (
                    <Row key={p.golabel + p.goid}>
                        <Col md={8}>
                            <Button onClick={ () => this.selectPathway(p)} primary>{p.golabel} <b>{p.goid ? p.goid : ''}</b></Button>
                        </Col>
                        <Col md={2}>
                            <Button accent raised mini  onClick={this.props.removePathwayHandler}>(X) Remove</Button>
                        </Col>
                    </Row>
                )
            })
        }
        else {
            <div></div>
        }
    }


}

PathwayView.propTypes = {
    selectedPathwaySet: PropTypes.any.isRequired,
    clickPathwayHandler: PropTypes.any.isRequired,
    removePathwayHandler: PropTypes.any.isRequired,
};
