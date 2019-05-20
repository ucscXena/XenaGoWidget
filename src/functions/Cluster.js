

/**
 * Merge the two most closely linked clusters.
 */

Cluster.prototype.reduce = function () {
    var clusters = this.clusters,
        minLinkage = Infinity,
        minI,
        minJ;
    for (var i = 0; i < clusters.length; i++) {
        for (var j = 0; j < i; j++) {
            var linkage = this.linkageOf(clusters[i], clusters[j])

            // set the linkage as the min
            if (linkage < minLinkage) {
                minLinkage = linkage;
                minI = i;
                minJ = j;
            }
        }
    }

    clusters = this.clusters = clusters.slice();
    clusters[minI] = clusters[minI].concat(clusters[minJ]);
    clusters.splice(minJ, 1);
    var level = {
        linkage: minLinkage,
        clusters: clusters,
        from: j,
        to: i,
    };
    this.levels.push(level);
    return level
};

/**
 * Calculate the linkage between two clusters.
 */

Cluster.prototype.linkageOf = function (clusterA, clusterB) {
    // grab all the distances
    let distances = [];
    for (let k = 0; k < clusterA.length; k++) {
        for (let h = 0; h < clusterB.length; h++) {
            distances.push(this.distanceOf(clusterA[k], clusterB[h]))
        }
    }

    return this.linkage(distances)
};

/**
 * Calculate the distance between two inputs.
 */

Cluster.prototype.distanceOf = function (i, j) {
    if (i > j) return this.distances[i][j]
    return this.distances[j][i]
};

/**
 * Create the upper triangle of the symmetric, distance matrix.
 * Only i > j is valid for matrix[i][j].
 */

function createDistanceArray(input, distance) {
    var length = input.length
    var matrix = new Array(length)
    for (var i = 0; i < length; i++) {
        matrix[i] = new Array(i)
        for (var j = 0; j < i; j++)
            matrix[i][j] = distance(input[i], input[j])
    }

    return matrix
}


export function Cluster(options) {
    if (!(this instanceof Cluster)) return new Cluster(options)

    if (!Array.isArray(options.input)) throw new TypeError('input must be an array')
    if (!options.input.length) throw new Error('input must not be empty')
    if (typeof options.distance !== 'function') throw new TypeError('invalid distance function')

    if (typeof options.linkage === 'string') options.linkage = Cluster.linkages[options.linkage]

    if (typeof options.linkage !== 'function') throw new TypeError('invalid linkage function')


    this.input = options.input
    this.distance = options.distance
    this.linkage = options.linkage

    // array of distances between each input index
    this.distances = createDistanceArray(options.input, options.distance)
    // cache lookup for similarities between clusters
    this.links = Object.create(null)

    // store the current clusters by indexes
    // this is private and gets rewritten on every level
    var clusters = this.clusters = []
    for (var i = 0, l = options.input.length; i < l; i++)
        clusters.push([i])

    // store each level
    var level = {
        linkage: null,
        clusters: clusters,
    }
    this.levels = [level]

    var minClusters = Math.max(options.minClusters || 1, 1)
    var maxLinkage = typeof options.maxLinkage === 'number'
        ? options.maxLinkage
        : Infinity

    while (this.clusters.length > minClusters && level.linkage < maxLinkage)
        level = this.reduce()
    return this.levels
}
