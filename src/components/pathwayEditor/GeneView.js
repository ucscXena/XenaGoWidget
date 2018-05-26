import React from 'react'
import PureComponent from "../PureComponent";
import PropTypes from 'prop-types';
import {Grid, Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
// import {Link} from 'react-toolbox/lib/link';
import FaTrash from 'react-icons/lib/fa/trash';


export default class GeneView extends PureComponent {

    constructor(props) {
        super(props);
        console.log('gene view construct ')
        console.log(props)
        this.state = {
            pathway: this.props.selectedPathway
        }
    }

    render() {
        console.log('geneview render')
        console.log(this.props)
        if (this.props.selectedPathway) {
            console.log(this.props.selectedPathway)
            return this.props.selectedPathway.gene.map(g => {
                return (
                    <Row key={g}>
                        <Col md={4}>
                            {g}
                        </Col>
                        <Col md={2}>
                            <Button ><FaTrash/></Button>
                        </Col>
                    </Row>
                )
            })
        }
        else {
            console.log('no pathway selected: ');
            console.log(this.state)
            return <div></div>
        }
    }

}


GeneView.propTypes = {
    selectedPathway: PropTypes.any,
};
