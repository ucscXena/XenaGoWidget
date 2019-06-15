import PureComponent from "./PureComponent";
import PropTypes from 'prop-types';
import React from 'react'
import {HeaderLabel} from "../components/HeaderLabel";
import {DiffLabel} from "../components/DiffLabel";
import {GENE_LABEL_HEIGHT} from "./PathwayScoresView";
import {observer} from "mobx-react";
import Test from "../components/Test";
import {computed} from "mobx";
import {UiStore} from "../store/UiStore";

const chiSquareMax = 100.0;

// @observer(['kittens'])
class LabelSet extends React.Component {

    // kittens
    // cats
    // dog


    constructor(props) {
        super(props);
        console.log('ropos,',this.props)
        console.log('cats',this.cats)
        console.log('kittens',this.kittens)
        console.log('dog',this.dog);
        // let test = new Test();
        // this.props.test = new Test();
        // console.log('cats2',this.props.test.cats)
        // console.log('cats3',this.test.cats)
    }


    // @computed get kittens(){
    //     this.props.XenaGeneSetApp.kittens
    // }


    render() {
        const {
            associateData
            , pathways
            , layout
            , hoveredPathways
            , selectedPathways
            , highlightedGene
            , labelHeight
            , height
            , cohortIndex
            , colorSettings
            , data
            , showDiffLayer
        } = this.props;

        let test = new Test();

        const uiStore = UiStore.INSTANCE;
        console.log('in render cats',uiStore.frogs)

        if(cohortIndex==1){
            // test.pokeCat();
            console.log('poke frogs',uiStore.addFrogs())
        }

        if (associateData.length > 0 && pathways.length === layout.length) {
            const numSamples = data.samples.length;
            // const possibleHeight = height - GENE_LABEL_HEIGHT ;
            const possibleHeight = height - GENE_LABEL_HEIGHT ;
            let offset = cohortIndex === 0 ? height - GENE_LABEL_HEIGHT : 0;
            return layout.map((el, i) => {
                let d = pathways[i];
                let geneLength = d.gene.length;
                let hovered, selected;
                let labelKey = d.gene[0];
                let labelString = labelKey; // can this go away?
                hovered = hoveredPathways.indexOf(d.gene[0]) >= 0;
                selected = selectedPathways.indexOf(labelString) >= 0;
                let highlighted = highlightedGene === labelKey;
                let diffHeight = (Math.abs(d.diffScore) < chiSquareMax ? Math.abs(d.diffScore) / chiSquareMax : 1)  * possibleHeight;
                //diffHeight = diffHeight > possibleHeight ? possibleHeight : diffHeight;
                let labelOffset = cohortIndex === 0 ? possibleHeight : labelHeight;
                let actualOffset = cohortIndex === 1 ? labelOffset :  possibleHeight - diffHeight ;
                return (
                    <div key={`${labelKey}-${cohortIndex}-outer`}>
                        {/*{`KITTENS: ${this.kittens}`}*/}
                        {/*{`CATS: ${this.cats}`}*/}
                        {/*{`DOG: ${this.dog}`}*/}
                        {`TEST: ${test.cats}`}
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
                        <HeaderLabel
                            labelHeight={labelHeight}
                            labelOffset={offset}
                            numSamples={numSamples}
                            geneLength={geneLength}
                            left={el.start}
                            width={el.size}
                            item={d}
                            selected={selected}
                            hovered={hovered}
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
    hoveredPathways: PropTypes.any.isRequired,
    selectedPathways: PropTypes.any.isRequired,
    labelHeight: PropTypes.any.isRequired,
    cohortIndex: PropTypes.any.isRequired,
    colorSettings: PropTypes.any.isRequired,
    height: PropTypes.any.isRequired,
    showDiffLayer: PropTypes.any,
};
export default observer(LabelSet)
