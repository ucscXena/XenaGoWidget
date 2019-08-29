import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Dialog from 'react-toolbox/lib/dialog';
import {isEqual} from 'underscore';
import {Button} from 'react-toolbox/lib/button';
import Link from 'react-toolbox/lib/link';
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Grid from 'react-bootstrap/lib/Grid';

export class SubCohortSelector extends PureComponent {

  constructor(props) {
    super(props);
    this.state = {
      originalSelectedSubCohorts:props.selectedSubCohorts,
      selectedSubCohorts:props.selectedSubCohorts,
      allSelected:isEqual(props.selectedSubCohorts.sort(),props.subCohortsForSelected.sort())
    };
  }

  componentDidUpdate(prevProps) {
    if(this.props.selectedCohort!==prevProps.selectedCohort){
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedSubCohorts:this.props.selectedSubCohorts,
        originalSelectedSubCohorts:this.props.selectedSubCohorts,
        allSelected:isEqual(this.props.selectedSubCohorts.sort(),this.props.subCohortsForSelected.sort()),
      });
    }
  }

  handleSelectOnly = (field) => {
    const newSelected = [field];
    // this is going to be almost always false
    let allSelected = isEqual(this.props.subCohortsForSelected.sort(),newSelected.sort()) ;
    this.setState({
      selectedSubCohorts:newSelected,
      allSelected,
    });
  };

  handleChange = (value,field) => {
    let newSelected = JSON.parse(JSON.stringify(this.state.selectedSubCohorts)) ;
    if(value){
      newSelected.push(field);
    }
    else{
      let indexValue = newSelected.indexOf(field);
      newSelected.splice(indexValue,1);
    }
    let allSelected = isEqual(this.props.subCohortsForSelected.sort(),newSelected.sort()) ;
    this.setState({
      selectedSubCohorts:newSelected,
      allSelected,
    });
  };

  selectAll(){
    this.setState({
      selectedSubCohorts:this.props.subCohortsForSelected,
      allSelected:true,
    });
    // this.props.handleSubCohortChange(this.props.subCohortsForSelected);
  }

  updateSubCategories(){
    this.props.handleSubCohortChange(this.state.selectedSubCohorts);
  }

  cancelUpdate(){
    this.setState({
      selectedSubCohorts:this.state.originalSelectedSubCohorts,
    });
    this.props.handleSubCohortChange(this.state.originalSelectedSubCohorts);
  }

  render() {

    let {active, onToggle,subCohortsForSelected,cohortLabel,selectedCohort} = this.props;
    let {allSelected,selectedSubCohorts} = this.state ;

    return (
      <Dialog
        active={active}
        onEscKeyDown={onToggle}
        onOverlayClick={onToggle}
        title='Edit Sub-Cohorts'
      >
        <table style={{ width:'100%'}}>
          <tbody>
            <tr>
              <td>
                            ({cohortLabel}) Select Sub Cohorts for {selectedCohort.name}
              </td>
            </tr>
            <tr>
              <td>
                <Grid style={{marginTop: 20,width:900}}>
                  {
                    subCohortsForSelected.sort().map( cs =>{
                      return (
                        <Row key={cs}>
                          <Col md={12}>
                            <input
                              checked={selectedSubCohorts.indexOf(cs)>=0}
                              disabled={selectedSubCohorts.length<2 && selectedSubCohorts.indexOf(cs)>=0} key={cs}
                              name={cs}
                              onChange={(value) => this.handleChange(value,cs)}
                              style={{display:'inline', marginRight:10}}
                              type='checkbox'
                            />
                            <div  style={{display: 'inline'}}>{cs}</div>
                            <Link href='#' label={'(Select Only)'} onClick={() => { this.handleSelectOnly(cs); }} style={{display:'inline', marginLeft: 20,fontSize: 'small'}}/>
                          </Col>
                        </Row>
                      );
                    })
                  }
                </Grid>
              </td>
            </tr>
            <tr>
              <td>
                <Button
                  icon='save' label='View' onClick={() => this.updateSubCategories()} primary
                  raised
                />
                {!allSelected &&
                            <Button
                              label={'Select All'} onClick={() => this.selectAll()} primary
                              raised
                            />
                }
                {allSelected &&
                            <Button
                              disabled label={'Select All'} primary
                              raised
                            />
                }
                {/*</td>*/}
                {/*<td>*/}
                <Button
                  icon='cancel' label='Cancel' onClick={() => this.cancelUpdate()}
                  raised
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Dialog>
    );
  }
}

SubCohortSelector.propTypes = {
  active: PropTypes.any.isRequired,
  cohortLabel: PropTypes.any.isRequired,
  handleSubCohortChange: PropTypes.any.isRequired,
  onToggle: PropTypes.any.isRequired,
  selectedCohort: PropTypes.any.isRequired,
  selectedSubCohorts: PropTypes.any,
  subCohortsForSelected: PropTypes.any,
};
