import React, {Component} from 'react'
import PropTypes from 'prop-types';

export class FilterSelector extends Component{

    constructor(props){
        super(props)


    }

    setSelected(props) {
        console.log('selected: ');
        console.log(props);
    }

    render(){
        const {filters,selected} = this.props;
        let filterArray = [];
        for(let f in filters){
            filterArray.push(f);
        }
        filterArray = filterArray.sort( function(a,b){
            return a.toLowerCase().localeCompare(b.toLowerCase());
        });
        // console.log(filterArray.length);
        return <select onSelect={this.setSelected}>
            <option key='null'>All</option>
            {
                filterArray.map(function(f) {
                    return <option key={f}>{f}</option>;
                })
            }
            }
        </select>
    }

}

FilterSelector.propTypes = {
    filters: PropTypes.object.isRequired,
    selected: PropTypes.any.isRequired,
};
