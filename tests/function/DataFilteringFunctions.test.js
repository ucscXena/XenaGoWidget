import expect from 'expect'
import {
  findPruneData,
  pruneColumns,
  calculateExpectedProb,
  calculateGeneSetExpected,
  filterCopyNumbers,
  filterMutations, calculateAssociatedData
} from '../../src/functions/DataFunctions'

import CalculateAssociatedDataPathwayDataCnvMutation from '../data/CalculateAssociatedDataPathwayDataCnvMutation'
import CalculateAssociatedDataPathwayDataMutation from '../data/CalculateAssociatedDataPathwayDataMutation'
import CalculateAssociatedDataPathwayDataCopyNumber from '../data/CalculateAssociatedDataPathwayDataCopyNumber'

import FindPruneData1 from '../data/FindPruneAssociatedData1'
import FindPruneDataKey1 from '../data/FindPruneDataKey1'
import FindPruneDataOutput1 from '../data/FindPruneDataOutput1'

import ExpectedGeneSetDataCnvMutation from '../data/ExpectedGeneSetDataCnvMutation'
import ExpectedGeneSetDataMutation from '../data/ExpectedGeneSetDataMutation'
import ExpectedGeneSetDataCopyNumber from '../data/ExpectedGeneSetDataCopyNumber'

import PruneColumnData1 from '../data/PruneColumnData1'
import PruneColumnPathwaysData1 from '../data/PrunePathwaysData1'
import PruneColumnOutput1 from '../data/PruneColumnOutput1'

import FilterMutationExpression1 from '../data/FilterMutationExpression1'
import FilterMutationOutput1 from '../data/FilterMutationOutput1'
import FilterMutationPathways1 from '../data/FilterMutationPathways1'
import FilterMutationReturnArray1 from '../data/FilterMutationReturnArray1'
import FilterMutationSamples1 from '../data/FilterMutationSamples1'

import FilterCopyNumber1 from '../data/FilterCopyNumber1'
import FilterCopyNumberGeneSetGeneList1 from '../data/FilterCopyNumberGeneSetGeneList1'
import FilterCopyNumberOutput1 from '../data/FilterCopyNumberOutput1'
import FilterCopyNumberReturnArray1 from '../data/FilterCopyNumberReturnArray1'

import FilterCopyNumberGeneInput1 from '../data/FilterCopyNumberGeneInput1'
import FilterCopyNumberGeneGeneList1 from '../data/FilterCopyNumberGeneGeneList1'
import FilterMutationGeneExpression1 from '../data/FilterMutationGeneExpression1'
import FilterMutationGeneOutput1 from '../data/FilterMutationGeneOutput1'
import FilterMutationGeneReturnArray1 from '../data/FilterMutationGeneReturnArray1'
import FilterMutationGeneSamples1 from '../data/FilterMutationGeneSamples1'
import FilterCopyNumberGeneReturnArray1 from '../data/FilterCopyNumberGeneReturnArray1'

import FilterBothExpression1 from '../data/FilterBothExpression1'
import FilterBothReturnArray1 from '../data/FilterBothReturnArray1'
import FilterBothSamples1 from '../data/FilterBothSamples1'
import FilterBothCopyNumber1 from '../data/FilterBothCopyNumber1'
import FilterBothGeneList1 from '../data/FilterBothGeneList1'
import FilterBothOutput1 from '../data/FilterBothOutput1'
import {VIEW_ENUM} from '../../src/data/ViewEnum'
import {sumInstances} from '../../src/functions/MathFunctions'

