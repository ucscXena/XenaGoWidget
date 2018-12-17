import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
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
            <div style={{marginLeft: 10}}>
                <Dropdown style={{marginTop:0,marginBottom:0,padding:0}} label='Sort' onChange={this.setSelected} value={this.state.selectedSort}
                          source={this.state.sortTypes.map(type => ({label: type, value: type}))}
                >
                </Dropdown>
            </div>
        );
    }
}

SortSelector.propTypes = {
    sortTypes: PropTypes.any.isRequired,
    selected: PropTypes.any.isRequired,
};
