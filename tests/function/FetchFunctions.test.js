import expect from 'expect';
import {fetchPathwayActivityMeans, getSamplesForCohort} from '../../src/functions/FetchFunctions';
import {getCohortDetails} from '../../src/functions/CohortFunctions';
import {FILTER_ENUM} from '../../src/components/FilterSelector';

function logError(err) {
  // eslint-disable-next-line no-console
  console.log(err.stack);
  return err;
}

describe('Fetch Functions', () => {

  it('Fetch all samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Ovarian Cancer (OV)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohort(cohortDetails,FILTER_ENUM.CNV_MUTATION).do( (a) => {
      expect(a.length).toEqual(136);
    }).subscribe( () => done(),e => done(logError(e)));
  });

  it('Fetch mutation samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Ovarian Cancer (OV)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohort(cohortDetails,FILTER_ENUM.MUTATION).do( (a) => {
      expect(a.length).toEqual(142);
    }).subscribe( () => done(),e => done(logError(e)));
  });

  it('Fetch CN samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Ovarian Cancer (OV)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohort(cohortDetails,FILTER_ENUM.COPY_NUMBER).do( (a) => {
      expect(a.length).toEqual(579);
    }).subscribe( () => done(),e => done(logError(e)));
  });

  it('Fetch Gene Expression samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Lung Adenocarcinoma (LUAD)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohort(cohortDetails,FILTER_ENUM.GENE_EXPRESSION).do( (a) => {
      expect(a.length).toEqual(576);
    }).subscribe( () => done(),e => done(logError(e)));
  });

  it('Test fetching pathway activity means', (done) => {
    let selectedCohorts = [];
    let samples = [];
    let geneSetLabels = [];
    fetchPathwayActivityMeans(selectedCohorts,samples,geneSetLabels,( output )=> {
      console.log(output);
      expect(true).toEqual(false);
      done();
    });
  });

});

