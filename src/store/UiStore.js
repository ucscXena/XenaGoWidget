import {observable,action} from "mobx";


export class UiStore{


    // static UiStore INSTANCE = new UiStore() ;
    static INSTANCE ;

    constructor() {
        // this.todoApi = todoApi;
        // if (UiStore.INSTANCE) {
        //     throw new Error('Store is a singleton');
        // }

        UiStore.INSTANCE = this;
    }

    @observable hounds = false ;
    @observable frogs = 0;

    // @action
    // setSearchText = (searchText) => {
    //     this.searchText = searchText
    // }

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
