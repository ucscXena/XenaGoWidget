import React from 'react';
import PropTypes from 'prop-types';
import PureComponent from './PureComponent';
import {CohortSelector} from './CohortSelector';
import PathwayScoresView from './PathwayScoresView';
import '../css/base.css';
import HoverGeneView from './HoverGeneView';
import {FILTER_ENUM, FilterSelector} from './FilterSelector';

import {Card,Button} from 'react-toolbox';

import {MAX_GENE_LAYOUT_WIDTH_PX, MAX_GENE_WIDTH, MIN_GENE_WIDTH_PX} from './XenaGeneSetApp';
import {DetailedLegend} from './DetailedLegend';
import {
  getGenesForPathways,
} from '../functions/CohortFunctions';
import {partition} from '../functions/MathFunctions';
import {GeneExpressionLegend} from './GeneExpressionLegend';
const MIN_WIDTH = 400;
const MIN_COL_WIDTH = 12;

let layout = (width, {length = 0} = {}) => partition(width, length);

const style = {
  pathway: {
    columns: 2,
    columnWidth: 200,
    expressionColumns: 4,
    expressionWidth: 400,
  },
  gene: {
    columns: 2,
    columnWidth: 200,
    expressionColumns: 4,
    expressionWidth: 400,
  },
};


export default class XenaGoViewer extends PureComponent {

    handleGeneHover = (geneHoverProps) => {
      if (geneHoverProps) {
        geneHoverProps.cohortIndex = this.props.cohortIndex;
        geneHoverProps.expression.samplesAffected = geneHoverProps.pathway.samplesAffected;
      }
      this.props.onGeneHover(geneHoverProps);

    };

    handleChangeFilter = (filter) => {
      this.props.onChangeFilter(filter,this.props.cohortIndex);
    };

    handleSelectCohort = (selected) => {
      this.props.onChangeCohort(selected,this.props.cohortIndex);
    };

    handleSelectSubCohort = (subCohortSelected) => {
      this.props.onChangeSubCohort(subCohortSelected,this.props.cohortIndex);
    };

    hasDataForFilter(geneData,filter){
      if(!geneData) return false;
      switch (filter) {
      case FILTER_ENUM.GENE_EXPRESSION:
        return geneData.geneExpression!==undefined;
      case FILTER_ENUM.COPY_NUMBER:
        return geneData.copyNumber!==undefined;
      case FILTER_ENUM.MUTATION:
        return geneData.expression && geneData.expression.rows && geneData.expression.rows.length>0;
      case FILTER_ENUM.CNV_MUTATION:
        return this.hasDataForFilter(geneData,FILTER_ENUM.COPY_NUMBER) && this.hasDataForFilter(geneData,FILTER_ENUM.MUTATION);
      default:
        // eslint-disable-next-line no-console
        console.error('Error for gene data and filter',geneData,filter);
        return false;
      }
    }

