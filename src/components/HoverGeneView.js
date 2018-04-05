import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {List, ListItem, ListSubHeader} from "react-toolbox";

export default class HoverGeneView extends PureComponent {
    render() {
        let {data, title} = this.props;
        if (data.tissue) {
            return (
                <div>
                    {data.tissue !== 'Header' &&
                    <List>
                        {title &&
                        <ListSubHeader caption={title}/>
                        }
                        {data.pathway &&
                        <ListItem
                            caption={data.pathway.gene[0]}
                            legend='Gene'
                        />
                        }
                        {data.expression != null &&
                        <ListItem
                            caption={data.expression.toString()}
                            legend='Score'/>
                        }
                        {data.tissue &&
                        <ListItem
                            caption={data.tissue}
                            legend='Sample'
                        />
                        }
                    </List>
                    }
                    {data.tissue === 'Header' && data.pathway &&
                    <List>
                        <ListItem
                            caption={data.pathway.gene[0]}
                            legend='Gene'
                        />
                        <ListItem
                            caption={Number.parseFloat(data.expression * 100.0).toFixed(0)}
                            legend='Samples Affected (%)'
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
