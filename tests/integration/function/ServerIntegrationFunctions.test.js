import expect from 'expect';
import {
  doDataAssociations,
  findAssociatedData,
  calculateAssociatedData,
  calculateAllPathways,
  calculateDiffs, generateScoredData,
} from '../../../src/functions/DataFunctions';

import AssociatedDataCopyNumber1 from '../../data/AssociatedDataCopyNumber1';
import AssociatedDataExpression1 from '../../data/AssociatedDataExpression1';
import AssociatedDataGeneList1 from '../../data/AssociatedDataGeneList1';
import AssociatedDataPathways1 from '../../data/AssociatedDataPathways1';
import AssociatedDataSamples1 from '../../data/AssociatedDataSamples1';
import AssociatedDataOutput1 from '../../data/AssociatedDataOutput1';

import CalculateAssociatedDataPathwayData1 from '../../data/CalculateAssociatedDataPathwayData1';
import CalculateAssociateDataOutput1 from '../../data/CalculateAssociateDataOutput1';

import CalculateAllPathwaysA from '../../data/CalculateAllPathwaysA';
import CalculateAllPathwaysB from '../../data/CalculateAllPathwaysB';
import CalculateAllPathwaysOutput from '../../data/CalculateAllPathwaysOutput';

import FindAssociatedDataInputHash1 from '../../data/FindAssociatedDataInputHash1';
import FindAssociatedDataKey1 from '../../data/FindAssociatedDataKey';
import FindAssociatedDataOutput1 from '../../data/FindAssociatedOutput1';

import GenerateScoredDataPathwayDataA from '../../data/GenerateScoredDataPathwayDataA';
import GenerateScoredDataPathwayDataB from '../../data/GenerateScoredDataPathwayDataB';
import GenerateScoredDataPathways from '../../data/GenerateScoredDataPathways';
import GenerateScoredDataOutput from '../../data/GenerateScoredDataOutput';

import {VIEW_ENUM} from '../../../src/data/ViewEnum';
import {sumTotals} from '../../../src/functions/MathFunctions';

