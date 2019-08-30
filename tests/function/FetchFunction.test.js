import expect from 'expect';
import {getSamplesFromSelectedSubCohorts} from '../../src/functions/CohortFunctions';
import {calculateSamples} from '../../src/functions/FetchFunctions';
import {TEST_AVAILABLE_OVARIAN_SAMPLES, TEST_MESOTHELIOMA_SAMPLES} from './CohortFunctions.test';

const BREAST_SUBCOHORTS = {'name':'TCGA Breast Cancer (BRCA)','mutationDataSetId':'TCGA.BRCA.sampleMap/mutation_curated_wustl','copyNumberDataSetId':'TCGA.BRCA.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes','genomeBackgroundCopyNumber':{'host':'https://xenago.xenahubs.net','dataset':'cnv_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'genomeBackgroundMutation':{'host':'https://xenago.xenahubs.net','dataset':'mutation_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'amplificationThreshold':2,'deletionThreshold':-2,'host':'https://tcga.xenahubs.net','subCohorts':['BRCA.Basal','BRCA.Her2','BRCA.LumA','BRCA.LumB','BRCA.Normal'],'selectedSubCohorts':['BRCA.LumB']};
// const inputCohort = {"name":"TCGA Prostate Cancer (PRAD)","mutationDataSetId":"TCGA.PRAD.sampleMap/mutation_broad","copyNumberDataSetId":"TCGA.PRAD.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes","genomeBackgroundCopyNumber":{"host":"https://xenago.xenahubs.net","dataset":"cnv_sampleEvent","feature_event_K":"event_K","feature_total_pop_N":"total_pop_N"},"genomeBackgroundMutation":{"host":"https://xenago.xenahubs.net","dataset":"mutation_sampleEvent","feature_event_K":"event_K","feature_total_pop_N":"total_pop_N"},"amplificationThreshold":2,"deletionThreshold":-2,"host":"https://tcga.xenahubs.net","subCohorts":["PRAD.1-ERG","PRAD.2-ETV1","PRAD.3-ETV4","PRAD.4-FLI1","PRAD.5-SPOP","PRAD.6-FOXA1","PRAD.7-IDH1","PRAD.8-other"],"selectedSubCohorts":["PRAD.1-ERG","PRAD.2-ETV1","PRAD.3-ETV4","PRAD.4-FLI1","PRAD.5-SPOP","PRAD.6-FOXA1","PRAD.7-IDH1","PRAD.8-other"]};

describe('Fetch functions', () => {

  it('Get samples from selected sub', () => {
    let subSamples = getSamplesFromSelectedSubCohorts(BREAST_SUBCOHORTS);
    expect(subSamples.length).toEqual(219);
  });

  // TODO: use Marble or TestScheduler to add tests so we don't have react state update errors because we use subscribe, etc.
  // it('Get samples for a cohort', () => {
  //   console.log(JSON.stringify('A'))
  //   const cohort = {'name':'TCGA Ovarian Cancer (OV)','mutationDataSetId':'TCGA.OV.sampleMap/mutation_wustl','copyNumberDataSetId':'TCGA.OV.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes','genomeBackgroundCopyNumber':{'host':'https://xenago.xenahubs.net','dataset':'cnv_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'genomeBackgroundMutation':{'host':'https://xenago.xenahubs.net','dataset':'mutation_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'amplificationThreshold':2,'deletionThreshold':-2,'host':'https://tcga.xenahubs.net','subCohorts':['OVCA.Differentiated','OVCA.Immunoreactive','OVCA.Mesenchymal','OVCA.Proliferative'],'selectedSubCohorts':['OVCA.Differentiated','OVCA.Immunoreactive','OVCA.Mesenchymal','OVCA.Proliferative']};
  //   const sampleFunction = getSamplesForCohort(cohort).flatMap( (samples) => {
  //     console.log('returned samples',JSON.stringify(samples))
  //     expect(136).toEqual(samples.length);
  //     expect(availableOvarianSamples).toEqual(samples);
  //   });
  //   sampleFunction.subscribe(
  //     (x) => {
  //       console.log('subscribed x')
  //       console.log(JSON.stringify(x));
  //     }
  //   );
  //   console.log(JSON.stringify('BBBBBBBBB'));
  // });


  it('Calculate samples with all sub cohorts', () => {
    const cohort = {'name':'TCGA Ovarian Cancer (OV)','mutationDataSetId':'TCGA.OV.sampleMap/mutation_wustl','copyNumberDataSetId':'TCGA.OV.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes','genomeBackgroundCopyNumber':{'host':'https://xenago.xenahubs.net','dataset':'cnv_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'genomeBackgroundMutation':{'host':'https://xenago.xenahubs.net','dataset':'mutation_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'amplificationThreshold':2,'deletionThreshold':-2,'host':'https://tcga.xenahubs.net','subCohorts':['OVCA.Differentiated','OVCA.Immunoreactive','OVCA.Mesenchymal','OVCA.Proliferative'],'selectedSubCohorts':['OVCA.Differentiated','OVCA.Immunoreactive','OVCA.Mesenchymal','OVCA.Proliferative']};
    const calculatedSubCohort = ['TCGA-04-1638-01','TCGA-04-1648-01','TCGA-04-1649-01','TCGA-04-1651-01','TCGA-04-1652-01','TCGA-09-1670-01','TCGA-20-1686-01','TCGA-20-1687-01','TCGA-23-1029-01','TCGA-23-1111-01','TCGA-24-1844-01','TCGA-24-1845-01','TCGA-29-1694-01','TCGA-29-1696-01','TCGA-29-1771-01','TCGA-29-1776-01','TCGA-29-1778-01','TCGA-30-1714-01','TCGA-61-1899-01','TCGA-61-1901-01','TCGA-61-1904-01','TCGA-61-1906-01','TCGA-61-1910-01','TCGA-20-1685-01','TCGA-24-1842-01','TCGA-24-1843-01','TCGA-24-1846-01','TCGA-24-1847-01','TCGA-29-1688-01','TCGA-29-1699-01','TCGA-29-1701-01','TCGA-29-1707-01','TCGA-29-1710-01','TCGA-29-1711-01','TCGA-29-1761-01','TCGA-29-1769-01','TCGA-29-1781-01','TCGA-29-1784-01','TCGA-29-1785-01','TCGA-30-1855-01','TCGA-30-1856-01','TCGA-61-1725-01','TCGA-61-1738-01','TCGA-61-1740-01','TCGA-61-1895-01','TCGA-61-1907-01','TCGA-61-1911-01','TCGA-61-1913-01','TCGA-61-1914-01','TCGA-61-1915-01','TCGA-20-1682-01','TCGA-24-1849-01','TCGA-29-1690-01','TCGA-29-1693-01','TCGA-29-1695-01','TCGA-29-1698-01','TCGA-29-1705-01','TCGA-29-1764-01','TCGA-29-1766-01','TCGA-29-1768-01','TCGA-29-1770-01','TCGA-29-1777-01','TCGA-29-1783-01','TCGA-30-1718-01','TCGA-30-1857-01','TCGA-61-1733-01','TCGA-61-1737-01','TCGA-04-1646-01','TCGA-04-1655-01','TCGA-09-1673-01','TCGA-09-1674-01','TCGA-20-1683-01','TCGA-20-1684-01','TCGA-23-1114-01','TCGA-23-1809-01','TCGA-24-1850-01','TCGA-29-1691-01','TCGA-29-1697-01','TCGA-29-1702-01','TCGA-29-1703-01','TCGA-29-1762-01','TCGA-29-1763-01','TCGA-29-1774-01','TCGA-29-1775-01','TCGA-57-1586-01','TCGA-61-1741-01','TCGA-61-1900-01'];
    expect(calculateSamples(TEST_AVAILABLE_OVARIAN_SAMPLES,cohort)).toEqual(calculatedSubCohort);
  });

  it('Calculate samples with ONE sub cohorts', () => {
    const cohort = {'name':'TCGA Ovarian Cancer (OV)','mutationDataSetId':'TCGA.OV.sampleMap/mutation_wustl','copyNumberDataSetId':'TCGA.OV.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes','genomeBackgroundCopyNumber':{'host':'https://xenago.xenahubs.net','dataset':'cnv_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'genomeBackgroundMutation':{'host':'https://xenago.xenahubs.net','dataset':'mutation_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'amplificationThreshold':2,'deletionThreshold':-2,'host':'https://tcga.xenahubs.net','subCohorts':['OVCA.Differentiated','OVCA.Immunoreactive','OVCA.Mesenchymal','OVCA.Proliferative'],'selectedSubCohorts':['OVCA.Differentiated']};
    const calculatedSubCohort = ['TCGA-04-1638-01','TCGA-04-1648-01','TCGA-04-1649-01','TCGA-04-1651-01','TCGA-04-1652-01','TCGA-09-1670-01','TCGA-20-1686-01','TCGA-20-1687-01','TCGA-23-1029-01','TCGA-23-1111-01','TCGA-24-1844-01','TCGA-24-1845-01','TCGA-29-1694-01','TCGA-29-1696-01','TCGA-29-1771-01','TCGA-29-1776-01','TCGA-29-1778-01','TCGA-30-1714-01','TCGA-61-1899-01','TCGA-61-1901-01','TCGA-61-1904-01','TCGA-61-1906-01','TCGA-61-1910-01'];
    expect(calculateSamples(TEST_AVAILABLE_OVARIAN_SAMPLES,cohort)).toEqual(calculatedSubCohort);
  });

  it('Calculate samples without sub cohorts', () => {
    const cohort = {'name':'TCGA Mesothelioma (MESO)','mutationDataSetId':'TCGA.MESO.sampleMap/mutation_broad','copyNumberDataSetId':'TCGA.MESO.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes','genomeBackgroundCopyNumber':{'host':'https://xenago.xenahubs.net','dataset':'cnv_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'genomeBackgroundMutation':{'host':'https://xenago.xenahubs.net','dataset':'mutation_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'amplificationThreshold':2,'deletionThreshold':-2,'host':'https://tcga.xenahubs.net','subCohorts':[],'selectedSubCohorts':[]};
    expect(calculateSamples(TEST_MESOTHELIOMA_SAMPLES,cohort)).toEqual(TEST_MESOTHELIOMA_SAMPLES);
  });
});

