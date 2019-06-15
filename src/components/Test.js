
// import PureComponent from "./PureComponent";
// import PropTypes from 'prop-types';
import React from 'react'
// import {HeaderLabel} from "../components/HeaderLabel";
// import {DiffLabel} from "../components/DiffLabel";
// import {GENE_LABEL_HEIGHT} from "./PathwayScoresView";
// import {observer} from "mobx-react";
// import {computed} from "mobx";
import {computed, observable} from "mobx"

export default class Test extends React.Component{

    @observable cats = 12

    constructor(cats = 13) {
        super(cats);
        this.cats = cats;
    }

    pokeCat(){
        this.cats = this.cats + 12 ;
    }

    @computed get computedTest() {
        return this.cats * 100;
    }

}
