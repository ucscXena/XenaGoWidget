import {observable,action} from "mobx";


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

    @action
    toggleShowColorEditor = () => {
        this.showColorEditor = !this.showColorEditor;
    };

    @action
    toggleShowReciprocalPathway = () => {
        this.showReciprocalPathway = !this.showReciprocalPathway;
    };

    @action
    toggleShowColorByType = () => {
        this.showColorByType = !this.showColorByType;
    };

    @action
    toggleShowColorByTypeDetail = () => {
        this.showColorByTypeDetail = !this.showColorByTypeDetail;
    };

    @action
    toggleShowColorTotal = () => {
        this.showColorTotal = !this.showColorTotal;
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


    @observable hounds = false ;
    @observable frogs = 0;

    @action
    toggleHounds = () => {
        this.hounds = !this.hounds;
    }

    @action
    addFrogs = () => {
        this.frogs += 1;
    }

}

export function getStore() {
    return UiStore.INSTANCE;
}
