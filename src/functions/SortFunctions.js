import React from "react";
import cluster from '../functions/Cluster';
import {sumTotals, sumInstances} from '../functions/util';

export function transpose(a) {
    // return a[0].map(function (_, c) { return a.map(function (r) { return r[c]; }); });
    // or in more modern dialect
    return a.length === 0 ? a : a[0].map((_, c) => a.map(r => r[c]));
}

// Euclidean distance
function distance(a, b) {
    let d = 0;
    for (let i = 0; i < a.length; i++) {
        d += Math.abs(a[i] - b[i]);
        // d += sum ;
        // d += Math.pow(a[i] - b[i], 2);
    }
    // return Math.sqrt(d);
    return d;
}

function linkage(distances) {
// Single-linkage clustering
//     return Math.min.apply(null, distances);
    // complete-linkage clustering?
    let max = 0;
    return distances.reduce((d) => d > max ? d : max);
}


function scoreColumns(prunedColumns) {
    return prunedColumns.pathways.map((el, index) => {
        let pathway = JSON.parse(JSON.stringify(el));
        pathway.density = sumInstances(prunedColumns.data[index]);
        pathway.index = index;
        return pathway;
    });
}

/**
 * Populates density for each column
 * @param prunedColumns
 */
function sortColumnDensities(prunedColumns) {

    let sortedColumns = JSON.parse(JSON.stringify(prunedColumns));
    sortedColumns.pathways = scoreColumns(prunedColumns);
    sortedColumns.pathways.sort((a, b) => b.density - a.density);

    // refilter data by index
    sortedColumns.data = sortedColumns.pathways.map(el => sortedColumns.data[el.index]);
    sortedColumns.samples = prunedColumns.samples;

    return sortedColumns;
}


/**
 * Sort by column density followed by row.
 * https://github.com/nathandunn/XenaGoWidget/issues/67
 *
 * 1. find density for each column
 * 2. sort the tissues based on first, most dense column, ties, based on next most dense column
 *
 * 3. sort / re-order column based on density (*) <- re-ordering is going to be a pain, do last
 *
 * @param prunedColumns
 * @returns {undefined}
 */
export function clusterSort(prunedColumns) {
    let sortedColumns = sortColumnDensities(prunedColumns);

    sortedColumns.data.push(prunedColumns.samples);
    let renderedData = transpose(sortedColumns.data);

    // sort samples first based on what gene in position 1 has the highest total
    // total is hits of +1 from all sources
    // if all are equal, then take the sum of all hit totals as a tiebreaker
    // if all are equal, then take the sum of all hit instances (all hits just equal 1) as a tiebreaker
    renderedData = renderedData.sort(function (a, b) {
        for (let index = 0; index < a.length; ++index) {
            if (a[index].total !== b[index].total) {
                return b[index].total - a[index].total;
            }
        }
        let sumOfTotals = sumTotals(b) - sumTotals(a);
        if (sumOfTotals !== 0) {
            return sumOfTotals;
        }
        else {
           return sumInstances(b) - sumInstances(a);
        }
    });
    renderedData = transpose(renderedData);
    let returnColumns = {};
    returnColumns.sortedSamples = renderedData[renderedData.length - 1];
    returnColumns.samples = sortedColumns.samples;
    returnColumns.pathways = sortedColumns.pathways;
    returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1);

    return returnColumns;
}

/**
 * Same as the cluster sort, but we don't sort by pathways at all, we just re-order samples
 * @param prunedColumns
 */
export function clusterSampleSort(prunedColumns) {
    // prunedColumns =
    // - data = 41 gene sets times N samples
    // - pathways = 41 gene set descriptions
    // - samples = N sample descriptions
    let transposedData = transpose(prunedColumns.data);
    let summedSamples = transposedData.map((d, index) => {
        return {index: index, score: sumTotals(d)}
    }).sort((a, b) => b.score - a.score);
    let sortedTransposedData = [];
    summedSamples.forEach((d, i) => {
        sortedTransposedData[i] = transposedData[d.index];
    });
    let untransposedData = transpose(sortedTransposedData);
    let returnColumns = prunedColumns;
    returnColumns.data = untransposedData;
    return returnColumns;
}

function generateMissingGeneSets(pathways, geneSetList) {
    let pathwayGeneSets = pathways.map(p => p.golabel);
    let missingGenes = geneSetList.filter(g => pathwayGeneSets.indexOf(g) < 0);
    let returnColumns = [];
    missingGenes.forEach(mg => {
        let newPathway = {
            density: 0,
            goid: pathways[0].goid,
            golabel: pathways[0].golabel,
            index: -1,
            gene: [mg],
        };
        returnColumns.push(newPathway);
    });

    return returnColumns;
}

