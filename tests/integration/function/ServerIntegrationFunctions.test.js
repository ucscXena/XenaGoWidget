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

import GenerateScoredDataPathways from '../../data/GenerateScoredDataPathways';
import GenerateScoredDataPathwayDataAll from '../../data/GenerateScoredDataPathwayDataAll';
import GenerateScoredDataOutput from '../../data/GenerateScoredDataOutput';

import {VIEW_ENUM} from '../../../src/data/ViewEnum';
import {sumTotals} from '../../../src/functions/MathFunctions';

describe('Data Integration Functions', () => {

  it('Associated Data', () => {
    expect(doDataAssociations(AssociatedDataExpression1, AssociatedDataCopyNumber1, [[]],[[]],[[]],[[]],[[]],AssociatedDataGeneList1, AssociatedDataPathways1, AssociatedDataSamples1, VIEW_ENUM.CNV_MUTATION)).toEqual(AssociatedDataOutput1);
  });

  it('Calculate Associated Data', () => {
    expect(calculateAssociatedData(CalculateAssociatedDataPathwayData1,VIEW_ENUM.CNV_MUTATION,2)).toEqual(CalculateAssociateDataOutput1);
  });

  it('Calculate PathwayScore', () => {
    const pathwayScore = [68,98,74,20,19,16,18,56,126,179,74,35,33,83,73,105,10,80,46,214,301,189,411,1099,886,575,1665,823,1553,586,762,180,356,141,656,19,302,24,673,148,446];
    expect(calculateAssociatedData(CalculateAssociatedDataPathwayData1,VIEW_ENUM.CNV_MUTATION).map( pathway => sumTotals(pathway))).toEqual(pathwayScore);
  });

  // TODO: note for some reason this triggers:
  // ERROR: 'Warning: Can't perform a React state update on an unmounted component. This is a no-op, but it indicates a memory leak in your application. To fix, cancel all subscriptions and asynchronous tasks in %s.%s', 'the componentWillUnmount method', '
  // TODO: probably because its calculating based on the fetch
  // TODO: activate this again
  it('Calculate All Pathways', () => {
    let associatedDataA = calculateAssociatedData(CalculateAllPathwaysA,VIEW_ENUM.CNV_MUTATION);
    let associatedDataB = calculateAssociatedData(CalculateAllPathwaysB,VIEW_ENUM.CNV_MUTATION);
    expect(calculateAllPathways([CalculateAllPathwaysA,CalculateAllPathwaysB],[associatedDataA,associatedDataB])).toEqual(CalculateAllPathwaysOutput);
  });


  it('Generate Scored Data', () => {
    const Selection = {'pathway':{'golabel':'Cytosolic_Iron-sulfur_Cluster_Assembly','gene':['_Fe2S2_(2_)_(smallMolecule)','_Fe2(mu-S)2_(_)_(smallMolecule)','holo-RTEL1_(complex)','holo-ERRC1_(complex)','POLD1','Apoprotein_Lacking_4Fe-4S_Cluster_(family)','holo-POLD1_(complex)','NARFL_CIAO1_FAM96B_MMS19_(complex)','NARFL_4Fe-4S_(complex)','NUBP1','CIAPIN1','RTEL1','NUBP2','FAM96B','CIAO1','NARFL','MMS19','ABC7_dimer_(complex)','Fe___(smallMolecule)','NDOR1','Flavin_mononucleotide_(smallMolecule)','Triphosphopyridine_nucleotide_(smallMolecule)','azufre_(smallMolecule)','_Fe4S4__(smallMolecule)','NDOR1_CIAPIN1_oxidized_(complex)','CIAPIN1_4Fe-4S_2Fe-2S_oxidized_(complex)','NDOR1_FAD_FMN_(complex)','CIAPIN1_4Fe-4S_2Fe-2S_reduced_(complex)','NDOR1_CIAPIN1_reduced_(complex)','NUBP2_4Fe-4S_NUBP1_(complex)','NUBP1_4Fe-4S_(complex)','BRIP1','ABCB7','Flavin_adenine_dinucleotide_(smallMolecule)','holo-BRIP1_(holo-FANCJ)_(complex)','H__(smallMolecule)','TPNH_(smallMolecule)','ERCC2','Holoprotein_Containing_4Fe-4S_Cluster_(family)'],'firstGeneExpressionPathwayActivity':0.8016,'secondGeneExpressionPathwayActivity':-1.801},'tissue':'Header'};
    const Filters = VIEW_ENUM.PARADIGM;
    const sortedAssociatedData =[['TCGA-OR-A5JM-01','TCGA-OR-A5J7-01','TCGA-OR-A5LD-01','TCGA-OR-A5K9-01','TCGA-OR-A5JG-01','TCGA-OR-A5JE-01','TCGA-OR-A5JP-01','TCGA-OR-A5KX-01','TCGA-OR-A5K2-01','TCGA-OR-A5K0-01','TCGA-OR-A5J9-01','TCGA-OR-A5K5-01','TCGA-OR-A5JA-01','TCGA-OR-A5JY-01','TCGA-OR-A5LO-01','TCGA-OR-A5LE-01','TCGA-PK-A5HA-01','TCGA-PK-A5HB-01','TCGA-OR-A5J1-01'],['TCGA-CH-5772-01','TCGA-EJ-7125-01','TCGA-G9-7523-01']];
    expect(GenerateScoredDataOutput,generateScoredData(Selection,GenerateScoredDataPathwayDataAll,GenerateScoredDataPathways,Filters,sortedAssociatedData));

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
