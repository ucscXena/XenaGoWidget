import expect from 'expect'
import React from 'react'
import { unmountComponentAtNode} from 'react-dom'
import {
  addIndepProb,
  doDataAssociations,
  createEmptyArray,
  DEFAULT_DATA_VALUE,
  findAssociatedData,
  findPruneData,
  getCopyNumberHigh,
  getCopyNumberLow,
  getCopyNumberValue,
  getGenePathwayLookup,
  getMutationScore,
  pruneColumns,
  calculateExpectedProb,
  calculateGeneSetExpected,
  scoreChiSquareTwoByTwo,
  scoreData,
  scoreChiSquaredData,
  calculateAssociatedData,
  calculateObserved,
  calculatePathwayScore,
  calculateAllPathways,
  calculateDiffs
} from "../../src/functions/DataFunctions";
import {times} from "underscore";
import DefaultPathways from '../../src/data/genesets/tgac';

import AssociatedDataCopyNumber1 from '../data/AssociatedDataCopyNumber1';
import AssociatedDataExpression1 from '../data/AssociatedDataExpression1';
import AssociatedDataGeneList1 from '../data/AssociatedDataGeneList1';
import AssociatedDataPathways1 from '../data/AssociatedDataPathways1';
import AssociatedDataSamples1 from '../data/AssociatedDataSamples1';
import AssociatedDataOutput1 from '../data/AssociatedDataOutput1';

import CalculateAssociatedDataPathwayData1 from '../data/CalculateAssociatedDataPathwayData1';
import CalculateAssociateDataOutput1 from '../data/CalculateAssociateDataOutput1';

import CalculateAllPathwaysA from '../data/CalculateAllPathwaysA'
import CalculateAllPathwaysB from '../data/CalculateAllPathwaysB'
import CalculateAllPathwaysOutput from '../data/CalculateAllPathwaysOutput'

import FindAssociatedDataInputHash1 from '../data/FindAssociatedDataInputHash1'
import FindAssociatedDataKey1 from '../data/FindAssociatedDataKey'
import FindAssociatedDataOutput1 from '../data/FindAssociatedOutput1'

import FindPruneData1 from '../data/FindPruneAssociatedData1'
import FindPruneDataKey1 from '../data/FindPruneDataKey1'
import FindPruneDataOutput1 from '../data/FindPruneDataOutput1'

import ExpectedGeneSetData1 from '../data/ExpectedGeneSetData1'

import PruneColumnData1 from '../data/PruneColumnData1'
import PruneColumnPathwaysData1 from '../data/PrunePathwaysData1'
import PruneColumnOutput1 from '../data/PruneColumnOutput1'

const AMP_THRESHOLD = 2 ;
const DEL_THRESHOLD = -2 ;
const MUTATION_MIN = 2 ;

