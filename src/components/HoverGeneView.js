import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Chip} from 'react-toolbox';
import BaseStyle from '../css/base.css';
import {ScoreBadge} from './ScoreBadge';
import {interpolateGeneExpression, interpolateGeneExpressionFont} from '../functions/DrawFunctions';
import {VIEW_ENUM} from '../data/ViewEnum';
import {isViewGeneExpression} from '../functions/DataFunctions';

export default class HoverGeneView extends PureComponent {

    /**
     * This returns the number of affected versus the total number versus a single gene
     * @param data
     * @returns {string}
     */
    getRatio = data => {
      let returnString = data.expression.samplesAffected + '/' + data.expression.total;
      returnString += '  (';
      returnString += ((Number.parseFloat(data.expression.samplesAffected ) / Number.parseFloat(data.expression.total)) * 100.0).toFixed(0);
      returnString += '%)';
      return returnString;
    };

    getAffectedPathway = data => {
      let returnString = data.expression.allGeneAffected + '/' + (data.expression.total * data.pathway.gene.length);
      returnString += '  (';
      returnString += ((Number.parseFloat(data.expression.allGeneAffected) / Number.parseFloat(data.expression.total * data.pathway.gene.length)) * 100.0).toFixed(0);
      returnString += '%)';
      return returnString;

    };

  findScore = (data, cohortIndex,filter) => {
    switch (filter) {
    case VIEW_ENUM.GENE_EXPRESSION:
      // return cohortIndex === 0 ? data.pathway.firstGeneExpressionPathwayActivity: data.pathway.secondGeneExpressionPathwayActivity;
      // shows individual samples if available
      if(cohortIndex===0){
        return data.pathway.firstSampleGeneExpressionPathwayActivity!==undefined ? data.pathway.firstSampleGeneExpressionPathwayActivity: data.pathway.firstGeneExpressionPathwayActivity;
      }
      else{
        return data.pathway.secondSampleGeneExpressionPathwayActivity!==undefined ? data.pathway.secondSampleGeneExpressionPathwayActivity: data.pathway.secondGeneExpressionPathwayActivity;
      }
    case VIEW_ENUM.PARADIGM:
      // shows individual samples if available
      if(cohortIndex===0){
        return data.pathway.firstSampleParadigmPathwayActivity!==undefined ? data.pathway.firstSampleParadigmPathwayActivity: data.pathway.firstParadigmPathwayActivity;
      }
      else{
        return data.pathway.secondSampleParadigmPathwayActivity!==undefined ? data.pathway.secondSampleParadigmPathwayActivity: data.pathway.secondParadigmPathwayActivity;
      }
    default:
      return cohortIndex === 0 ? data.pathway.firstChiSquared : data.pathway.secondChiSquared;
    }
  };

