import expect from 'expect'
import React from 'react'
import {unmountComponentAtNode} from 'react-dom'
import {
  clusterSort,
  diffSort,
  scoreColumns,
  sortByType,
  synchronizedSort,
  transpose
} from "../../src/functions/SortFunctions";

import ScoredDataInput1 from '../data/ScoreColumnDataInput1';
import ScoredOutputData1 from '../data/ScoreColumnDataOutput1';

import ClusterSortInput1 from '../data/ClusterSortInput1';
import ClusterSortOutputData1 from '../data/ClusterSortOutput1';


import DiffSortInput1 from '../data/DiffSortInput1';
import DiffSortOutputData1 from '../data/DiffSortOutput1';

import SyncSortInput1 from '../data/SyncSortInput1';
import SyncSortOutputData1 from '../data/SyncSortOutput1';
import {AppStorageHandler} from "../../src/service/AppStorageHandler";

describe('Sort Functions', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });

  it('App storage store and get cohortSate ', () => {
    let cohortStateA = AppStorageHandler.getCohortState(0);
    let cohortStateB = AppStorageHandler.getCohortState(1);

    // expect(cohortStateA).toEqual("Ovarian");
    // let input = [[{"total":1,"mutation":0,"cnv":1,"mutation4":0,"mutation3":0,"mutation2":0,"cnvHigh":1,"cnvLow":0},{"total":0,"mutation":0,"cnv":0,"mutation4":0,"mutation3":0,"mutation2":0,"cnvHigh":0,"cnvLow":0}]];
    // let output = [[{"total":1,"mutation":0,"cnv":1,"mutation4":0,"mutation3":0,"mutation2":0,"cnvHigh":1,"cnvLow":0}],[{"total":0,"mutation":0,"cnv":0,"mutation4":0,"mutation3":0,"mutation2":0,"cnvHigh":0,"cnvLow":0}]];
    // expect(output).toEqual(transpose(input))
  });

});

