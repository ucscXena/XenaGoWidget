import React from 'react'
import PureComponent from "../PureComponent";
import PropTypes from 'prop-types';
import {Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
import FaTrash from 'react-icons/lib/fa/trash';


export default class PathwayView extends PureComponent {

    constructor(props) {
        super(props);
    }


    selectPathway = (p) => {
        this.props.clickPathwayHandler(p);
    };

    removePathway = (p) => {
        this.props.removePathwayHandler(p);
    };

    render() {
        if (this.props.selectedPathwaySet
            && this.props.selectedPathwaySet.pathways
            && this.props.selectedPathwaySet.pathways.length > 0) {
            return this.props.selectedPathwaySet.pathways.map(p => {
                return (
                    <Row key={p.golabel + p.goid}>
                        <Col md={9}>
                            <Button raised={p.highlight} onClick={ () => this.selectPathway(p)} primary>{p.golabel} ({p.gene.length}) <b>{p.goid ? p.goid : ''}</b></Button>
                        </Col>
                        <Col md={1}>
                            <Button onClick={ () => this.removePathway(p)}><FaTrash/></Button>
                        </Col>
                    </Row>
                )
            })
        }
        else {
            return <div></div>
        }
    }


}

PathwayView.propTypes = {
    selectedPathwaySet: PropTypes.any,
    clickPathwayHandler: PropTypes.any.isRequired,
    removePathwayHandler: PropTypes.any.isRequired,
};
