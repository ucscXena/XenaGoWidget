import React from 'react';
import PureComponent from './PureComponent';
// import PropTypes from 'prop-types';
import {Card, Chip, Avatar, List, ListItem, ListSubHeader} from "react-toolbox";
import BaseStyle from '../css/base.css';

export class TwoColorLegend extends PureComponent {

    render() {
        return (
            <div style={{margin: 5,padding: 5,fontFamily:'Arial',fontSize:'small', boxShadow: '1px 1px 1px 1px gray',borderRadius:5}}>
                <span className={BaseStyle.cnvColor}><strong>CNV</strong></span>
                &nbsp;
                &nbsp;
                <span className={BaseStyle.mutationColor}><strong>Mutation</strong></span>
            </div>
        )
    }
}
