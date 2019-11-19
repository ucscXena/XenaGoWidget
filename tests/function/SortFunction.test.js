import expect from 'expect';
import {
  diffSort,
  scoreColumns,
  sortByTypeScore,
  synchronizedSort,
  transpose
} from '../../src/functions/SortFunctions';

import ScoredDataInput1 from '../data/ScoreColumnDataInput1';
import ScoredOutputData1 from '../data/ScoreColumnDataOutput1';


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
    expect(output).toEqual(sortByTypeScore(input));
  });

  it('Diff sort', () => {
    const diffSortSamples1 = ['TCGA-OR-A5J4-01','TCGA-OR-A5J1-01',  'TCGA-OR-A5J7-01', 'TCGA-OR-A5J9-01', 'TCGA-OR-A5JA-01', 'TCGA-OR-A5JE-01', 'TCGA-OR-A5JG-01', 'TCGA-OR-A5JM-01', 'TCGA-OR-A5JP-01', 'TCGA-OR-A5JY-01', 'TCGA-OR-A5K0-01', 'TCGA-OR-A5K2-01', 'TCGA-OR-A5K5-01', 'TCGA-OR-A5K9-01', 'TCGA-OR-A5KX-01', 'TCGA-OR-A5LD-01', 'TCGA-OR-A5LE-01', 'TCGA-OR-A5LO-01', 'TCGA-PK-A5HA-01', 'TCGA-PK-A5HB-01', 'TCGA-OR-A5J3-01', 'TCGA-OR-A5J5-01', 'TCGA-OR-A5J8-01', 'TCGA-OR-A5JC-01', 'TCGA-OR-A5JF-01', 'TCGA-OR-A5JI-01', 'TCGA-OR-A5JJ-01', 'TCGA-OR-A5JS-01', 'TCGA-OR-A5JW-01', 'TCGA-OR-A5K3-01', 'TCGA-OR-A5K6-01', 'TCGA-OR-A5K8-01', 'TCGA-OR-A5KO-01', 'TCGA-OR-A5KU-01', 'TCGA-OR-A5KY-01', 'TCGA-OR-A5KZ-01', 'TCGA-OR-A5L6-01', 'TCGA-OR-A5LB-01', 'TCGA-OR-A5LC-01', 'TCGA-OR-A5LJ-01', 'TCGA-OR-A5LK-01', 'TCGA-OR-A5LS-01', 'TCGA-OR-A5LT-01', 'TCGA-OU-A5PI-01', 'TCGA-OR-A5J2-01', 'TCGA-OR-A5J6-01', 'TCGA-OR-A5JB-01', 'TCGA-OR-A5JD-01', 'TCGA-OR-A5JK-01', 'TCGA-OR-A5JL-01', 'TCGA-OR-A5JO-01', 'TCGA-OR-A5JQ-01', 'TCGA-OR-A5JR-01', 'TCGA-OR-A5JT-01', 'TCGA-OR-A5JV-01', 'TCGA-OR-A5JX-01', 'TCGA-OR-A5JZ-01', 'TCGA-OR-A5K1-01', 'TCGA-OR-A5K4-01', 'TCGA-OR-A5KT-01', 'TCGA-OR-A5KV-01', 'TCGA-OR-A5KW-01', 'TCGA-OR-A5L3-01', 'TCGA-OR-A5L4-01', 'TCGA-OR-A5L5-01', 'TCGA-OR-A5L8-01', 'TCGA-OR-A5L9-01', 'TCGA-OR-A5LA-01', 'TCGA-OR-A5LG-01', 'TCGA-OR-A5LH-01', 'TCGA-OR-A5LL-01', 'TCGA-OR-A5LN-01', 'TCGA-OR-A5LP-01', 'TCGA-OR-A5LR-01', 'TCGA-PA-A5YG-01', 'TCGA-PK-A5H9-01', 'TCGA-OR-A5JH-01', 'TCGA-OR-A5JU-01', 'TCGA-OR-A5KB-01', 'TCGA-OR-A5KP-01', 'TCGA-OR-A5KQ-01', 'TCGA-OR-A5KS-01', 'TCGA-OR-A5L1-01', 'TCGA-OR-A5L2-01', 'TCGA-OR-A5LF-01', 'TCGA-OR-A5LI-01', 'TCGA-P6-A5OH-01', 'TCGA-PK-A5HC-01'];
    console.log('Diff sort',JSON.stringify(diffSort(DiffSortInput1,diffSortSamples1)));
    expect(DiffSortOutputData1).toEqual(diffSort(DiffSortInput1,diffSortSamples1));
  });

  it('Synchronized sort', () => {
    const geneList = ['RRM2B','NUDT1','DUT'];
    expect(SyncSortOutputData1).toEqual(synchronizedSort(SyncSortInput1,geneList,undefined,false));
  });
});

