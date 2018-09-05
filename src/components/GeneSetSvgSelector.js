import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {pick, groupBy, mapObject, pluck, flatten} from 'underscore';
import {sum} from '../functions/util';
import {Dropdown} from "react-toolbox";
import {getCopyNumberValue} from "../functions/DataFunctions";


export class GeneSetSvgSelector extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            value: props.selected,
            pathways: props.pathways,
        };
    }

    render() {
        let {pathways} = this.props;
        return (
            <div style={{marginLeft: 10, marginTop: 0}}>
                Gene Set Selector
                {pathways &&
                    pathways.map( (p) => {
                        console.log(p)
                        return (
                            <div>
                                {p.golabel}
                            </div>
                        )
                    })
                }
            </div>
        );
    }
}

GeneSetSvgSelector.propTypes = {
    value: PropTypes.any,
    pathways: PropTypes.any,
};
