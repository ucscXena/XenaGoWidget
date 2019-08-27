import expect from 'expect';
import {getSamplesFromSelectedSubCohorts} from '../../src/functions/CohortFunctions';

const inputBreast = {'name':'TCGA Breast Cancer (BRCA)','mutationDataSetId':'TCGA.BRCA.sampleMap/mutation_curated_wustl','copyNumberDataSetId':'TCGA.BRCA.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes','genomeBackgroundCopyNumber':{'host':'https://xenago.xenahubs.net','dataset':'cnv_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'genomeBackgroundMutation':{'host':'https://xenago.xenahubs.net','dataset':'mutation_sampleEvent','feature_event_K':'event_K','feature_total_pop_N':'total_pop_N'},'amplificationThreshold':2,'deletionThreshold':-2,'host':'https://tcga.xenahubs.net','subCohorts':['BRCA.Basal','BRCA.Her2','BRCA.LumA','BRCA.LumB','BRCA.Normal'],'selectedSubCohorts':['BRCA.LumB']};
// const inputCohort = {"name":"TCGA Prostate Cancer (PRAD)","mutationDataSetId":"TCGA.PRAD.sampleMap/mutation_broad","copyNumberDataSetId":"TCGA.PRAD.sampleMap/Gistic2_CopyNumber_Gistic2_all_thresholded.by_genes","genomeBackgroundCopyNumber":{"host":"https://xenago.xenahubs.net","dataset":"cnv_sampleEvent","feature_event_K":"event_K","feature_total_pop_N":"total_pop_N"},"genomeBackgroundMutation":{"host":"https://xenago.xenahubs.net","dataset":"mutation_sampleEvent","feature_event_K":"event_K","feature_total_pop_N":"total_pop_N"},"amplificationThreshold":2,"deletionThreshold":-2,"host":"https://tcga.xenahubs.net","subCohorts":["PRAD.1-ERG","PRAD.2-ETV1","PRAD.3-ETV4","PRAD.4-FLI1","PRAD.5-SPOP","PRAD.6-FOXA1","PRAD.7-IDH1","PRAD.8-other"],"selectedSubCohorts":["PRAD.1-ERG","PRAD.2-ETV1","PRAD.3-ETV4","PRAD.4-FLI1","PRAD.5-SPOP","PRAD.6-FOXA1","PRAD.7-IDH1","PRAD.8-other"]};

describe('Fetch functions', () => {

  it('Get samples from selected sub', () => {
    let subSamples = getSamplesFromSelectedSubCohorts(inputBreast);
    expect(subSamples.length).toEqual(219);
  });

});

