import React from 'react';
import PureComponent from './PureComponent';
import XenaGoViewer from './XenaGoViewer';
import {AppStorageHandler} from '../service/AppStorageHandler';
import NavigationBar from './NavigationBar';
import {GeneSetSelector} from './GeneSetSelector';
import {
  calculateAllPathways, generateScoredData, generateZScoreForBoth, isViewGeneExpression,
} from '../functions/DataFunctions';
import FaRefresh from 'react-icons/lib/fa/refresh';
import FaClose from 'react-icons/lib/fa/close';
import BaseStyle from '../css/base.css';
import {LabelTop} from './LabelTop';
import VerticalGeneSetScoresView from './VerticalGeneSetScoresView';
import {ColorEditor} from './ColorEditor';
import {Dialog} from 'react-toolbox';
import {
  fetchBestPathways,
  fetchCombinedCohorts, getCohortDataForView, getGeneSetsForView,
} from '../functions/FetchFunctions';

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {sparseDataMatchPartialField, refGene} = xenaQuery;
import CrossHairH from './CrossHairH';
import CrossHairV from './CrossHairV';
import {getCohortDetails, getSubCohortsOnlyForCohort, matchViews} from '../functions/CohortFunctions';
import {isEqual} from 'underscore';
import update from 'immutability-helper';
import {scorePathway, SortType} from '../functions/SortFunctions';
import VerticalLegend from './VerticalLegend';
import FaExpand from 'react-icons/lib/fa/arrows-alt';
import QueryString from 'querystring';
import {calculateCohorts, calculateViews, calculateGeneSet, generatedUrlFunction} from '../functions/UrlFunctions';
import GeneSetEditor from './GeneSetEditor';
import Button from 'react-toolbox/lib/button';
import FaSortAsc from 'react-icons/lib/fa/sort-alpha-asc';
import FaSortDesc from 'react-icons/lib/fa/sort-alpha-desc';
import {DetailedLegend} from './DetailedLegend';
import {GeneExpressionLegend} from './GeneExpressionLegend';


const VIEWER_HEIGHT = 500;
const VERTICAL_SELECTOR_WIDTH = 220;
export const VERTICAL_GENESET_DETAIL_WIDTH = 180;
export const VERTICAL_GENESET_SUPPRESS_WIDTH = 20;
const ARROW_WIDTH = 20;
const BORDER_OFFSET = 2;

export const MIN_FILTER = 2;
export const MIN_GENE_WIDTH_PX = 80;// 8 or less
export const MAX_GENE_WIDTH = 85;
export const MAX_GENE_LAYOUT_WIDTH_PX = 12 * MAX_GENE_WIDTH; // 85 genes

export const DEFAULT_GENE_SET_LIMIT = 45 ;

const LOAD_STATE = {
  UNLOADED: 'unloaded',
  LOADING: 'loading',
  LOADED: 'loaded',
};

let currentLoadState = LOAD_STATE.UNLOADED ;
let showClusterSort = AppStorageHandler.getSortState()===SortType.CLUSTER;

/**
 * refactor that from index
 */
export default class XenaGeneSetApp extends PureComponent {


