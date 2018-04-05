import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {List,ListItem,ListSubHeader} from "react-toolbox";

export default class HoverPathwayView extends PureComponent {
    render() {
        var {data, title} = this.props;
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
                            caption={data.pathway.golabel}
                            legend={data.pathway.goid ? 'Pathway (' + data.pathway.goid + ')' : 'Pathway'}
                        />
                            &&
                        <ListItem
                            caption={data.pathway.gene.length.toString()}
                            legend='Genes'
                            />
                        }
                        {data.tissue &&
                        <ListItem
                            caption={data.tissue}
                            legend='Sample'
                        />
                        }
                        {data.expression != null &&
                        <ListItem
                            caption={data.expression.toString()}
                            legend='Score'/>
                        }
                    </List>
                    }
                    {data.tissue === 'Header' && data.pathway &&
                    <List>
                        <ListItem
                            caption={data.pathway.golabel}
                            legend={data.pathway.goid ? 'Pathway (' + data.pathway.goid + ')' : 'Pathway'}
                        />
                        <ListItem
                            caption={data.pathway.gene.length.toString()}
                            legend='Genes'
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

HoverPathwayView.propTypes = {
    data: PropTypes.any.isRequired,
    title: PropTypes.any,
};
