import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Dialog from "react-toolbox/lib/dialog";
import Checkbox from "react-toolbox/lib/checkbox";
import {isEqual} from 'underscore';
import update, {extend} from "immutability-helper";


export class SubCohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedSubCohorts:props.selectedSubCohorts,
            allSelected:isEqual(props.selectedSubCohorts.sort(),props.subCohortsForSelected.sort())
        };
    }

    componentDidUpdate(prevProps) {
        this.setState({
            selectedSubCohorts:this.props.selectedSubCohorts,
            allSelected:isEqual(this.props.selectedSubCohorts.sort(),this.props.subCohortsForSelected.sort()),
        })
    }

    handleChange = (value,field) => {


        console.log('state selected',this.state.selectedSubCohorts,value,field);
        let newSelected = JSON.parse(JSON.stringify(this.state.selectedSubCohorts)) ;
        // let allSelected = this.state.allSelected;

        if(field==='All'){
            // allSelected = true;
            this.setState({
                selectedSubCohorts:this.props.subCohortsForSelected,
                allSelected:true,
            });
            this.props.handleSubCohortChange(this.props.subCohortsForSelected);
        }
        else{
            if(value){
                newSelected.push(field);
            }
            else{
                let indexValue = newSelected.indexOf(field);
                newSelected.splice(indexValue,1)
            }
            let allSelected = isEqual(this.props.subCohortsForSelected.sort(),newSelected.sort()) ;

            this.setState({
                selectedSubCohorts:newSelected,
                allSelected,
            });
            this.props.handleSubCohortChange(newSelected);
        }

    };


    render() {

        let {active, handleToggle,subCohortsForSelected,cohortLabel,selectedCohort} = this.props;
        let {allSelected} = this.state ;

        return (
            <Dialog
                active={active}
                onEscKeyDown={handleToggle}
                onOverlayClick={handleToggle}
                title='Edit SubCohorts'
            >
                <table width="100%">
                    <tbody>
                    <tr>
                        <td>
                            ({cohortLabel}) Select Sub Cohorts for {selectedCohort}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <Checkbox label='All' key='All'
                                      checked={allSelected}
                                      disabled={allSelected}
                                      onChange={ (value) => this.handleChange(value,'All')}
                            />
                                {
                                    subCohortsForSelected.map( cs =>{
                                       return (
                                           <Checkbox label={cs} key={cs}
                                                     checked={this.state.selectedSubCohorts.indexOf(cs)>=0}
                                                     onChange={ (value) => this.handleChange(value,cs)}
                                                     />
                                       )
                                    })
                                }
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
    handleToggle: PropTypes.any.isRequired,
    handleSubCohortChange: PropTypes.any.isRequired,
    selectedCohort: PropTypes.any.isRequired,
    selectedSubCohorts: PropTypes.any,
    subCohortsForSelected: PropTypes.any,
};
