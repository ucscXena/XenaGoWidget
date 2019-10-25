export const FILTER_ENUM = {
  CNV_MUTATION:'CNV \u2229 Mutation',
  MUTATION:'Mutation',
  COPY_NUMBER:'Copy Number',
  GENE_EXPRESSION:'Gene Expression',
};

export function getLabelValues(){
  return Object.entries(FILTER_ENUM).map( f => {
    return {
      label: f[1],
      value: f[0],
    };
  });
}
