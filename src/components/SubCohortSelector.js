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
            allSelected:isEqual(props.selectedSubCohorts,props.subCohortsForSelected)
        };
    }

    setSelected(){
        let {subCohortsForSelected,selectedSubCohorts} = this.props;
        let subCohortsNames = Object.keys(selectedSubCohorts);
        let selected = {};

        const availableSubtypes = Object.keys(subCohortsForSelected).length;
        let selectedSubTypes = Object.values(selectedSubCohorts).filter( s => s ).length;
        if(selectedSubTypes===0){
            selectedSubTypes = availableSubtypes;
        }

        let allSelected = availableSubtypes===selectedSubTypes;
        subCohortsForSelected.map( cs =>{
            selected[cs] =  subCohortsNames.indexOf(cs)>=0;
            if(allSelected){
                selected[cs] = true ;
            }
        });
        this.setState( {
            active: this.props.active,
            selected,
            allSelected,
        });
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
        }
        else{
            if(value){
                newSelected.push(field);
            }
            else{
                let indexValue = newSelected.indexOf(field);
                console.log('index value',indexValue,field,newSelected)
                newSelected.splice(indexValue,1)
            }
            let allSelected = isEqual(this.props.subCohortsForSelected,newSelected) ;

            this.setState({
                selectedSubCohorts:newSelected,
                allSelected,
            })
        }
        // const newSelectedObject = this.props.subCohortsForSelected.map( s => {
        //     console.log('s',s)
        //     return {
        //         [s]:newSelected.indexOf(s)>=0
        //     }
        // });
        let newSelectedObject = {};
        for(let sc of this.props.subCohortsForSelected){
            newSelectedObject[sc] = newSelected.indexOf(sc)>=0;
        }
        console.log('newly selected object',newSelectedObject);
        let selectionObject = {
            selected:this.props.selectedCohort,
            selectedSubCohorts:newSelectedObject,
        };
        this.props.handleSubCohortChange(selectionObject);

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
