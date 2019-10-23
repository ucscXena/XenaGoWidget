import LargePathways from '../data/genesets/geneExpressionGeneDataSet';
import GoPathways from '../data/genesets/tgac';
import FlybasePathways from '../data/genesets/flyBase';
// import PanCanPathways from '../data/genesets/pancan';

const GENE_SET_SOURCES = {
  BPA: 'BPA',
  GO: 'GO',
  FLYBASE: 'FLY BASE',
};

export function getSources(){
  return Object.keys(GENE_SET_SOURCES).map( s => {
    return {
      label: s,
      value: s,
    };
  });
}

export function getGeneSetForSource(source){
  switch (source) {
  case GENE_SET_SOURCES.BPA:
    return LargePathways;
  case GENE_SET_SOURCES.GO:
    return GoPathways;
  case GENE_SET_SOURCES.FLYBASE:
    return FlybasePathways;
  default:
    return null ;
  }
}
