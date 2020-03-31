import React from 'react'
import PureComponent from './PureComponent'
import {AppStorageHandler} from '../service/AppStorageHandler'
import NavigationBar from './NavigationBar'
import {GeneSetSelector} from './GeneSetSelector'
import {
  calculateAllPathways,
  calculateAssociatedData,
  generateScoredData,
  generateZScoreForBoth, getSelectedGeneSetIndex,
  isViewGeneExpression, mergeGeneSetAndGeneDetailData, pruneGeneSelection,
} from '../functions/DataFunctions'
import BaseStyle from '../css/base.css'
import VerticalGeneSetScoresView from './VerticalGeneSetScoresView'
import FaConfigure from 'react-icons/lib/fa/cog'
// import FaConfigure from 'react-icons/lib/fa/cogs'
import {Dialog} from 'react-toolbox'
import {
  fetchBestPathways,
  fetchCombinedCohorts,
  fetchSampleData,
  getCohortDataForGeneExpressionView,
  getGeneSetsForView,
} from '../functions/FetchFunctions'

const xenaQuery = require('ucsc-xena-client/dist/xenaQuery')
const {sparseDataMatchPartialField, refGene} = xenaQuery
import CrossHairH from './CrossHairH'
import CrossHairV from './CrossHairV'
import {
  getCohortDetails,
  getSubCohortsOnlyForCohort,
  // getViewsForCohort,
} from '../functions/CohortFunctions'
import {isEqual} from 'underscore'
import update from 'immutability-helper'
import {
  scorePathway, sortAssociatedData, sortGeneDataWithSamples,
} from '../functions/SortFunctions'
import QueryString from 'querystring'
import {
  calculateCohortColors,
  calculateCohorts,
  calculateFilter,
  calculateGeneSet,
  generateUrl,
} from '../functions/UrlFunctions'
import GeneSetEditor from './GeneSetEditor'
import Button from 'react-toolbox/lib/button'
// import FaSortAsc from 'react-icons/lib/fa/sort-alpha-asc'
// import FaSortDesc from 'react-icons/lib/fa/sort-alpha-desc'
// import {intersection} from '../functions/MathFunctions'
import {SORT_ENUM, SORT_ORDER_ENUM} from '../data/SortEnum'
// import {CohortEditorSelector} from './CohortEditorSelector'
import {GeneSetLegend} from './GeneSetLegend'
import {CnvMutationLegend} from './CnvMutationLegend'
import {GeneSetInformationColumn} from './GeneSetInformationColumn'
import {CohortEditorSelector} from './CohortEditorSelector'

const VIEWER_HEIGHT = 500
const VERTICAL_SELECTOR_WIDTH = 220
export const VERTICAL_GENESET_DETAIL_WIDTH = 180
const BORDER_OFFSET = 2

export const MIN_FILTER = 2
export const MIN_GENE_WIDTH_PX = 80// 8 or less
export const MAX_GENE_WIDTH = 85
export const MAX_GENE_LAYOUT_WIDTH_PX = 12 * MAX_GENE_WIDTH // 85 genes

export const DEFAULT_GENE_SET_LIMIT = 45

const LOAD_STATE = {
  UNLOADED: 'unloaded',
  LOADING: 'loading',
  LOADED: 'loaded',
}

let currentLoadState = LOAD_STATE.UNLOADED

/**
 * refactor that from index
 */
export default class XenaGeneSetApp extends PureComponent {
  constructor(props) {
    super(props)

    const pathways = AppStorageHandler.getPathways()
    const urlVariables = QueryString.parse(location.hash.substr(1))

    const filter = calculateFilter(urlVariables)
    const selectedGeneSet = calculateGeneSet(urlVariables, pathways)
    // we have to load the sub cohorts before we load the cohorrts
    AppStorageHandler.storeSubCohorts(
      this.calculateSubCohortSamples(urlVariables))
    const cohorts = calculateCohorts(urlVariables)
    const cohortColors = calculateCohortColors(urlVariables)

    this.state = {
      associatedData: [],
      selectedCohort: cohorts,
      subCohortCounts: [],
      cohortColors,
      fetch: false,
      automaticallyReloadPathways: true,
      currentLoadState: LOAD_STATE.LOADING,
      reloadPathways: process.env.NODE_ENV !== 'test',
      loading: LOAD_STATE.UNLOADED,
      pathwaySelection: selectedGeneSet,
      showColorEditor: false,
      showCohortEditor: false,
      sortViewOrder: SORT_ORDER_ENUM.DESC,
      sortViewBy: urlVariables.geneSetSortMethod ?urlVariables.geneSetSortMethod : SORT_ENUM.DIFF,
      filterOrder: SORT_ORDER_ENUM.DESC,
      filterBy: urlVariables.geneSetFilterMethod ?urlVariables.geneSetFilterMethod :SORT_ENUM.CONTRAST_DIFF,
      filter: filter,
      hoveredPathway: undefined,
      geneData: [{}, {}],
      pathwayData: [{}, {}],
      showGeneSetSearch: false,
      geneHits: [],
      selectedGene: undefined,
      reference: refGene['hg38'],
      limit: 25,
      geneSetLimit: urlVariables.geneSetLimit ?urlVariables.geneSetLimit : DEFAULT_GENE_SET_LIMIT,
      highlightedGene: undefined,
      collapsed: true,
      mousing: false,
      x: -1,
      y: -1,
      geneStateColors: {
        highDomain: 100,
        midDomain: 0,
        lowDomain: -100,
        lowColor: '#0000ff',
        midColor: '#ffffff',
        highColor: '#ff0000',
        gamma: 1.0,
        geneGamma: 1.0,
        linkDomains: true,
        shadingValue: 10,
      },
    }
  }

