import React from 'react';
import PureComponent from '../PureComponent';
import PropTypes from 'prop-types';
import { Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
// import {Link} from 'react-toolbox/lib/link';
import FaTrash from 'react-icons/lib/fa/trash';


export default class GeneView extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      pathway: this.props.selectedPathway
    };
  }

    removeGene = (p,g) => {
      this.props.removeGeneHandler(p,g);
    };

    render() {
      if (this.props.selectedPathway) {
        return this.props.selectedPathway.gene.map(g => {
          return (
            <Row key={g}>
              <Col md={4}>
                {g}
              </Col>
              <Col md={2}>
                <Button onClick={() => this.removeGene(this.props.selectedPathway,g)}><FaTrash/></Button>
              </Col>
            </Row>
          );
        });
      }
      else {
        return <div />;
      }
    }

}


GeneView.propTypes = {
  removeGeneHandler: PropTypes.any.isRequired,
  selectedPathway: PropTypes.any,
};
