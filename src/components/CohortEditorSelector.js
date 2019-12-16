import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Col, Grid, Row} from 'react-bootstrap';
import React from 'react';
import BaseStyle from '../css/base.css';
import Button from 'react-toolbox/lib/button';
import {VIEW_ENUM} from '../data/ViewEnum';

export class CohortEditorSelector extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      // cohort : props.cohort,
      // filter: props.filter,
    };
  }

  render(){

    return (
      <div className={BaseStyle.cohortEditorBox}>
        <Grid  className={BaseStyle.inlineButton}>
          <Row>
            <Col className={BaseStyle.inlineButton} md={6}>
              Cohort A: {this.props.cohort[0].name}
              <br/>
              Cohort B: {this.props.cohort[1].name}
            </Col>
            <Col className={BaseStyle.inlineButton} md={2}>
              <Button primary raised>Edit Cohorts</Button>
            </Col>
            <Col className={BaseStyle.inlineButton} md={2}>
              View:
              <select
                onChange={(event) => this.setState({filter: [event.target.value,event.target.value]})}
                value={this.props.view}
              >
                {
                  Object.entries(VIEW_ENUM).map( f => {
                    return (
                      <option key={f[0]} value={f[1]}>{f[0]}</option>
                    );
                  })
                }
              </select>
            </Col>
          </Row>
        </Grid>
      </div>
    );
  }
}
CohortEditorSelector.propTypes = {
  cohort: PropTypes.any.isRequired,
  onChangeCohorts: PropTypes.any.isRequired,
  onChangeView: PropTypes.any.isRequired,
  view: PropTypes.any.isRequired,
};
