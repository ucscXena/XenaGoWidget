import expect from 'expect';
import {addIndepProb} from '../../src/functions/DataFunctions';

describe('Test statistical function', () => {

  it('Calculates indep function properly', () => {
    expect([addIndepProb([3])]).toContain(3);
  });
  it('Calculates indep function properly 1', () => {
    expect([addIndepProb([3,3])]).toContain(-3);
  });
  it('Calculates multiple function properly 2', () => {
    expect([addIndepProb([0.2,0.6])]).toContain(0.68);
  });
  it('Calculates multiple function properly 3', () => {
    expect([addIndepProb([0.8,0.05])]).toContain(0.81);
  });
});
