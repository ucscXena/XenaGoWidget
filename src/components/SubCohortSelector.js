import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Dialog from "react-toolbox/lib/dialog";
import Input from "react-toolbox/lib/input";


export class SubCohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            active: this.props.active,
        };
    }

    // handleChange = (name, value) => {
    //     let newArray = JSON.parse(JSON.stringify(this.state.colorSettings));
    //     if (name === 'shadingValue') {
    //         value = 1 / (value / 100.0) ;
    //     }
    //     newArray[name] = value;
    //     if (name === 'highDomain' && this.state.colorSettings.linkDomains) {
    //         newArray['lowDomain'] = -value;
    //         this.props.handleSubCohortChange('lowDomain', -value)
    //     }
    //     this.setState({
    //         colorSettings: newArray
    //     });
    //     this.props.handleSubCohortChange(name, value)
    // };


    render() {

        let {active, handleToggle} = this.props;

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
                            Gene Gamma
                        </td>
                        <td>
                            {/*<Input type='number' name='gamma'*/}
                            {/*       value={this.state.colorSettings.geneGamma}*/}
                            {/*       onChange={this.handleChange.bind(this, 'geneGamma')}*/}
                            {/*       style={{width: 50}}*/}
                            {/*/>*/}
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Gene Saturation Percent (%)
                        </td>
                        <td>
                            {/*<Input type='number' name='shadingValue'*/}
                            {/*       value={100.0 / this.state.colorSettings.shadingValue}*/}
                            {/*       onChange={this.handleChange.bind(this, 'shadingValue')}*/}
                            {/*       style={{width: 50}}*/}
                            {/*/>*/}
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
};