  componentDidUpdate() {
    const generatedUrl = generateUrl(
      this.state.filter,
      this.state.pathwaySelection.pathway.golabel,
      this.state.selectedCohort[0].name,
      this.state.selectedCohort[1].name,
      this.state.selectedCohort[0].selectedSubCohorts,
      this.state.selectedCohort[1].selectedSubCohorts,
    )
    if (location.hash !== generatedUrl) {
      location.hash = generatedUrl
    }
  }

  queryGenes = (geneQuery) => {
    const {reference: {host, name}, limit} = this.state
    if (geneQuery.trim().length === 0) {
      this.setState({
        geneHits: [],
      })
      return
    }
    const subscriber = sparseDataMatchPartialField(host, 'name2', name,
      geneQuery,
      limit)
    subscriber.subscribe((matches) => {
      this.setState({
        geneHits: matches,
      })
    },
    )
  };

  handleSubCohortValue(inputSubCohortUrl, addedSubCohorts) {
    const addedSubCohort = this.addSubCohortSample(inputSubCohortUrl)
    if (addedSubCohort.samples) {
      addedSubCohorts.push(addedSubCohort)
    } else {
      addedSubCohorts = addedSubCohorts.filter(
        (as) => as.subCohortName !== addedSubCohort.subCohortName &&
          as.cohort !== addedSubCohort.cohort)
    }
    return addedSubCohorts
  }

  /**
   * For should be one or more inputs:
   *
   * urlVariables = {
   *   subCohortSamples: <Cohort>:<SubCohortName>:<Samples>
   *   subCohortSamples: TCGA%20Stomach%20Cancer%20(STAD):From_Xena_Cohort1:TCGA-BR-8384-01,TCGA-BR-4371-01&
   * subCohortSamples=TCGA%20Stomach%20Cancer%20(STAD):From_Xena_Cohort2:TCGA-D7-6822-01,TCGA-BR-8485-01&
   * }
   *
   * @param urlVariables
   * @return {*[]}
   */
  calculateSubCohortSamples(urlVariables) {
    const addedSubCohorts = []
    // TCGA%20Stomach%20Cancer%20(STAD):From_Xena_Cohort1:TCGA-BR-8384-01,TCGA-BR-4371-01&
    if (urlVariables.subCohortSamples) {
      if (Array.isArray(urlVariables.subCohortSamples)) {
        for (const url of urlVariables.subCohortSamples) {
          this.handleSubCohortValue(url, addedSubCohorts)
        }
      } else {
        this.handleSubCohortValue(urlVariables.subCohortSamples,
          addedSubCohorts)
      }
    }
    return addedSubCohorts
  }

  addSubCohortSample(url) {
    const parsed = url.split(':')
    return {
      cohort: parsed[0],
      subCohortName: parsed[1],
      samples: parsed[2],
    }
  }

  handleCombinedCohortData = (input) => {
    let {
      pathways,
      geneList,
      cohortData,
      filterCounts,
      samplesA,
      geneExpressionA,
      geneExpressionPathwayActivityA,
      genomeBackgroundMutationA,
      genomeBackgroundCopyNumberA,
      samplesB,
      geneExpressionB,
      geneExpressionPathwayActivityB,
      genomeBackgroundMutationB,
      genomeBackgroundCopyNumberB,
      selectedCohorts,
    } = input

    const [geneExpressionZScoreA, geneExpressionZScoreB] = isViewGeneExpression(
      this.state.filter) ? generateZScoreForBoth(geneExpressionA,
        geneExpressionB) : [geneExpressionA, geneExpressionB]

    const pathwayDataA = {
      geneList,
      pathways,
      cohortData,
      cohort: selectedCohorts[0],
      filter: this.state.filter,
      filterCounts: filterCounts[0],
      geneExpression: geneExpressionZScoreA,
      geneExpressionPathwayActivity: geneExpressionPathwayActivityA,
      samples: samplesA,
      genomeBackgroundMutation: genomeBackgroundMutationA,
      genomeBackgroundCopyNumber: genomeBackgroundCopyNumberA,
    }

    const pathwayDataB = {
      geneList,
      pathways,
      cohortData,
      cohort: selectedCohorts[1],
      filter: this.state.filter,
      filterCounts: filterCounts[1],
      geneExpression: geneExpressionZScoreB,
      geneExpressionPathwayActivity: geneExpressionPathwayActivityB,
      samples: samplesB,
      genomeBackgroundMutation: genomeBackgroundMutationB,
      genomeBackgroundCopyNumber: genomeBackgroundCopyNumberB,
    }

    const associatedDataA = calculateAssociatedData(pathwayDataA,
      this.state.filter)
    const associatedDataB = calculateAssociatedData(pathwayDataB,
      this.state.filter)

    AppStorageHandler.storePathways(pathways)
    const selection = AppStorageHandler.getPathwaySelection()
    if (!selection ||
      !selection.pathway ||
      !selection.pathway.golabel ||
      associatedDataA.filter(
        (d) => d[0].golabel === selection.pathway.golabel).length === 0) {
      selection.pathway = pathways[0]
    }

    const sortedAssociatedDataA = sortAssociatedData(selection.pathway,
      associatedDataA, this.state.filter)
    const sortedAssociatedDataB = sortAssociatedData(selection.pathway,
      associatedDataB, this.state.filter)

    const sortedSamplesA = sortedAssociatedDataA[0].map((d) => d.sample)
    const sortedSamplesB = sortedAssociatedDataB[0].map((d) => d.sample)

    pathways = calculateAllPathways([pathwayDataA, pathwayDataB],
      [sortedAssociatedDataA, sortedAssociatedDataB], this.state.filter)
    pathwayDataA.pathways = pathways
    pathwayDataB.pathways = pathways

    const geneData = generateScoredData(selection, [pathwayDataA, pathwayDataB],
      pathways, this.state.filter, [sortedSamplesA, sortedSamplesB])
    const sortedGeneData = isViewGeneExpression(this.state.filter) ?
      sortGeneDataWithSamples([sortedSamplesA, sortedSamplesB], geneData) :
      geneData

    let pathwayIndex = getSelectedGeneSetIndex(selection,pathways)
    const mergedGeneSetData = [
      mergeGeneSetAndGeneDetailData(sortedGeneData[0],sortedAssociatedDataA,pathwayIndex),
      mergeGeneSetAndGeneDetailData(sortedGeneData[1],sortedAssociatedDataB,pathwayIndex),
    ]

    currentLoadState = LOAD_STATE.LOADED
    this.setState({
      // associatedData: [sortedAssociatedDataA, sortedAssociatedDataB],
      associatedData: mergedGeneSetData,
      pathwaySelection: selection,
      geneList,
      pathways,
      geneData: sortedGeneData,
      pathwayData: [pathwayDataA, pathwayDataB],
      // sortedPathwayData,
      loading: LOAD_STATE.LOADED,
      currentLoadState: currentLoadState,
      processing: false,
      fetch: false,
    })

    fetchSampleData(this.state.selectedCohort, this.state.filter,
      this.handleSampleDataCounts)
  };

