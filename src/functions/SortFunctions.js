import React from "react";
import cluster from '../functions/Cluster';
import {sum, sumInstances} from '../functions/util';

function transpose(a) {
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

/**
 * Populates density for each column
 * @param prunedColumns
 */
function sortColumnHierarchical(prunedColumns) {
    let sortedPathways = prunedColumns.pathways.map((el, index) => {
        let pathway = JSON.parse(JSON.stringify(el));
        pathway.density = sumInstances(prunedColumns.data[index]);
        pathway.index = index;
        return pathway;
    });
    let sortedColumns = {};
    sortedColumns.pathways = sortedPathways;
    sortedColumns.samples = prunedColumns.samples;
    sortedColumns.data = prunedColumns.data;


    let levels = cluster({
        input: sortedColumns.data,
        distance: distance,
        linkage: linkage,
    });

    let clusterIndices = levels[levels.length - 1].clusters[0];

    let renderedArray = clusterIndices.map((el, i) => {
        return sortedColumns.data[el]
    });
    let renderedIndices = clusterIndices.map((el, i) => {
        return sortedColumns.pathways[el]
    });
    sortedColumns.data = renderedArray;
    sortedColumns.pathways = renderedIndices;

    return sortedColumns;
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
 *
 * @param prunedColumns
 */
export function overallSort(prunedColumns) {
    let sortedColumns = sortColumnDensities(prunedColumns);

    let renderedData = transpose(sortedColumns.data);

    renderedData = renderedData.sort(function (a, b) {
        return sum(b) - sum(a)
    });

    renderedData = transpose(renderedData);

    let returnColumns = {};

    returnColumns.data = renderedData;

    return returnColumns;
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

    // let sortedPathways = scoreColumns(prunedColumns);

    sortedColumns.data.push(prunedColumns.samples);
    let renderedData = transpose(sortedColumns.data);

    renderedData = renderedData.sort(function (a, b) {
        for (let index = 0; index < a.length; ++index) {
            if (a[index] !== b[index]) {
                return b[index] - a[index];
            }
        }
        return sum(b) - sum(a)
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

    sortedColumns.pathways.sort((a, b) => {
        let index1 = geneList.indexOf(a.gene[0]);
        let index2 = geneList.indexOf(b.gene[0]);
        //
        if(index1>=0 && index2 >=0){
            return geneList.indexOf(a.gene[0])-geneList.indexOf(b.gene[0])
        }
        // else
        // if(index1>=0){
        //     return 1
        // }
        // else
        // if(index2>=0){
        //     return -1
        // }
        else{
            return b.density - a.density
        }
    });
    // refilter data by index
    sortedColumns.data = sortedColumns.pathways.map(el => sortedColumns.data[el.index]);

    sortedColumns.samples = prunedColumns.samples;

    // let sortedColumns = sortColumnDensities(prunedColumns);
    sortedColumns.data.push(prunedColumns.samples);
    let renderedData = transpose(sortedColumns.data);

    // TODO: sort where the column appears based on geneList first
    // TODO: then sort by column densities
    // TODO: then stub in empty columns

    renderedData = renderedData.sort(function (a, b) {
        for (let index = 0; index < a.length; ++index) {
            if (a[index] !== b[index]) {
                return b[index] - a[index];
            }
        }
        return sum(b) - sum(a)
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
 * @param prunedColumns
 */
export function hierarchicalSort(prunedColumns) {
    let sortedColumns = sortColumnHierarchical(prunedColumns);

    let inputData = transpose(sortedColumns.data);
    sortedColumns.data.push(sortedColumns.samples);
    let renderedData = transpose(sortedColumns.data);


    let levels = cluster({
        input: inputData,
        distance: distance,
        linkage: linkage,
    });

    let clusters = levels[levels.length - 1].clusters[0];

    let returnData = clusters.map(el => renderedData[el])
    renderedData = transpose(returnData);

    let returnColumns = {};
    returnColumns.sortedSamples = renderedData[renderedData.length - 1];
    returnColumns.samples = sortedColumns.samples;
    returnColumns.pathways = sortedColumns.pathways;
    returnColumns.data = renderedData.slice(0, sortedColumns.data.length - 1);

    return returnColumns;
}

