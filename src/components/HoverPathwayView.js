import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Chip, Avatar, List, ListItem, ListSubHeader} from "react-toolbox";
import BaseStyle from '../../src/base.css';

export default class HoverPathwayView extends PureComponent {

    getRatio(data) {
        let returnString = data.expression.affected + '/' + data.expression.total;
        returnString += '  (';
        returnString += ((Number.parseFloat(data.expression.affected) / Number.parseFloat(data.expression.total)) * 100.0).toFixed(0);
        returnString += '%)';
        return returnString;
    }

    render() {
        let {data, title} = this.props;
        if (data.tissue) {
            return (
                <div>
                    {data.tissue !== 'Header' &&
                    <div>
                        {title &&
                        <H3>{title}</H3>
                        }

                        {data.pathway &&
                        <div className={BaseStyle.pathwayChip}>
                            <span>
                                <strong>{data.pathway.goid ? 'Pathway (' + data.pathway.goid + ')' : 'Pathway'}</strong>
                                {data.pathway.golabel}
                            </span>
                        </div>
                        }
                        {data.pathway &&
                        <Chip>
                            <span>
                                <strong>Genes</strong>
                                {data.pathway.gene.length.toString()}
                            </span>
                        </Chip>
                        }
                        {data.expression != null &&
                        <Chip>
                            <span>
                                <strong>Hits</strong>
                                {data.expression.toString()}
                            </span>
                        </Chip>
                        }
                        {data.tissue &&
                        <div className={BaseStyle.pathwayChip}>
                            <span>
                                <strong>Sample</strong>
                                {data.tissue}
                            </span>
                        </div>
                        }
                    </div>
                    }
                    {
                        data.tissue === 'Header' && data.pathway &&
                        <div>
                            <div className={BaseStyle.pathwayChip}>
                                <span>
                                <strong>{data.pathway.goid ? 'Pathway (' + data.pathway.goid + ')' : 'Pathway'}</strong>&nbsp;&nbsp;
                                    {data.pathway.golabel}
                            </span>
                            </div>
                            <Chip>
                                <span>
                                <strong>Genes</strong>
                                    {data.pathway.gene.length.toString()}
                            </span>
                            </Chip>
                            <div className={BaseStyle.pathwayChip}>
                                <span>
                                <strong>Samples Affected</strong>&nbsp;&nbsp;
                                    {this.getRatio(data)}
                            </span>
                            </div>
                        </div>
                    }
                </div>
            );
        }
        else {
            return (<div>
                <List>
                    <ListItem caption='Hover over pathway'/>
                </List>
            </div>);
        }
    }
}

HoverPathwayView.propTypes = {
    data: PropTypes.any.isRequired,
    title: PropTypes.any,
};
