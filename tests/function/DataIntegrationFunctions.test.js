import expect from 'expect';
import {
  doDataAssociations,
  findAssociatedData,
  findPruneData,
  pruneColumns,
  calculateExpectedProb,
  calculateGeneSetExpected,
  calculateAssociatedData,
  calculateObserved,
  calculatePathwayScore,
  calculateAllPathways,
  calculateDiffs, generateScoredData, filterCopyNumbers, filterMutations
} from '../../src/functions/DataFunctions';

import AssociatedDataCopyNumber1 from '../data/AssociatedDataCopyNumber1';
import AssociatedDataExpression1 from '../data/AssociatedDataExpression1';
import AssociatedDataGeneList1 from '../data/AssociatedDataGeneList1';
import AssociatedDataPathways1 from '../data/AssociatedDataPathways1';
import AssociatedDataSamples1 from '../data/AssociatedDataSamples1';
import AssociatedDataOutput1 from '../data/AssociatedDataOutput1';

import CalculateAssociatedDataPathwayData1 from '../data/CalculateAssociatedDataPathwayData1';
import CalculateAssociateDataOutput1 from '../data/CalculateAssociateDataOutput1';

import CalculateAllPathwaysA from '../data/CalculateAllPathwaysA';
import CalculateAllPathwaysB from '../data/CalculateAllPathwaysB';
import CalculateAllPathwaysOutput from '../data/CalculateAllPathwaysOutput';

import FindAssociatedDataInputHash1 from '../data/FindAssociatedDataInputHash1';
import FindAssociatedDataKey1 from '../data/FindAssociatedDataKey';
import FindAssociatedDataOutput1 from '../data/FindAssociatedOutput1';

import FindPruneData1 from '../data/FindPruneAssociatedData1';
import FindPruneDataKey1 from '../data/FindPruneDataKey1';
import FindPruneDataOutput1 from '../data/FindPruneDataOutput1';

import ExpectedGeneSetData1 from '../data/ExpectedGeneSetData1';

import PruneColumnData1 from '../data/PruneColumnData1';
import PruneColumnPathwaysData1 from '../data/PrunePathwaysData1';
import PruneColumnOutput1 from '../data/PruneColumnOutput1';

import GenerateScoredDataPathwayDataA from '../data/GenerateScoredDataPathwayDataA';
import GenerateScoredDataPathwayDataB from '../data/GenerateScoredDataPathwayDataB';
import GenerateScoredDataPathways from '../data/GenerateScoredDataPathways';
import GenerateScoredDataOutput from '../data/GenerateScoredDataOutput';

import FilterMutationExpression1 from '../data/FilterMutationExpression1';
import FilterMutationOutput1 from '../data/FilterMutationOutput1';
import FilterMutationPathways1 from '../data/FilterMutationPathways1';
import FilterMutationReturnArray1 from '../data/FilterMutationReturnArray1';
import FilterMutationSamples1 from '../data/FilterMutationSamples1';

import FilterCopyNumber1 from '../data/FilterCopyNumber1';
import FilterCopyNumberGeneSetGeneList1 from '../data/FilterCopyNumberGeneSetGeneList1';
import FilterCopyNumberOutput1 from '../data/FilterCopyNumberOutput1';
import FilterCopyNumberReturnArray1 from '../data/FilterCopyNumberReturnArray1';

import FilterCopyNumberGeneInput1 from '../data/FilterCopyNumberGeneInput1';
import FilterCopyNumberGeneGeneList1 from '../data/FilterCopyNumberGeneGeneList1';
import FilterMutationGeneExpression1 from '../data/FilterMutationGeneExpression1';
import FilterMutationGeneOutput1 from '../data/FilterMutationGeneOutput1';
import FilterMutationGeneReturnArray1 from '../data/FilterMutationGeneReturnArray1';
import FilterMutationGeneSamples1 from '../data/FilterMutationGeneSamples1';
import FilterCopyNumberGeneReturnArray1 from '../data/FilterCopyNumberGeneReturnArray1';

