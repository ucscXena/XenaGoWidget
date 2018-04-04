import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';

export default class HoverPathwayView extends PureComponent {
    render() {
        var {data, title} = this.props;
        if(data.tissue){
            return (
                <div>
                    <h4>{title}</h4>
                    {data.tissue !== 'Header' &&
                    <ul>
                        {/*{data.x &&*/}
                        {/*<li>*/}
                        {/*({data.x},{data.y})*/}
                        {/*</li>*/}
                        {/*}*/}
                        {data.pathway &&
                        <li>
                            Pathway: {data.pathway.golabel}
                            {data.pathway.goid ? '(' + data.pathway.goid+')' : ''}
                            <br/>
                            Genes ({data.pathway.gene.length})
                        </li>
                        }
                        {data.tissue &&
                        <li>
                            Sample: {data.tissue}
                        </li>
                        }
                        {data.expression != null &&
                        <li>
                            Mutation Score: {data.expression}
                        </li>
                        }
                    </ul>
                    }
                    {data.tissue === 'Header' && data.pathway &&
                    <div>
                        Pathway: {data.pathway.golabel}
                        {data.pathway.goid ? '(' + data.pathway.goid+')' : ''}
                        <br/>
                        Genes ({data.pathway.gene.length}) <br/>
                        Samples Affected: { Number.parseFloat(data.expression * 100.0).toFixed(0) }%
                    </div>
                    }
                </div>
            );
        }
        else{
            return <div></div>
        }
    }
}

HoverPathwayView.propTypes = {
    data: PropTypes.any.isRequired,
    title: PropTypes.any.isRequired,
};