    render() {
      let geneList = getGenesForPathways(this.props.pathways);

      let {renderHeight, renderOffset, cohortIndex,selectedCohort,cohortLabel,filter,
        geneDataStats, geneHoverData, onSetCollapsed , collapsed,
        highlightedGene, colorSettings, showDiffLayer, showDetailLayer,
        pathwayData, swapCohorts, copyCohorts, handleVersusAll,
      } = this.props;

      // let { processing, pathwayData } = this.state ;
      let genesInGeneSet = geneDataStats.data.length;
      let calculatedWidth;
      if (genesInGeneSet < 8) {
        calculatedWidth = genesInGeneSet * MIN_GENE_WIDTH_PX;
      } else if (genesInGeneSet > 85 && collapsed) {
        calculatedWidth = MAX_GENE_LAYOUT_WIDTH_PX;
      } else {
        calculatedWidth = Math.max(MIN_WIDTH, MIN_COL_WIDTH * geneDataStats.pathways.length);
      }

      let layoutData = layout(calculatedWidth, geneDataStats.data);
      if (pathwayData) {
        return (
          <table>
            <tbody>
              {this.hasDataForFilter(geneDataStats,filter) &&
                    <tr>
                      <td
                        style={{paddingRight: 20, paddingLeft: 20, paddingTop: 0, paddingBottom: 0}}
                        valign="top"
                      >
                        <Card style={{height: 300, width: style.gene.columnWidth, marginTop: 5}}>
                          <CohortSelector
                            cohortIndex={cohortIndex}
                            cohortLabel={cohortLabel}
                            copyCohorts={copyCohorts}
                            filter={filter}
                            filterCounts={geneDataStats.filterCounts}
                            handleVersusAll={handleVersusAll}
                            onChange={this.handleSelectCohort}
                            onChangeSubCohort={this.handleSelectSubCohort}
                            selectedCohort={selectedCohort}
                            swapCohorts={swapCohorts}
                          />
                          <FilterSelector
                            geneList={geneList}
                            onChange={this.handleChangeFilter}
                            pathwayData={geneDataStats}
                            selected={filter}
                          />
                          <HoverGeneView
                            cohortIndex={cohortIndex}
                            data={geneHoverData}
                            filter={filter}
                          />
                        </Card>
                        {geneDataStats.pathways.length > MAX_GENE_WIDTH &&
                            <Card style={{height: 30, width: style.gene.columnWidth, marginTop: 5}}>
                              {collapsed &&
                                <Button
                                  flat icon='chevron_right' onClick={() => onSetCollapsed(false)}
                                  primary
                                >Expand</Button>
                              }
                              {!collapsed &&
                                <Button
                                  icon='chevron_left'
                                  onClick={() => onSetCollapsed(true)}
                                >Collapse</Button>
                              }
                            </Card>
                        }
                        { filter !== FILTER_ENUM.GENE_EXPRESSION && <DetailedLegend/>}
                        { filter === FILTER_ENUM.GENE_EXPRESSION && <GeneExpressionLegend/>}
                      </td>
                      <td style={{padding: 0}}>
                        <PathwayScoresView
                          calculatedWidth={calculatedWidth}
                          cohortIndex={cohortIndex}
                          collapsed={collapsed}
                          colorSettings={colorSettings}
                          dataStats={geneDataStats}
                          filter={filter}
                          geneList={geneList}
                          height={renderHeight}
                          highlightedGene={highlightedGene}
                          layoutData={layoutData}
                          offset={renderOffset}
                          onHover={this.handleGeneHover}
                          showDetailLayer={showDetailLayer}
                          showDiffLayer={showDiffLayer}
                        />
                      </td>
                    </tr>
              }
            </tbody>
          </table>
        );
      }

      // return (
      //     <Dialog active={processing} title='Loading'>
      //         {selectedCohort}
      //     </Dialog>
      // );
    }
}

XenaGoViewer.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  cohortLabel: PropTypes.any.isRequired,
  collapsed: PropTypes.any,
  colorSettings: PropTypes.any,
  copyCohorts: PropTypes.any.isRequired,
  filter: PropTypes.any.isRequired,
  geneDataStats: PropTypes.any.isRequired,
  geneHoverData: PropTypes.any.isRequired,
  highlightedGene: PropTypes.any,
  onChangeCohort: PropTypes.any.isRequired,
  onChangeFilter: PropTypes.any.isRequired,
  onChangeSubCohort: PropTypes.any.isRequired,
  onGeneHover: PropTypes.any.isRequired, // optional
  onSetCollapsed: PropTypes.any,
  pathwayData: PropTypes.any.isRequired,
  pathwaySelection: PropTypes.any.isRequired,
  pathways: PropTypes.any.isRequired,


  renderHeight: PropTypes.any.isRequired,
  renderOffset: PropTypes.any.isRequired,
  selectedCohort: PropTypes.any.isRequired,

  showDetailLayer: PropTypes.any,
  showDiffLayer: PropTypes.any,
  swapCohorts: PropTypes.any.isRequired,
};
