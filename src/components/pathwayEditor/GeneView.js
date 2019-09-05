import React from 'react';
import PureComponent from '../PureComponent';
import PropTypes from 'prop-types';
import { Row, Col} from 'react-material-responsive-grid';
import {Button} from 'react-toolbox/lib/button';
// import {Link} from 'react-toolbox/lib/link';
import FaTrash from 'react-icons/lib/fa/trash';
import update from 'immutability-helper';


export default class GeneView extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      pathway: props.selectedPathway
    };
  }
  componentWillReceiveProps(nextProps) {
    // You don't have to do this check first, but it can help prevent an unneeded render
    if (nextProps.selectedPathway !== this.props.selectedPathway) {
      this.setState({ pathway: nextProps.selectedPathway});
    }
  }

    removeGene = (selectedPathway,selectedGene) => {
      const geneIndex = this.state.pathway.gene.findIndex(g => g === selectedGene);
      let updatedPathway = update(this.state.pathway,{
        gene: { $splice: [[geneIndex,1]]}
      });
      this.setState({
        pathway: updatedPathway,
      });
      this.props.updateGenesForGeneSet(updatedPathway);
    };

    render() {
      // console.log('selected pathway',this.state,this.props)
      if (this.state.pathway) {
        return this.state.pathway.gene.map(g => {
          return (
            <Row key={g}>
              <Col md={4}>
                {g}
              </Col>
              <Col md={2}>
                <Button onClick={() => this.removeGene(this.state.pathway,g)}><FaTrash/></Button>
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
  selectedPathway: PropTypes.any,
  updateGenesForGeneSet: PropTypes.any.isRequired,
};
