import expect from 'expect';
import {getSamplesForCohort} from '../../src/functions/FetchFunctions';
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
    getSamplesForCohort(cohortDetails,FILTER_ENUM.ALL).do( (a) => {
      expect(a.length).toEqual(136);
    }).subscribe( () => done(),e => done(logError(e)));
  });


});

