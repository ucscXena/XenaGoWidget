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

export const UNASSIGNED_SUBTYPE = { key: 'UNASSIGNED',label:'unassigned'};

export class SubCohortSelector extends PureComponent {

  constructor(props) {
    super(props);
    // console.log(Object.keys(props.subCohortsForSelected),props.selectedSubCohorts);
    this.state = {
      originalSelectedSubCohorts:props.selectedSubCohorts,
      selectedSubCohorts:props.selectedSubCohorts,
      allSelected:isEqual(props.selectedSubCohorts.sort(),Object.keys(props.subCohortsForSelected).sort())
    };
  }

  componentDidUpdate(prevProps) {
    if(this.props.selectedCohort!==prevProps.selectedCohort){
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({
        selectedSubCohorts:this.props.selectedSubCohorts,
        originalSelectedSubCohorts:this.props.selectedSubCohorts,
        allSelected:isEqual(this.props.selectedSubCohorts.sort(),Object.keys(this.props.subCohortsForSelected).sort()),
      });
    }
  }

  handleSelectOnly = (field) => {
    const newSelected = [field];
    // this is going to be almost always false
    let allSelected = isEqual(Object.keys(this.props.subCohortsForSelected).sort(),newSelected.sort()) ;
    // console.log('new selected',newSelected,allSelected);

    this.setState({
      selectedSubCohorts:newSelected,
      allSelected,
    });
  };

  handleChange = (event) => {
    const field = event.target.name;
    const newValue = event.target.checked ;
    console.log('new value',field,newValue)
    let newSelected = JSON.parse(JSON.stringify(this.state.selectedSubCohorts)) ;
    if(newValue){
      newSelected.push(field);
    }
    else{
      let indexValue = newSelected.indexOf(field);
      newSelected.splice(indexValue,1);
    }
    let allSelected = isEqual(Object.keys(this.props.subCohortsForSelected).sort(),newSelected.sort()) ;
    console.log('selected vs new',this.state.selectedSubCohorts,newSelected)
    this.setState({
      selectedSubCohorts:newSelected,
      allSelected,
    });
  };

  selectAll(){
    // console.log('sub cohorts for selected all',this.props.subCohortsForSelected);
    this.setState({
      selectedSubCohorts:this.props.filterCounts.subCohortCounts.map( a => a.name),
      allSelected:true,
    });
  }

  updateSubCategories(){
    this.props.handleSubCohortChange(this.state.selectedSubCohorts);
  }

  cancelUpdate(){
    this.props.onToggle();
    this.setState({
      selectedSubCohorts: this.props.selectedSubCohorts
    });
  }

  render() {

    let {active, subCohortsForSelected,selectedCohort,filterCounts} = this.props;
    let {allSelected,selectedSubCohorts} = this.state ;
    console.log('sub cohorts for selected',selectedSubCohorts,subCohortsForSelected,filterCounts);

    return (
      <Dialog
        active={active}
        onEscKeyDown={() => this.cancelUpdate()}
        onOverlayClick={() => this.cancelUpdate()}
        title='Edit Sub-Cohorts'
      >
        <table style={{ width:'100%'}}>
          <tbody>
            <tr>
              <td>
                Select Sub Cohorts for <br/>{selectedCohort.name}
              </td>
            </tr>
            <tr>
              <td>
                <Grid style={{marginTop: 20,width:900}}>
                  {
                    filterCounts.subCohortCounts.sort( (a,b) => a.name.localeCompare(b.name)).map( cs =>{
                      console.log('cs',cs)
                      return (
                        <Row key={cs.name}>
                          <Col md={12}>
                            <input
                              checked={cs.count === 0 || selectedSubCohorts.indexOf(cs.name)>=0}
                              disabled={cs.count === 0 || selectedSubCohorts.length<2 && selectedSubCohorts.indexOf(cs.name)>=0} key={cs.name}
                              name={cs.name}
                              onChange={this.handleChange}
                              style={{display:'inline', marginRight:10}}
                              type='checkbox'
                            />
                            <div  style={{display: 'inline'}}>
                              {`${cs.name} (${cs.count})`}
                            </div>
                            <Link
                              href='#' label={'(Select Only)'} onClick={() => { this.handleSelectOnly(cs.name); }}
                              style={{display:'inline', marginLeft: 20,fontSize: 'small'}}
                            />
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
                {!allSelected &&
                <Link
                  href='#'
                  label={`(Select All - ${filterCounts.available})`}
                  onClick={() => this.selectAll()}
                  style={{display:'inline', marginLeft: 20,fontSize: 'small'}}
                />
                }
                {allSelected &&
                <Link
                  disabled
                  label={'(Select All)'}
                  style={{display:'inline', marginLeft: 20,fontSize: 'small'}}
                />
                }
              </td>
            </tr>
            <tr>
              <td>
                <Button
                  icon='save' label='View' onClick={() => this.updateSubCategories()} primary
                  raised
                />
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
  filterCounts: PropTypes.any.isRequired,
  handleSubCohortChange: PropTypes.any.isRequired,
  onToggle: PropTypes.any.isRequired,
  selectedCohort: PropTypes.any.isRequired,
  selectedSubCohorts: PropTypes.any,
  subCohortsForSelected: PropTypes.any,
};
