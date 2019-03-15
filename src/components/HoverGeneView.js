import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Chip, Avatar, List, ListItem, ListSubHeader} from "react-toolbox";
import BaseStyle from '../css/base.css';

export default class HoverGeneView extends PureComponent {

    /**
     * This returns the number of affected versus the total number versus a single gene
     * @param data
     * @returns {string}
     */
    getRatio(data) {
        let returnString = data.expression.affected + '/' + data.expression.total;
        returnString += '  (';
        returnString += ((Number.parseFloat(data.expression.affected) / Number.parseFloat(data.expression.total)) * 100.0).toFixed(0);
        returnString += '%)';
        return returnString;
    }

    getAffectedPathway(data) {
        let returnString = data.expression.allGeneAffected + '/' + (data.expression.total * data.pathway.gene.length) ;
        returnString += '  (';
        returnString += ((Number.parseFloat(data.expression.allGeneAffected) / Number.parseFloat(data.expression.total* data.pathway.gene.length)) * 100.0).toFixed(0);
        returnString += '%)';
        return returnString;

    }

    getScore(data, cohortIndex) {
        return Number.parseFloat(cohortIndex===0 ? data.pathway.firstChiSquared : data.pathway.secondChiSquared).toFixed(1);
    }

    render() {
        let {data, title,cohortIndex} = this.props;
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
                        <Chip>
                            {data.expression.cnv!==0 &&
                            <span
                                className={data.expression.cnv === 0 ? '' : BaseStyle.cnvColor}><strong>CNV</strong> {data.expression.cnv}</span>
                            }
                            {data.expression.mutation!==0 &&
                            <span
                                className={data.expression.mutation === 0 ? '' : BaseStyle.mutationColor}> <strong>Mut</strong> {data.expression.mutation}</span>
                            }
                            {/*<span className={data.expression.total===0 ? '' : BaseStyle.highlightChip}><strong>Hits</strong> {data.expression.total}</span>*/}
                        </Chip>
                        }
                        {data.tissue &&
                        <Chip>
                            <span style={{margin:0}}>
                                <strong>Sample</strong>
                                <span>{data.tissue}</span>
                                </span>
                        </Chip>
                        }
                    </div>
                    }
                    {data.tissue === 'Header' && data.pathway && data.pathway.gene.length === 1 && data.expression && data.expression.total>0 &&
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
                            <span><strong>Score</strong> {this.getScore(data,cohortIndex)}</span>
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
