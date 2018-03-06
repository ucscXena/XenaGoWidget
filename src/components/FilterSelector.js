import React, {Component} from 'react'
import PropTypes from 'prop-types';

export class FilterSelector extends Component {

    constructor(props) {
        super(props);
        console.log(props)
        this.state = {
            value: props.selected,
            pathwayData: props.pathwayData,
        };

        this.setSelected = this.setSelected.bind(this);
    }

    setSelected(event) {
        let targetValue = event.target.value;
        if (targetValue) {
            this.setState({value: targetValue});
        }
        else {
            this.setState({value: null});
        }
        // console.log('calling change: '+targetValue);
        this.props.onChange(targetValue);
    }

    compileData(filteredArray, data) {
        let returnArray = {};

        for (let type of filteredArray) {
            let returnObject = {
                name: type,
                count: 0
            };
            returnArray[type] = returnObject;
        }

        for (let row of data.expression.rows) {
            let filteredObject = returnArray[row.effect] ;
            filteredObject.count = filteredObject.count + 1;
        }


        return returnArray;
    }

    render() {
        const {filters} = this.props;
        let filterArray = [];

        for (let f in filters) {
            filterArray.push(f);
        }

        let labeledObject = this.compileData(filterArray, this.state.pathwayData);

        filterArray = filterArray.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        let labeledArray = [];
        let total = 0 ;
        for(let f of filterArray){
            // console.log(labeledObject[f]);
            total = total + labeledObject[f].count ;
            labeledArray.push(labeledObject[f]);
        }

        // console.log(labeledArray);
        // console.log(filterArray);

        return <select onChange={this.setSelected} value={this.state.value}>
            <option key='null'>All ({total})</option>
            {
                labeledArray.map(function (f) {
                    if(f.count){
                        return <option key={f.name} value={f.name}>{f.name} ({f.count})</option>;
                    }
                })
            }
            }
        </select>
    }


}

FilterSelector.propTypes = {
    filters: PropTypes.object.isRequired,
    pathwayData: PropTypes.any,
    onChange: PropTypes.any,
    selected: PropTypes.any,
};