  render() {
    let {data, cohortIndex, filter} = this.props;
    if (data.tissue) {
      const score =this.findScore(data, cohortIndex,filter);

      // console.log('hoping that we get activity for the data item,',data)
      return (
        <div>
          {data.tissue !== 'Header' && data.source === 'GeneSet' &&
            <div className={BaseStyle.pathwayChip}>
              <span><strong>Pathway</strong> {data.pathway.golabel}</span>
              <br/>
              <span><strong>Sample</strong> {data.tissue}</span>
              <br/>
              <br/>
              <span
                className={BaseStyle.scoreBox}
                style={{
                  color:interpolateGeneExpressionFont(score),
                  backgroundColor:interpolateGeneExpression(score)
                }}
              >
                <strong>Mean Score</strong> {score.toFixed(2)}</span>
            </div>
          }
          {data.tissue !== 'Header' && data.source !== 'GeneSet' &&
                    <div>
                      {data.pathway &&
                      <div className={BaseStyle.pathwayChip}>
                        <span>{data.pathway.gene[0].replace(/_/g,' ')}</span>
                      </div>
                      }
                      {data.expression != null &&
                        <div>
                          {filter===VIEW_ENUM.PARADIGM &&
                          <div className={BaseStyle.pathwayChip}>
                            <strong>ZScore</strong>
                            <div
                              className={BaseStyle.scoreBox}
                              style={{
                                color:interpolateGeneExpressionFont(data.expression.paradigm)
                                ,backgroundColor:interpolateGeneExpression(data.expression.paradigm)
                              }}
                            >
                              {data.expression.paradigm.toPrecision(2)}
                            </div>
                          </div>
                          }
                          {filter===VIEW_ENUM.GENE_EXPRESSION &&
                          <div className={BaseStyle.pathwayChip}>
                            <strong>ZScore</strong>
                            <div
                              className={BaseStyle.scoreBox}
                              style={{
                                color:interpolateGeneExpressionFont(data.expression.geneExpression),
                                backgroundColor:interpolateGeneExpression(data.expression.geneExpression)
                              }}
                            >
                              {data.expression.geneExpression.toPrecision(2)}
                            </div>
                          </div>
                          }
                          {data.selectCnv && data.expression.cnvHigh > 0 &&
                            <Chip>
                              <span
                                className={data.expression.cnvHigh === 0 ? '' : BaseStyle.cnvHighColor}
                              ><strong>CNV Amplification</strong>
                                <ScoreBadge score={data.expression.cnvHigh}/>
                              </span>
                            </Chip>
                          }
                          {data.selectCnv && data.expression.cnvLow > 0 &&
                            <Chip>
                              <span
                                className={data.expression.cnvLow === 0 ? '' : BaseStyle.cnvLowColor}
                              ><strong>CNV Deletion</strong>
                                <ScoreBadge score={data.expression.cnvLow}/>
                              </span>
                            </Chip>
                          }
                          {!data.selectCnv && data.expression.mutation2 > 0 &&
                            <Chip>
                              <span
                                className={data.expression.mutation2 === 0 ? '' : BaseStyle.mutation2Color}
                              > <strong>Missense / Inframe </strong>
                                <ScoreBadge score={data.expression.mutation2}/>
                              </span>
                            </Chip>
                          }
                          {!data.selectCnv && data.expression.mutation3 > 0 &&
                            <Chip>
                              <span
                                className={data.expression.mutation3 === 0 ? '' : BaseStyle.mutation3Color}
                              > <strong>Splice</strong>
                                <ScoreBadge score={data.expression.mutation3}/>
                              </span>
                            </Chip>
                          }
                          {!data.selectCnv && data.expression.mutation4 > 0 &&
                            <Chip>
                              <span
                                className={data.expression.mutation4 === 0 ? '' : BaseStyle.mutation4Color}
                              > <strong>Deleterious</strong>
                                <ScoreBadge score={data.expression.mutation4}/>
                              </span>
                            </Chip>
                          }
                        </div>
                      }
                      {data.tissue &&
                        <Chip>
                          <span style={{margin: 0}}>
                            <strong>Sample</strong>
                            <span>{data.tissue}</span>
                          </span>
                        </Chip>
                      }
                    </div>
          }
          {data.tissue === 'Header' && data.pathway && data.pathway.gene.length === 1 && data.expression
              && data.expression.total > 0 && data.expression.allGeneAffected===undefined && filter !== VIEW_ENUM.GENE_EXPRESSION && filter !== VIEW_ENUM.PARADIGM &&
                    <div>
                      <div className={BaseStyle.pathwayChip}>
                        <span>{data.pathway.gene[0].replace(/_/,' ')}</span>
                      </div>
                      <div className={BaseStyle.pathwayChip}>
                        <span><strong>Samples Affected</strong><br/> {this.getRatio(data)}</span>
                      </div>
                    </div>
          }
          {data.tissue === 'Header' && data.pathway && data.pathway.gene.length === 1 && data.pathway
            && ( isViewGeneExpression(filter))  &&
            <div>
              <div className={BaseStyle.pathwayChip}>
                <span>{data.pathway.gene[0].replace(/_/g,' ')}</span>
              </div>
              <div className={BaseStyle.pathwayChip}>
                <span><strong>Mean ZScore</strong>
                  {filter===VIEW_ENUM.PARADIGM &&
                  <div
                    className={BaseStyle.scoreBox}
                    style={{
                      color: interpolateGeneExpressionFont(data.pathway.paradigmMean),
                      backgroundColor: interpolateGeneExpression(data.pathway.paradigmMean)
                    }}
                  >
                    {data.pathway.paradigmMean.toPrecision(2)}
                  </div>
                  }
                  {filter===VIEW_ENUM.GENE_EXPRESSION &&
                  <div
                    className={BaseStyle.scoreBox}
                    style={{
                      color: interpolateGeneExpressionFont(data.pathway.geneExpressionMean),
                      backgroundColor: interpolateGeneExpression(data.pathway.geneExpressionMean)
                    }}
                  >
                    {data.pathway.geneExpressionMean.toPrecision(2)}
                  </div>
                  }
                  <div style={{fontSize:'smaller',display: 'inline'}}>({data.expression.total})</div>
                </span>
              </div>
            </div>
          }
          {data.tissue === 'Header' && data.pathway && data.pathway.gene.length > 0 && data.expression && data.expression.allGeneAffected!==undefined &&
                    <div className={BaseStyle.pathwayChip}>
                      <span><strong>Pathway&nbsp;&nbsp;</strong>
                        {data.pathway.golabel.replace(/_/g,' ')}
                      </span>
                      {!isViewGeneExpression(filter) &&
                      <div>
                        <span><strong>Samples Affected</strong><br/> {this.getRatio(data)}</span>
                      </div>
                      }
                      {!isViewGeneExpression(filter) &&
                      <div>
                        <span><strong>Affected Area</strong><br/> {this.getAffectedPathway(data)}</span>
                      </div>
                      }
                      <div>
                        <br/>
                        <span
                          className={BaseStyle.scoreBox}
                          style={{
                            color:interpolateGeneExpressionFont(score),
                            backgroundColor:interpolateGeneExpression(score)
                          }}
                        >
                          <strong>Mean Score</strong> {score.toFixed(2)}</span>
                      </div>
                    </div>
          }
        </div>
      );
    }
    else {
      return <div/>;
    }
  }
}

HoverGeneView.propTypes = {
  cohortIndex: PropTypes.any.isRequired,
  data: PropTypes.any.isRequired,
  filter: PropTypes.any.isRequired,
};
