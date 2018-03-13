import React, {Component} from 'react'
import PropTypes from 'prop-types';

export default class HoverGeneView extends Component {
    render() {
        var {data, title} = this.props;
        if(data.tissue){
            return (
                <div>
                    <h4>{title}</h4>
                    {data.tissue !== 'Header' &&
                    <ul>
                        {data.pathway &&
                        <li>
                            Gene: ({data.pathway.gene[0]})
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
                        Gene: {data.pathway.gene[0]} <br/>
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

HoverGeneView.propTypes = {
    data: PropTypes.any.isRequired,
    title: PropTypes.any.isRequired,
};
