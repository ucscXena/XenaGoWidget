import React from 'react'
import PureComponent from "../PureComponent";
import PropTypes from 'prop-types';
import {Button} from 'react-toolbox/lib/button';
import {Grid, Row, Col} from 'react-material-responsive-grid';
import FaTrash from 'react-icons/lib/fa/trash';


export default class PathwaySetsView extends PureComponent {

    // constructor(props){
    //     super(props);
    // }

    render() {
        return this.props.pathwaySets.map((pathway, index) => {
            return (
                <Row key={pathway.name}>
                    <Col md={8}>
                        <Button primary>{pathway.name}</Button>
                    </Col>
                    <Col md={2}>
                        <Button><FaTrash/></Button>
                    </Col>
                </Row>
            )
        });
    }

}


PathwaySetsView.propTypes = {
    pathwaySets: PropTypes.any,
};
