import React from 'react'
import PureComponent from "../PureComponent";

import DefaultPathWays from "../../../tests/data/tgac";

export default class PathwayList extends PureComponent {


    constructor(props) {
        super(props);
        this.state = {
            pathways: [{name: "Default", pathwaySets: DefaultPathWays}]
        }
    }

    render() {

        <div>?</div>
    }

}
