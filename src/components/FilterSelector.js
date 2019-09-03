import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick, groupBy, mapObject, pluck, flatten} from 'ucsc-xena-client/dist/underscore_ext';
import {Dropdown} from 'react-toolbox';
import {
  DEFAULT_AMPLIFICATION_THRESHOLD,
  DEFAULT_DELETION_THRESHOLD,
  getCopyNumberValue,
  getGeneExpressionHits
} from '../functions/DataFunctions';
import mutationVector from '../data/mutationVector';
import {MIN_FILTER} from './XenaGeneSetApp';

export const FILTER_ENUM = {
  CNV_MUTATION:'CN + Mutation',
  MUTATION:'Mutation',
  COPY_NUMBER:'Copy Number',
  GENE_EXPRESSION:'Gene Expression',
};

function lowerCaseCompare(a, b) {
  // put gene expression at the bottom
  if(a==='Gene Expression') return 1 ;
  if(b==='Gene Expression') return 1 ;
  return a.toLowerCase().localeCompare(b.toLowerCase());
}

function calculateCopyNumberTotal(genes,geneList,copyNumber){
  // calculate gene expression hits total
  let copyNumberTotal = 0;
  // TODO: move to a reduce function and use 'index' method
  for (let gene of genes) {
    let geneIndex = geneList.indexOf(gene);
    let copyNumberData = copyNumber[geneIndex];
    copyNumberData.map((el) => {
      copyNumberTotal += getCopyNumberValue(el, DEFAULT_AMPLIFICATION_THRESHOLD, DEFAULT_DELETION_THRESHOLD);
    });
  }
  return copyNumberTotal;
}

function calculateMutationTotal(genes,rows,filteredEffects){
  // calculate mutations hits total
  let totalMutations = 0;
  let hasGene = row => genes.has(row.gene);
  let effects = groupBy(rows.filter(hasGene), 'effect');
  let returnObject = mapObject(pick(effects, filteredEffects),
    list => list.length);
  for (let obj in returnObject) {
    totalMutations += returnObject[obj];
  }
  return totalMutations;
}

function calculateGeneExpressionTotal(genes,geneList,geneExpression) {
  let geneExpressionTotal = 0;
  // TODO: move to a reduce function and use 'index' method
  for (let gene of genes) {
    let geneIndex = geneList.indexOf(gene);
    let geneExpressionData= geneExpression[geneIndex];
    geneExpressionData.map((el) => {
      geneExpressionTotal += getGeneExpressionHits(el);
    });
  }
  return geneExpressionTotal;
}


function compileData(filteredEffects, data, geneList) {
  let {pathways, copyNumber, expression: {rows}, geneExpression} = data;

  let genes = new Set(flatten(pluck(pathways, 'gene')));
  let filterObject = {};

  let copyNumberTotal = calculateCopyNumberTotal(genes,geneList,copyNumber);
  filterObject[FILTER_ENUM.COPY_NUMBER] = copyNumberTotal;

  const totalMutations = calculateMutationTotal(genes,rows,filteredEffects);
  filterObject[FILTER_ENUM.MUTATION] = totalMutations;

  filterObject[FILTER_ENUM.CNV_MUTATION] = totalMutations + copyNumberTotal;

  // calculate gene expression hits total
  filterObject[FILTER_ENUM.GENE_EXPRESSION] = calculateGeneExpressionTotal(genes,geneList,geneExpression);;

  return filterObject;
}


export class FilterSelector extends PureComponent {

    handleSetSelected = (targetValue) => {
      this.props.onChange(targetValue);
    };

    getFilters(){
      let filteredMutationVector = pick(mutationVector, v => v >= MIN_FILTER);
      filteredMutationVector[FILTER_ENUM.COPY_NUMBER] = 1;
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
      const labelValues = labels.map(label => ({label: label + ' (' + counts[label] + ')', value: label}));

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
