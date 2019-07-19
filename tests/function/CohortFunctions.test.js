import expect from 'expect'
import React from 'react'
import {render, unmountComponentAtNode} from 'react-dom'
import {
  fetchCohortData, getGenesForNamedPathways, getGenesForPathways,
  getSamplesFromSubCohort,
  getSamplesFromSubCohortList,
  getSubCohortsOnlyForCohort
} from "../../src/functions/CohortFunctions";
import DefaultCohortData from '../data/DefaultCohortData'
import SamplePathway1 from '../data/SamplePathway1'

describe('Test Sub Cohorts', () => {

  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });


  it('Get sub all cohort samples cohort', () => {
    let samples = getSamplesFromSubCohort('TCGA Ovarian Cancer (OV)','OVCA.Immunoreactive');
    expect(107).toEqual(samples.length);
  });

  it('Get Sub cohorts for cohort', () => {
    let subCohorts = getSubCohortsOnlyForCohort('TCGA Ovarian Cancer (OV)');
    expect(["OVCA.Differentiated", "OVCA.Immunoreactive", "OVCA.Mesenchymal", "OVCA.Proliferative"]).toEqual(subCohorts);

  });

  // https://github.com/mjackson/expect
  it('Get sub all cohort samples cohort', () => {
    let samples = getSamplesFromSubCohortList('TCGA Ovarian Cancer (OV)',['OVCA.Immunoreactive','OVCA.Differentiated']);
    expect(samples.length).toEqual(107+135);
  });


  it('Get Cohort Data',() => {
    expect(DefaultCohortData).toEqual(fetchCohortData());
  });

  // it('Get Genes for Pathways',() => {
  //   const inputPathways = {};
  //   const geneList = {};
  //   expect(geneList).toEqual(getGenesForPathways(pathways));
  // });

  it('Get Names Genes For Pathway', () => {
      const selectedPathways = ["Sensitivity to DNA damaging agents"];
      const geneList = ["BLM","WRN","RECQL4","ATM","TTDN1"];
      expect(geneList).toEqual(getGenesForNamedPathways(selectedPathways,SamplePathway1));
  });

});

