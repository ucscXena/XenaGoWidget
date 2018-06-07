import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {List, ListItem, ListSubHeader} from "react-toolbox";

export default class HoverGeneView extends PureComponent {

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
                    <List>
                        {title &&
                        <ListSubHeader legend={title}/>
                        }
                        {data.pathway &&
                        <ListItem
                            legend={data.pathway.gene[0]}
                            caption='Gene'
                        />
                        }
                        {data.expression != null &&
                        <ListItem
                            legend={data.expression.toString()}
                            caption='Hits'/>
                        }
                        {data.tissue &&
                        <ListItem
                            legend={data.tissue}
                            caption='Sample'
                        />
                        }
                    </List>
                    }
                    {data.tissue === 'Header' && data.pathway && data.pathway.gene.length === 1 &&
                    <List>
                        <ListItem
                            legend={data.pathway.gene[0]}
                            caption='Gene'
                        />
                        <ListItem
                            legend={this.getRatio(data)}
                            caption='Samples Affected'
                        />
                    </List>
                    }
                    {data.tissue === 'Header' && data.pathway && data.pathway.gene.length > 1 &&
                    <List>
                        <ListItem
                            legend={data.pathway.golabel}
                            caption='Pathway 123'
                        />
                    </List>
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
    title: PropTypes.any,
};
