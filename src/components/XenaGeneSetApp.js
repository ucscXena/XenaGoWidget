import React from 'react';
import PureComponent from './PureComponent';
import XenaGoViewer from './XenaGoViewer';
import PathwayEditor from './pathwayEditor/PathwayEditor';
import {AppStorageHandler} from '../service/AppStorageHandler';
import NavigationBar from './NavigationBar';
import {GeneSetSelector} from './GeneSetSelector';
import {
  calculateAllPathways, generateScoredData,
} from '../functions/DataFunctions';
import FaClose from 'react-icons/lib/fa/close';
import BaseStyle from '../css/base.css';
import {LabelTop} from './LabelTop';
import VerticalGeneSetScoresView from './VerticalGeneSetScoresView';
import {ColorEditor} from './ColorEditor';
import {Dialog} from 'react-toolbox';
import {fetchCombinedCohorts} from '../functions/FetchFunctions';

let xenaQuery = require('ucsc-xena-client/dist/xenaQuery');
let {sparseDataMatchPartialField, refGene} = xenaQuery;
import CrossHairH from './CrossHairH';
import CrossHairV from './CrossHairV';
import {getCohortDetails, getSubCohortsOnlyForCohort} from '../functions/CohortFunctions';
import {isEqual} from 'underscore';
import update from 'immutability-helper';
import {SortType} from '../functions/SortFunctions';
import VerticalLegend from './VerticalLegend';
import FaExpand from 'react-icons/lib/fa/arrows-alt';



export const XENA_VIEW = 'xena';
export const PATHWAYS_VIEW = 'pathways';
const VIEWER_HEIGHT = 500;

const VERTICAL_SELECTOR_WIDTH = 220;
export const VERTICAL_GENESET_DETAIL_WIDTH = 180;
export const VERTICAL_GENESET_SUPPRESS_WIDTH = 20;
const ARROW_WIDTH = 20;
const BORDER_OFFSET = 2;

export const MIN_FILTER = 2;


export const LABEL_A = 'A';
export const LABEL_B = 'B';

