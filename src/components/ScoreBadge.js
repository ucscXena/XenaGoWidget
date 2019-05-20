import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Card, Chip, Avatar, List, ListItem, ListSubHeader} from "react-toolbox";
import BaseStyle from '../css/base.css';

export class ScoreBadge extends PureComponent {



    render() {
        if(this.props.score>1){
                return <div className={BaseStyle.hoverScore} >{this.props.score}</div>
        }
        else{
            return '';
        }
    }
}
ScoreBadge.propTypes = {
    score: PropTypes.any.isRequired,
};