  geneHighlight = (geneName) => {
    this.setState(
      {
        highlightedGene: geneName,
      },
    )
  };

  handleGeneHover = (geneHover) => {
    if (geneHover && geneHover.pathway) {
      const otherCohortIndex = geneHover.cohortIndex === 0 ? 1 : 0
      const geneHoverData = []
      geneHoverData[geneHover.cohortIndex] = geneHover

      const gene = geneHover.pathway.gene[0]
      const otherPathway = this.state.geneData[otherCohortIndex].pathways.filter(
        (p) => p.gene[0] === gene)[0]
      geneHoverData[otherCohortIndex] = {
        cohortIndex: otherCohortIndex,
        tissue: 'Header',
        pathway: otherPathway,
        expression: otherPathway, // for displaying the hover
      }

      this.setState({
        geneHoverData,
      })
    }
  };

  handlePathwayHover = (hoveredPoint) => {
    if (!hoveredPoint) return
    let hoveredPathway = hoveredPoint.pathway
    const sourceCohort = hoveredPoint.cohortIndex

    const cohort0 = {
      tissue: sourceCohort === 0 ? hoveredPoint.tissue : 'Header',
      source: 'GeneSet',
      cohortIndex: 0,
      pathway: hoveredPathway,
      expression: {
        affected: hoveredPathway.firstObserved,
        samplesAffected: hoveredPathway.firstObserved,
        geneExpressionMean: hoveredPathway.firstGeneExpressionMean,
        allGeneAffected: hoveredPathway.firstTotal,
        total: hoveredPathway.firstNumSamples,
      },
    }

    const cohort1 = {
      tissue: sourceCohort === 1 ? hoveredPoint.tissue : 'Header',
      source: 'GeneSet',
      cohortIndex: 1,
      pathway: update(hoveredPathway,{
        geneExpressionMean: { $set: hoveredPathway.geneExpressionMean - hoveredPathway.diffScore },
      }),
      expression: {
        affected: hoveredPathway.secondObserved,
        samplesAffected: hoveredPathway.secondObserved,
        geneExpressionMean: hoveredPathway.secondGeneExpressionMean,
        allGeneAffected: hoveredPathway.secondTotal,
        total: hoveredPathway.secondNumSamples,
      },
    }

    const geneHoverData = hoveredPathway ? [
      cohort0,
      cohort1,
    ] : null

    this.setState({
      hoveredPathway,
      geneHoverData,
    })
  };

  handlePathwaySelect = (selection) => {
    const {pathwayData, filter, associatedData} = this.state

    // slice out older pathway data
    if (selection.pathway.gene.length === 0) {
      return
    }
    const pathwaySelectionWrapper = {
      pathway: selection.pathway,
      tissue: 'Header',
    }

    const selectedGoLabel = pathwaySelectionWrapper.pathway.golabel

    AppStorageHandler.storePathwaySelection(pathwaySelectionWrapper)
    const geneSetPathways = AppStorageHandler.getPathways()
    const pureAssociatedData = [
      pruneGeneSelection(associatedData[0],geneSetPathways,selectedGoLabel)
      , pruneGeneSelection(associatedData[1],geneSetPathways,selectedGoLabel)
    ]

    const newAssociatedData = [
      sortAssociatedData(pathwaySelectionWrapper.pathway, pureAssociatedData[0],
        filter),
      sortAssociatedData(pathwaySelectionWrapper.pathway, pureAssociatedData[1],
        filter),
    ]


    const sortedAssociatedDataA = sortAssociatedData(selection.pathway,
      pureAssociatedData[0], this.state.filter)
    const sortedAssociatedDataB = sortAssociatedData(selection.pathway,
      pureAssociatedData[1], this.state.filter)

    const sortedSamplesA = sortedAssociatedDataA[0].map((d) => d.sample)
    const sortedSamplesB = sortedAssociatedDataB[0].map((d) => d.sample)

    // TODO: create gene data off of the sorted pathway data
    const geneData = generateScoredData(pathwaySelectionWrapper, pathwayData,
      geneSetPathways, filter, [sortedSamplesA, sortedSamplesB])
    const sortedGeneData = isViewGeneExpression(this.state.filter) ?
      sortGeneDataWithSamples([sortedSamplesA, sortedSamplesB], geneData) :
      geneData

    let pathwayIndex = getSelectedGeneSetIndex(pathwaySelectionWrapper,geneSetPathways)

    const mergedGeneSetData = [
      mergeGeneSetAndGeneDetailData(sortedGeneData[0],newAssociatedData[0],pathwayIndex),
      mergeGeneSetAndGeneDetailData(sortedGeneData[1],newAssociatedData[1],pathwayIndex),
    ]

    this.setState({
      // geneData,
      geneData:sortedGeneData,
      pathwaySelection: pathwaySelectionWrapper,
      // pathways: inputPathways,
      // associatedData: newAssociatedData,
      associatedData: mergedGeneSetData,
    })
  };

