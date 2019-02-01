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
            colorSettings: this.props.colorSettings,
        };
    }

    handleChange = (name, value) => {
        // console.log('handling input', name,value, this.state)
        // this.setState({...this.state.colorSettings, [name]: value});

        let newArray = JSON.parse(JSON.stringify(this.state.colorSettings));
        newArray[name] = value;
        // console.log('newArray: ', newArray)
        this.setState({
            colorSettings: newArray
        });

        this.props.handleColorChange(name,value)
    };


    render() {
        let {active, handleToggle} = this.props;

        return (
            <Dialog
                active={active}
                onEscKeyDown={handleToggle}
                onOverlayClick={handleToggle}
                title='Edit Score Colors'
            >
                <Input type='number' label='Domain' name='domain' value={this.state.colorSettings.domain}
                       onChange={this.handleChange.bind(this, 'domain')} maxLength={16}/>
                <Input type='number' label='Gamma' name='gamma' value={this.state.colorSettings.gamma}
                       onChange={this.handleChange.bind(this, 'gamma')} maxLength={16}/>
                <Input type='color' label='Low Color' name='lowColor' value={this.state.colorSettings.lowColor}
                       onChange={this.handleChange.bind(this, 'lowColor')} maxLength={16}/>
                <Input type='color' label='Mid Color' name='midColor' value={this.state.colorSettings.midColor}
                       onChange={this.handleChange.bind(this, 'midColor')} maxLength={16}/>
                <Input type='color' label='High Color' name='highColor' value={this.state.colorSettings.highColor}
                       onChange={this.handleChange.bind(this, 'highColor')} maxLength={16}/>
            </Dialog>
        );

    }

}