describe('Data Filtering Functions', () => {

  it('Filter Mutations for Gene Set', () => {
    expect(FilterMutationOutput1).toEqual(filterMutations(FilterMutationExpression1, FilterMutationReturnArray1, FilterMutationSamples1, FilterMutationPathways1))
  })

  it('Filter Copy Numbers for Gene Set', () => {
    expect(FilterCopyNumberOutput1).toEqual(filterCopyNumbers(FilterCopyNumber1, FilterCopyNumberReturnArray1, FilterCopyNumberGeneSetGeneList1 , FilterMutationPathways1))
  })

  it('Filter Copy Numbers for one Gene', () => {
    const pathways = [{'goid':'','golabel':'DUT','gene':['DUT']}]
    const outputFile = filterCopyNumbers(FilterCopyNumberGeneInput1, FilterCopyNumberGeneReturnArray1, FilterCopyNumberGeneGeneList1, pathways)
    let finalSum = outputFile[0].reduce( (a,b) => {
      return a + b.total
    },0 )
    expect(83).toEqual(outputFile[0].length)
    expect(1).toEqual(outputFile.length)
    expect(4).toEqual(finalSum)
  })

  it('Filter Mutations for one Gene', () => {
    const pathways = [{'goid':'','golabel':'LATS2','gene':['LATS2']}]
    const outputFile = filterMutations(FilterMutationGeneExpression1, FilterMutationGeneReturnArray1, FilterMutationGeneSamples1, pathways)
    let finalSum = outputFile[0].reduce( (a,b) => {
      return a + b.total
    },0 )
    expect(83).toEqual(outputFile[0].length)
    expect(1).toEqual(outputFile.length)
    expect(11).toEqual(finalSum)
    expect(outputFile).toEqual(FilterMutationGeneOutput1)
  })

  it('Filter Both for one Gene', () => {
    const pathways = [{'goid':'','golabel':'LATS2','gene':['LATS2']}]
    let outputFile = filterMutations(FilterBothExpression1, FilterBothReturnArray1, FilterBothSamples1, pathways)
    let intermediateSum = outputFile[0].reduce( (a,b) => {
      return a + b.total
    },0 )
    expect(83).toEqual(outputFile[0].length)
    expect(1).toEqual(outputFile.length)
    expect(11).toEqual(intermediateSum)
    outputFile = filterCopyNumbers(FilterBothCopyNumber1, outputFile, FilterBothGeneList1, pathways)

    let finalSum = outputFile[0].reduce( (a,b) => {
      return a + b.total
    },0 )
    expect(83).toEqual(outputFile[0].length)
    expect(1).toEqual(outputFile.length)
    expect(12).toEqual(finalSum)
    expect(outputFile).toEqual(FilterBothOutput1)
  })

  it('Find pruned columns', () => {
    expect(FindPruneDataOutput1).toEqual(findPruneData(FindPruneData1,FindPruneDataKey1))
  })

  it('Prune columns', () => {
    expect(PruneColumnOutput1).toEqual(pruneColumns(PruneColumnData1,PruneColumnPathwaysData1,0))
  })

  it('Calculates expected probability', () => {
    const inputPathway = {'goid':'','golabel':'TP53 (Pancan Atlas)','gene':['TP53','MDM2','MDM4','ATM','CHEK2','RPS6KA3'],'firstObserved':116,'firstTotal':148,'firstNumSamples':136,'firstExpected':36.0005741958846,'firstChiSquared':241.77183912800558,'secondObserved':150,'secondTotal':188,'secondNumSamples':492,'secondExpected':53.40942510070341,'secondChiSquared':195.95547707551532}
    const inputExpected = 1506
    const inputTotal = 25000
    const outputProb = 0.3112128622809085
    expect(calculateExpectedProb(inputPathway,inputExpected,inputTotal)).toEqual(outputProb)
  })

  it('Calculates Gene Set Expected CNV / Mutation', () => {
    const output = {'Notch signaling':4.5097662980407565,'Hippo signaling':5.4311390819539085,'DNA base excision repair':5.867413965468239,'DNA strand break joining':3.5163871774845146,'Poly(ADP-ribose) polymerase (PARP)':1.8699772076189347,'Direct reversal of DNA damage':1.8699772076189347,'Repair of DNA-topoisomerase crosslinks':1.2737478471126893,'Mismatch excision repair':5.4311390819539085,'Nucleotide excision repair':12.260673085628401,'Homologous recombination':9.52227410527737,'Fanconi anemia':8.196251012016068,'Non-homologous DNA end-joining':4.022638000650218,'Modulation of nucleotide pools':1.8699772076189347,'DNA polymerase':7.470088010750064,'Editing and processing nucleases':4.5097662980407565,'Ubiquitination and modification':5.867413965468239,'Chromatin structure and modification':1.8699772076189347,'Sensitivity to DNA damaging agents':2.989775095697508,'Known/suspected DNA repair function':4.978914913064097,'Conserved DNA damage response':7.470088010750064,'DNA damage checkpoint':16.138553030489735,'PI3-K signaling':9.52227410527737,'Wnt signaling':16.886089952234478,'Intrinsic apoptotic pathway':24.18910537109285,'Extrinsic apoptotic pathway':22.66147567797578,'Cell cycle':21.51188302355258,'Histone modification':27.17017176740131,'Oxidative stress':20.991653131552383,'Ras signaling':25.21575894181112,'TGF-B signaling':20.672102162334276,'TP53 signaling':20.247168120645547,'cell cycle (Pancan Atlas)':7.470088010750064,'HIPPO (Pancan Atlas)':13.812252944602514,'MYC (Pancan Atlas)':6.695656628511836,'NOTCH (Pancan Atlas)':18.768750831457954,'NRF2 (Pancan Atlas)':1.8699772076189347,'PI3K (Pancan Atlas)':11.768025466623026,'TGF-Beta (Pancan Atlas)':4.022638000650218,'RTK RAS (Pancan Atlas)':20.15852896942554,'TP53 (Pancan Atlas)':3.5163871774845146,'WNT (Pancan Atlas)':18.42937031246883,'FOXA1_tf_targets':31.433145029215243,'Insulin/IGF-PI3K pathway branch (FlyBase ortho set)':16.59541298546123,'Hedgehog (FlyBase ortho set)':8.542753380801384,'EGFR (FlyBase ortho set)':16.59541298546123,'BMP-SMAD1/5/8 (FlyBase ortho set)':12.956502012029475,'Activin/myostatin-SMAD2/3 (FlyBase ortho set)':7.089232976389052}
    expect(calculateGeneSetExpected(ExpectedGeneSetDataCnvMutation,VIEW_ENUM.CNV_MUTATION)).toEqual(output)
  })

  it('Calculates Gene Set Expected Mutation', () => {
    const output = {'Notch signaling':0.6689174105766142,'Hippo signaling':0.8292323615244971,'DNA base excision repair':0.9084338979929986,'DNA strand break joining':0.5059586333614036,'Poly(ADP-ribose) polymerase (PARP)':0.25630175129450083,'Direct reversal of DNA damage':0.25630175129450083,'Repair of DNA-topoisomerase crosslinks':0.17162822192887695,'Mismatch excision repair':0.8292323615244971,'Nucleotide excision repair':2.3782277307008,'Homologous recombination':1.6684776528683907,'Fanconi anemia':1.3710942602398464,'Non-homologous DNA end-joining':0.5877757822829802,'Modulation of nucleotide pools':0.25630175129450083,'DNA polymerase':1.219179982742328,'Editing and processing nucleases':0.6689174105766142,'Ubiquitination and modification':0.9084338979929986,'Chromatin structure and modification':0.25630175129450083,'Sensitivity to DNA damaging agents':0.4234509282173595,'Known/suspected DNA repair function':0.7493981746764127,'Conserved DNA damage response':1.219179982742328,'DNA damage checkpoint':3.681689703790859,'PI3-K signaling':1.6684776528683907,'Wnt signaling':3.9881582500977935,'Intrinsic apoptotic pathway':8.954229371864841,'Extrinsic apoptotic pathway':7.469668054650858,'Cell cycle':6.556411744028801,'Histone modification':13.079052259388005,'Oxidative stress':6.189380667553275,'Ras signaling':10.169896045041654,'TGF-B signaling':5.976357292629248,'TP53 signaling':5.706503135298357,'cell cycle (Pancan Atlas)':1.219179982742328,'HIPPO (Pancan Atlas)':2.8501569332314647,'MYC (Pancan Atlas)':1.0649929817869208,'NOTCH (Pancan Atlas)':4.8705924098215325,'NRF2 (Pancan Atlas)':0.25630175129450083,'PI3K (Pancan Atlas)':2.2398252566373467,'TGF-Beta (Pancan Atlas)':0.5877757822829802,'RTK RAS (Pancan Atlas)':5.652036435263719,'TP53 (Pancan Atlas)':0.5059586333614036,'WNT (Pancan Atlas)':4.698157173037707,'FOXA1_tf_targets':22.383302381430436,'Insulin/IGF-PI3K pathway branch (FlyBase ortho set)':3.866380183472916,'Hedgehog (FlyBase ortho set)':1.4462288210355092,'EGFR (FlyBase ortho set)':3.866380183472916,'BMP-SMAD1/5/8 (FlyBase ortho set)':2.5827834351900183,'Activin/myostatin-SMAD2/3 (FlyBase ortho set)':1.1423766639790847}
    expect(calculateGeneSetExpected(ExpectedGeneSetDataMutation,VIEW_ENUM.MUTATION)).toEqual(output)
  })

  it('Calculates Gene Set Expected Copy Number', () => {
    const output = {'Notch signaling':3.8955179554270902,'Hippo signaling':4.6840406689101055,'DNA base excision repair':5.056486526471938,'DNA strand break joining':3.042461315509973,'Poly(ADP-ribose) polymerase (PARP)':1.6222169443064138,'Direct reversal of DNA damage':1.6222169443064138,'Repair of DNA-topoisomerase crosslinks':1.106001881675267,'Mismatch excision repair':4.6840406689101055,'Nucleotide excision repair':10.445018060747351,'Homologous recombination':8.152814856867948,'Fanconi anemia':7.03437145143225,'Non-homologous DNA end-joining':3.4775726088814536,'Modulation of nucleotide pools':1.6222169443064138,'DNA polymerase':6.419500629963031,'Editing and processing nucleases':3.8955179554270902,'Ubiquitination and modification':5.056486526471938,'Chromatin structure and modification':1.6222169443064138,'Sensitivity to DNA damaging agents':2.589042242799637,'Known/suspected DNA repair function':4.2973501615824645,'Conserved DNA damage response':6.419500629963031,'DNA damage checkpoint':13.651224629682833,'PI3-K signaling':8.152814856867948,'Wnt signaling':14.263466271084967,'Intrinsic apoptotic pathway':20.02810808156473,'Extrinsic apoptotic pathway':18.876838360907044,'Cell cycle':17.98371507017859,'Histone modification':22.10614647141871,'Oxidative stress':17.573876058965816,'Ras signaling':20.771714880686368,'TGF-B signaling':17.320679924100826,'TP53 signaling':16.98246049878953,'cell cycle (Pancan Atlas)':6.419500629963031,'HIPPO (Pancan Atlas)':11.733538294599937,'MYC (Pancan Atlas)':5.761898038950383,'NOTCH (Pancan Atlas)':15.794597027358781,'NRF2 (Pancan Atlas)':1.6222169443064138,'PI3K (Pancan Atlas)':10.034355777777508,'TGF-Beta (Pancan Atlas)':3.4775726088814536,'RTK RAS (Pancan Atlas)':16.911706649067586,'TP53 (Pancan Atlas)':3.042461315509973,'WNT (Pancan Atlas)':15.51990298968122,'FOXA1_tf_targets':24.802805067980135,'Insulin/IGF-PI3K pathway branch (FlyBase ortho set)':14.02565317212629,'Hedgehog (FlyBase ortho set)':7.327173207128869,'EGFR (FlyBase ortho set)':14.02565317212629,'BMP-SMAD1/5/8 (FlyBase ortho set)':11.023784460010178,'Activin/myostatin-SMAD2/3 (FlyBase ortho set)':6.096340162479786}
    expect(calculateGeneSetExpected(ExpectedGeneSetDataCopyNumber,VIEW_ENUM.COPY_NUMBER)).toEqual(output)
  })

  it('Calculate Observed Cnv Mutation', () => {
    const outputScore = [8,8,3,2,4,0,2,2,7,7,5,4,3,4,8,7,1,4,4,17,16,14,18,26,24,21,32,24,32,24,22,15,19,8,20,3,15,3,28,11,16,31,21,11,23,15,4]
    expect(calculateAssociatedData(CalculateAssociatedDataPathwayDataCnvMutation,VIEW_ENUM.CNV_MUTATION).map((pathway) => sumInstances(pathway))).toEqual(outputScore)
  })

  it('Calculate Observed Copy Number', () => {
    const outputScore = [5,7,2,2,4,0,2,1,5,7,4,3,3,2,8,7,0,3,3,11,14,10,16,22,19,15,22,18,24,18,18,13,13,4,16,0,11,2,16,5,13,24,17,6,15,12,3]
    expect(calculateAssociatedData(CalculateAssociatedDataPathwayDataCopyNumber,VIEW_ENUM.COPY_NUMBER).map((pathway) => sumInstances(pathway))).toEqual(outputScore)
  })

  it('Calculate Observed Mutation', () => {
    const outputScore = [3,1,1,0,0,0,0,1,2,0,1,1,0,2,1,0,1,1,1,7,2,4,3,16,12,10,23,13,23,10,10,3,9,4,6,3,6,1,18,6,4,25,6,5,13,3,1]
    expect(calculateAssociatedData(CalculateAssociatedDataPathwayDataMutation,VIEW_ENUM.MUTATION).map((pathway) => sumInstances(pathway))).toEqual(outputScore)
  })

})