  searchHandler = (geneQuery) => {
    this.queryGenes(geneQuery)
  };

  handleColorToggle = () => {
    this.setState({showColorEditor: !this.state.showColorEditor})
  };

  handleColorChange = (name, value) => {
    const newArray = JSON.parse(JSON.stringify(this.state.geneStateColors))
    newArray[name] = value
    this.setState({
      geneStateColors: newArray,
    })
  };

  handleSetCollapsed = (collapsed) => {
    this.setState({
      collapsed: collapsed,
    })
  };

  doRefetch() {
    if (this.state.fetch && currentLoadState !== LOAD_STATE.LOADING) {
      return true
    }

    switch (currentLoadState) {
    case LOAD_STATE.LOADING:
      return false
    case LOAD_STATE.UNLOADED:
      return true

      // TODO: this should be calculated below depending on the state of gene data and if the selected cohort changed
    case LOAD_STATE.LOADED:
      return false
    }

    if (isEqual(this.state.geneData, [{}, {}])) return true
    if (isEqual(this.state.pathwayData, [{}, {}])) return true
    return !isEqual(this.state.selectedCohort[0], this.state.selectedCohort[1])
  }

  handleChangeCohort = (selectedCohort, cohortIndex) => {
    const cohortDetails = getCohortDetails({name: selectedCohort})
    const subCohorts = getSubCohortsOnlyForCohort(selectedCohort)
    if (subCohorts) {
      cohortDetails.subCohorts = subCohorts
      cohortDetails.selectedSubCohorts = subCohorts
    }

    const newCohortState = [
      cohortIndex === 0 ? cohortDetails : this.state.selectedCohort[0],
      cohortIndex === 1 ? cohortDetails : this.state.selectedCohort[1],
    ]
    AppStorageHandler.storeCohortState(newCohortState[cohortIndex],
      cohortIndex)

    this.setState({
      selectedCohort: newCohortState,
      fetch: true,
      currentLoadState: LOAD_STATE.LOADING,
      reloadPathways: this.state.automaticallyReloadPathways,
    })
  };

  handleChangeView = (updateCohortState, newView) => {
    AppStorageHandler.storeCohortState(updateCohortState[0], 0)
    AppStorageHandler.storeCohortState(updateCohortState[1], 1)
    this.setState({
      selectedCohort: updateCohortState,
      filter: newView,
      fetch: true,
      currentLoadState: LOAD_STATE.LOADING,
      reloadPathways: this.state.automaticallyReloadPathways,
      showCohortEditor: false,
    })
  };

  handleChangeSubCohort = (selectedCohort, cohortIndex) => {
    const updateCohortState = update(this.state.selectedCohort, {
      [cohortIndex]: {
        selectedSubCohorts: {$set: selectedCohort.selectedSubCohorts},
      },
    })
    AppStorageHandler.storeCohortState(updateCohortState[cohortIndex],
      cohortIndex)
    this.setState({
      selectedCohort: updateCohortState,
      fetch: true,
      currentLoadState: LOAD_STATE.LOADING,
      reloadPathways: this.state.automaticallyReloadPathways,
    })
  };

  handleChangeFilter = (newView) => {
    AppStorageHandler.storeFilterState(newView)

    this.setState({
      filter: newView,
      fetch: true,
      currentLoadState: LOAD_STATE.LOADING,
      reloadPathways: this.state.automaticallyReloadPathways,
    },
    )
  };

  handleChangeTopFilter = (event) => {
    this.handleChangeFilter(event.target.value)
  };

  handleVersusAll = (selectedSubCohort, cohortSourceIndex) => {
    // select ONLY
    const sourceCohort = update(this.state.selectedCohort[cohortSourceIndex], {
      selectedSubCohorts: {$set: [selectedSubCohort]},
    })

    // select ALL
    const targetCohort = update(this.state.selectedCohort[cohortSourceIndex], {
      selectedSubCohorts: {$set: this.state.selectedCohort[cohortSourceIndex].subCohorts},
    })

    const newCohortState = [
      cohortSourceIndex === 0 ? sourceCohort : targetCohort,
      cohortSourceIndex === 0 ? targetCohort : sourceCohort,
    ]
    AppStorageHandler.storeCohortStateArray(newCohortState)
    this.setState({
      selectedCohort: newCohortState,
      fetch: true,
      currentLoadState: LOAD_STATE.LOADING,
    })
  };

  swapCohorts = () => {
    // TODO: swap cohorts, sub cohorts, filters,
    const newCohortState = [
      this.state.selectedCohort[1],
      this.state.selectedCohort[0],
    ]
    AppStorageHandler.storeCohortStateArray(newCohortState)
    this.setState({
      selectedCohort: newCohortState,
      fetch: true,
      currentLoadState: LOAD_STATE.LOADING,
    })
  };

  copyCohorts = (cohortSourceIndex) => {
    // TODO: swap cohorts, sub cohorts, filters,
    const newCohortState = [
      this.state.selectedCohort[cohortSourceIndex],
      this.state.selectedCohort[cohortSourceIndex],
    ]
    AppStorageHandler.storeCohortStateArray(newCohortState)
    this.setState({
      selectedCohort: newCohortState,
      fetch: true,
      currentLoadState: LOAD_STATE.LOADING,
    })
  };

  setActiveGeneSets = (newPathways) => {
    AppStorageHandler.storePathways(newPathways)

    let pathwaySelection = newPathways.filter(
      (p) => this.state.pathwaySelection.pathway.golabel === p.golabel)
    pathwaySelection = {
      tissue: 'Header',
      pathway: pathwaySelection.length > 0 ?
        pathwaySelection[0] :
        newPathways[0],
    }
    this.setState({
      pathwaySelection,
      showGeneSetSearch: false,
      pathways: newPathways,
      fetch: true,
      reloadPathways: false,
      currentLoadState: LOAD_STATE.LOADING,
    })
  };

