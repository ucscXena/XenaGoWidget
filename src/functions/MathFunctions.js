// util methods on collections

import { times } from 'underscore'


// partition a list into chunks of size n
export function partitionN(arr, n, step, pad) {
  let i; let last; let len; const
    ret = []

  step = step || n
  for (i = 0; i < arr.length; i += step) {
    ret.push(arr.slice(i, i + n))
  }

  last = ret[ret.length - 1]
  if (last) {
    len = last.length
    if (pad && len < n) {
      ret[ret.length - 1] = last.concat(pad.slice(0, n - len))
    }
  }
  return ret
}

// map two collections over fn of two values
export function map2(c0, c1, fn) {
  return c0.map((v, i) => fn(v, c1[i]))
}

// Like groupBy, but combine new elements with the group, using
// the reducing function fn.
// We use a Map for ordered, numeric keys.
export function reduceByKey(arr, keyFn = (x) => x, fn) {
  const ret = new Map()
  arr.forEach((e) => {
    const k = keyFn(e)
    ret.set(k, fn(e, k, ret.get(k)))
  })
  return ret
}

// partition n things m ways
export function partition(n, m) {
  const starts = times(m, (i) => Math.round(i * n / m))
  return starts.map((s, i) => ({
    start: s,
    size: (i === m - 1 ? n : starts[i + 1]) - s,
  }))
}

export function sumParadigm(arr) {
  let total = 0
  for (let i = 0; i < arr.length; ++i) {
    total += arr[i].paradigm  ? arr[i].paradigm : 0
  }
  return total
}

export function sumGeneExpression(arr) {
  let total = 0
  for (let i = 0; i < arr.length; ++i) {
    total += arr[i].geneExpression  ? arr[i].geneExpression : 0
  }
  return total
}

export function sumInstances(arr) {
  let total = 0
  for (let i = 0; i < arr.length; ++i) {
    total += arr[i].total > 0 ? 1 : 0
  }
  return total
}

export function sumTotals(arr) {
  let total = 0
  for (let i = 0; i < arr.length; ++i) {
    total += arr[i].total
  }
  return total
}


export function intersection(a, b) {
  const sa = new Set(a)
  return b.filter((x) => sa.has(x))
}
