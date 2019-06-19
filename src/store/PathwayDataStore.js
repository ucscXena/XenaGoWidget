import {observable,action} from "mobx";

export class PathwayDataStore{

    static INSTANCE ;

    constructor() {
        PathwayDataStore.INSTANCE = this;
    }

    @observable data = {};

    @action setData = (newData) => {
        this.data = newData ;
    };

}

// export function getStore() {
//     return PathwayDataStore.INSTANCE;
// }

