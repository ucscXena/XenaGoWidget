import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick, groupBy, mapObject, pluck, flatten} from 'underscore';
import {sum} from '../functions/util';
import {Dropdown} from "react-toolbox";
import {getCopyNumberValue} from "../functions/ScoreFunctions";

function lowerCaseCompare(a, b) {
    return a.toLowerCase().localeCompare(b.toLowerCase());
}


function compileData(filteredEffects, data,geneList) {
    let {pathways, copyNumber,expression: {rows}} = data;

    let genes = new Set(flatten(pluck(pathways, 'gene')));
    let hasGene = row => genes.has(row.gene);
    let effects = groupBy(rows.filter(hasGene), 'effect');

    let returnObject = mapObject(pick(effects, filteredEffects),
                     list => list.length);

    // console.log('genes')
    // console.log(genes)
    // console.log('pathways')
    // console.log(pathways)
    // console.log('geneList')
    // console.log(geneList)

    let copyNumberTotal = 0 ;
    for(let gene of genes){
        let geneIndex = geneList.indexOf(gene)
        // console.log(gene + ' => '+ geneIndex)
        let copyNumberData = copyNumber[geneIndex]
        // console.log(copyNumberData)
        for(let c of copyNumberData){
            // for(let g of c){
                copyNumberTotal += getCopyNumberValue(c)
            // }
        }
    }

    let filterObject = {};
    filterObject['Copy Number'] = copyNumberTotal;

    // console.log('return objects');
    //
    // console.log(returnObject)
    let totalMutations = 0 ;
    for(let obj in returnObject){
        totalMutations += returnObject[obj];
    }

    filterObject['Mutation'] = totalMutations;


    return filterObject;
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
        const {filters,pathwayData,selected,geneList} = this.props;

        let counts = compileData(Object.keys(filters), pathwayData,geneList);
        // CNV counts
        let labels = Object.keys(counts).sort(lowerCaseCompare);
        let total = sum(Object.values(counts));

        const labelValues = labels.map(label => ( {label:label+ ' ('+ counts[label]+')',value:label}));
        labelValues.unshift({label:'All ('+total+')',value:'All'});
        // labelValues.unshift({label:'Copy Number ('+copyNumberCount+')',value:'CopyNumber'});

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
    geneList: PropTypes.any,
    onChange: PropTypes.any,
    selected: PropTypes.any,
};
