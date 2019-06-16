import {observable,action} from "mobx";


export class PathwayEditorStore{

    static INSTANCE ;

    constructor() {
        PathwayEditorStore.INSTANCE = this;
    }

    @observable geneSetArray = [];

    @action removeGeneSet = (geneSet) => {
        let index = geneSet.indexOf(geneSet);
        if(index>=0){
            return this.geneSetArray.splice(index,1)
        }
        else{
            console.error("geneset does not exist")
        }
    };

    @action addGeneSet = (geneSet) => {
        this.geneSetArray.push(geneSet);
    };

    @action addGeneToGeneSet = (gene,geneSet) => {
        let selectedGeneSet = this.removeGeneSet(geneSet);
        if(selectedGeneSet){
            let index = selectedGeneSet.indexOf(gene);
            if(index>=0){
                selectedGeneSet.push(gene);
                this.addGeneSet(geneSet);
                return gene
            }
            else{
                console.error("gene does not exist in geneset")
            }
        }
    };

    @action removeGeneFromGeneSet = (gene,geneSet) => {
        let selectedGeneSet = this.removeGeneSet(geneSet);
        if(selectedGeneSet){
            let index = selectedGeneSet.indexOf(gene);
            if(index>=0){
                let gene = selectedGeneSet.splice(index,1);
                this.addGeneSet(geneSet);
                return gene
            }
            else{
                console.error("gene does not exist in geneset")
            }
        }
    };
}

export function getStore() {
    return PathwayEditorStore.INSTANCE;
}
