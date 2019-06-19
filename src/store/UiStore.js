import {observable, action, computed} from "mobx";


export class UiStore{

    static INSTANCE ;

    constructor() {
        UiStore.INSTANCE = this;
    }


    @observable showColorEditor= false;
    @observable showReciprocalPathway= false;
    @observable showColorByType= false;
    @observable showColorByTypeDetail= true;
    @observable showColorTotal= false;
    @observable showDetailLayer= true;
    @observable showClusterSort= false;
    @observable showDiffLayer= true;
    @observable showPathwayDetails= false;
    @observable collapsed= true;


    @observable geneStateColors= {
        highDomain: 100,
        midDomain: 0,
        lowDomain: -100,
        lowColor: '#0000ff',
        midColor: '#ffffff',
        highColor: '#ff0000',
        gamma: 1.0,
        geneGamma: 1.0,
        linkDomains: true,
        shadingValue: 10,
    };

    @computed get getShowDiffLayer(){
        return this.showDiffLayer;
    }

    @action
    toggleShowColorEditor = () => {
        this.showColorEditor = !this.showColorEditor;
    };

    @action
    toggleShowReciprocalPathway = () => {
        this.showReciprocalPathway = !this.showReciprocalPathway;
    };

    @action
    activateShowColorByType = () => {
        this.showColorByType = true;
        this.showColorByTypeDetail = false ;
        this.showColorTotal = false ;
    };

    @action
    activateShowColorByTypeDetail = () => {
        this.showColorByType = false ;
        this.showColorByTypeDetail = true ;
        this.showColorTotal = false ;
    };

    @action
    activateShowColorTotal = () => {
        this.showColorByType = false ;
        this.showColorByTypeDetail = false ;
        this.showColorTotal = true ;
    };

    @action
    toggleShowDetailLayer = () => {
        this.showDetailLayer = !this.showDetailLayer;
    };

    @action
    toggleShowClusterSort = () => {
        this.showClusterSort = !this.showClusterSort;
    };

    @action
    toggleShowDiffLayer = () => {
        this.showDiffLayer = !this.showDiffLayer;
    };

    @action
    toggleShowPathwayDetails = () => {
        this.showPathwayDetails = !this.showPathwayDetails;
    };

    @action
    toggleShowCollapsed = () => {
        this.showCollapsed = !this.showCollapsed;
    };

    static getStore() {
        return UiStore.INSTANCE;
    }

}

