import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick, groupBy, mapObject, pluck, flatten} from 'underscore';
import {sum} from '../functions/util';

function lowerCaseCompare(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}

function compileData(filteredEffects, data) {
    let {pathways, expression: {rows}} = data;

    let genes = new Set(flatten(pluck(pathways, 'gene')));
    let hasGene = row => genes.has(row.gene);
    let effects = groupBy(rows.filter(hasGene), 'effect');
    return mapObject(pick(effects, filteredEffects),
                     list => list.length);
}


export class FilterSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            value: props.selected,
            pathwayData: props.pathwayData,
        };
    }

    setSelected = (event) => {
        let targetValue = event.target.value;
        if (targetValue) {
            this.setState({value: targetValue});
        }
        else {
            this.setState({value: null});
        }
        this.props.onChange(targetValue);
    }

    render() {
        const {filters,pathwayData,selected} = this.props;

        let counts = compileData(Object.keys(filters), pathwayData);
        let labels = Object.keys(counts).sort(lowerCaseCompare);
        let total = sum(Object.values(counts));

        return (
            <select onChange={this.setSelected} value={selected}>
                <option key='null'>All ({total})</option>
                {
                    labels.map(label => <option key={label} value={label}>{label} ({counts[label]})</option>)
                }
            </select>);
    }
}

FilterSelector.propTypes = {
    filters: PropTypes.object.isRequired,
    pathwayData: PropTypes.any,
    onChange: PropTypes.any,
    selected: PropTypes.any,
};
