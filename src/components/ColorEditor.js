import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Dialog from "react-toolbox/lib/dialog";
import Input from "react-toolbox/lib/input";


export class ColorEditor extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            active: this.props.active,
        };
    }

    handleChange(input){
        console.log('handling input',input,this.state)
    }


    render() {


        let {active, handleToggle} = this.props;

        let actions = [
            {label: "Cancel", onClick: handleToggle},
            {label: "Save", onClick: handleToggle}
        ];

        return (
            <Dialog
                actions={actions}
                active={active}
                onEscKeyDown={handleToggle}
                onOverlayClick={handleToggle}
                title='Edit Score Colors'
            >
                <Input type='number' label='Domain' name='domain' value={this.state.domain} onChange={this.handleChange.bind(this, 'domain')} maxLength={16 } />
                <Input type='number' label='Gamma' name='gamma' value={this.state.gamma} onChange={this.handleChange.bind(this, 'gamma')} maxLength={16 } />
                <Input type='color' label='Low Color' name='lowColor' value={this.state.lowColor} onChange={this.handleChange.bind(this, 'lowColor')} maxLength={16 } />
                <Input type='color' label='Mid Color' name='midColor' value={this.state.midColor} onChange={this.handleChange.bind(this, 'midColor')} maxLength={16 } />
                <Input type='color' label='High Color' name='highColor' value={this.state.highColor} onChange={this.handleChange.bind(this, 'highColor')} maxLength={16 } />
            </Dialog>
        );

    }

}

