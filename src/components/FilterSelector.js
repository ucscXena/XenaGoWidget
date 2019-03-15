import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick, groupBy, mapObject, pluck, flatten,sum} from 'underscore';
import {Dropdown} from "react-toolbox";
import {getCopyNumberValue} from "../functions/DataFunctions";

function lowerCaseCompare(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}


function compileData(filteredEffects, data, geneList, amplificationThreshold, deletionThreshold) {
    let {pathways, copyNumber, expression: {rows}} = data;

    let genes = new Set(flatten(pluck(pathways, 'gene')));
    let hasGene = row => genes.has(row.gene);
    let effects = groupBy(rows.filter(hasGene), 'effect');

    let returnObject = mapObject(pick(effects, filteredEffects),
        list => list.length);

    let copyNumberTotal = 0;

    // TODO: move to a reduce function and use 'index' method
    for (let gene of genes) {
        let geneIndex = geneList.indexOf(gene);
        let copyNumberData = copyNumber[geneIndex];

        copyNumberData.map((el) => {
            copyNumberTotal += getCopyNumberValue(el, amplificationThreshold, deletionThreshold)
        });
    }

    let filterObject = {};
    filterObject['Copy Number'] = copyNumberTotal;
    let totalMutations = 0;
    for (let obj in returnObject) {
        totalMutations += returnObject[obj];
    }

    filterObject['Mutation'] = totalMutations;


    return filterObject;
}


export class FilterSelector extends PureComponent {

    constructor(props) {
        super(props);
    }

    setSelected = (targetValue) => {
        this.props.onChange(targetValue);
    };

    render() {
        const {filters, pathwayData, selected, geneList, amplificationThreshold, deletionThreshold} = this.props;
        if(pathwayData.expression.length === 0){
            return <div>Loading...</div>;
        }
        let counts = compileData(Object.keys(filters), pathwayData, geneList, amplificationThreshold, deletionThreshold);
        // CNV counts
        let labels = Object.keys(counts).sort(lowerCaseCompare);
        let total = sum(Object.values(counts));

        const labelValues = labels.map(label => ({label: label + ' (' + counts[label] + ')', value: label}));
        labelValues.unshift({label: 'CNV + Mutation (' + total + ')', value: 'All'});

        const filterLabel = 'Filter (' + total + ')';

        return (
            <div style={{marginLeft: 10,marginTop:0,height:65}}>
                <Dropdown style={{marginTop:0}} label={filterLabel} onChange={this.setSelected} value={selected}
                          source={labelValues}>
                </Dropdown>
            </div>
        );
    }
}

FilterSelector.propTypes = {
    filters: PropTypes.object.isRequired,
    pathwayData: PropTypes.any.isRequired,
    geneList: PropTypes.any.isRequired,
    onChange: PropTypes.any.isRequired,
    selected: PropTypes.any.isRequired,
    amplificationThreshold: PropTypes.any.isRequired,
    deletionThreshold: PropTypes.any.isRequired,
};