  handleEditCohorts = () => {
    this.setState({showCohortEditor: true})
  };

  handleSampleDataCounts = (cohortA, cohortB) => {
    const returnA = Object.assign({},
      ...cohortA.subCohortCounts.map((s) => ({[s.name]: s.count})))
    const returnB = Object.assign({},
      ...cohortB.subCohortCounts.map((s) => ({[s.name]: s.count})))
    this.setState({
      fetchSamples: false,
      subCohortCounts: [returnA, returnB],
    })
  };

  handleMeanActivityData = (output) => {
    // 1. fetch activity
    const geneSets = getGeneSetsForView(this.state.filter)
    const loadedPathways = geneSets.map((p) => {
      p.firstGeneExpressionPathwayActivity = undefined
      p.secondGeneExpressionPathwayActivity = undefined
      return p
    })
    const indexMap = {}
    geneSets.forEach((p, index) => {
      indexMap[p.golabel] = index
    })

    for (const index in output.geneExpressionPathwayActivityA.field) {
      const field = output.geneExpressionPathwayActivityA.field[index]
      const cleanField = field.indexOf(' (GO:') < 0 ? field : field.substr(0,
        field.indexOf('GO:') - 1).trim()
      const sourceIndex = indexMap[cleanField]
      loadedPathways[sourceIndex].firstGeneExpressionPathwayActivity = output.geneExpressionPathwayActivityA.mean[index]
      loadedPathways[sourceIndex].secondGeneExpressionPathwayActivity = output.geneExpressionPathwayActivityB.mean[index]
    }

    const sortedPathways = loadedPathways.filter(
      (a) => a.firstGeneExpressionPathwayActivity &&
        a.secondGeneExpressionPathwayActivity).
      sort((a, b) => (this.state.filterOrder === SORT_ORDER_ENUM.ASC ?
        1 :
        -1) * (scorePathway(a, this.state.filterBy) -
        scorePathway(b, this.state.filterBy))).
      slice(0, this.state.geneSetLimit).
      sort((a, b) => (this.state.sortViewOrder === SORT_ORDER_ENUM.ASC ?
        1 :
        -1) * (scorePathway(a, this.state.sortViewBy) -
        scorePathway(b, this.state.sortViewBy)))
    fetchCombinedCohorts(this.state.selectedCohort, sortedPathways,
      this.state.filter, this.handleCombinedCohortData)
  };

