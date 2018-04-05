import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick, groupBy, mapObject, pluck, flatten} from 'underscore';
import {sum} from '../functions/util';
import {Dropdown} from "react-toolbox";

function lowerCaseCompare(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}

function compileData(filteredEffects, data) {
    console.log('compiling data')
    console.log(data);
    let {pathways, copyNumber,expression: {rows}} = data;

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

    setSelected = (targetValue) => {
        if (targetValue) {
            this.setState({value: targetValue});
        }
        else {
            this.setState({value: null});
        }
        this.props.onChange(targetValue);
    };

    render() {
        const {filters,pathwayData,selected} = this.props;

        let counts = compileData(Object.keys(filters), pathwayData);
        let labels = Object.keys(counts).sort(lowerCaseCompare);
        let total = sum(Object.values(counts));

        const labelValues = labels.map(label => ( {label:label+ ' ('+ counts[label]+')',value:label}));
        labelValues.unshift({label:'All ('+total+')',value:'All'});

        const filterLabel = 'Filter ('+total+')';

        return (
            <Dropdown label={filterLabel} onChange={this.setSelected} value={selected}
                      source={labelValues} >
            </Dropdown>
        );
    }
}

FilterSelector.propTypes = {
    filters: PropTypes.object.isRequired,
    pathwayData: PropTypes.any,
    onChange: PropTypes.any,
    selected: PropTypes.any,
};
