import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Chip} from "react-toolbox";
import BaseStyle from '../css/base.css';
import {ScoreBadge} from "./ScoreBadge";

export default class HoverGeneView extends PureComponent {

    /**
     * This returns the number of affected versus the total number versus a single gene
     * @param data
     * @returns {string}
     */
    getRatio(data) {
        let returnString = data.expression.samplesAffected + '/' + data.expression.total;
        returnString += '  (';
        returnString += ((Number.parseFloat(data.expression.samplesAffected ) / Number.parseFloat(data.expression.total)) * 100.0).toFixed(0);
        returnString += '%)';
        return returnString;
    }

    getAffectedPathway(data) {
        let returnString = data.expression.allGeneAffected + '/' + (data.expression.total * data.pathway.gene.length);
        returnString += '  (';
        returnString += ((Number.parseFloat(data.expression.allGeneAffected) / Number.parseFloat(data.expression.total * data.pathway.gene.length)) * 100.0).toFixed(0);
        returnString += '%)';
        return returnString;

    }

    getScore(data, cohortIndex) {
        console.log('data',data.pathway)
        return Number.parseFloat(cohortIndex === 0 ? data.pathway.firstChiSquared : data.pathway.secondChiSquared).toFixed(1);
    }

    render() {
        let {data, title, cohortIndex} = this.props;
        if (data.tissue) {
            return (
                <div>
                    {data.tissue !== 'Header' &&
                    <div>
                        {title &&
                        <H3>{title}</H3>
                        }
                        {data.pathway &&
                        <Chip>
                            <span><strong>Gene</strong> {data.pathway.gene[0]}</span>
                        </Chip>
                        }
                        {data.expression != null &&
                        <div>
                            {data.selectCnv && data.expression.cnvHigh > 0 &&
                            <Chip>
                            <span
                                className={data.expression.cnvHigh === 0 ? '' : BaseStyle.cnvHighColor}><strong>CNV Amplification</strong>
                                <ScoreBadge score={data.expression.cnvHigh}/>
                            </span>
                            </Chip>
                            }
                            {data.selectCnv && data.expression.cnvLow > 0 &&
                            <Chip>
                            <span
                                className={data.expression.cnvLow === 0 ? '' : BaseStyle.cnvLowColor}><strong>CNV Deletion</strong>
                                <ScoreBadge score={data.expression.cnvLow}/>
                                </span>
                            </Chip>
                            }
                            {!data.selectCnv && data.expression.mutation2 > 0 &&
                            <Chip>
                            <span
                                className={data.expression.mutation2 === 0 ? '' : BaseStyle.mutation2Color}> <strong>Missense / Inframe </strong>
                                <ScoreBadge score={data.expression.mutation2}/>
                                </span>
                            </Chip>
                            }
                            {!data.selectCnv && data.expression.mutation3 > 0 &&
                            <Chip>
                            <span
                                className={data.expression.mutation3 === 0 ? '' : BaseStyle.mutation3Color}> <strong>Splice</strong>
                                <ScoreBadge score={data.expression.mutation3}/>
                            </span>
                            </Chip>
                            }
                            {!data.selectCnv && data.expression.mutation4 > 0 &&
                            <Chip>
                            <span
                                className={data.expression.mutation4 === 0 ? '' : BaseStyle.mutation4Color}> <strong>Deleterious</strong>
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
                    {data.tissue === 'Header' && data.pathway && data.pathway.gene.length === 1 && data.expression && data.expression.total > 0 &&
                    <div>
                        <Chip>
                            <span><strong>Gene</strong> {data.pathway.gene[0]}</span>
                        </Chip>
                        <div className={BaseStyle.pathwayChip}>
                            <span><strong>Samples Affected</strong><br/> {this.getRatio(data)}</span>
                        </div>
                    </div>
                    }
                    {data.tissue === 'Header' && data.pathway && data.pathway.gene.length > 1 &&
                    <div className={BaseStyle.pathwayChip}>
                            <span><strong>Pathway&nbsp;&nbsp;</strong>
                                {data.pathway.golabel}
                            </span>
                        <div>
                            <span><strong>Samples Affected</strong><br/> {this.getRatio(data)}</span>
                        </div>
                        <div>
                            <span><strong>Affected Area</strong><br/> {this.getAffectedPathway(data)}</span>
                        </div>
                        <div>
                            <span><strong>Score</strong> {this.getScore(data, cohortIndex)}</span>
                        </div>

                    </div>
                    }
                </div>
            );
        }
        else {
            return <div/>
        }
    }

}

HoverGeneView.propTypes = {
    data: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    title: PropTypes.any,
};
