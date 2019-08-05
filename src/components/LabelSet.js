import PureComponent from "./PureComponent";
import PropTypes from 'prop-types';
import React from 'react'
import {HeaderLabel} from "../components/HeaderLabel";
import {DiffLabel} from "../components/DiffLabel";
import {GENE_LABEL_HEIGHT} from "./PathwayScoresView";
import {omit,isEqual} from 'underscore'
import BaseStyle from '../css/base.css';

const chiSquareMax = 100.0;
const omitArray = ['hoveredPathways','pathways','data'];

export default class LabelSet extends PureComponent {

    constructor(props) {
        super(props);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (!isEqual(omit(nextProps,omitArray), omit(this.props,omitArray))) {
            return true ;
        }
        return false ;
    }

    render() {
        const {
            associatedData
            , pathways
            , layout
            , highlightedGene
            , labelHeight
            , height
            , cohortIndex
            , colorSettings
            , data
            , showDiffLayer
        } = this.props;
        if (associatedData.length > 0 && pathways.length === layout.length) {
            const numSamples = data.samples.length;
            const possibleHeight = height - GENE_LABEL_HEIGHT ;
            let offset = cohortIndex === 0 ? height - GENE_LABEL_HEIGHT : 0;

            // console.log('label set pathways',JSON.stringify(pathways));

            return layout.map((el, i) => {
                let d = pathways[i];
                let geneLength = d.gene.length;
                let labelKey = d.gene[0];
                let highlighted = highlightedGene === labelKey;
                let diffHeight = (Math.abs(d.diffScore) < chiSquareMax ? Math.abs(d.diffScore) / chiSquareMax : 1)  * possibleHeight;
                let labelOffset = cohortIndex === 0 ? possibleHeight : labelHeight;
                let actualOffset = cohortIndex === 1 ? labelOffset :  possibleHeight - diffHeight ;
                return (
                    <div key={`${labelKey}-${cohortIndex}-outer`} className={cohortIndex === 0 ? BaseStyle.labelDefaultTop : BaseStyle.labelDefaultBottom}>
                        { showDiffLayer && ((cohortIndex===0 && d.diffScore > 0) || cohortIndex===1 &&  d.diffScore < 0) &&
                        <DiffLabel
                            labelHeight={diffHeight}
                            labelOffset={actualOffset}
                            numSamples={numSamples}
                            geneLength={geneLength}
                            left={el.start}
                            width={el.size}
                            item={d}
                            labelString={labelKey}
                            key={labelKey + '-' + cohortIndex + 'diff'}
                            cohortIndex={cohortIndex}
                            colorSettings={colorSettings}
                        />
                        }
                        { cohortIndex === 0  &&
                        <div style={{
                            position: 'absolute',
                            height: height,
                            top: 0,
                            left: el.start,
                            width:el.size,
                            opacity:0.1,
                            zIndex: -20000,
                        }}
                        />
                        }
                        { cohortIndex === 1  &&
                        <div style={{
                            position: 'absolute',
                            height: height,
                            top: 0,
                            left: el.start,
                            width:el.size,
                            opacity:0.1,
                            zIndex: -20000,
                        }}
                        />
                        }
                        <HeaderLabel
                            labelHeight={labelHeight}
                            labelOffset={offset}
                            numSamples={numSamples}
                            geneLength={geneLength}
                            left={el.start}
                            width={el.size}
                            item={d}
                            highlighted={highlighted}
                            labelString={labelKey}
                            key={labelKey + '-' + cohortIndex}
                            colorSettings={colorSettings}
                        />
                    </div>
                )
            });
        } else {
            return <div/>;
        }
    }
}
LabelSet.propTypes = {
    associatedData: PropTypes.any.isRequired,
    pathways: PropTypes.any.isRequired,
    data: PropTypes.any.isRequired,
    layout: PropTypes.any.isRequired,
    labelHeight: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    colorSettings: PropTypes.any.isRequired,
    height: PropTypes.any.isRequired,
    showDiffLayer: PropTypes.any,
};
