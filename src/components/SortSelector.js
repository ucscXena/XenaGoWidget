import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick, groupBy, mapObject, pluck, flatten} from 'underscore';
import {Dropdown} from "react-toolbox";


export class SortSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            sortTypes: props.sortTypes,
            selectedSort: props.selected,
        };
    }

    setSelected = (targetValue) => {
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
            <Dropdown style={{marginLeft:10}} label='Sort' onChange={this.setSelected} value={this.state.selectedSort}
                      source={this.state.sortTypes.map(type => ({label: type, value: type}))}
            >
            </Dropdown>);
    }
}

SortSelector.propTypes = {
    sortTypes: PropTypes.any.isRequired,
    selected: PropTypes.any.isRequired,
};
