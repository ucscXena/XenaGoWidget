// util methods on collections

import {times} from 'underscore';


// partition a list into chunks of size n
export function partitionN(arr, n, step, pad) {
    var i, last, len, ret = [];

    step = step || n;
    for (i = 0; i < arr.length; i += step) {
        ret.push(arr.slice(i, i + n));
    }

    last = ret[ret.length - 1];
    if (last) {
        len = last.length;
        if (pad && len < n) {
            ret[ret.length - 1] = last.concat(pad.slice(0, n - len));
        }
    }
    return ret;
}

// map two collections over fn of two values
export function map2(c0, c1, fn) {
    return c0.map((v, i) => fn(v, c1[i]));
}

// Like groupBy, but combine new elements with the group, using
// the reducing function fn.
// We use a Map for ordered, numeric keys.
export function reduceByKey(arr, keyFn = x => x, fn) {
    var ret = new Map();
    arr.forEach(e => {
        var k = keyFn(e);
        ret.set(k, fn(e, k, ret.get(k)));
    });
    return ret;
}

// partition n things m ways
export function partition(n, m) {
    var starts = times(m, i => Math.round(i * n / m))
    return starts.map((s, i) => ({
		start: s,
		size: (i === m - 1 ? n : starts[i + 1]) - s
	}));
}

export function sumInstances(arr) {
    let total = 0;
    for (let i = 0; i < arr.length; ++i) {
        total += arr[i] > 0 ? 1 : 0 ;
    }
    return total;
}

export function sum(arr) {
    let total = 0;
    for (let i = 0; i < arr.length; ++i) {
        total += arr[i];
    }
    return total;
}

