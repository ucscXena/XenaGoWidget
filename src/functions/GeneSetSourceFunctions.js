import LargePathways from '../data/genesets/geneExpressionGeneDataSet';
import GoPathways from '../data/genesets/tgac';
import FlybasePathways from '../data/genesets/flyBase';
// import PanCanPathways from '../data/genesets/pancan';

export function getSources(){
  return [
    { name: 'LargePathways',value:LargePathways},
    { name: 'GoPathways',value:GoPathways},
    { name: 'FlybasePathways',value:FlybasePathways},
  ];
}
