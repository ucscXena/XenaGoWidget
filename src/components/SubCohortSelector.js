import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Dialog from "react-toolbox/lib/dialog";
import Checkbox from "react-toolbox/lib/checkbox";


export class SubCohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        let {subCohortsForSelected,selectedSubCohorts} = props;
        // let subCohortsNames = Object.keys(subCohortsForSelected);
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
            // if(allSelected){
            //     allSelected = selected[cs];
            // }
        });
        this.state = {
            active: this.props.active,
            selected,
            allSelected,
        };
    }

    handleChange = (value,field) => {
        let newSelected = JSON.parse(JSON.stringify(this.state.selected)) ;
        let allSelected = this.state.allSelected;

        if(field==='All'){
            allSelected = true
            Object.keys(newSelected).forEach( s => {
                newSelected[s] = true ;
            });
        }
        else{
            newSelected[field] = value ;
            const availableSubtypes = Object.keys(this.props.subCohortsForSelected).length;
            let selectedSubTypes = Object.values(newSelected).filter( s => s ).length;
            allSelected = availableSubtypes === selectedSubTypes ;
        }

        this.props.handleSubCohortChange(newSelected)

        this.setState({
            selected:newSelected,
            allSelected,
        })
    };


    render() {

        let {active, handleToggle,subCohortsForSelected,cohortLabel,selectedCohort} = this.props;
        let {selected,allSelected} = this.state ;

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
                                                     checked={selected[cs]}
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
