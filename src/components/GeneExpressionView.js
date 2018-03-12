import React, {Component} from 'react'
import CanvasDrawing from "../CanvasDrawing";
import PropTypes from 'prop-types';
// import mutationScores from '../data/mutationVector'
import ScoreFunctions from '../functions/ScoreFunctions';


export default class GeneExpressionView extends Component {

    constructor(props) {
        super(props)
    }

    render() {
        const {width, height, data, onClick, onHover, selected, filter} = this.props;
        let titleString = selected.golabel + ' (' + selected.goid + ')';
        let filterString = filter.indexOf('All')===0 ? '' : filter ;
        return (
            <div>
                <h3>{titleString}</h3>
                <CanvasDrawing width={width} height={height} filter={filterString}
                               draw={ScoreFunctions.drawTissueView} data={data}
                               onClick={onClick}
                               onHover={onHover}/>
            </div>
        );
    }
}
GeneExpressionView.propTypes = {
    width: PropTypes.string.isRequired,
    height: PropTypes.string.isRequired,
    data: PropTypes.object.isRequired,
    selected: PropTypes.any.isRequired,
    onClick: PropTypes.any.isRequired,
    onHover: PropTypes.any.isRequired,
    filter: PropTypes.any,
    id: PropTypes.any,
};

