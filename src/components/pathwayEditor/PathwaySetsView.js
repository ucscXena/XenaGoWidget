import React from 'react'
import PureComponent from "../PureComponent";
import PropTypes from 'prop-types';
import {Button} from 'react-toolbox/lib/button';
import {Grid, Row, Col} from 'react-material-responsive-grid';
import FaTrash from 'react-icons/lib/fa/trash';
import FaEye from 'react-icons/lib/fa/eye';
import FaClone from 'react-icons/lib/fa/clone';


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
                    <Col md={3}>
                        <a role='button' onClick={()=>this.clone(pathway)}><FaClone/></a>
                        <a role='button' onClick={()=>this.view(pathway)}><FaEye/></a>
                    {/*</Col>*/}
                    {/*<Col md={1}>*/}
                        <a role='button' onClick={()=>this.deleteView(pathway)}><FaTrash/></a>
                    </Col>
                </Row>
            )
        });
    }

    clone(pathway) {
        console.log('clone: '+JSON.stringify(pathway))
    }

    view(pathway) {
        console.log('viewing: '+JSON.stringify(pathway))
    }

    deleteView(pathway) {
        console.log('delete view: '+JSON.stringify(pathway))
    }
}


PathwaySetsView.propTypes = {
    pathwaySets: PropTypes.any,
};