  constructor(props) {
    super(props);

    const pathways = AppStorageHandler.getPathways();
    const urlVariables = QueryString.parse(location.hash.substr(1));

    const views = calculateViews(urlVariables);
    const selectedGeneSet = calculateGeneSet(urlVariables,pathways);
    const cohorts = calculateCohorts(urlVariables);

    this.state = {
      // TODO: this should use the full cohort Data, not just the top-level
      selectedCohort: cohorts,
      fetch: false,
      automaticallyReloadPathways: true,
      reloadPathways: process.env.NODE_ENV!=='test' ,
      loading:LOAD_STATE.UNLOADED,
      pathwaySelection: selectedGeneSet,
      showColorEditor: false,
      showDetailLayer: true,
      showDiffLayer: true,
      sortViewOrder:'desc',
      sortViewBy:'Diff',
      viewOrder:'desc',
      viewBy:'AbsDiff',
      view:views,
      hoveredPathway: undefined,
      geneData: [{}, {}],
      pathwayData: [{}, {}],
      showPathwayDetails: true,
      showGeneSetSearch: false,
      geneHits: [],
      selectedGene: undefined,
      reference: refGene['hg38'],
      limit: 25,
      geneSetLimit: DEFAULT_GENE_SET_LIMIT,
      highlightedGene: undefined,
      collapsed: true,
      mousing: false,
      x:-1,
      y:-1,
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
      }
    };
  }

  componentDidUpdate() {
    const generatedUrl = generatedUrlFunction(
      this.state.view[0],
      this.state.view[1],
      this.state.pathwaySelection.pathway.golabel,
      this.state.selectedCohort[0].name,
      this.state.selectedCohort[1].name,
      this.state.selectedCohort[0].selectedSubCohorts,
      this.state.selectedCohort[1].selectedSubCohorts,
    );
    if(location.hash !== generatedUrl){
      location.hash = generatedUrl ;
    }
  }


  queryGenes = (geneQuery) => {
    let {reference: {host, name}, limit} = this.state;
    if (geneQuery.trim().length === 0) {
      this.setState({
        geneHits: []
      });
      return;
    }
    let subscriber = sparseDataMatchPartialField(host, 'name2', name, geneQuery, limit);
    subscriber.subscribe(matches => {
      this.setState({
        geneHits: matches
      });
    }
    );
  };

    handleCombinedCohortData = (input) => {
      let {
        pathways,
        geneList,
        viewCounts,
        cohortData,

        samplesA,
        mutationsA,
        copyNumberA,
        geneExpressionA,
        geneExpressionPathwayActivityA,
        paradigmA,
        paradigmPathwayActivityA,
        genomeBackgroundMutationA,
        genomeBackgroundCopyNumberA,
        samplesB,
        mutationsB,
        copyNumberB,
        geneExpressionB,
        geneExpressionPathwayActivityB,
        paradigmB,
        paradigmPathwayActivityB,
        genomeBackgroundMutationB,
        genomeBackgroundCopyNumberB,
        selectedCohorts,
      } = input;

      // get mean and stdev over both geneExpression arrays over each gene, we would assume they are for the same gene order
      const [geneExpressionZScoreA,geneExpressionZScoreB]  = generateZScoreForBoth(geneExpressionA,geneExpressionB);
      const [paradigmZScoreA,paradigmZScoreB]  = generateZScoreForBoth(paradigmA[1],paradigmB[1]);
      // const [paradigmZScoreA,paradigmZScoreB]  = [paradigmA,paradigmB];


      let pathwayDataA = {
        geneList,
        pathways,
        cohortData,
        cohort: selectedCohorts[0],
        view: this.state.view[0],
        viewCounts: viewCounts[0],
        copyNumber: copyNumberA,
        expression: mutationsA,
        geneExpression: geneExpressionZScoreA,
        geneExpressionPathwayActivity: geneExpressionPathwayActivityA[1],
        paradigm: paradigmZScoreA,
        paradigmPathwayActivity: paradigmPathwayActivityA[1],
        samples: samplesA,
        genomeBackgroundMutation: genomeBackgroundMutationA,
        genomeBackgroundCopyNumber: genomeBackgroundCopyNumberA,
      };


      let pathwayDataB = {
        geneList,
        pathways,
        cohortData,
        cohort: selectedCohorts[1],
        view: this.state.view[1],
        viewCounts: viewCounts[1],

        copyNumber: copyNumberB,
        expression: mutationsB,
        geneExpression: geneExpressionZScoreB,
        geneExpressionPathwayActivity: geneExpressionPathwayActivityB[1],
        paradigm: paradigmZScoreB,
        paradigmPathwayActivity: paradigmPathwayActivityB[1],
        samples: samplesB,
        genomeBackgroundMutation: genomeBackgroundMutationB,
        genomeBackgroundCopyNumber: genomeBackgroundCopyNumberB,
      };

      pathways = calculateAllPathways([pathwayDataA,pathwayDataB]);
      pathwayDataA.pathways = pathways ;
      pathwayDataB.pathways = pathways ;

      AppStorageHandler.storePathways(pathways);


      let selection = AppStorageHandler.getPathwaySelection();
      if(!selection.golabel){
        selection.pathway = pathways[0];
      }
      let geneData = generateScoredData(selection,[pathwayDataA,pathwayDataB],pathways,this.state.view,showClusterSort);

      currentLoadState = LOAD_STATE.LOADED;
      this.setState({
        pathwaySelection: selection,
        geneList,
        pathways,
        geneData,
        pathwayData: [pathwayDataA,pathwayDataB],
        loading: LOAD_STATE.LOADED,
        currentLoadState: currentLoadState,
        processing: false,
        fetch: false,
      });


    };

    editGeneSetColors = () => {
      this.handleColorToggle();
    };

    geneHighlight = (geneName) => {
      this.setState(
        {
          highlightedGene: geneName
        }
      );
    };

    handleGeneHover = (geneHover) => {
      if(geneHover){
        const otherCohortIndex = geneHover.cohortIndex === 0 ? 1 : 0 ;
        let geneHoverData = [];
        geneHoverData[geneHover.cohortIndex] = geneHover;

        const gene = geneHover.pathway.gene[0] ;
        const otherPathway = this.state.geneData[otherCohortIndex].pathways.filter( p => p.gene[0] === gene )[0];
        geneHoverData[otherCohortIndex] = {
          cohortIndex: otherCohortIndex,
          tissue: 'Header',
          pathway : otherPathway,
          expression: otherPathway, // for displaying the hover
        };

        this.setState({
          geneHoverData
        });
      }
    };


    handlePathwayHover = (hoveredPathway) => {

      const geneHoverData = hoveredPathway ? [
        {
          tissue: 'Header',
          pathway: hoveredPathway,
          expression: {
            affected: hoveredPathway.firstObserved,
            samplesAffected: hoveredPathway.firstObserved,
            geneExpressionMean: hoveredPathway.firstGeneExpressionMean,
            allGeneAffected: hoveredPathway.firstTotal,
            total: hoveredPathway.firstNumSamples,
          }
        },
        {

          tissue: 'Header',
          pathway: hoveredPathway,
          expression: {
            affected: hoveredPathway.secondObserved,
            samplesAffected: hoveredPathway.secondObserved,
            geneExpressionMean: hoveredPathway.secondGeneExpressionMean,
            allGeneAffected: hoveredPathway.secondTotal,
            total: hoveredPathway.secondNumSamples,
          }
        }
      ] : null ;

      this.setState({
        hoveredPathway,
        geneHoverData
      });
    };

    handleVerticalGeneSetSelect = (pathwaySelection) => {
      if(this.state.showPathwayDetails){
        this.handlePathwaySelect(pathwaySelection);
      }
      else{
        this.handleShowGeneSetDetail();
      }

    };

    handlePathwaySelect = (pathwaySelection) => {

      let {pathwayData,view} = this.state;

      if (pathwaySelection.gene.length === 0) {
        return;
      }
      let pathwaySelectionWrapper = {
        pathway:pathwaySelection,
        tissue: 'Header'
      };
      AppStorageHandler.storePathwaySelection(pathwaySelectionWrapper);

      const geneSetPathways = AppStorageHandler.getPathways();
      let geneData = generateScoredData(pathwaySelectionWrapper,pathwayData,geneSetPathways,view,showClusterSort);

      this.setState({
        geneData,
        pathwaySelection: pathwaySelectionWrapper
      });
    };


    handleHideGeneSetDetail = () => {
      this.setState({
        showPathwayDetails: false
      });
    };

    handleShowGeneSetDetail = () => {
      this.setState({
        showPathwayDetails: true
      });
    };

    searchHandler = (geneQuery) => {
      this.queryGenes(geneQuery);
    };

    handleColorToggle = () => {
      this.setState({showColorEditor: !this.state.showColorEditor});
    };

    handleColorChange = (name, value) => {
      let newArray = JSON.parse(JSON.stringify(this.state.geneStateColors));
      newArray[name] = value;
      this.setState({
        geneStateColors: newArray
      });

    };


    toggleShowDiffLayer = () => {
      this.setState({
        showDiffLayer: !this.state.showDiffLayer
      });
    };

    toggleShowDetailLayer = () => {
      this.setState({
        showDetailLayer: !this.state.showDetailLayer
      });
    };

    toggleShowClusterSort = () => {
      showClusterSort = !showClusterSort;
      AppStorageHandler.storeSortState(showClusterSort ? SortType.CLUSTER : SortType.DIFF);
      this.handlePathwaySelect(this.state.pathwaySelection.pathway);
    };

    handleSetCollapsed = (collapsed) => {
      this.setState({
        collapsed: collapsed
      });
    };

    doRefetch(){

      if(this.state.fetch && currentLoadState!==LOAD_STATE.LOADING){
        return true ;
      }

      switch (currentLoadState) {
      case LOAD_STATE.LOADING:
        return false ;
      case LOAD_STATE.UNLOADED:
        return true ;

        // TODO: this should be calculated below depending on the state of gene data and if the selected cohort changed
      case LOAD_STATE.LOADED:
        return false ;

      }

      if(isEqual(this.state.geneData,[{},{}])) return true ;
      if(isEqual(this.state.pathwayData,[{},{}])) return true ;
      return !isEqual(this.state.selectedCohort[0], this.state.selectedCohort[1]);
    }

    handleChangeCohort = (selectedCohort, cohortIndex) => {
      let cohortDetails = getCohortDetails({name: selectedCohort});
      const subCohorts = getSubCohortsOnlyForCohort(selectedCohort);
      if(subCohorts){
        cohortDetails.subCohorts= subCohorts;
        cohortDetails.selectedSubCohorts = subCohorts;
      }

      const newCohortState = [
        cohortIndex === 0 ?  cohortDetails : this.state.selectedCohort[0]   ,
        cohortIndex === 1 ?  cohortDetails  : this.state.selectedCohort[1]   ,
      ];
      AppStorageHandler.storeCohortState(newCohortState[cohortIndex], cohortIndex);

      this.setState( {selectedCohort: newCohortState,fetch: true,currentLoadState: LOAD_STATE.LOADING,reloadPathways:this.state.automaticallyReloadPathways});
    };

    handleChangeSubCohort = (selectedCohort, cohortIndex) => {
      let updateCohortState = update(this.state.selectedCohort,{
        [cohortIndex]: {
          selectedSubCohorts: { $set: selectedCohort.selectedSubCohorts }
        }
      });
      AppStorageHandler.storeCohortState(updateCohortState[cohortIndex], cohortIndex);
      this.setState( {selectedCohort: updateCohortState,fetch: true,currentLoadState: LOAD_STATE.LOADING,reloadPathways:this.state.automaticallyReloadPathways});
    };

    handleChangeView = (newView, cohortIndex) => {
      AppStorageHandler.storeViewState(newView, cohortIndex);
      let {pathwayData,pathwaySelection,view} = this.state;
      const viewState = matchViews(view,newView,cohortIndex);

      let newPathwayData = update(pathwayData,{
        [cohortIndex]: {
          view: { $set: newView},
        }
      });

      let pathwayClickData = {
        pathway: pathwaySelection.pathway
      };

      let newPathways = calculateAllPathways(newPathwayData);
      let geneData = generateScoredData(pathwayClickData,newPathwayData,newPathways,viewState,showClusterSort);
      this.setState({ view:viewState ,geneData,pathways:newPathways,pathwayData:newPathwayData,fetch:true,currentLoadState: LOAD_STATE.LOADING,reloadPathways:this.state.automaticallyReloadPathways});
    };


  handleVersusAll = (selectedSubCohort,cohortSourceIndex) => {
    // select ONLY
    const sourceCohort = update(this.state.selectedCohort[cohortSourceIndex],{
      selectedSubCohorts: { $set: [selectedSubCohort] }
    });

    // select ALL
    const targetCohort = update(this.state.selectedCohort[cohortSourceIndex],{
      selectedSubCohorts: { $set: this.state.selectedCohort[cohortSourceIndex].subCohorts}
    });


    const newCohortState = [
      cohortSourceIndex === 0 ? sourceCohort : targetCohort ,
      cohortSourceIndex === 0 ? targetCohort : sourceCohort,
    ];
    AppStorageHandler.storeCohortStateArray(newCohortState);
    const viewState = [
      this.state.view[cohortSourceIndex]  ,
      this.state.view[cohortSourceIndex]  ,
    ];
    AppStorageHandler.storeViewStateArray(viewState);
    this.setState( {selectedCohort: newCohortState,
      view:viewState,
      fetch: true,
      currentLoadState: LOAD_STATE.LOADING
    });
  };

  swapCohorts = () => {
    // TODO: swap cohorts, sub cohorts, views,
    const newCohortState = [
      this.state.selectedCohort[1]  ,
      this.state.selectedCohort[0],
    ];
    AppStorageHandler.storeCohortStateArray(newCohortState);
    const viewState = [
      this.state.view[1]  ,
      this.state.view[0]  ,
    ];
    AppStorageHandler.storeViewStateArray(viewState);
    this.setState( {
      selectedCohort: newCohortState,
      fetch: true,
      currentLoadState: LOAD_STATE.LOADING,
      view: viewState,
    });
  };

    copyCohorts = (cohortSourceIndex) => {
      // TODO: swap cohorts, sub cohorts, filters,
      const newCohortState = [
        this.state.selectedCohort[cohortSourceIndex]  ,
        this.state.selectedCohort[cohortSourceIndex],
      ];
      AppStorageHandler.storeCohortStateArray(newCohortState);
      const viewState = [
        this.state.view[cohortSourceIndex]  ,
        this.state.view[cohortSourceIndex]  ,
      ];
      AppStorageHandler.storeViewStateArray(viewState);
      this.setState( {selectedCohort: newCohortState,
        view:viewState,
        fetch: true,
        currentLoadState: LOAD_STATE.LOADING
      });
    };

    setActiveGeneSets = (newPathways) => {
      AppStorageHandler.storePathways(newPathways);

      let pathwaySelection = newPathways.filter( p => this.state.pathwaySelection.pathway.golabel===p.golabel );
      pathwaySelection = {
        tissue: 'Header',
        pathway: pathwaySelection.length>0 ? pathwaySelection[0] : newPathways[0],
      };
      this.setState({
        pathwaySelection,
        showGeneSetSearch: false,
        pathways:newPathways,
        fetch: true,
        reloadPathways: false,
        currentLoadState: LOAD_STATE.LOADING,
      });
    };

  handleMeanActivityData = (output) => {
    // 1. fetch activity
    const geneSets = getGeneSetsForView(this.state.view[0]);
    let loadedPathways = geneSets.map( p => {
      p.firstGeneExpressionPathwayActivity = undefined ;
      p.secondGeneExpressionPathwayActivity = undefined ;
      return p ;
    });
    let indexMap = {};
    geneSets.forEach( (p,index) => {
      indexMap[p.golabel] = index ;
    });

    for(let index in output.geneExpressionPathwayActivityA.field){
      const field = output.geneExpressionPathwayActivityA.field[index];
      const cleanField = field.indexOf(' (GO:') < 0 ? field :  field.substr(0,field.indexOf('GO:')-1).trim();
      const sourceIndex = indexMap[cleanField];
      loadedPathways[sourceIndex].firstGeneExpressionPathwayActivity = output.geneExpressionPathwayActivityA.mean[index];
      loadedPathways[sourceIndex].secondGeneExpressionPathwayActivity = output.geneExpressionPathwayActivityB.mean[index];
    }

    const sortedPathways = loadedPathways
      .filter( a => a.firstGeneExpressionPathwayActivity && a.secondGeneExpressionPathwayActivity )
      .sort( (a,b) => (this.state.viewOrder === 'asc' ? 1 : -1) * (scorePathway(a,this.state.viewBy)-scorePathway(b,this.state.viewBy)) )
      .slice(0,this.state.geneSetLimit)
      .sort( (a,b) => (this.state.sortViewOrder === 'asc' ? 1 : -1) * (scorePathway(a,this.state.sortViewBy)-scorePathway(b,this.state.sortViewBy)) );
    fetchCombinedCohorts(this.state.selectedCohort,sortedPathways,this.state.view,this.handleCombinedCohortData);

  };

  render() {
    let storedPathways = AppStorageHandler.getPathways();
    let pathways = this.state.pathways ? this.state.pathways : storedPathways;
    let leftPadding = this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH - ARROW_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH;

    if(this.doRefetch()){
      currentLoadState = LOAD_STATE.LOADING;
      // change gene sets here

      if(getCohortDataForView(this.state.selectedCohort,this.state.view[0])!==null){
        if(this.state.reloadPathways){
          fetchBestPathways(this.state.selectedCohort,this.state.view[0],this.handleMeanActivityData);
        }
        else{
          fetchCombinedCohorts(this.state.selectedCohort,pathways,this.state.view,this.handleCombinedCohortData);
        }
      }
      else{
        fetchCombinedCohorts(this.state.selectedCohort,pathways,this.state.view,this.handleCombinedCohortData);
      }
    }

    return (
      <div>

        <NavigationBar
          acceptGeneHandler={this.geneHighlight}
          editGeneSetColors={this.editGeneSetColors}
          geneOptions={this.state.geneHits}
          searchHandler={this.searchHandler}
          showClusterSort={showClusterSort}
          showDetailLayer={this.state.showDetailLayer}
          showDiffLayer={this.state.showDiffLayer}
          toggleShowClusterSort={this.toggleShowClusterSort}
          toggleShowDetailLayer={this.toggleShowDetailLayer}
          toggleShowDiffLayer={this.toggleShowDiffLayer}
        />

        <div>
          <Dialog
            active={this.state.currentLoadState === LOAD_STATE.LOADING}
            style={{width:400}}
            title="Loading"
          >
            <p>
              {this.state.selectedCohort[0].name} ...
              <br/>
              {this.state.selectedCohort[1].name} ...
            </p>
          </Dialog>
          <ColorEditor
            active={this.state.showColorEditor}
            colorSettings={this.state.geneStateColors}
            onColorChange={this.handleColorChange}
            onColorToggle={this.handleColorToggle}
          />
          {this.state.pathways &&
            <Dialog
              active={this.state.showGeneSetSearch}
              onEscKeyDown={() => this.setState({showGeneSetSearch:false})}
              onOverlayClick={() => this.setState({showGeneSetSearch:false})}
              title="Gene Set Editor"
            >
              <GeneSetEditor
                cancelPathwayEdit={() => this.setState({showGeneSetSearch:false})}
                pathwayData={this.state.pathwayData}
                pathways={this.state.pathways}
                setPathways={this.setActiveGeneSets}
                view={this.state.view[0]}
              />
            </Dialog>
          }
          <table>
            <tbody>
              <tr>
                <td>
                  <table>
                    <tbody>
                      <tr>
                        <td colSpan={1}>
                          <VerticalLegend/>
                        </td>
                        <td colSpan={1}>
                          { !isViewGeneExpression(this.state.view[0]) && <DetailedLegend/>}
                          { isViewGeneExpression(this.state.view[0]) && <GeneExpressionLegend/>}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3}>
                          <Button icon='edit' onClick={() => this.setState({showGeneSetSearch:true})} raised>
                            Edit Gene Sets&nbsp;
                            {this.state.pathways &&
                            <div style={{display:'inline'}}>
                              ({this.state.pathways.length})
                            </div>
                            }

                          </Button>
                          <Button onClick={() => {AppStorageHandler.resetSessionStorage() ; location.reload(); }} raised>
                            <FaRefresh/>
                              Reset
                          </Button>
                        </td>
                      </tr>
                      <tr>
                        <td className={BaseStyle.autoSortBox} colSpan={2}>
                          Sort on Cohort Change
                          <input
                            checked={this.state.automaticallyReloadPathways} onChange={() => this.setState({ automaticallyReloadPathways: !this.state.automaticallyReloadPathways})}
                            type='checkbox'
                          />
                          <br/>
                          Limit <input onChange={(event) => this.setState({geneSetLimit:event.target.value} )} size={3} value={this.state.geneSetLimit}/>
                          Filter Gene Sets by
                          <select onChange={(event) => this.setState({viewBy:event.target.value})} value={this.state.viewBy}>
                            <option value='AbsDiff'>Abs Diff</option>
                            <option value='Diff'>Cohort Diff</option>
                            <option value='Total'>Total</option>
                          </select>
                          {this.state.viewOrder === 'asc' &&
                          <FaSortAsc onClick={() => this.setState({viewOrder: 'desc'})}/>
                          }
                          {this.state.viewOrder === 'desc' &&
                          <FaSortDesc onClick={() => this.setState({viewOrder: 'asc'})}/>
                          }
                          <br/>
                          Sort Visible Gene Sets by
                          <select onChange={(event) => this.setState({sortViewBy:event.target.value})} value={this.state.sortViewBy}>
                            <option  value='AbsDiff'>Abs Diff</option>
                            <option  value='Diff'>Cohort Diff</option>
                            <option value='Total'>Total</option>
                          </select>
                          {this.state.sortViewOrder === 'asc' &&
                          <FaSortAsc onClick={() => this.setState({sortViewOrder: 'desc'})}/>
                          }
                          {this.state.sortViewOrder  === 'desc' &&
                          <FaSortDesc onClick={() => this.setState({sortViewOrder: 'asc'})}/>
                          }
                          <br/>
                          <br/>
                          <Button
                            onClick={() => { this.setState( {
                              fetch: true,
                              currentLoadState: LOAD_STATE.LOADING,
                              reloadPathways: true,
                            });}} primary raised
                          >Sort Gene Sets Now</Button>
                        </td>
                      </tr>
                      <tr>
                        <td width={this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH}>
                          {this.state.showPathwayDetails &&
                              <div style={{paddingLeft: leftPadding}}>
                                <FaClose
                                  className={BaseStyle.mouseHover}
                                  onClick={this.handleHideGeneSetDetail}
                                />
                              </div>
                          }
                          {!this.state.showPathwayDetails &&
                            <FaExpand
                              className={BaseStyle.mouseHover}
                              onClick={this.handleShowGeneSetDetail}
                            />
                          }
                        </td>
                        <td width={VERTICAL_SELECTOR_WIDTH - 20}>
                          <LabelTop width={VERTICAL_SELECTOR_WIDTH - 20}/>
                        </td>
                        <td width={this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH}>
                          {this.state.showPathwayDetails &&
                              <FaClose
                                className={BaseStyle.mouseHover}
                                onClick={this.handleHideGeneSetDetail}
                              />
                          }
                          {!this.state.showPathwayDetails &&
                            <FaExpand
                              className={BaseStyle.mouseHover}
                              onClick={this.handleShowGeneSetDetail}
                            />
                          }
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <VerticalGeneSetScoresView
                            cohortIndex={0}
                            data={this.state.pathwayData[0]}
                            labelHeight={18 + 2 * BORDER_OFFSET}
                            onClick={this.handleVerticalGeneSetSelect}
                            onHover={this.handlePathwayHover}
                            onMouseOut={this.handlePathwayHover}
                            pathways={pathways}
                            selectedCohort={this.state.selectedCohort[0]}
                            selectedGeneSet={this.state.pathwaySelection}
                            showDetails={this.state.showPathwayDetails}
                            view={this.state.view[0]}
                          />
                        </td>
                        <td width={VERTICAL_SELECTOR_WIDTH - 20}>
                          {this.state.pathways &&
                              <GeneSetSelector
                                geneStateColors={this.state.geneStateColors}
                                highlightedGene={this.state.highlightedGene}
                                hoveredPathway={this.state.hoveredPathway}
                                labelHeight={18}
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
                        <td>
                          <VerticalGeneSetScoresView
                            cohortIndex={1}
                            data={this.state.pathwayData[1]}
                            labelHeight={18 + 2 * BORDER_OFFSET}
                            onClick={this.handleVerticalGeneSetSelect}
                            onHover={this.handlePathwayHover}
                            onMouseOut={this.handlePathwayHover}
                            pathways={pathways}
                            selectedCohort={this.state.selectedCohort[1]}
                            selectedGeneSet={this.state.pathwaySelection}
                            showDetails={this.state.showPathwayDetails}
                            view={this.state.view[1]}
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>

                {this.state.loading===LOAD_STATE.LOADED &&
                                <td
                                  className="map_wrapper" onMouseMove={(ev) => {
                                    let topClient = ev.currentTarget.getBoundingClientRect().top;
                                    let scrollDownBuffer = 0 ;
                                    if(topClient < 0 ){
                                      scrollDownBuffer = -topClient + 74;
                                    }

                                    const x = ev.clientX + 8;
                                    const y = ev.clientY + 8 + scrollDownBuffer ;
                                    if(x>=530){
                                      this.setState({mousing: true, x, y});
                                    }
                                    else{
                                      this.setState({mousing: false, x, y});
                                    }
                                  }}
                                  onMouseOut={() => {
                                    this.setState({mousing: false});
                                  }}
                                  valign="top"
                                >
                                  <CrossHairH mousing={this.state.mousing} y={this.state.y}/>
                                  <CrossHairV height={VIEWER_HEIGHT * 2} mousing={this.state.mousing} x={this.state.x}/>
                                  <XenaGoViewer
                                    // reference
                                    cohortIndex={0}

                                    // view
                                    collapsed={this.state.collapsed}
                                    colorSettings={this.state.geneStateColors}
                                    copyCohorts={this.copyCohorts}

                                    // data
                                    geneDataStats={this.state.geneData[0]}
                                    geneHoverData={this.state.geneHoverData ? this.state.geneHoverData[0] : {}}
                                    highlightedGene={this.state.highlightedGene}

                                    // maybe state?
                                    onChangeCohort={this.handleChangeCohort}
                                    onChangeSubCohort={this.handleChangeSubCohort}
                                    onChangeView={this.handleChangeView}
                                    onGeneHover={this.handleGeneHover}

                                    // new pathway data
                                    onSetCollapsed={this.handleSetCollapsed}
                                    onVersusAll={this.handleVersusAll}

                                    // functions
                                    pathwayData={this.state.pathwayData[0]}
                                    pathways={pathways}
                                    pathwaySelection={this.state.pathwaySelection}
                                    renderHeight={VIEWER_HEIGHT}
                                    renderOffset={0}

                                    // state
                                    selectedCohort={this.state.selectedCohort[0]}
                                    showDetailLayer={this.state.showDetailLayer}
                                    showDiffLayer={this.state.showDiffLayer}
                                    swapCohorts={this.swapCohorts}
                                    view={this.state.view[0]}
                                  />
                                  <XenaGoViewer
                                    // reference
                                    cohortIndex={1}
                                    collapsed={this.state.collapsed}
                                    colorSettings={this.state.geneStateColors}
                                    copyCohorts={this.copyCohorts}

                                    // data
                                    geneDataStats={this.state.geneData[1]}
                                    geneHoverData={this.state.geneHoverData ? this.state.geneHoverData[1] : {}}
                                    highlightedGene={this.state.highlightedGene}

                                    // maybe state?
                                    onChangeCohort={this.handleChangeCohort}
                                    onChangeSubCohort={this.handleChangeSubCohort}
                                    onChangeView={this.handleChangeView}
                                    onGeneHover={this.handleGeneHover}

                                    // new pathway data
                                    onSetCollapsed={this.handleSetCollapsed}
                                    onVersusAll={this.handleVersusAll}

                                    // functions
                                    pathwayData={this.state.pathwayData[1]}
                                    pathways={pathways}
                                    pathwaySelection={this.state.pathwaySelection}
                                    renderHeight={VIEWER_HEIGHT}
                                    renderOffset={VIEWER_HEIGHT - 3}

                                    // state
                                    selectedCohort={this.state.selectedCohort[1]}
                                    showDetailLayer={this.state.showDetailLayer}
                                    showDiffLayer={this.state.showDiffLayer}
                                    swapCohorts={this.swapCohorts}
                                    view={this.state.view[1]}
                                  />
                                </td>
                }
              </tr>
            </tbody>
          </table>
        </div>
      </div>);
  }
}
