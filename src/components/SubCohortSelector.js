import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Dialog from "react-toolbox/lib/dialog";
import Checkbox from "react-toolbox/lib/checkbox";


export class SubCohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        con
        this.state = {
            active: this.props.active,
        };
    }

    handleChange = (value,field) => {
        // alert('handing change - '+field+' - '+value);
        console.log(value,field)

        // this.setState({...this.state, [field]: value});
    };


    render() {

        let {active, handleToggle,subCohortsForSelected,cohortLabel,selectedCohort} = this.props;

        console.log('selected sub cohorts',subCohortsForSelected,this.props.selectedSubCohort);

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
                                      checked={true}
                                      onChange={ (value) => this.handleChange(value,'All')}
                            />
                                {
                                    Object.keys(subCohortsForSelected).map( cs =>{
                                       return (
                                           <Checkbox label={cs} key={cs}
                                                     checked={true}
                                                     onChange={ (value) => this.handleChange(value,{cs})}
                                                     />
                                       )
                                    })
                                }
                            {/*</ul>*/}
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
    selectedSubCohort: PropTypes.any,
    subCohortsForSelected: PropTypes.any,
};