import FilterBothExpression1 from '../data/FilterBothExpression1';
import FilterBothReturnArray1 from '../data/FilterBothReturnArray1';
import FilterBothSamples1 from '../data/FilterBothSamples1';
import FilterBothCopyNumber1 from '../data/FilterBothCopyNumber1';
import FilterBothGeneList1 from '../data/FilterBothGeneList1';
import FilterBothOutput1 from '../data/FilterBothOutput1';
import {FILTER_ENUM} from '../../src/functions/FilterFunctions';

describe('Data Integration Functions', () => {

  it('Associated Data', () => {
    expect(AssociatedDataOutput1).toEqual(doDataAssociations(AssociatedDataExpression1, AssociatedDataCopyNumber1, [[]],AssociatedDataGeneList1, AssociatedDataPathways1, AssociatedDataSamples1, FILTER_ENUM.CNV_MUTATION));
  });

  it('Filter Mutations for Gene Set', () => {
    expect(FilterMutationOutput1).toEqual(filterMutations(FilterMutationExpression1, FilterMutationReturnArray1, FilterMutationSamples1, FilterMutationPathways1));
  });

  it('Filter Copy Numbers for Gene Set', () => {
    expect(FilterCopyNumberOutput1).toEqual(filterCopyNumbers(FilterCopyNumber1, FilterCopyNumberReturnArray1, FilterCopyNumberGeneSetGeneList1 , FilterMutationPathways1));
  });

  it('Filter Copy Numbers for one Gene', () => {
    const pathways = [{'goid':'','golabel':'DUT','gene':['DUT']}];
    const outputFile = filterCopyNumbers(FilterCopyNumberGeneInput1, FilterCopyNumberGeneReturnArray1, FilterCopyNumberGeneGeneList1, pathways);
    let finalSum = outputFile[0].reduce( (a,b) => {
      return a + b.total;
    },0 );
    expect(83).toEqual(outputFile[0].length);
    expect(1).toEqual(outputFile.length);
    expect(4).toEqual(finalSum);
  });

  it('Filter Mutations for one Gene', () => {
    const pathways = [{'goid':'','golabel':'LATS2','gene':['LATS2']}];
    const outputFile = filterMutations(FilterMutationGeneExpression1, FilterMutationGeneReturnArray1, FilterMutationGeneSamples1, pathways);
    let finalSum = outputFile[0].reduce( (a,b) => {
      return a + b.total;
    },0 );
    expect(83).toEqual(outputFile[0].length);
    expect(1).toEqual(outputFile.length);
    expect(11).toEqual(finalSum);
    expect(outputFile).toEqual(FilterMutationGeneOutput1);
  });

  it('Filter Both for one Gene', () => {
    const pathways = [{'goid':'','golabel':'LATS2','gene':['LATS2']}];
    let outputFile = filterMutations(FilterBothExpression1, FilterBothReturnArray1, FilterBothSamples1, pathways);
    let intermediateSum = outputFile[0].reduce( (a,b) => {
      return a + b.total;
    },0 );
    expect(83).toEqual(outputFile[0].length);
    expect(1).toEqual(outputFile.length);
    expect(11).toEqual(intermediateSum);
    outputFile = filterCopyNumbers(FilterBothCopyNumber1, outputFile, FilterBothGeneList1, pathways);

    let finalSum = outputFile[0].reduce( (a,b) => {
      return a + b.total;
    },0 );
    expect(83).toEqual(outputFile[0].length);
    expect(1).toEqual(outputFile.length);
    expect(12).toEqual(finalSum);
    expect(outputFile).toEqual(FilterBothOutput1);
  });

  // TODO: reactivate
  it('Find Associated Data', () => {
    expect(FindAssociatedDataOutput1).toEqual(findAssociatedData(FindAssociatedDataInputHash1,FindAssociatedDataKey1));
  });


  it('Find pruned columns', () => {
    expect(FindPruneDataOutput1).toEqual(findPruneData(FindPruneData1,FindPruneDataKey1));
  });

  it('Prune columns', () => {
    expect(PruneColumnOutput1).toEqual(pruneColumns(PruneColumnData1,PruneColumnPathwaysData1,0));
  });

  it('Calculates expected probability', () => {
    const inputPathway = {'goid':'','golabel':'TP53 (Pancan Atlas)','gene':['TP53','MDM2','MDM4','ATM','CHEK2','RPS6KA3'],'firstObserved':116,'firstTotal':148,'firstNumSamples':136,'firstExpected':36.0005741958846,'firstChiSquared':241.77183912800558,'secondObserved':150,'secondTotal':188,'secondNumSamples':492,'secondExpected':53.40942510070341,'secondChiSquared':195.95547707551532};
    const inputExpected = 1506;
    const inputTotal = 25000;
    const outputProb = 0.3112128622809085;
    expect(calculateExpectedProb(inputPathway,inputExpected,inputTotal)).toEqual(outputProb);
  });

  it('Calculates Gene Set Expected', () => {
    const output = {'Notch signaling':44.66612281988055,'Hippo signaling':52.1623051662852,'DNA base excision repair':55.53700332143,'DNA strand break joining':36.0005741958846,'Poly(ADP-ribose) polymerase (PARP)':20.22441477095158,'Direct reversal of DNA damage':20.22441477095158,'Repair of DNA-topoisomerase crosslinks':14.052370390208129,'Mismatch excision repair':52.1623051662852,'Nucleotide excision repair':93.69964333865461,'Homologous recombination':79.75208290162034,'Fanconi anemia':71.76449060935416,'Non-homologous DNA end-joining':40.494172925681866,'Modulation of nucleotide pools':20.22441477095158,'DNA polymerase':67.01629760269542,'Editing and processing nucleases':44.66612281988055,'Ubiquitination and modification':55.53700332143,'Chromatin structure and modification':20.22441477095158,'Sensitivity to DNA damaging agents':31.15117209447816,'Known/suspected DNA repair function':48.5465919536048,'Conserved DNA damage response':67.01629760269542,'DNA damage checkpoint':108.51888599280187,'PI3-K signaling':79.75208290162034,'Wnt signaling':110.82744575678224,'Intrinsic apoptotic pathway':126.86065451569475,'Extrinsic apoptotic pathway':124.30913748095283,'Cell cycle':122.14170706932096,'Histone modification':130.7722056038411,'Oxidative stress':121.0867993902569,'Ras signaling':128.36970184888767,'TGF-B signaling':120.41471508174367,'TP53 signaling':119.49147447610773,'cell cycle (Pancan Atlas)':67.01629760269542,'HIPPO (Pancan Atlas)':100.25136824082601,'MYC (Pancan Atlas)':61.64567804721665,'NOTCH (Pancan Atlas)':115.99727879436857,'NRF2 (Pancan Atlas)':20.22441477095158,'PI3K (Pancan Atlas)':91.42545483343683,'TGF-Beta (Pancan Atlas)':40.494172925681866,'RTK RAS (Pancan Atlas)':119.29453257346131,'TP53 (Pancan Atlas)':36.0005741958846,'WNT (Pancan Atlas)':115.12856126958182};
    expect(calculateGeneSetExpected(ExpectedGeneSetData1,FILTER_ENUM.CNV_MUTATION)).toEqual(output);
  });

  it('Calculate Associated Data', () => {
    expect(calculateAssociatedData(CalculateAssociatedDataPathwayData1,FILTER_ENUM.CNV_MUTATION,2)).toEqual(CalculateAssociateDataOutput1);
  });

  it('Calculate Observed', () => {
    const outputScore = [53,66,53,19,18,16,18,43,64,86,53,31,33,57,53,66,10,64,37,126,98,85,115,132,124,120,130,131,134,119,132,87,115,89,126,18,111,21,122,116,117];
    expect(calculateObserved(CalculateAssociatedDataPathwayData1,FILTER_ENUM.CNV_MUTATION)).toEqual(outputScore);
  });

  it('Calculate PathwayScore', () => {
    const pathwayScore = [68,98,74,20,19,16,18,56,126,179,74,35,33,83,73,105,10,80,46,214,301,189,411,1099,886,575,1665,823,1553,586,762,180,356,141,656,19,302,24,673,148,446];
    expect(calculatePathwayScore(CalculateAssociatedDataPathwayData1,FILTER_ENUM.CNV_MUTATION)).toEqual(pathwayScore);
  });

  // TODO: note for some reason this triggers:
  // ERROR: 'Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in %s.%s', 'the componentWillUnmount method', '
  // TODO: probably because its calculating based on the fetch
  // TODO: activate this again
  it('Calculate All Pathways', () => {
    expect(calculateAllPathways([CalculateAllPathwaysA,CalculateAllPathwaysB])).toEqual(CalculateAllPathwaysOutput);
  });

  it('Calculate Diffs', () => {
    const CalculateDiffsA1 = [{'gene':['AKT1']},{'gene':['AKT2']},{'gene':['AKT3']},{'gene':['BTK']},{'gene':['GRB10']},{'gene':['GRB2']},{'gene':['HSPB1']},{'gene':['ILK']},{'gene':['MTCP1']},{'gene':['PDK2']},{'gene':['PDPK1']},{'gene':['PIK3CA']},{'gene':['PIK3CG']},{'gene':['PIK3R1']},{'gene':['PIK3R2']},{'gene':['PAK1']},{'gene':['PRKCA']},{'gene':['PRKCB']},{'gene':['PRKCZ']},{'gene':['PTEN']},{'gene':['TCL1A']}];
    const CalculateDiffsOutput1 = [[{'gene':['AKT1']},{'gene':['AKT2']},{'gene':['AKT3']},{'gene':['BTK']},{'gene':['GRB10']},{'gene':['GRB2']},{'gene':['HSPB1']},{'gene':['ILK']},{'gene':['MTCP1']},{'gene':['PDK2']},{'gene':['PDPK1']},{'gene':['PIK3CA']},{'gene':['PIK3CG']},{'gene':['PIK3R1']},{'gene':['PIK3R2']},{'gene':['PAK1']},{'gene':['PRKCA']},{'gene':['PRKCB']},{'gene':['PRKCZ']},{'gene':['PTEN']},{'gene':['TCL1A']}],{}];
    const CalculateDiffsB2 = [{'gene':['AKT1']},{'gene':['AKT2']},{'gene':['AKT3']},{'gene':['BTK']},{'gene':['GRB10']},{'gene':['GRB2']},{'gene':['HSPB1']},{'gene':['ILK']},{'gene':['MTCP1']},{'gene':['PDK2']},{'gene':['PDPK1']},{'gene':['PIK3CA']},{'gene':['PIK3CG']},{'gene':['PIK3R1']},{'gene':['PIK3R2']},{'gene':['PAK1']},{'gene':['PRKCA']},{'gene':['PRKCB']},{'gene':['PRKCZ']},{'gene':['PTEN']},{'gene':['TCL1A']}];
    const CalculateDiffsOutput2 =[{},[{'gene':['AKT1']},{'gene':['AKT2']},{'gene':['AKT3']},{'gene':['BTK']},{'gene':['GRB10']},{'gene':['GRB2']},{'gene':['HSPB1']},{'gene':['ILK']},{'gene':['MTCP1']},{'gene':['PDK2']},{'gene':['PDPK1']},{'gene':['PIK3CA']},{'gene':['PIK3CG']},{'gene':['PIK3R1']},{'gene':['PIK3R2']},{'gene':['PAK1']},{'gene':['PRKCA']},{'gene':['PRKCB']},{'gene':['PRKCZ']},{'gene':['PTEN']},{'gene':['TCL1A']}]] ;
    expect(calculateDiffs(CalculateDiffsA1,{})).toEqual(CalculateDiffsOutput1);
    expect(calculateDiffs({},CalculateDiffsB2)).toEqual(CalculateDiffsOutput2);
  });

  it('Generate Scored Data', () => {
    const Selection = {'pathway':{'goid':'GO:0006281','golabel':'Modulation of nucleotide pools','gene':['NUDT1','DUT','RRM2B'],'firstObserved':33,'firstTotal':33,'firstNumSamples':136,'firstExpected':20.22441477095158,'firstChiSquared':9.479983189100402,'secondObserved':43,'secondTotal':44,'secondNumSamples':492,'secondExpected':28.71748902704271,'secondChiSquared':7.5436558288678714},'tissue':'Header'};
    const Filters = [FILTER_ENUM.CNV_MUTATION,FILTER_ENUM.CNV_MUTATION];
    expect(GenerateScoredDataOutput,generateScoredData(Selection,[GenerateScoredDataPathwayDataA,GenerateScoredDataPathwayDataB],GenerateScoredDataPathways,Filters,false));

  });



});

