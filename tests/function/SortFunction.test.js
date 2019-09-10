import expect from 'expect';
import {
  clusterSort,
  diffSort,
  scoreColumns,
  sortByType,
  synchronizedSort,
  transpose
} from '../../src/functions/SortFunctions';

import ScoredDataInput1 from '../data/ScoreColumnDataInput1';
import ScoredOutputData1 from '../data/ScoreColumnDataOutput1';

import ClusterSortInput1 from '../data/ClusterSortInput1';
import ClusterSortOutputData1 from '../data/ClusterSortOutput1';


import DiffSortInput1 from '../data/DiffSortInput1';
import DiffSortOutputData1 from '../data/DiffSortOutput1';

import SyncSortInput1 from '../data/SyncSortInput1';
import SyncSortOutputData1 from '../data/SyncSortOutput1';

describe('Sort Functions', () => {


  it('Transpose', () => {
    let input = [[{'total':1,'mutation':0,'cnv':1,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':1,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0}]];
    let output = [[{'total':1,'mutation':0,'cnv':1,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':1,'cnvLow':0}],[{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0}]];
    expect(output).toEqual(transpose(input));
  });

  it('Score columns', () => {
    expect(ScoredOutputData1).toEqual(scoreColumns(ScoredDataInput1));
  });

  it('Sort by type', () => {
    let input = [[{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},'TCGA-OR-A5J1-01'],[{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},'TCGA-OR-A5J4-01'],[{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},'TCGA-OR-A5J7-01'],[{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},'TCGA-OR-A5J9-01'],[{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},{'total':0,'mutation':0,'cnv':0,'mutation4':0,'mutation3':0,'mutation2':0,'cnvHigh':0,'cnvLow':0},'TCGA-OR-A5JA-01']];
    let output = [ [ { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, 'TCGA-OR-A5J1-01' ], [ { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, 'TCGA-OR-A5J4-01' ], [ { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, 'TCGA-OR-A5J7-01' ], [ { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0 }, { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, 'TCGA-OR-A5J9-01' ], [ { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, { 'cnv': 0, 'cnvHigh': 0, 'cnvLow': 0, 'mutation': 0, 'mutation2': 0, 'mutation3': 0, 'mutation4': 0, 'total': 0, }, 'TCGA-OR-A5JA-01' ] ];
    expect(output).toEqual(sortByType(input));
  });

  it('Cluster sort', () => {
    expect(ClusterSortOutputData1).toEqual(clusterSort(ClusterSortInput1));
  });

  it('Diff sort', () => {
    expect(DiffSortOutputData1).toEqual(diffSort(DiffSortInput1));
  });

  it('Synchronized sort', () => {
    const geneList = ['RRM2B','NUDT1','DUT'];
    expect(SyncSortOutputData1).toEqual(synchronizedSort(SyncSortInput1,geneList,undefined,false));
  });
});

