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
      return a;
    }).subscribe( (result) => {
      expect(result.length).toEqual(136);
      done();
    },
    e => done(logError(e))
    );
  });

  it('Fetch mutation samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Ovarian Cancer (OV)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohortAndView(cohortDetails,VIEW_ENUM.MUTATION).do( (a) => {
      return a;
    }).subscribe( (result) => {
      expect(result.length).toEqual(142);
      done();
    },e => done(logError(e)));
  });

  it('Fetch CN samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Ovarian Cancer (OV)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohortAndView(cohortDetails,VIEW_ENUM.COPY_NUMBER).do( (a) => {
      return a;
    }).subscribe( (result) => {
      expect(result.length).toEqual(579);
      done();
    },e => done(logError(e)));
  });

  it('Fetch Gene Expression samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Lung Adenocarcinoma (LUAD)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohortAndView(cohortDetails,VIEW_ENUM.GENE_EXPRESSION).do( (a) => {
      return a ;
    }).subscribe( (result) => {
      expect(result.length).toEqual(574);
      done();
    },e => done(logError(e)));
  });

  it('Fetch Paradigm IPL samples for cohort', (done) => {
    const cohort = {
      name: 'TCGA Lung Adenocarcinoma (LUAD)'
    };
    const cohortDetails = getCohortDetails(cohort);
    getSamplesForCohortAndView(cohortDetails,VIEW_ENUM.PARADIGM).do( (a) => {
      return a;
    }).subscribe( (result) => {
      expect(result.length).toEqual(507);
      done();
    },e => done(logError(e)));
  });
});
