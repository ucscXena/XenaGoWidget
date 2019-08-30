import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick, groupBy, mapObject, pluck, flatten,sum} from 'ucsc-xena-client/dist/underscore_ext';
import {Dropdown} from 'react-toolbox';
import {getCopyNumberValue} from '../functions/DataFunctions';
import mutationVector from '../data/mutationVector';
import {MIN_FILTER} from './XenaGeneSetApp';

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
      copyNumberTotal += getCopyNumberValue(el, amplificationThreshold, deletionThreshold);
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

    handleSetSelected = (targetValue) => {
      this.props.onChange(targetValue);
    };

    getFilters(){
      let filteredMutationVector = pick(mutationVector, v => v >= MIN_FILTER);
      filteredMutationVector['Copy Number'] = 1;
      return filteredMutationVector;
    }

    render() {
      const {pathwayData, selected, geneList, amplificationThreshold, deletionThreshold} = this.props;
      if(pathwayData.expression.length === 0){
        return <div>Loading...</div>;
      }
      let counts = compileData(Object.keys(this.getFilters()), pathwayData, geneList, amplificationThreshold, deletionThreshold);
      // CNV counts
      let labels = Object.keys(counts).sort(lowerCaseCompare);
      let total = sum(Object.values(counts));

      const labelValues = labels.map(label => ({label: label + ' (' + counts[label] + ')', value: label}));
      labelValues.unshift({label: 'CNV + Mutation (' + total + ')', value: 'All'});

      return (
        <div style={{marginLeft: 10,marginTop:0,height:65}}>
          <Dropdown
            onChange={this.handleSetSelected} source={labelValues} style={{marginTop:0}} value={selected}
          />
        </div>
      );
    }
}

FilterSelector.propTypes = {
  amplificationThreshold: PropTypes.any.isRequired,
  deletionThreshold: PropTypes.any.isRequired,
  geneList: PropTypes.any.isRequired,
  onChange: PropTypes.any.isRequired,
  pathwayData: PropTypes.any.isRequired,
  selected: PropTypes.any.isRequired,
};
