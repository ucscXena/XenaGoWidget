import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick, groupBy, mapObject, pluck, flatten} from 'underscore';


export class SortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            sortTypes: props.sortTypes,
            selectedSort: props.selected,
        };
    }

    setSelected = (event) => {
        let targetValue = event.target.value;
        if (targetValue) {
            this.setState({selectedSort: targetValue});
        }
        else {
            this.setState({selectedSort: null});
        }
        this.props.onChange(targetValue);
    };

    render() {
        // const {sortTypes,selected} = this.props;
        return (
            <select onChange={this.setSelected} value={this.state.selectedSort}>
                {/*<option key='null'>None</option>*/}
                {
                    this.state.sortTypes.map(label => <option key={label} value={label}>{label}</option>)
                }
            </select>);
    }
}

SortSelector.propTypes = {
    sortTypes: PropTypes.any.isRequired,
    selected: PropTypes.any.isRequired,
};
