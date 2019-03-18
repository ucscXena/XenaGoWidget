import React from 'react';
import PureComponent from './PureComponent';
// import PropTypes from 'prop-types';
import {Card, Chip, Avatar, List, ListItem, ListSubHeader} from "react-toolbox";
import BaseStyle from '../css/base.css';


export class Legend extends PureComponent {

    render() {
        return (
            <Card>
                {/*<Chip>*/}
                    <span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong></span>
                {/*</Chip>*/}
                {/*<Chip>*/}
                    <span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong></span>
                {/*</Chip>*/}
                {/*<Chip>*/}
                    <span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong></span>
                {/*</Chip>*/}
                {/*<Chip>*/}
                    <span className={BaseStyle.mutation3Color}><strong>Splice</strong></span>
                {/*</Chip>*/}
                {/*<Chip>*/}
                    <span className={BaseStyle.mutation4Color}><strong>Deleterious</strong></span>
                {/*</Chip>*/}
            </Card>
        )
    }
}