export const MIN_GENE_WIDTH_PX = 80;// 8 or less
export const MAX_GENE_WIDTH = 85;
export const MAX_GENE_LAYOUT_WIDTH_PX = 12 * MAX_GENE_WIDTH; // 85 genes

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
    let cohortDataA = AppStorageHandler.getCohortState(0);
    let cohortDataB = AppStorageHandler.getCohortState(1);

    this.state = {
      // TODO: this should use the full cohort Data, not just the top-level
      selectedCohort:[
        cohortDataA,
        cohortDataB,
      ],
      view: XENA_VIEW,
      fetch: false,
      loading:LOAD_STATE.UNLOADED,
      showColorEditor: false,
      showDetailLayer: true,
      showDiffLayer: true,
      pathwaySet: {
        name: 'Default Pathway',
        pathways,
        selected: true
      },
      filter:[
        AppStorageHandler.getFilterState(0)  ,
        AppStorageHandler.getFilterState(1)  ,
      ],
      hoveredPathway: undefined,
      geneData: [{}, {}],
      pathwayData: [{}, {}],
      showPathwayDetails: false,
      geneHits: [],
      selectedGene: undefined,
      reference: refGene['hg38'],
      limit: 25,
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
        filterCounts,
        cohortData,

        samplesA,
        mutationsA,
        copyNumberA,
        genomeBackgroundMutationA,
        genomeBackgroundCopyNumberA,
        samplesB,
        mutationsB,
        copyNumberB,
        genomeBackgroundMutationB,
        genomeBackgroundCopyNumberB,
        selectedCohorts,
      } = input;

      // TODO: calculate Diff!
      // TODO: update Xena Go Viewers

      let pathwayDataA = {
        geneList,
        pathways,
        cohortData,
        cohort: selectedCohorts[0],
        filter: this.state.filter[0],
        filterCounts: filterCounts[0],

        copyNumber: copyNumberA,
        expression: mutationsA,
        samples: samplesA,
        genomeBackgroundMutation: genomeBackgroundMutationA,
        genomeBackgroundCopyNumber: genomeBackgroundCopyNumberA,
      };


      let pathwayDataB = {
        geneList,
        pathways,
        cohortData,
        cohort: selectedCohorts[1],
        filter: this.state.filter[1],
        filterCounts: filterCounts[1],

        copyNumber: copyNumberB,
        expression: mutationsB,
        samples: samplesB,
        genomeBackgroundMutation: genomeBackgroundMutationB,
        genomeBackgroundCopyNumber: genomeBackgroundCopyNumberB,
      };

      pathways = calculateAllPathways([pathwayDataA,pathwayDataB]);

      pathwayDataA.pathways = pathways ;
      pathwayDataB.pathways = pathways ;

      AppStorageHandler.storePathways(pathways);


      let selection = AppStorageHandler.getPathwaySelection();
      let geneData = generateScoredData(selection,[pathwayDataA,pathwayDataB],pathways,this.state.filter,showClusterSort);

      currentLoadState = LOAD_STATE.LOADED;
      this.setState({
        pathwaySelection: selection,
        geneList,
        pathways,
        geneData,
        pathwayData: [pathwayDataA,pathwayDataB],
        loading: LOAD_STATE.LOADED,
        currentLoadState: LOAD_STATE.LOADED,
        processing: false,
        fetch: false,
      });


    };

    getActiveApp() {
      return this.state.pathwaySet;
    }

    handleShowPathwayEditor = () => {
      this.setState({
        view: PATHWAYS_VIEW
      });
    };

    handleSaveAndClosePathwayEditor = (updatedPathwaySet) => {
      AppStorageHandler.storePathways(updatedPathwaySet.pathways);
      this.setState({
        view: XENA_VIEW,
        pathwaySet: updatedPathwaySet,
        pathways: updatedPathwaySet.pathways,
        fetch: true,
        currentLoadState: LOAD_STATE.LOADING,
      });
    };

    editGeneSetColors = () => {
      // alert('configuring xena')
      this.handleColorToggle();
      // this.setState({
      //     view: XENA_VIEW
      // })
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
          expression: otherPathway, // for dipslaying the hover
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

      let {pathwayData,filter} = this.state;

      if (pathwaySelection.gene.length === 0) {
        return;
      }
      let pathwaySelectionWrapper = {
        pathway:pathwaySelection,
        tissue: 'Header'
      };
      AppStorageHandler.storePathwaySelection(pathwaySelectionWrapper);

      const geneSetPathways = AppStorageHandler.getPathways();
      let geneData = generateScoredData(pathwaySelectionWrapper,pathwayData,geneSetPathways,filter,showClusterSort);

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

      this.setState( {selectedCohort: newCohortState,fetch: true,currentLoadState: LOAD_STATE.LOADING});
    };

    handleChangeSubCohort = (selectedCohort, cohortIndex) => {
      let updateCohortState = update(this.state.selectedCohort,{
        [cohortIndex]: {
          selectedSubCohorts: { $set: selectedCohort.selectedSubCohorts }
        }
      });
      AppStorageHandler.storeCohortState(updateCohortState[cohortIndex], cohortIndex);
      this.setState( {selectedCohort: updateCohortState,fetch: true,currentLoadState: LOAD_STATE.LOADING});
    };

    handleChangeFilter = (newFilter, cohortIndex) => {
      AppStorageHandler.storeFilterState(newFilter, cohortIndex);
      let {pathwayData,pathwaySelection,filter} = this.state;
      let filterState = [
        cohortIndex===0 ? newFilter : filter[0]  ,
        cohortIndex===1 ? newFilter : filter[1]  ,
      ];

      let newPathwayData = update(pathwayData,{
        [cohortIndex]: {
          filter: { $set: newFilter},
        }
      });

      let pathwayClickData = {
        pathway: pathwaySelection.pathway
      };

      let newPathways = calculateAllPathways(newPathwayData);
      let geneData = generateScoredData(pathwayClickData,newPathwayData,newPathways,filterState,showClusterSort);
      this.setState({ filter:filterState ,geneData,pathways:newPathways,pathwayData:newPathwayData,fetch:true,currentLoadState: LOAD_STATE.LOADING});
    };

    render() {
      let activeApp = this.getActiveApp();
      let pathways = activeApp.pathways;
      let leftPadding = this.state.showPathwayDetails ? VERTICAL_GENESET_DETAIL_WIDTH - ARROW_WIDTH : VERTICAL_GENESET_SUPPRESS_WIDTH;

      if(this.doRefetch()){
        currentLoadState = LOAD_STATE.LOADING;
        fetchCombinedCohorts(this.state.selectedCohort,pathways,this.state.filter,this.handleCombinedCohortData);
      }

      return (
        <div>

          <NavigationBar
            acceptGeneHandler={this.geneHighlight}
            editGeneSetColors={this.editGeneSetColors}
            geneOptions={this.state.geneHits}
            onShowPathways={this.handleShowPathwayEditor}
            onShowXena={this.handleSaveAndClosePathwayEditor}
            searchHandler={this.searchHandler}
            showClusterSort={showClusterSort}
            showDetailLayer={this.state.showDetailLayer}
            showDiffLayer={this.state.showDiffLayer}
            toggleShowClusterSort={this.toggleShowClusterSort}
            toggleShowDetailLayer={this.toggleShowDetailLayer}
            toggleShowDiffLayer={this.toggleShowDiffLayer}
            view={this.state.view}
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
            <Dialog
              active={this.state.view === PATHWAYS_VIEW}
              onEscKeyDown={() => this.setState({view:XENA_VIEW})}
              onOverlayClick={() => this.setState({view:XENA_VIEW})}
              title='Edit Pathways'
            >
              <PathwayEditor
                onClose={this.handleSaveAndClosePathwayEditor}
                pathwaySet={this.state.pathwaySet}
                ref='pathway-editor'
                selectedPathway={this.state.selectedPathway}
              />
            </Dialog>
            <table>
              <tbody>
                <tr>
                  <td>
                    <table>
                      <tbody>
                        <tr>
                          <td colSpan={3}>
                            <VerticalLegend/>
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
                              cohortLabel={LABEL_A}
                              data={this.state.pathwayData[0]}
                              filter={this.state.filter[0]}
                              labelHeight={18 + 2 * BORDER_OFFSET}
                              onClick={this.handleVerticalGeneSetSelect}
                              onHover={this.handlePathwayHover}
                              onMouseOut={this.handlePathwayHover}
                              pathways={pathways}
                              selectedCohort={this.state.selectedCohort[0]}
                              showDetails={this.state.showPathwayDetails}
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
                              cohortLabel={LABEL_B}
                              data={this.state.pathwayData[1]}
                              filter={this.state.filter[1]}
                              labelHeight={18 + 2 * BORDER_OFFSET}
                              onClick={this.handleVerticalGeneSetSelect}
                              onHover={this.handlePathwayHover}
                              onMouseOut={this.handlePathwayHover}
                              pathways={pathways}
                              selectedCohort={this.state.selectedCohort[1]}
                              showDetails={this.state.showPathwayDetails}
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
                                    cohortLabel={LABEL_A}

                                    // view
                                    collapsed={this.state.collapsed}
                                    colorSettings={this.state.geneStateColors}

                                    // data
                                    filter={this.state.filter[0]}
                                    geneDataStats={this.state.geneData[0]}
                                    geneHoverData={this.state.geneHoverData ? this.state.geneHoverData[0] : {}}

                                    // maybe state?
                                    highlightedGene={this.state.highlightedGene}
                                    onChangeCohort={this.handleChangeCohort}
                                    onChangeFilter={this.handleChangeFilter}

                                    // new pathway data
                                    onChangeSubCohort={this.handleChangeSubCohort}
                                    onGeneHover={this.handleGeneHover}

                                    // functions
                                    onSetCollapsed={this.handleSetCollapsed}
                                    pathwayData={this.state.pathwayData[0]}
                                    pathwaySelection={this.state.pathwaySelection}
                                    pathways={pathways}
                                    renderHeight={VIEWER_HEIGHT}

                                    // state
                                    renderOffset={0}
                                    selectedCohort={this.state.selectedCohort[0]}
                                    showDetailLayer={this.state.showDetailLayer}
                                    showDiffLayer={this.state.showDiffLayer}
                                  />
                                  <XenaGoViewer
                                    // reference
                                    cohortIndex={1}
                                    cohortLabel={LABEL_B}

                                    // view
                                    collapsed={this.state.collapsed}
                                    colorSettings={this.state.geneStateColors}

                                    // data
                                    filter={this.state.filter[1]}
                                    geneDataStats={this.state.geneData[1]}
                                    geneHoverData={this.state.geneHoverData ? this.state.geneHoverData[1] : {}}

                                    // maybe state?
                                    highlightedGene={this.state.highlightedGene}
                                    onChangeCohort={this.handleChangeCohort}
                                    onChangeFilter={this.handleChangeFilter}

                                    // new pathway data
                                    onChangeSubCohort={this.handleChangeSubCohort}
                                    onGeneHover={this.handleGeneHover}

                                    // functions
                                    onSetCollapsed={this.handleSetCollapsed}
                                    pathwayData={this.state.pathwayData[1]}
                                    pathwaySelection={this.state.pathwaySelection}
                                    pathways={pathways}
                                    renderHeight={VIEWER_HEIGHT}

                                    // state
                                    renderOffset={VIEWER_HEIGHT - 3}
                                    selectedCohort={this.state.selectedCohort[1]}
                                    showDetailLayer={this.state.showDetailLayer}
                                    showDiffLayer={this.state.showDiffLayer}
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
