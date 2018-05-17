import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import {Chip, Card, CardActions, CardMedia, CardTitle, Layout} from "react-toolbox";


export default class CompareBox extends PureComponent {
    constructor(props) {
        super(props);
    }

    render() {
        console.log('render Compare Box props')
        console.log(this.props)
        let {statBox: {commonGenes, commonPathways}} = this.props;
        console.log(commonGenes)
        console.log(commonPathways)
        // // return <div>Compare box</div>
        if (commonGenes) {
            console.log('has common genes')
            return (
                commonGenes.map((s) => {
                    console.log(s)
                    return (
                        <div key={s.name}>{s.name} {s.score}</div>
                    )
                })
            )
        }
        // else{
        return <div></div>
        // }
    }
}

CompareBox.propTypes = {
    statBox: PropTypes.any.isRequired,
};