describe('Data Functions', () => {
  let node;

  beforeEach(() => {
    node = document.createElement('div')
  });

  afterEach(() => {
    unmountComponentAtNode(node)
  });

  it('Copy Number Value', () => {
    expect(0).toEqual(getCopyNumberValue('NOTANUMBER',AMP_THRESHOLD,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberValue(undefined,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberValue(-3,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberValue(-2,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberValue(-1,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberValue(0,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberValue(1,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberValue(2,AMP_THRESHOLD,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberValue(3,AMP_THRESHOLD,DEL_THRESHOLD));
  });

  it('Copy Number High', () => {
    expect(0).toEqual(getCopyNumberHigh('NOTANUMBER',AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(undefined,AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(-3,AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(-2,AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(-1,AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(0,AMP_THRESHOLD));
    expect(0).toEqual(getCopyNumberHigh(1,AMP_THRESHOLD));
    expect(1).toEqual(getCopyNumberHigh(2,AMP_THRESHOLD));
    expect(1).toEqual(getCopyNumberHigh(3,AMP_THRESHOLD));
  });

  it('Copy Number Low', () => {
    expect(0).toEqual(getCopyNumberLow('NOTANUMBER',DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(undefined,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberLow(-3,DEL_THRESHOLD));
    expect(1).toEqual(getCopyNumberLow(-2,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(-1,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(0,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(1,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(2,DEL_THRESHOLD));
    expect(0).toEqual(getCopyNumberLow(3,DEL_THRESHOLD));
  });

  it('Mutation Score', () => {
    expect(1).toEqual(getMutationScore('Frame_Shift_Ins',MUTATION_MIN))
    expect(1).toEqual(getMutationScore('SpliceDonorDeletion',MUTATION_MIN))
    expect(1).toEqual(getMutationScore('InFrameInsertion',MUTATION_MIN))
    expect(0).toEqual(getMutationScore('synonymous_variant',MUTATION_MIN))
    expect(0).toEqual(getMutationScore('downstream_gene_variant',MUTATION_MIN))
    expect(0).toEqual(getMutationScore('Copy Number',MUTATION_MIN))
  });

  it('Gene Pathway Look', () => {
    let genePathwayLookup = getGenePathwayLookup(DefaultPathways)
    expect([9,23,24]).toEqual(genePathwayLookup('BRCA1'))
    expect([19,23,27,28,30,39]).toEqual(genePathwayLookup('TP53'))
    expect([]).toEqual(genePathwayLookup('ATPK1'))
    expect([]).toEqual(genePathwayLookup('CDC1'))
  });

  it('Associated Data', () => {
    expect(AssociatedDataOutput1).toEqual(doDataAssociations(AssociatedDataExpression1, AssociatedDataCopyNumber1, AssociatedDataGeneList1, AssociatedDataPathways1, AssociatedDataSamples1, 'All', MUTATION_MIN))
  });

  it('Find Associated Data', () => {
    expect(FindAssociatedDataOutput1).toEqual(findAssociatedData(FindAssociatedDataInputHash1,FindAssociatedDataKey1))
  });


  it('Find pruned columns', () => {
    // let prunedDataOutput = findPruneData(FindPruneData1,FindPruneDataKey1);
    expect(FindPruneDataOutput1).toEqual(findPruneData(FindPruneData1,FindPruneDataKey1))
  });

  it('Prune columns', () => {
    expect(PruneColumnOutput1).toEqual(pruneColumns(PruneColumnData1,PruneColumnPathwaysData1,0))
  });



  describe('Test statistical function', () => {
    let node;

    beforeEach(() => {
      node = document.createElement('div')
    });

    afterEach(() => {
      unmountComponentAtNode(node)
    });

    it('Calculates single function properly', () => {
      expect([addIndepProb([3])]).toContain(3)
    });
    it('Calculates multiple function properly 1', () => {
      expect([addIndepProb([3,3])]).toContain(-3)
    });
    it('Calculates multiple function properly 2', () => {
      expect([addIndepProb([0.2,0.6])]).toContain(0.68)
    });
    it('Calculates multiple function properly 3', () => {
      expect([addIndepProb([0.8,0.05])]).toContain(0.81)
    });
  });


  it('Create a simple array', () => {
    let returnArray = createEmptyArray(20,5);
    expect(returnArray.length).toEqual(20);
    expect(returnArray[0].length).toEqual(5);
    // expect(returnArray[5][3]).toEqual({total:0,mutation:0,cnv:0});
    expect(returnArray[5][3]).toEqual({total:0,mutation4:0,mutation3:0,mutation2:0,mutation:0,cnv:0,cnvLow:0,cnvHigh:0});
    returnArray[5][3] = {total:7,mutation:3,cnv:1};
    expect(returnArray[5][3]).toEqual({total:7,mutation:3,cnv:1});
    returnArray = new Array(20).fill(0).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
    expect(returnArray[5][3]).toEqual({total:0,mutation:0,cnv:0});

  });

  it('Calculates single function properly', () => {
    // let returnArray = new Array(20).fill([]).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
    // let returnArray = times(20,fill([]).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
    let returnArray = times(20, () => times(5, () => DEFAULT_DATA_VALUE));
    expect(returnArray.length===20);
    expect(returnArray[0].length===5);
    expect(returnArray[5][3]).toEqual({total:0,mutation4:0,mutation3:0,mutation2:0,mutation:0,cnv:0,cnvLow:0,cnvHigh:0});
    returnArray[5][3] = {total:7,mutation:3,cnv:1};
    expect(returnArray[5][3]).toEqual({total:7,mutation:3,cnv:1});
    returnArray = new Array(20).fill(0).map(() => new Array(5).fill({total:0,mutation:0,cnv:0}));
    expect(returnArray[5][3]).toEqual({total:0,mutation:0,cnv:0});

  });

  it('Calculates expected probability', () => {
    const inputPathway = {"goid":"","golabel":"TP53 (Pancan Atlas)","gene":["TP53","MDM2","MDM4","ATM","CHEK2","RPS6KA3"],"firstObserved":116,"firstTotal":148,"firstNumSamples":136,"firstExpected":36.0005741958846,"firstChiSquared":241.77183912800558,"secondObserved":150,"secondTotal":188,"secondNumSamples":492,"secondExpected":53.40942510070341,"secondChiSquared":195.95547707551532}
    const inputExpected = 1506;
    const inputTotal = 25000;
    const outputProb = 0.3112128622809085;
    expect(calculateExpectedProb(inputPathway,inputExpected,inputTotal)).toEqual(outputProb);
  });

  it('Calculates Gene Set Expected', () => {
    const output = {"Notch signaling":44.66612281988055,"Hippo signaling":52.1623051662852,"DNA base excision repair":55.53700332143,"DNA strand break joining":36.0005741958846,"Poly(ADP-ribose) polymerase (PARP)":20.22441477095158,"Direct reversal of DNA damage":20.22441477095158,"Repair of DNA-topoisomerase crosslinks":14.052370390208129,"Mismatch excision repair":52.1623051662852,"Nucleotide excision repair":93.69964333865461,"Homologous recombination":79.75208290162034,"Fanconi anemia":71.76449060935416,"Non-homologous DNA end-joining":40.494172925681866,"Modulation of nucleotide pools":20.22441477095158,"DNA polymerase":67.01629760269542,"Editing and processing nucleases":44.66612281988055,"Ubiquitination and modification":55.53700332143,"Chromatin structure and modification":20.22441477095158,"Sensitivity to DNA damaging agents":31.15117209447816,"Known/suspected DNA repair function":48.5465919536048,"Conserved DNA damage response":67.01629760269542,"DNA damage checkpoint":108.51888599280187,"PI3-K signaling":79.75208290162034,"Wnt signaling":110.82744575678224,"Intrinsic apoptotic pathway":126.86065451569475,"Extrinsic apoptotic pathway":124.30913748095283,"Cell cycle":122.14170706932096,"Histone modification":130.7722056038411,"Oxidative stress":121.0867993902569,"Ras signaling":128.36970184888767,"TGF-B signaling":120.41471508174367,"TP53 signaling":119.49147447610773,"cell cycle (Pancan Atlas)":67.01629760269542,"HIPPO (Pancan Atlas)":100.25136824082601,"MYC (Pancan Atlas)":61.64567804721665,"NOTCH (Pancan Atlas)":115.99727879436857,"NRF2 (Pancan Atlas)":20.22441477095158,"PI3K (Pancan Atlas)":91.42545483343683,"TGF-Beta (Pancan Atlas)":40.494172925681866,"RTK RAS (Pancan Atlas)":119.29453257346131,"TP53 (Pancan Atlas)":36.0005741958846,"WNT (Pancan Atlas)":115.12856126958182};
    expect(calculateGeneSetExpected(ExpectedGeneSetData1,"All")).toEqual(output);
  });


  it('Score Chi Square Data', () => {
    expect(-7.5).toEqual(scoreChiSquaredData(10,5,3))
  });

  it('Score Chi Square Data Two by Two', () => {
    expect(0.07326007326007325).toEqual(scoreChiSquareTwoByTwo(10,5,3,2))
  });

  it('Score Data', () => {
    expect(0.6666666666666666).toEqual(scoreData(10,5,3))
  });

  it('Calculate Associated Data', () => {
    expect(calculateAssociatedData(CalculateAssociatedDataPathwayData1,"All",2)).toEqual(CalculateAssociateDataOutput1)
  });

  it('Calculate Observed', () => {
    const outputScore = [53,66,53,19,18,16,18,43,64,86,53,31,33,57,53,66,10,64,37,126,98,85,115,132,124,120,130,131,134,119,132,87,115,89,126,18,111,21,122,116,117];
    expect(calculateObserved(CalculateAssociatedDataPathwayData1,"All",2)).toEqual(outputScore)
  });

  it('Calculate PathwayScore', () => {
    const pathwayScore = [68,98,74,20,19,16,18,56,126,179,74,35,33,83,73,105,10,80,46,214,301,189,411,1099,886,575,1665,823,1553,586,762,180,356,141,656,19,302,24,673,148,446];
    expect(calculatePathwayScore(CalculateAssociatedDataPathwayData1,"All",2)).toEqual(pathwayScore);
  });

  it('Calculate All Pathways', () => {
    expect(calculateAllPathways(CalculateAllPathwaysA,CalculateAllPathwaysB)).toEqual(CalculateAllPathwaysOutput);
  });

  it('Calculate Diffs', () => {
    const CalculateDiffsA1 = [{"gene":["AKT1"]},{"gene":["AKT2"]},{"gene":["AKT3"]},{"gene":["BTK"]},{"gene":["GRB10"]},{"gene":["GRB2"]},{"gene":["HSPB1"]},{"gene":["ILK"]},{"gene":["MTCP1"]},{"gene":["PDK2"]},{"gene":["PDPK1"]},{"gene":["PIK3CA"]},{"gene":["PIK3CG"]},{"gene":["PIK3R1"]},{"gene":["PIK3R2"]},{"gene":["PAK1"]},{"gene":["PRKCA"]},{"gene":["PRKCB"]},{"gene":["PRKCZ"]},{"gene":["PTEN"]},{"gene":["TCL1A"]}];
    const CalculateDiffsOutput1 = [[{"gene":["AKT1"]},{"gene":["AKT2"]},{"gene":["AKT3"]},{"gene":["BTK"]},{"gene":["GRB10"]},{"gene":["GRB2"]},{"gene":["HSPB1"]},{"gene":["ILK"]},{"gene":["MTCP1"]},{"gene":["PDK2"]},{"gene":["PDPK1"]},{"gene":["PIK3CA"]},{"gene":["PIK3CG"]},{"gene":["PIK3R1"]},{"gene":["PIK3R2"]},{"gene":["PAK1"]},{"gene":["PRKCA"]},{"gene":["PRKCB"]},{"gene":["PRKCZ"]},{"gene":["PTEN"]},{"gene":["TCL1A"]}],{}];
    const CalculateDiffsB2 = [{"gene":["AKT1"]},{"gene":["AKT2"]},{"gene":["AKT3"]},{"gene":["BTK"]},{"gene":["GRB10"]},{"gene":["GRB2"]},{"gene":["HSPB1"]},{"gene":["ILK"]},{"gene":["MTCP1"]},{"gene":["PDK2"]},{"gene":["PDPK1"]},{"gene":["PIK3CA"]},{"gene":["PIK3CG"]},{"gene":["PIK3R1"]},{"gene":["PIK3R2"]},{"gene":["PAK1"]},{"gene":["PRKCA"]},{"gene":["PRKCB"]},{"gene":["PRKCZ"]},{"gene":["PTEN"]},{"gene":["TCL1A"]}];
    const CalculateDiffsOutput2 =[{},[{"gene":["AKT1"]},{"gene":["AKT2"]},{"gene":["AKT3"]},{"gene":["BTK"]},{"gene":["GRB10"]},{"gene":["GRB2"]},{"gene":["HSPB1"]},{"gene":["ILK"]},{"gene":["MTCP1"]},{"gene":["PDK2"]},{"gene":["PDPK1"]},{"gene":["PIK3CA"]},{"gene":["PIK3CG"]},{"gene":["PIK3R1"]},{"gene":["PIK3R2"]},{"gene":["PAK1"]},{"gene":["PRKCA"]},{"gene":["PRKCB"]},{"gene":["PRKCZ"]},{"gene":["PTEN"]},{"gene":["TCL1A"]}]] ;
    expect(calculateDiffs(CalculateDiffsA1,{})).toEqual(CalculateDiffsOutput1);
    expect(calculateDiffs({},CalculateDiffsB2)).toEqual(CalculateDiffsOutput2);
  });

  // it('Generate Scored Data', () => {
  //    const Selection = {"pathway":{"goid":"GO:0016570","golabel":"Histone modification","gene":["KANSL1","KDM5A","CTCFL","KAT2A","UBE2B","USP3","EYA3","EYA1","DOT1L","RBBP5","ACTL6A","WDR5","KDM8","SETD6","MIER2","BAP1","HASPIN","USP49","MSL2","ELK4","TAF7","TAF5","LEO1","UBE2E1","NCOA3","KMT2A","PHF19","CTBP1","MSL1","UHRF1","SETDB2","SIN3A","IWS1","BEND3","PHF20","HAT1","HDAC3","DNMT1","SART3","EYA2","KDM5C","WBP2","KAT14","ATXN7L3","PADI2","KAT8","NAA60","CTR9","CDK2","CUL4B","NSD3","SETD2","PCGF6","KANSL2","HDAC1","NR1H4","PIH1D1","REST","WAC","ING3","NTMT1","KANSL3","ATRX","UBE2N","NIPBL","OGT","ATXN7","UIMC1","WDR61","PRDM12","PRMT7","KDM6B","ELP3","SETD1A","RBM14","JAK2","EHMT1","SNW1","MSL3","BRCC3","BRPF1","HDAC6","SUPT7L","TET2","NAA40","SKR16C5","KDM4B","RYBP","USP51","FOXP3","HCFC1","KAT2B","ING5","KAT6B","CDK1","AUTS2","SETD7","KAT5","ZNF304","DTX3L","CHD5","MIER1","CHTOP","HDAC2","RNF2","CREBBP","KAT6A","EZH2","TAF1","ZNF451","KDM1A","FMR1","JADE1","KMT5A","SUV39H2","PRMT6","DPY30","DDB2","EP400","JADE2","NSD1","ZNF335","EHMT2","DDB1","TAF12","PKN1","UBE2A","RPS6KA4","ARRB1","HMGA2","SUV39H1","EPC1","RCOR1","DNMT3B","ASH2L","RUVBL1","TAF9","LEF1","PHC1","KDM5D","PAXIP1","PER1","CLOCK","COPRS","SETD1B","SMARCAD1","KMT2B","BRD7","DMAP1","RING1","ENY2","RNF40","MYSM1","ZNF274","BRD8","RPS6KA5","BAZ1B","EED","TAF5L","TADA3","NACC2","PHF8","SMYD3","MBIP","KDM7A","POLE3","PAF1","CXXC1","SIRT6","HUWE1","YEATS4","JADE3","PRMT2","USP16","H2AFY","PRKCA","HDAC11","PRKCB","TET1","NEK11","KDM5B","SIRT1","MAP3K7","MAPK3","MUC1","saga_human","CARM1","MYB","PHF1","TET3","KDM2A","TRIP12","CCNA2","KMT5B","KAT7","KDM1B","MT3","PRDM5","SNCA","MCRS1","TADA2A","KDM2B","RNF20","AKAP8","ELP4","BFD1","KMT2C","KDM4A","PHF2","USP15","TAF6L","KDM3A","TRRAP","TADA1","NOC2L","OTUB1","MORF4L1","RUVBL2","RAPGEF3","TRIM16","SPI1","BCOR","SETMAR","PRMT1","SUPT6H","HDAC4","CAMK1","SUDS3","PRKCD","DCAF1","FBL","SUPT3H","RNF168","NAA50","SUZ12","KDM4D","USP22","LIF","SMARCB1","HDAC5","HDAC10","ATF2","CDK9","HLCS","UBR5","ING4","PRMT8","POLE4","ASH1L"],"firstObserved":130,"firstTotal":1665,"firstNumSamples":136,"firstExpected":130.7722056038411,"firstChiSquared":-0.1186235341342542,"secondObserved":363,"secondTotal":2459,"secondNumSamples":492,"secondExpected":353.29540523031375,"secondChiSquared":0.9455643208870146},"tissue":"Header"}
  //    const ScoredInputA = ScoredInputA
  //
  //    const Filters = ["All","All"];
  //
  // });

});

