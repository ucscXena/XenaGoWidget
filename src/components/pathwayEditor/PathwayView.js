import React from 'react'
import PureComponent from "../PureComponent";
import PropTypes from 'prop-types';
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';


export default class PathwayView extends PureComponent {

    constructor(props) {
        super(props);
        console.log(this.props)
        // this.state = {
        //     pathwaySet: this.props.selectedPathwaySet
        // }
    }

    selectPathway = (p) => {
        console.log('child selecting pathway ');
        this.props.clickPathwayHandler(p);
    };

    removePathway = (p) => {
        console.log('remove child selecting pathway ');
        this.props.removePathwayHandler(p);
    };

    render() {
        if (this.props.selectedPathwaySet.pathway) {
            console.log('this.props.selectedPathwaySet.pathway')
            console.log(this.props.selectedPathwaySet.pathway)
            return this.props.selectedPathwaySet.pathway.map(p => {
                return (
                    <Row key={p.golabel + p.goid}>
                        <Col md={8}>
                            <Button onClick={ () => this.selectPathway(p)} primary>{p.golabel} <b>{p.goid ? p.goid : ''}</b></Button>
                        </Col>
                        <Col md={2}>
                            <Button onClick={ () => this.removePathway(p)}>(X) Remove</Button>
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
