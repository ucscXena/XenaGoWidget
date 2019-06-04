import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Dialog from "react-toolbox/lib/dialog";
import Checkbox from "react-toolbox/lib/checkbox";


export class SubCohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        console.log('super props',props);
        let {subCohortsForSelected,selectedSubCohorts} = props;
        console.log('selected sub cohorts',selectedSubCohorts,subCohortsForSelected)
        // let subCohortsNames = Object.keys(subCohortsForSelected);
        let subCohortsNames = Object.keys(selectedSubCohorts);
        let selected = {};

        let allSelected = true ;
        Object.keys(subCohortsForSelected).map( cs =>{
            selected[cs] =  subCohortsNames.indexOf(cs)>=0;
            console.log('cs',cs,subCohortsNames,selected[cs]);
            if(allSelected){
                allSelected = selected[cs];
            }
        });
        console.log('selected -> ',subCohortsForSelected,selectedSubCohorts,selected);
        this.state = {
            active: this.props.active,
            selected,
            allSelected,
        };
    }

    handleChange = (value,field) => {
        // alert('handing change - '+field+' - '+value);
        console.log('handling change',value,field)

        let newSelected = JSON.parse(JSON.stringify(this.state.selected)) ;
        console.log('A',newSelected)
        let allSelected = this.state.allSelected;

        if(field==='All'){
            allSelected = true
            Object.keys(newSelected).forEach( s => {
                newSelected[s] = true ;
            });
            console.log('B',newSelected)
        }
        else{
            allSelected = false ;
            newSelected[field] = value ;
        }

        console.log('input selected',this.state.selected,'vs',newSelected)

        this.props.handleSubCohortChange(newSelected)


        this.setState({
            selected:newSelected,
            allSelected,
        })
    };


    render() {

        let {active, handleToggle,subCohortsForSelected,cohortLabel,selectedCohort} = this.props;
        let {selected,allSelected} = this.state ;

        console.log('selected sub cohorts',subCohortsForSelected,this.props.selectedSubCohorts);
        console.log('state',this.state)

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
                                    Object.keys(subCohortsForSelected).map( cs =>{
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
