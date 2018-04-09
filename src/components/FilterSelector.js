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


function compileData(filteredEffects, data) {
    console.log('compiling data')
    console.log(data);
    let {pathways, copyNumber,expression: {rows}} = data;
    console.log('copyNumber')
    console.log(copyNumber)

    let genes = new Set(flatten(pluck(pathways, 'gene')));
    let hasGene = row => genes.has(row.gene);
    let effects = groupBy(rows.filter(hasGene), 'effect');

    console.log('effects')
    console.log(effects)




    let returnObject = mapObject(pick(effects, filteredEffects),
                     list => list.length);
    console.log('return object');
    console.log(returnObject);

    let copyNumberTotal = 0 ;
    for(let c of copyNumber){
        for(let g of c){
            copyNumberTotal += getCopyNumberValue(g)
        }
    }

    returnObject['Copy Number'] = copyNumberTotal;


    return returnObject ;
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

        console.log('filters: ');
        console.log(filters)

        console.log('pathwayData: ');
        console.log(pathwayData)
        let counts = compileData(Object.keys(filters), pathwayData);
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
    onChange: PropTypes.any,
    selected: PropTypes.any,
};
