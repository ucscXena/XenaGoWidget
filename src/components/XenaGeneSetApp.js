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
// import FaSortAsc from 'react-icons/lib/fa/sort-alpha-asc'
// import FaSortDesc from 'react-icons/lib/fa/sort-alpha-desc'
// import {intersection} from '../functions/MathFunctions'
import {SORT_ENUM, SORT_ORDER_ENUM} from '../data/SortEnum'
// import {CohortEditorSelector} from './CohortEditorSelector'
import {GeneSetLegend} from './GeneSetLegend'
import {CnvMutationLegend} from './CnvMutationLegend'
import {GeneSetInformationColumn} from './GeneSetInformationColumn'
import {CohortEditorSelector} from './CohortEditorSelector'
import {DiffColumn} from './DiffColumn'

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
      this.state.pathwaySelection.open ? this.state.pathwaySelection.open : false,
      this.state.selectedCohort[0].name,
      this.state.selectedCohort[1].name,
      this.state.selectedCohort[0].selectedSubCohorts,
      this.state.selectedCohort[1].selectedSubCohorts,
    )
    if (location.hash !== generatedUrl) {
      location.hash = generatedUrl
    }
  }

  generateSubCohortText(selectedCohort){
    if(
      (!selectedCohort.subCohorts)
      ||
      (selectedCohort.subCohorts.length===selectedCohort.selectedSubCohorts.length)
    ){
      return ' from all available '
    }
    if(selectedCohort.selectedSubCohorts.length===1){
      return  ` from sub cohort '${selectedCohort.selectedSubCohorts[0]}' `
    }
    else{
      return  ` ${selectedCohort.selectedSubCohorts.length} sub cohorts `
    }
  }


  showConfiguration = () => {
    this.setState({
      showGeneSetSearch: true
    })
  }

  generateTitle() {
    let returnText
    if (this.state.selectedCohort[0].name === this.state.selectedCohort[1].name) {
      returnText = `From cohort '${this.state.selectedCohort[0].name}' `
      if(this.state.geneData[0].samples ){
        if(this.state.geneData[0].samples) returnText += ` comparing ${this.state.geneData[0].samples.length} samples `
        returnText +=  `${this.generateSubCohortText(this.state.selectedCohort[0])} to `
        if(this.state.geneData[1].samples) returnText += ` ${this.state.geneData[1].samples.length} samples `
        returnText +=  `${this.generateSubCohortText(this.state.selectedCohort[1])} `
      }
      else
      if(this.state.pathwayData[0].samples ){
        if(this.state.pathwayData[0].samples) returnText += ` comparing ${this.state.pathwayData[0].samples.length} samples `
        returnText +=  `${this.generateSubCohortText(this.state.selectedCohort[0])} to `
        if(this.state.pathwayData[1].samples) returnText += ` ${this.state.pathwayData[1].samples.length} samples `
        returnText +=  `${this.generateSubCohortText(this.state.selectedCohort[1])} `
      }
    }
    // there are two
    else{
      returnText = `Comparing cohort '${this.state.selectedCohort[0].name}' `
      if(this.state.geneData.length===2 && this.state.geneData[0].samples && this.state.geneData[1].samples){
        returnText +=  `with ${this.state.geneData[0].samples.length} samples `
        returnText +=  `${this.generateSubCohortText(this.state.selectedCohort[0])} `
        returnText +=  ` to cohort '${this.state.selectedCohort[1].name}' `
        returnText +=  ` with ${this.state.geneData[1].samples.length} samples `
        returnText +=  `${this.generateSubCohortText(this.state.selectedCohort[1])} `
      }
      else
      if(this.state.pathwayData.length===2 && this.state.pathwayData[0].samples && this.state.pathwayData[1].samples){
        returnText +=  `with ${this.state.pathwayData[0].samples.length} samples `
        returnText +=  `${this.generateSubCohortText(this.state.selectedCohort[0])} `
        returnText +=  ` to cohort '${this.state.selectedCohort[1].name}' `
        returnText +=  ` with ${this.state.pathwayData[1].samples.length} samples `
        returnText +=  `${this.generateSubCohortText(this.state.selectedCohort[1])} `
      }
    }

    return returnText
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
      selection.pathway = update(pathways[0], {
        open: {$set: false}
      })
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
    pathwayDataA.pathwaySelection = selection
    pathwayDataB.pathwaySelection = selection
    pathwayDataA.selectedCohort = selectedCohorts[0]
    pathwayDataB.selectedCohort = selectedCohorts[1]

    const geneData = selection && selection.open ? generateScoredData(selection, [pathwayDataA, pathwayDataB],
      pathways, this.state.filter, [sortedSamplesA, sortedSamplesB]) : [{},{}]
    const sortedGeneData = isViewGeneExpression(this.state.filter) && selection.open ?
      sortGeneDataWithSamples([sortedSamplesA, sortedSamplesB], geneData) :
      geneData

    let pathwayIndex = getSelectedGeneSetIndex(selection,pathways)
    const mergedGeneSetData = selection.open ?[
      mergeGeneSetAndGeneDetailData(sortedGeneData[0],sortedAssociatedDataA,pathwayIndex),
      mergeGeneSetAndGeneDetailData(sortedGeneData[1],sortedAssociatedDataB,pathwayIndex),
    ] : [sortedAssociatedDataA,sortedAssociatedDataB]

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
    if (!hoveredPoint) {
      this.setState({
        hoveredPathway: null,
        geneHoverData: null,
      })
      return
    }
    let hoveredPathway = hoveredPoint.pathway
    const sourceCohort = hoveredPoint.cohortIndex

    const cohort0 = {
      tissue: sourceCohort === 0 ? hoveredPoint.tissue : 'Header',
      source: 'GeneSet',
      cohortIndex: 0,
      // pathway: hoveredPathway,
      // this makes this explicit
      pathway: update(hoveredPathway,{
        geneExpressionMean: { $set: hoveredPathway.firstGeneExpressionMean},
      }),
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
        geneExpressionMean: { $set: hoveredPathway.secondGeneExpressionMean},
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

  // if it is open:
  // if selected is open and is selected then close, otherwise open
  // if selected is NOT open, then select, regardless
  calculateOpen(currentSelection,priorSelection){
    return priorSelection.open ? currentSelection.pathway.golabel !== priorSelection.pathway.golabel : true
  }

  handlePathwaySelect = (selection) => {
    const {pathwayData, filter, associatedData} = this.state

    // slice out older pathway data
    if (selection.pathway.gene.length === 0) {
      return
    }

    const pathwaySelectionWrapper = {
      pathway: selection.pathway,
      open: this.calculateOpen(selection,this.state.pathwaySelection),
      tissue: 'Header',
    }

    AppStorageHandler.storePathwaySelection(pathwaySelectionWrapper)
    const geneSetPathways = AppStorageHandler.getPathways()
    const pureAssociatedData = [pruneGeneSelection(associatedData[0]), pruneGeneSelection(associatedData[1])]

    const sortedAssociatedDataA = sortAssociatedData(selection.pathway,
      pureAssociatedData[0], this.state.filter)
    const sortedAssociatedDataB = sortAssociatedData(selection.pathway,
      pureAssociatedData[1], this.state.filter)

    const sortedSamplesA = sortedAssociatedDataA[0].map((d) => d.sample)
    const sortedSamplesB = sortedAssociatedDataB[0].map((d) => d.sample)

    const geneData = pathwaySelectionWrapper  && pathwaySelectionWrapper.open ? generateScoredData(pathwaySelectionWrapper, pathwayData,
      geneSetPathways, filter, [sortedSamplesA, sortedSamplesB]) : [{},{}]
    const sortedGeneData = isViewGeneExpression(this.state.filter) && pathwaySelectionWrapper.open  ?
      sortGeneDataWithSamples([sortedSamplesA, sortedSamplesB], geneData) :
      geneData

    let pathwayIndex = getSelectedGeneSetIndex(pathwaySelectionWrapper,geneSetPathways)

    const mergedGeneSetData =
      pathwaySelectionWrapper.open ? [
        mergeGeneSetAndGeneDetailData(sortedGeneData[0],sortedAssociatedDataA,pathwayIndex),
        mergeGeneSetAndGeneDetailData(sortedGeneData[1],sortedAssociatedDataB,pathwayIndex),
      ] : [sortedAssociatedDataA,sortedAssociatedDataB]

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

    const defaultPathway = update( newPathways[0],{
      open: {$set: false},
    })
    let pathwaySelection = newPathways.filter(
      (p) => this.state.pathwaySelection.pathway.golabel === p.golabel)

    pathwaySelection = {
      tissue: 'Header',
      pathway: pathwaySelection.length > 0 ?
        pathwaySelection[0] :
        defaultPathway,
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

    let titleText = this.generateTitle()
    let titleSize = (45 - titleText.length * 0.15)

    return (
      <div>

        <NavigationBar
          acceptGeneHandler={this.geneHighlight}
          configurationHandler={this.showConfiguration}
          geneOptions={this.state.geneHits}
          searchHandler={this.searchHandler}
        />

        <h2
          className={BaseStyle.titleBox}
          style={{fontSize:titleSize,width: 1100}}>
          {titleText}
        </h2>

        <div
          className="map_wrapper"
          onMouseMove={(ev) => {
            const topClient = ev.currentTarget.getBoundingClientRect().top
            let scrollDownBuffer = 0
            if (topClient < 0) {
              scrollDownBuffer = -topClient + 74
            }
            const yLimit = this.state.geneData[0].samples ? 233 : 193
            const x = ev.clientX + 8
            const y = ev.clientY + 8 + scrollDownBuffer
            if (   y >= yLimit &&  ((x >= 265 && x <= 445) || (x >= 673 && x <= 853)) ) {
              this.setState({mousing: true, x, y})
            } else {
              this.setState({mousing: false, x, y})
            }
          }} onMouseOut={() => {
            this.setState({mousing: false})
          }}
        >
          <CrossHairH mousing={this.state.mousing} y={this.state.y}/>
          <CrossHairV
            height={VIEWER_HEIGHT * 3}
            mousing={this.state.mousing} x={this.state.x}
          />
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
          {this.state.pathways && this.state.selectedCohort &&
          <Dialog
            active={this.state.showCohortEditor}
            onEscKeyDown={() => this.setState({showCohortEditor: false})}
            onOverlayClick={() => this.setState({showCohortEditor: false})}
            title="Cohort Editor"
            type='normal'
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
            type="large"
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
              <tr>
                <td style={{minWidth:250}} valign='top' width={250}>
                  <GeneSetInformationColumn
                    cohort={this.state.selectedCohort}
                    cohortColor={this.state.cohortColors}
                    cohortIndex={0}
                    geneDataStats={this.state.geneData && this.state.geneData[0].pathwaySelection ? this.state.geneData : this.state.pathwayData}
                    geneHoverData={this.state.geneHoverData}
                    onEditCohorts={this.handleEditCohorts}
                    pathwayData={this.state.pathwayData}
                    subCohortCounts={this.state.subCohortCounts}
                    view={this.state.filter}
                  />
                </td>
                <td  width={300}>
                  <table>
                    <tbody>
                      {isViewGeneExpression(this.state.filter) &&
                        <tr>
                          <td>
                            <div className={BaseStyle.verticalLegendBox}>
                              Geneset Legend
                            </div>
                          </td>
                          <td colSpan={3}>
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
                                      Geneset Summary:
                                    </td>
                                    <td style={{padding: 0, margin: 0}}>
                                      <GeneSetLegend
                                        id='mean-score' label={'mean'}
                                        maxScore={50} minScore={-50}
                                        precision={0}
                                      />
                                    </td>
                                  </tr>
                                  <tr>
                                    <td style={{padding: 0, margin: 0}}>
                                      Sample Legend:
                                    </td>
                                    <td style={{padding: 0, margin: 0}}>
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
                      {isViewGeneExpression(this.state.filter) && this.state.geneData && this.state.geneData[0].data &&
                          <tr>
                            <td colSpan={1}>
                              <div className={BaseStyle.verticalLegendBox}>
                                    Gene Legend
                              </div>
                            </td>
                            <td colSpan={3}>
                              <GeneSetLegend
                                id='geneExpressionGeneScore'
                                label={'Gene expression z-score'} maxScore={2}
                                minScore={-2}
                              />
                            </td>
                          </tr>
                      }
                      {!isViewGeneExpression(this.state.filter) &&
                          <div style={{marginLeft: 5}}>
                            <CnvMutationLegend view={this.state.filter}/>
                          </div>
                      }
                      <tr>
                        <td valign='top'>
                          <DiffColumn
                            associatedData={this.state.associatedData}
                            cohortIndex={0}
                            filter={this.state.filter}
                            geneData={this.state.geneData}
                            labelHeight={18 + 2 * BORDER_OFFSET}
                            maxValue={maxValue}
                            pathways={pathways}
                            selectedPathway={this.state.pathwaySelection}
                            width={VERTICAL_GENESET_DETAIL_WIDTH}
                          />
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
                          <DiffColumn
                            associatedData={this.state.associatedData}
                            cohortIndex={1}
                            filter={this.state.filter}
                            geneData={this.state.geneData}
                            labelHeight={18 + 2 * BORDER_OFFSET}
                            maxValue={maxValue}
                            pathways={pathways}
                            selectedPathway={this.state.pathwaySelection}
                            width={VERTICAL_GENESET_DETAIL_WIDTH}
                          />
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
                <td style={{minWidth:250}} valign='top' width={250}>
                  <GeneSetInformationColumn
                    cohort={this.state.selectedCohort}
                    cohortColor={this.state.cohortColors}
                    cohortIndex={1}
                    geneDataStats={this.state.geneData && this.state.geneData[0].pathwaySelection ? this.state.geneData : this.state.pathwayData}
                    geneHoverData={this.state.geneHoverData}
                    onEditCohorts={this.handleEditCohorts}
                    onShowCohortEditor={this.handleEditCohorts}
                    pathwayData={this.state.pathwayData}
                    subCohortCounts={this.state.subCohortCounts}
                    view={this.state.filter}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>)
  }
}