describe('Data Integration Functions', () => {

  it('Associated Data', () => {
    expect(AssociatedDataOutput1).toEqual(doDataAssociations(AssociatedDataExpression1, AssociatedDataCopyNumber1, [[]],[[]],[[]],[[]],AssociatedDataGeneList1, AssociatedDataPathways1, AssociatedDataSamples1, VIEW_ENUM.CNV_MUTATION));
  });

  it('Calculate Associated Data', () => {
    expect(calculateAssociatedData(CalculateAssociatedDataPathwayData1,VIEW_ENUM.CNV_MUTATION,2)).toEqual(CalculateAssociateDataOutput1);
  });

  it('Calculate PathwayScore', () => {
    const pathwayScore = [68,98,74,20,19,16,18,56,126,179,74,35,33,83,73,105,10,80,46,214,301,189,411,1099,886,575,1665,823,1553,586,762,180,356,141,656,19,302,24,673,148,446];
    // expect(calculatePathwayScore(CalculateAssociatedDataPathwayData1,VIEW_ENUM.CNV_MUTATION)).toEqual(pathwayScore);
    expect(calculateAssociatedData(CalculateAssociatedDataPathwayData1,VIEW_ENUM.CNV_MUTATION).map( pathway => sumTotals(pathway))).toEqual(pathwayScore);
  });

  // TODO: note for some reason this triggers:
  // ERROR: 'Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in %s.%s', 'the componentWillUnmount method', '
  // TODO: probably because its calculating based on the fetch
  // TODO: activate this again
  it('Calculate All Pathways', () => {
    let associatedDataA = calculateAssociatedData(CalculateAllPathwaysA,VIEW_ENUM.CNV_MUTATION);
    let associatedDataB = calculateAssociatedData(CalculateAllPathwaysB,VIEW_ENUM.CNV_MUTATION);
    // console.log(JSON.stringify(calculateAllPathways([CalculateAllPathwaysA,CalculateAllPathwaysB],[associatedDataA,associatedDataB])));
    expect(calculateAllPathways([CalculateAllPathwaysA,CalculateAllPathwaysB],[associatedDataA,associatedDataB])).toEqual(CalculateAllPathwaysOutput);
  });


  it('Generate Scored Data', () => {
    const Selection = {'pathway':{'goid':'GO:0006281','golabel':'Modulation of nucleotide pools','gene':['NUDT1','DUT','RRM2B'],'firstObserved':33,'firstTotal':33,'firstNumSamples':136,'firstExpected':20.22441477095158,'firstChiSquared':9.479983189100402,'secondObserved':43,'secondTotal':44,'secondNumSamples':492,'secondExpected':28.71748902704271,'secondChiSquared':7.5436558288678714},'tissue':'Header'};
    const Filters = [VIEW_ENUM.CNV_MUTATION,VIEW_ENUM.CNV_MUTATION];
    expect(GenerateScoredDataOutput,generateScoredData(Selection,[GenerateScoredDataPathwayDataA,GenerateScoredDataPathwayDataB],GenerateScoredDataPathways,Filters,false));

  });

  it('Calculate Diffs', () => {
    const CalculateDiffsA1 = [{'gene':['AKT1']},{'gene':['AKT2']},{'gene':['AKT3']},{'gene':['BTK']},{'gene':['GRB10']},{'gene':['GRB2']},{'gene':['HSPB1']},{'gene':['ILK']},{'gene':['MTCP1']},{'gene':['PDK2']},{'gene':['PDPK1']},{'gene':['PIK3CA']},{'gene':['PIK3CG']},{'gene':['PIK3R1']},{'gene':['PIK3R2']},{'gene':['PAK1']},{'gene':['PRKCA']},{'gene':['PRKCB']},{'gene':['PRKCZ']},{'gene':['PTEN']},{'gene':['TCL1A']}];
    const CalculateDiffsOutput1 = [[{'gene':['AKT1']},{'gene':['AKT2']},{'gene':['AKT3']},{'gene':['BTK']},{'gene':['GRB10']},{'gene':['GRB2']},{'gene':['HSPB1']},{'gene':['ILK']},{'gene':['MTCP1']},{'gene':['PDK2']},{'gene':['PDPK1']},{'gene':['PIK3CA']},{'gene':['PIK3CG']},{'gene':['PIK3R1']},{'gene':['PIK3R2']},{'gene':['PAK1']},{'gene':['PRKCA']},{'gene':['PRKCB']},{'gene':['PRKCZ']},{'gene':['PTEN']},{'gene':['TCL1A']}],{}];
    const CalculateDiffsB2 = [{'gene':['AKT1']},{'gene':['AKT2']},{'gene':['AKT3']},{'gene':['BTK']},{'gene':['GRB10']},{'gene':['GRB2']},{'gene':['HSPB1']},{'gene':['ILK']},{'gene':['MTCP1']},{'gene':['PDK2']},{'gene':['PDPK1']},{'gene':['PIK3CA']},{'gene':['PIK3CG']},{'gene':['PIK3R1']},{'gene':['PIK3R2']},{'gene':['PAK1']},{'gene':['PRKCA']},{'gene':['PRKCB']},{'gene':['PRKCZ']},{'gene':['PTEN']},{'gene':['TCL1A']}];
    const CalculateDiffsOutput2 =[{},[{'gene':['AKT1']},{'gene':['AKT2']},{'gene':['AKT3']},{'gene':['BTK']},{'gene':['GRB10']},{'gene':['GRB2']},{'gene':['HSPB1']},{'gene':['ILK']},{'gene':['MTCP1']},{'gene':['PDK2']},{'gene':['PDPK1']},{'gene':['PIK3CA']},{'gene':['PIK3CG']},{'gene':['PIK3R1']},{'gene':['PIK3R2']},{'gene':['PAK1']},{'gene':['PRKCA']},{'gene':['PRKCB']},{'gene':['PRKCZ']},{'gene':['PTEN']},{'gene':['TCL1A']}]] ;
    expect(calculateDiffs(CalculateDiffsA1,{},null)).toEqual(CalculateDiffsOutput1);
    expect(calculateDiffs({},CalculateDiffsB2,null)).toEqual(CalculateDiffsOutput2);
  });

  // TODO: reactivate
  it('Find Associated Data', () => {
    expect(FindAssociatedDataOutput1).toEqual(findAssociatedData(FindAssociatedDataInputHash1,FindAssociatedDataKey1));
  });

});
