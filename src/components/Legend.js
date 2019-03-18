import React from 'react';
import PureComponent from './PureComponent';
// import PropTypes from 'prop-types';
import {Card, Chip, Avatar, List, ListItem, ListSubHeader} from "react-toolbox";
import BaseStyle from '../css/base.css';


export class Legend extends PureComponent {

    render() {
        return (
            <table>
                <tbody>
                <tr>
                    <td>
                        <Chip><span className={BaseStyle.cnvHighColor}><strong>CNV Amplification</strong></span></Chip>
                    {/*</td>*/}
                    {/*<td colSpan={2}>*/}
                        <Chip>
                        <span className={BaseStyle.cnvLowColor}><strong>CNV Deletion</strong></span>
                        </Chip>
                    </td>
                </tr>
                <tr>
                   <td>
                       <Chip>
                           <span className={BaseStyle.mutation4Color}><strong>Deleterious</strong></span>
                       </Chip>
                   </td>
                </tr>
                <tr>
                    <td>
                        <Chip>
                            <span className={BaseStyle.mutation3Color}><strong>Splice</strong></span>
                        </Chip>
                        {/*</td>*/}
                        {/*<td>*/}
                        <Chip>
                        <span className={BaseStyle.mutation2Color}><strong>Missense / Inframe</strong></span>
                        </Chip>
                    {/*</td>*/}
                    {/*<td>*/}
                    </td>
                </tr>
                </tbody>
            </table>
    )
    }
    }
