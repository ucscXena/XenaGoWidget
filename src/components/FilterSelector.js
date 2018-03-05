import React, {Component} from 'react'
import PropTypes from 'prop-types';

export class FilterSelector extends Component {

    constructor(props) {
        super(props);
        this.state = {value: props.selected};

        this.setSelected = this.setSelected.bind(this);
    }

    setSelected(event) {
        let targetValue = event.target.value ;
        if (targetValue) {
            this.setState({value: targetValue});
        }
        else {
            this.setState({value: null});
        }
    }

    render() {
        const {filters} = this.props;
        let filterArray = [];
        for (let f in filters) {
            filterArray.push(f);
        }
        filterArray = filterArray.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        // console.log(filterArray.length);
        return <select onChange={this.setSelected} value={this.state.value}>
            <option key='null'>All</option>
            {
                filterArray.map(function (f) {
                    return <option key={f}>{f}</option>;
                })
            }
            }
        </select>
    }

}

FilterSelector.propTypes = {
    filters: PropTypes.object.isRequired,
    selected: PropTypes.any,
};