function generateMissingColumns(pathways, geneList) {

    let pathwayGenes = pathways.map(p => p.gene[0]);
    let missingGenes = geneList.filter(g => pathwayGenes.indexOf(g) < 0);
    let returnColumns = [];
    missingGenes.forEach(mg => {
        let newPathway = {
            density: 0,
            goid: pathways[0].goid,
            golabel: pathways[0].golabel,
            index: -1,
            gene: [mg],
        };
        returnColumns.push(newPathway);
    });

    return returnColumns;
}

export function synchronizedGeneSetSort(prunedColumns, geneSetList) {
    let sortedColumns = JSON.parse(JSON.stringify(prunedColumns));
    sortedColumns.pathways = scoreColumns(prunedColumns);
    let missingColumns = generateMissingGeneSets(sortedColumns.pathways, geneSetList);
    sortedColumns.pathways = [...sortedColumns.pathways, ...missingColumns];

    sortedColumns.pathways.sort((a, b) => {
        let geneSetA = a.golabel;
        let geneSetB = b.golabel;
        let index1 = geneSetList.indexOf(geneSetA);
        let index2 = geneSetList.indexOf(geneSetB);

        if (index1 >= 0 && index2 >= 0) {
            return geneSetList.indexOf(geneSetA) - geneSetList.indexOf(geneSetB)
        }
        return b.density - a.density
    });
    // refilter data by index
    let columnLength = sortedColumns.data[0].length;
    sortedColumns.data = sortedColumns.pathways.map(el => {
        let columnData = sortedColumns.data[el.index];
        if (columnData) {
            return columnData
        }
        else {
            return Array.from(Array(columnLength), () => 0);
        }
    });

    sortedColumns.samples = prunedColumns.samples;

    sortedColumns.data.push(prunedColumns.samples);
    let renderedData = transpose(sortedColumns.data);

    renderedData = renderedData.sort(function (a, b) {
        for (let index = 0; index < a.length; ++index) {
            if (a[index] !== b[index]) {
                return b[index] - a[index];
            }
        }
        return sumTotals(b) - sumTotals(a)
    });

    renderedData = transpose(renderedData);
    let returnColumns = {};
    returnColumns.sortedSamples = renderedData[renderedData.length - 1];
    returnColumns.samples = sortedColumns.samples;
    returnColumns.pathways = sortedColumns.pathways;
    returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1);

    return returnColumns;
}


export function synchronizedSort(prunedColumns, geneList) {

    let sortedColumns = JSON.parse(JSON.stringify(prunedColumns));
    sortedColumns.pathways = scoreColumns(prunedColumns);
    let missingColumns = generateMissingColumns(sortedColumns.pathways, geneList);
    sortedColumns.pathways = [...sortedColumns.pathways, ...missingColumns];

    sortedColumns.pathways.sort((a, b) => {
        let geneA = a.gene[0];
        let geneB = b.gene[0];
        let index1 = geneList.indexOf(geneA);
        let index2 = geneList.indexOf(geneB);

        if (index1 >= 0 && index2 >= 0) {
            return geneList.indexOf(geneA) - geneList.indexOf(geneB)
        }
        return b.density - a.density
    });
    // refilter data by index
    let columnLength = sortedColumns.data[0].length;
    sortedColumns.data = sortedColumns.pathways.map(el => {
        let columnData = sortedColumns.data[el.index];
        if (columnData) {
            return columnData
        }
        else {
            return Array.from(Array(columnLength), () => 0);
        }
    });

    sortedColumns.samples = prunedColumns.samples;

    sortedColumns.data.push(prunedColumns.samples);
    let renderedData = transpose(sortedColumns.data);

    renderedData = renderedData.sort(function (a, b) {
        for (let index = 0; index < a.length; ++index) {
            if (a[index].total !== b[index].total) {
                return b[index].total - a[index].total;
            }
        }
        return sumTotals(b) - sumTotals(a)
    });

    renderedData = transpose(renderedData);
    let returnColumns = {};
    returnColumns.sortedSamples = renderedData[renderedData.length - 1];
    returnColumns.samples = sortedColumns.samples;
    returnColumns.pathways = sortedColumns.pathways;
    returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1);

    return returnColumns;
}


