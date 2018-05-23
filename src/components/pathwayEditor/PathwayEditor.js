import React from 'react'
import PureComponent from "../PureComponent";
import PathwayList from "./PathwayList";
import PathwayView from "./PathwayView";
import DefaultPathWays from "../../../tests/data/tgac";


export default class PathwayEditor extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            pathways: [{name: "Default", pathways: DefaultPathWays, selected: true}]
        }
    }


    getLabels() {
        return this.state.pathways.map((pathway, index) => {
            return (
                <option key={pathway.name}>{pathway.name}</option>
            )
        });
    }

    render() {
        return (
            <div>
                <select>
                    {this.getLabels()}
                </select>
                <PathwayView selectedPathway={this.getSelectedPathway()}/>
            </div>
        );
    }


    getSelectedPathway() {
        return this.state.pathways.find(f => f.selected === true)
    }
}
