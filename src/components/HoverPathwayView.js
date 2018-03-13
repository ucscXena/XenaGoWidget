import React, {Component} from 'react'
import PropTypes from 'prop-types';

export default class HoverPathwayView extends Component {
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
                            Pathway: {data.pathway.golabel} ({data.pathway.goid}) <br/>
                            Genes ({data.pathway.gene.length})
                        </li>
                        }
                        {data.tissue &&
                        <li>
                            Tissue: {data.tissue}
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
                        Pathway: {data.pathway.golabel} ({data.pathway.goid}) <br/>
                        Genes ({data.pathway.gene.length}) <br/>
                        Total Mutation Score: {data.expression}
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
