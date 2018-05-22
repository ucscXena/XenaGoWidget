import React from 'react'
import PureComponent from "../PureComponent";
import PathwayList from "./PathwayList";
import PathwayView from "./PathwayView";


export default class PathwayEditor extends PureComponent {



    render(){

        return(
            <div>
                <PathwayList/>
                <PathwayView/>
            </div>
        )


    }


}
