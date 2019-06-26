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
        // console.log('diff',omit(nextProps,omitArray),omit(this.props,omitArray))
        // console.log('is isEqual assData',isEqual(nextProps.associateData,this.props.associateData))
        // console.log('is isEqual data',isEqual(nextProps.data,this.props.data))
        // console.log('is isEqual layout',isEqual(nextProps.layout,this.props.layout))
        // console.log('is isEqual pathways',isEqual(nextProps.pathways,this.props.pathways))
        if (!isEqual(omit(nextProps,omitArray), omit(this.props,omitArray))) {
            // console.log('should update')
            // console.log('is not isEqual pathways',isEqual(nextProps.pathways,this.props.pathways),nextProps.pathways,this.props.pathways)

            return true ;
            // this.draw(newProps);
        }
        // console.log('not UPdate')
        return false ;
    }

    render() {
        const {
            associateData
            , pathways
            , layout
            // , hoveredPathways
            // , selectedPathways
            , highlightedGene
            , labelHeight
            , height
            , cohortIndex
            , colorSettings
            , data
            , showDiffLayer
        } = this.props;
        console.log('retdragging')

        if (associateData.length > 0 && pathways.length === layout.length) {
            const numSamples = data.samples.length;
            // const possibleHeight = height - GENE_LABEL_HEIGHT ;
            const possibleHeight = height - GENE_LABEL_HEIGHT ;
            let offset = cohortIndex === 0 ? height - GENE_LABEL_HEIGHT : 0;
            return layout.map((el, i) => {
                let d = pathways[i];
                let geneLength = d.gene.length;
                let labelKey = d.gene[0];
                let labelString = labelKey; // can this go away?
                // const hovered = hoveredPathways.indexOf(d.gene[0]) >= 0;
                // const selected = selectedPathways.indexOf(labelString) >= 0;
                let highlighted = highlightedGene === labelKey;
                let diffHeight = (Math.abs(d.diffScore) < chiSquareMax ? Math.abs(d.diffScore) / chiSquareMax : 1)  * possibleHeight;
                //diffHeight = diffHeight > possibleHeight ? possibleHeight : diffHeight;
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
                            labelString={labelString}
                            key={labelKey + '-' + cohortIndex + 'diff'}
                            cohortIndex={cohortIndex}
                            colorSettings={colorSettings}
                        />
                        }
                        {/*{ cohortIndex === 0  &&*/}
                        {/*<rect x={el.start} width={el.size} style={{*/}
                        {/*    position: 'absolute',*/}
                        {/*    // height: height*2,*/}
                        {/*     top: 0,*/}
                        {/*     left: el.start,*/}
                        {/*     width:el.size,*/}
                        {/*    opacity:0.1,*/}
                        {/*    zIndex: 2000,*/}
                        {/*}}*/}
                        {/*/>*/}
                        {/*    }*/}
                        {/*{ cohortIndex === 1  &&*/}
                        {/*<div style={{*/}
                        {/*    position: 'absolute',*/}
                        {/*    height: height*2,*/}
                        {/*    top: -height,*/}
                        {/*    left: el.start,*/}
                        {/*    width:el.size,*/}
                        {/*    opacity:0.1,*/}
                        {/*    zIndex: -20000,*/}
                        {/*}}*/}
                        {/*/>*/}
                        {/*}*/}
                        <HeaderLabel
                            labelHeight={labelHeight}
                            labelOffset={offset}
                            numSamples={numSamples}
                            geneLength={geneLength}
                            left={el.start}
                            width={el.size}
                            item={d}
                            // selected={selected}
                            // hovered={hovered}
                            highlighted={highlighted}
                            labelString={labelString}
                            key={labelKey + '-' + cohortIndex}
                            colorSettings={colorSettings}
                        />
                    </div>
                )
            });
        } else {
            return <div></div>;
        }
    }
}
LabelSet.propTypes = {
    associateData: PropTypes.any.isRequired,
    pathways: PropTypes.any.isRequired,
    data: PropTypes.any.isRequired,
    layout: PropTypes.any.isRequired,
    // hoveredPathways: PropTypes.any.isRequired,
    // selectedPathways: PropTypes.any.isRequired,
    labelHeight: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    colorSettings: PropTypes.any.isRequired,
    height: PropTypes.any.isRequired,
    showDiffLayer: PropTypes.any,
};
