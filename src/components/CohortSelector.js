import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Input from 'react-toolbox/lib/input';


export class CohortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            selectedCohort: props.selectedCohort
        };
    }

    onChange = (event) => {
        this.setState({selectedCohort: event});
        let {onChange} = this.props;
        if (onChange) {
            onChange(event);
        }
    };


    render() {
        return (
            <div>
                <h3>Cohort</h3>
                <select style={{marginLeft: 10}}
                        onChange={this.onChange}
                        value={this.state.selectedCohort}
                >
                    {
                        this.props.cohorts.map(c => {
                            return (
                                <option value={c.name} key={c.name}>
                                    {c.name}
                                </option>
                            )
                        })
                    }
                </select>
            </div>
        );
    }
}

CohortSelector.propTypes = {
    cohorts: PropTypes.array.isRequired,
    selectedCohort: PropTypes.string.isRequired,
    onChange: PropTypes.any.isRequired,
};
{/*label={'Select Cohort'}*/
}
{/*value={this.state.selectedCohort} onChange={this.onChange}*/
}
{/*source={this.props.cohorts.map(c => ( {label:c.name,value:c.name} ))} />*/
}
{/*{label:c.name,value:c.name} ))*/
}
