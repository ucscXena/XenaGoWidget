import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';

export class FilterSelector extends PureComponent {

    constructor(props) {
        super(props);
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


        let genes = this.getGenes(data.pathways);

        for (let row of data.expression.rows) {
            let filteredObject = returnArray[row.effect] ;
            if(filteredObject && genes.indexOf(row.gene)>=0){
                filteredObject.count = filteredObject.count + 1;
            }
        }

        return returnArray;
    }

    getGenes(pathways) {
        let genes = [] ;
        for(let p of pathways){
            for(let g of p.gene){
                genes.push(g);
            }
        }

        return genes ;
    }

    render() {
        const {filters,pathwayData,selected} = this.props;
        let filterArray = [];

        for (let f in filters) {
            filterArray.push(f);
        }

        let labeledObject = this.compileData(filterArray, pathwayData);

        filterArray = filterArray.sort(function (a, b) {
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        let labeledArray = [];
        let total = 0 ;
        for(let f of filterArray){
            total = total + labeledObject[f].count ;
            labeledArray.push(labeledObject[f]);
        }

        return <select onChange={this.setSelected} value={selected}>
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
