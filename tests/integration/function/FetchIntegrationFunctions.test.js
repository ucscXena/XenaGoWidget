import expect from 'expect';
import { getSamplesForCohortAndView} from '../../../src/functions/FetchFunctions';
import {getCohortDetails} from '../../../src/functions/CohortFunctions';
import {VIEW_ENUM} from '../../../src/data/ViewEnum';
import {logError} from '../../ErrorLogger';

describe('Fetch Functions', () => {

  it('Fetch all samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Ovarian Cancer (OV)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohortAndView(cohortDetails,VIEW_ENUM.CNV_MUTATION).do( (a) => {
      console.log(a.length,'vs',136);
      expect(a.length).toEqual(136);
    }).subscribe( () => done(),e => done(logError(e)));
  });

  it('Fetch mutation samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Ovarian Cancer (OV)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohortAndView(cohortDetails,VIEW_ENUM.MUTATION).do( (a) => {
      console.log(a.length,'vs',136);
      expect(a.length).toEqual(142);
    }).subscribe( () => done(),e => done(logError(e)));
  });

  it('Fetch CN samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Ovarian Cancer (OV)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohortAndView(cohortDetails,VIEW_ENUM.COPY_NUMBER).do( (a) => {
      expect(a.length).toEqual(579);
    }).subscribe( () => done(),e => done(logError(e)));
  });

  it('Fetch Gene Expression samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Lung Adenocarcinoma (LUAD)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohortAndView(cohortDetails,VIEW_ENUM.GENE_EXPRESSION).do( (a) => {
      // expect(a.length).toEqual(576); // note, this used to be more but sub cohort definitions somehow lessened this
      expect(a.length).toEqual(574);
    }).subscribe( () => done(),e => done(logError(e)));
  });

  it('Fetch Paradigm IPL samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Lung Adenocarcinoma (LUAD)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohortAndView(cohortDetails,VIEW_ENUM.PARADIGM).do( (a) => {
      expect(a.length).toEqual(507);
    }).subscribe( () => done(),e => done(logError(e)));
  });
});
