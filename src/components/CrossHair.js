'use strict';

import PureComponent from './PureComponent';
import React from 'react'
import {Portal} from 'react-overlays';
// require('./Crosshair.css');
import '../css/Crosshair.css' ;

export default class CrossHair extends PureComponent {
	state = {mousing: false, x: -1, y: -1};

	componentWillReceiveProps(nextProps) {
		if (!nextProps.frozen) {
			this.setState({mousing: false, x: -1, y: -1});
		}
	}

	onMouseMove = (ev) => {
		var x = ev.clientX - ev.currentTarget.getBoundingClientRect().left;
		console.log(x)
		// if (!this.props.frozen) {
			this.setState({mousing: true, x, y: ev.clientY});
		// }
	};

	onMouseOut = () => {
		if (!this.props.frozen) {
			this.setState({mousing: false});
		}
	};

	render() {
		console.log('rendered a cross-hair ')
		let {mousing, x, y} = this.state,
			{onMouseMove, onMouseOut} = this,
			{frozen, height, children} = this.props,
			cursor = frozen ? 'default' : 'none';
		console.log('style',cursor)
		console.log('state',this.state)

		return (
			<div id='crosshair2' style={{cursor:'none',zIndex:2000}} onMouseMove={onMouseMove} onMouseOut={onMouseOut}>
				{children}
				{mousing ? <div className='crosshair crosshairV' style={{left: x, height}}/> : null}
				{mousing ?
					<Portal container={document.body}>
						<div className='crosshairs'>
							<span className='crosshair crosshairH' style={{top: y}}/>
						</div>
					</Portal> : null}
			</div>
		);
	}
}

