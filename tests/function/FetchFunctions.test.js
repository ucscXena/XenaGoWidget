// import {getSamplesForCohort} from '../../src/functions/FetchFunctions';
import {getCohortDetails} from '../../src/functions/CohortFunctions';
// import {FILTER_ENUM} from '../../src/components/FilterSelector';
// const Rx = require('ucsc-xena-client/dist/rx');

describe('Fetch Functions', () => {

  it('Fetch all samples for cohort', () => {
    const cohort = {
      name: 'TCGA Ovarian Cancer (OV)'
    };
    const cohortDetails = getCohortDetails(cohort);
    console.log('cohor tdetails',cohortDetails);
    // let someVar ;
    // let subscriber = Rx.observable.from(getSamplesForCohort(cohortDetails,FILTER_ENUM.ALL)) .subscribe(
    //   console.log
    // );
    // console.log('sub 1',subscriber)
    // console.log('sub',JSON.stringify(subscriber))
    // const outputSamples = Rx.Observable.subscribe(
    //   getSamplesForCohort(cohortDetails,FILTER_ENUM.ALL)
    // )
    //   .flatMap( (samples) => {
    //   console.log('samples',JSON.stringify(samples));
    //   return samples ;
    // } ).subscribe( s => {
    //   console.log('subscribed output samples',JSON.stringify(s));
    //   someVar = s ;
    //   return s ;
    // });
    // console.log('output output samples',outputSamples);
    // let samples = getSamplesForCohort(cohortDetails,FILTER_ENUM.ALL).subscribe( (output) => {
    //   console.log('output',JSON.stringify(output));
    //   return output ;
    // });
    // expect(samples.length).toEqual(107+135);
  });


});