  render() {
    const storedPathways = AppStorageHandler.getPathways()
    let pathways = this.state.pathways ? this.state.pathways : storedPathways
    let maxValue = 0

    if (this.doRefetch()) {
      currentLoadState = LOAD_STATE.LOADING
      // change gene sets here

      // if gene Expressions
      if (getCohortDataForGeneExpressionView(this.state.selectedCohort,
        this.state.filter) !== null) {
        if (this.state.reloadPathways) {
          fetchBestPathways(this.state.selectedCohort, this.state.filter,
            this.handleMeanActivityData)
        } else {
          fetchCombinedCohorts(this.state.selectedCohort, pathways,
            this.state.filter, this.handleCombinedCohortData)
        }
      } else {
        // if its not gene expression just use the canned data
        if (!isViewGeneExpression(this.state.filter)) {
          pathways = getGeneSetsForView(this.state.filter)
        }

        fetchCombinedCohorts(this.state.selectedCohort, pathways,
          this.state.filter, this.handleCombinedCohortData)
      }
    }

    if (this.state.pathways) {
      const maxValues = this.state.pathways.map((p) =>
        Math.max(Math.abs(p.firstGeneExpressionPathwayActivity),
          Math.abs(p.secondGeneExpressionPathwayActivity)))
      maxValue = Math.max(...maxValues)
    }

    return (
      <div>

        <NavigationBar
          acceptGeneHandler={this.geneHighlight}
          geneOptions={this.state.geneHits}
          searchHandler={this.searchHandler}
        />

        <div>
          <Dialog
            active={this.state.currentLoadState === LOAD_STATE.LOADING}
            style={{width: 400}}
            title="Loading"
          >
            <p>
              {this.state.selectedCohort[0].name} ...
              <br/>
              {this.state.selectedCohort[1].name} ...
            </p>
          </Dialog>
          {/*<ColorEditor*/}
          {/*  active={this.state.showColorEditor}*/}
          {/*  colorSettings={this.state.geneStateColors}*/}
          {/*  onColorChange={this.handleColorChange}*/}
          {/*  onColorToggle={this.handleColorToggle}*/}
          {/*/>*/}
          {this.state.pathways && this.state.selectedCohort &&
          <Dialog
            active={this.state.showCohortEditor}
            onEscKeyDown={() => this.setState({showCohortEditor: false})}
            onOverlayClick={() => this.setState({showCohortEditor: false})}
            title="Cohort Editor"
            type='small'
          >
            <CohortEditorSelector
              cohort={this.state.selectedCohort}
              onCancelCohortEdit={() => this.setState(
                {showCohortEditor: false})}
              onChangeView={this.handleChangeView}
              subCohortCounts={this.state.subCohortCounts}
              view={this.state.filter}
            />
          </Dialog>
          }
          {this.state.pathways && this.state.associatedData &&
          <Dialog
            active={this.state.showGeneSetSearch}
            onEscKeyDown={() => this.setState({showGeneSetSearch: false})}
            onOverlayClick={() => this.setState({showGeneSetSearch: false})}
            title="Gene Set Editor"
          >
            <GeneSetEditor
              cancelPathwayEdit={() => this.setState(
                {showGeneSetSearch: false})}
              pathwayData={this.state.pathwayData}
              pathways={this.state.pathways}
              setPathways={this.setActiveGeneSets}
              view={this.state.filter}
            />
          </Dialog>
          }
          <table>
            <tbody>
              {/*<tr>*/}
              {/*  <td className={BaseStyle.autoSortBox} colSpan={3}>*/}
              {/*    <div className={BaseStyle.headerBox}>*/}
              {/*    Gene Sets*/}
              {/*    </div>*/}
              {/*    {isViewGeneExpression(this.state.filter) &&*/}
              {/*    <div className={BaseStyle.containerBox}>*/}
              {/*      Limit*/}
              {/*      <input*/}
              {/*        onBlur={() => this.setState({*/}
              {/*          fetch: true,*/}
              {/*          currentLoadState: LOAD_STATE.LOADING,*/}
              {/*          reloadPathways: this.state.automaticallyReloadPathways,*/}
              {/*        })}*/}
              {/*        onChange={(event) => this.setState(*/}
              {/*          {geneSetLimit: event.target.value})} size={3}*/}
              {/*        value={this.state.geneSetLimit}*/}
              {/*      />*/}
              {/*    </div>*/}
              {/*    }*/}
              {/*    {isViewGeneExpression(this.state.filter) &&*/}
              {/*    <div className={BaseStyle.containerBox}>*/}
              {/*      Filter by*/}
              {/*      <select*/}
              {/*        onChange={(event) => this.setState({*/}
              {/*          filterBy: event.target.value,*/}
              {/*          fetch: true,*/}
              {/*          currentLoadState: LOAD_STATE.LOADING,*/}
              {/*          reloadPathways: this.state.automaticallyReloadPathways,*/}
              {/*        })}*/}
              {/*        style={{marginLeft: 5}}*/}
              {/*        value={this.state.filterBy}*/}
              {/*      >*/}
              {/*        <option*/}
              {/*          value={SORT_ENUM.CONTRAST_DIFF}*/}
              {/*        >{SORT_ENUM.CONTRAST_DIFF}</option>*/}
              {/*        <option*/}
              {/*          value={SORT_ENUM.ABS_DIFF}*/}
              {/*        >{SORT_ENUM.ABS_DIFF}</option>*/}
              {/*        <option value={SORT_ENUM.DIFF}>Cohort Diff</option>*/}
              {/*        <option value={SORT_ENUM.TOTAL}>Total</option>*/}
              {/*      </select>*/}
              {/*      {this.state.filterOrder === SORT_ORDER_ENUM.ASC &&*/}
              {/*      <FaSortAsc onClick={() => this.setState({*/}
              {/*        filterOrder: 'desc',*/}
              {/*        fetch: true,*/}
              {/*        currentLoadState: LOAD_STATE.LOADING,*/}
              {/*        reloadPathways: this.state.automaticallyReloadPathways,*/}
              {/*      })}*/}
              {/*      />*/}
              {/*      }*/}
              {/*      {this.state.filterOrder === SORT_ORDER_ENUM.DESC &&*/}
              {/*      <FaSortDesc onClick={() => this.setState({*/}
              {/*        filterOrder: 'asc',*/}
              {/*        fetch: true,*/}
              {/*        currentLoadState: LOAD_STATE.LOADING,*/}
              {/*        reloadPathways: this.state.automaticallyReloadPathways,*/}
              {/*      })}*/}
              {/*      />*/}
              {/*      }*/}
              {/*    </div>*/}
              {/*    }*/}
              {/*    {isViewGeneExpression(this.state.filter) &&*/}
              {/*      <Button*/}
              {/*        icon='edit' onClick={() => this.setState(*/}
              {/*          {showGeneSetSearch: true})} raised*/}
              {/*      >*/}
              {/*      Gene Sets&nbsp;*/}
              {/*        {this.state.pathways &&*/}
              {/*      <div style={{display: 'inline'}}>*/}
              {/*        ({this.state.pathways.length})*/}
              {/*      </div>*/}
              {/*        }*/}
              {/*      </Button>*/}
              {/*    }*/}
              {/*    {!isViewGeneExpression(this.state.filter) &&*/}
              {/*    <div style={{display: 'inline'}}>*/}
              {/*      Using default pathways*/}
              {/*    </div>*/}
              {/*    }*/}
              {/*  </td>*/}
              {/*  <td className={BaseStyle.autoSortBox}>*/}
              {/*    <Button*/}
              {/*      icon='edit' onClick={() => this.handleEditCohorts()}*/}
              {/*      raised*/}
              {/*    >*/}
              {/*    Cohorts*/}
              {/*    </Button>*/}
              {/*  &nbsp;&nbsp;&nbsp;Analysis:*/}
              {/*    <select*/}
              {/*      className={BaseStyle.softflow}*/}
              {/*      onChange={this.handleChangeTopFilter}*/}
              {/*      style={{marginLeft: 10, marginTop: 3, marginBottom: 3}}*/}
              {/*      value={this.state.filter}*/}
              {/*    >*/}
              {/*      {*/}
              {/*        allowableViews.map((c) => {*/}
              {/*          return (*/}
              {/*            <option key={c} value={c}>*/}
              {/*              {c}*/}
              {/*            </option>*/}
              {/*          )*/}
              {/*        })*/}
              {/*      }*/}
              {/*    </select>*/}
              {/*  </td>*/}
              {/*</tr>*/}
              <tr>
                {/*<td colSpan={3} width={VERTICAL_GENESET_DETAIL_WIDTH * 2 + VERTICAL_GENESET_DETAIL_WIDTH}>*/}
                <td colSpan={5}>
                  <h3>
                    Cohort X comparing sub cohorts A,B, C (z) to sub cohorts D, E, F (y)
                    <Button floating mini onClick={() => alert('cog')}>
                      <FaConfigure/>
                    </Button>
                  </h3>
                  {/*<Autocomplete*/}
                  {/*  label='Find Gene'*/}
                  {/*  multiple={false}*/}
                  {/*  onChange={(searchText) => {*/}
                  {/*    this.acceptGeneHandler(searchText)*/}
                  {/*    this.setState({geneNameSearch: searchText})*/}
                  {/*  }}*/}
                  {/*  onQueryChange={(geneQuery) => {*/}
                  {/*    this.handleSearch(geneQuery)*/}
                  {/*    this.setState({geneNameSearch: geneQuery})*/}
                  {/*  }}*/}
                  {/*  source={this.props.geneOptions}*/}
                  {/*  theme={AutocompleteTheme}*/}
                  {/*  value={this.state.geneNameSearch}*/}
                  {/*/>*/}
                  {/*<DetailedLabelTop*/}
                  {/*  cohort={this.state.selectedCohort}*/}
                  {/*  colors={this.state.cohortColors}*/}
                  {/*  onShowCohortEditor={this.handleEditCohorts}*/}
                  {/*  pathwayData={this.state.pathwayData}*/}
                  {/*  width={VERTICAL_GENESET_DETAIL_WIDTH * 2 +*/}
                  {/*VERTICAL_GENESET_DETAIL_WIDTH - 20}*/}
                  {/*/>*/}
                </td>
              </tr>
              <tr>
                <td valign='top'>
                  <GeneSetInformationColumn
                    cohort={this.state.selectedCohort}
                    cohortColor={this.state.cohortColors}
                    cohortIndex={0}
                    geneDataStats={this.state.geneData}
                    geneHoverData={this.state.geneHoverData}
                    onEditCohorts={this.handleEditCohorts}
                    pathwayData={this.state.pathwayData}
                    subCohortCounts={this.state.subCohortCounts}
                    view={this.state.filter}
                  />
                </td>
                <td>
                  <table>
                    <tbody>
                      <tr>
                        <td colSpan={3}>
                          {this.state.pathwaySelection &&
                        <div className={BaseStyle.geneSetInfoBox}>
                          <div className={BaseStyle.geneSetBoxLabel}>Viewing Gene Set
                            Details
                          </div>
                          {this.state.pathwaySelection.pathway.golabel}
                          &nbsp;
                          ({this.state.pathwaySelection.pathway.gene.length} genes)
                        </div>
                          }
                        </td>
                      </tr>
                      {isViewGeneExpression(this.state.filter) &&
                        <tr>
                          <td colSpan={3}>
                            Pathway Score:
                            <GeneSetLegend
                              id='geneExpressionGeneSetScore'
                              label={this.state.filter + ' score'} maxScore={maxValue}
                              minScore={-maxValue}
                            />
                          </td>
                        </tr>
                      }
                      {!isViewGeneExpression(this.state.filter) &&
                          <tr>
                            <td>
                              <table style={{padding: 0, margin: 0, borderSpacing: 0}}>
                                <tbody>
                                  <tr style={{padding: 0, margin: 0}}>
                                    <td style={{padding: 0, margin: 0}}>
                                      Pathway Score:
                                      <GeneSetLegend
                                        id='mean-score' label={'mean'}
                                        maxScore={50} minScore={-50}
                                        precision={0}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{padding: 0, margin: 0}}>
                                      Sample Score:
                                      <GeneSetLegend
                                        id='densityGrad1' label={'density'} maxColor='red'
                                        maxScore={5} midColor='orange'
                                        minColor='white' minScore={0} precision={0}
                                      />
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                      }
                      <tr>
                        <td colSpan={3}>
                          {isViewGeneExpression(this.state.filter) &&
                            <div style={{marginLeft: 5}}>
                              Sample Legend:
                              <GeneSetLegend
                                id='geneExpressionGeneScore'
                                label={'Gene expression z-score'} maxScore={2}
                                minScore={-2}
                              />
                            </div>
                          }
                          {!isViewGeneExpression(this.state.filter) &&
                          <div style={{marginLeft: 5}}>
                            <CnvMutationLegend view={this.state.filter}/>
                          </div>
                          }
                        </td>
                      </tr>
                      <tr>
                        <td valign='top'>
                          <VerticalGeneSetScoresView
                            associatedData={this.state.associatedData[0]}
                            cohortIndex={0}
                            filter={this.state.filter}
                            geneData={this.state.geneData[0]}
                            labelHeight={18 + 2 * BORDER_OFFSET}
                            maxValue={maxValue}
                            onClick={this.handlePathwaySelect}
                            onHover={this.handlePathwayHover}
                            onMouseOut={this.handlePathwayHover}
                            pathways={pathways}
                            selectedCohort={this.state.selectedCohort[0]}
                            selectedPathway={this.state.pathwaySelection}
                            width={VERTICAL_GENESET_DETAIL_WIDTH}
                          />
                        </td>
                        <td valign='top' width={VERTICAL_SELECTOR_WIDTH - 20}>
                          {this.state.pathways &&
                        <GeneSetSelector
                          geneColors={this.state.geneColors}
                          geneData={this.state.geneData}
                          geneStateColors={this.state.geneStateColors}
                          highlightedGene={this.state.highlightedGene}
                          hoveredPathway={this.state.hoveredPathway}
                          labelHeight={18}
                          maxValue={maxValue}
                          onClick={this.handlePathwaySelect}
                          onHover={this.handlePathwayHover}
                          onMouseOut={this.handlePathwayHover}
                          pathways={this.state.pathways}
                          selectedPathway={this.state.pathwaySelection}
                          topOffset={14}
                          width={VERTICAL_SELECTOR_WIDTH}
                        />
                          }
                        </td>
                        <td valign='top'>
                          <VerticalGeneSetScoresView
                            associatedData={this.state.associatedData[1]}
                            cohortIndex={1}
                            filter={this.state.filter}
                            geneData={this.state.geneData[1]}
                            labelHeight={18 + 2 * BORDER_OFFSET}
                            maxValue={maxValue}
                            onClick={this.handlePathwaySelect}
                            onHover={this.handlePathwayHover}
                            onMouseOut={this.handlePathwayHover}
                            pathways={pathways}
                            selectedCohort={this.state.selectedCohort[1]}
                            selectedPathway={this.state.pathwaySelection}
                            width={VERTICAL_GENESET_DETAIL_WIDTH}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
                <td valign='top'>
                  <GeneSetInformationColumn
                    cohort={this.state.selectedCohort}
                    cohortColor={this.state.cohortColors}
                    cohortIndex={1}
                    geneDataStats={this.state.geneData}
                    geneHoverData={this.state.geneHoverData}
                    onEditCohorts={this.handleEditCohorts}
                    onShowCohortEditor={this.handleEditCohorts}
                    pathwayData={this.state.pathwayData}
                    subCohortCounts={this.state.subCohortCounts}
                    view={this.state.filter}
                  />
                </td>

                {this.state.loading === LOAD_STATE.LOADED &&
                <td
                  className="map_wrapper"
                  onMouseMove={(ev) => {
                    const topClient = ev.currentTarget.getBoundingClientRect().top
                    let scrollDownBuffer = 0
                    if (topClient < 0) {
                      scrollDownBuffer = -topClient + 74
                    }

                    const x = ev.clientX + 8
                    const y = ev.clientY + 8 + scrollDownBuffer
                    if (x >= 860 && y >= 200) {
                      this.setState({mousing: true, x, y})
                    } else {
                      this.setState({mousing: false, x, y})
                    }
                  }} onMouseOut={() => {
                    this.setState({mousing: false})
                  }}
                  valign='top'
                >
                  <CrossHairH mousing={this.state.mousing} y={this.state.y}/>
                  <CrossHairV
                    height={VIEWER_HEIGHT * 2}
                    mousing={this.state.mousing} x={this.state.x}
                  />
                  {/*<XenaGoViewer*/}
                  {/*  // reference*/}
                  {/*  allowableViews={allowableViews}*/}
                  {/*  cohortColor={this.state.cohortColors[0]}*/}
                  {/*  cohortIndex={0}*/}

                  {/*  // view*/}
                  {/*  collapsed={this.state.collapsed}*/}
                  {/*  colorSettings={this.state.geneStateColors}*/}
                  {/*  copyCohorts={this.copyCohorts}*/}

                  {/*  // data*/}
                  {/*  filter={this.state.filter}*/}
                  {/*  geneDataStats={this.state.geneData[0]}*/}
                  {/*  geneHoverData={this.state.geneHoverData ?*/}
                  {/*    this.state.geneHoverData[0] :*/}
                  {/*    {}}*/}

                  {/*  // maybe state?*/}
                  {/*  highlightedGene={this.state.highlightedGene}*/}
                  {/*  onChangeCohort={this.handleChangeCohort}*/}
                  {/*  onChangeFilter={this.handleChangeFilter}*/}
                  {/*  onChangeSubCohort={this.handleChangeSubCohort}*/}
                  {/*  onEditCohorts={this.handleEditCohorts}*/}

                  {/*  // new pathway data*/}
                  {/*  onGeneHover={this.handleGeneHover}*/}
                  {/*  onSetCollapsed={this.handleSetCollapsed}*/}

                  {/*  // functions*/}
                  {/*  onVersusAll={this.handleVersusAll}*/}
                  {/*  pathwayData={this.state.pathwayData[0]}*/}
                  {/*  pathwaySelection={this.state.pathwaySelection}*/}
                  {/*  pathways={pathways}*/}
                  {/*  renderHeight={VIEWER_HEIGHT}*/}

                  {/*  // state*/}
                  {/*  renderOffset={TOP_HEIGHT}*/}
                  {/*  selectedCohort={this.state.selectedCohort[0]}*/}
                  {/*  subCohortCounts={this.state.subCohortCounts[0]}*/}
                  {/*  swapCohorts={this.swapCohorts}*/}
                  {/*/>*/}
                  {/*<XenaGoViewer*/}
                  {/*  // reference*/}
                  {/*  allowableViews={allowableViews}*/}
                  {/*  cohortColor={this.state.cohortColors[1]}*/}
                  {/*  cohortIndex={1}*/}
                  {/*  collapsed={this.state.collapsed}*/}
                  {/*  colorSettings={this.state.geneStateColors}*/}
                  {/*  copyCohorts={this.copyCohorts}*/}

                  {/*  // data*/}
                  {/*  filter={this.state.filter}*/}
                  {/*  geneDataStats={this.state.geneData[1]}*/}
                  {/*  geneHoverData={this.state.geneHoverData ?*/}
                  {/*    this.state.geneHoverData[1] :*/}
                  {/*    {}}*/}

                  {/*  // maybe state?*/}
                  {/*  highlightedGene={this.state.highlightedGene}*/}
                  {/*  onChangeCohort={this.handleChangeCohort}*/}
                  {/*  onChangeFilter={this.handleChangeFilter}*/}
                  {/*  onChangeSubCohort={this.handleChangeSubCohort}*/}
                  {/*  onEditCohorts={this.handleEditCohorts}*/}

                  {/*  // new pathway data*/}
                  {/*  onGeneHover={this.handleGeneHover}*/}
                  {/*  onSetCollapsed={this.handleSetCollapsed}*/}

                  {/*  // functions*/}
                  {/*  onVersusAll={this.handleVersusAll}*/}
                  {/*  pathwayData={this.state.pathwayData[1]}*/}
                  {/*  pathwaySelection={this.state.pathwaySelection}*/}
                  {/*  pathways={pathways}*/}
                  {/*  renderHeight={VIEWER_HEIGHT}*/}

                  {/*  // state*/}
                  {/*  renderOffset={TOP_HEIGHT + VIEWER_HEIGHT - 3}*/}
                  {/*  selectedCohort={this.state.selectedCohort[1]}*/}
                  {/*  subCohortCounts={this.state.subCohortCounts[1]}*/}
                  {/*  swapCohorts={this.swapCohorts}*/}
                  {/*/>*/}
                </td>
                }
              </tr>
            </tbody>
          </table>
        </div>
      </div>)
  }
}
