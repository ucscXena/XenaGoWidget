export const VIEW_ENUM = {
  CNV_MUTATION:'CNV \u2229 Mutation',
  MUTATION:'Mutation',
  COPY_NUMBER:'Copy Number',
  GENE_EXPRESSION:'BPA Gene Expression',
  PARADIGM:'Paradigm IPL',
  REGULON:'Regulon Activity',
}

export function findEnumForValue(input){
  console.log('input',input)
  const view = Object.entries(VIEW_ENUM).filter( v => {
    return v[1]===input
  })
  console.log('found view',view)
  if(view) return view[0][0]
  return null
}
