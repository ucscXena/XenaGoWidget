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
        let newArray = JSON.parse(JSON.stringify(this.state.colorSettings));
        newArray[name] = value;
        if (name === 'highDomain' && this.state.colorSettings.linkDomains) {
            newArray['lowDomain'] = -value;
            this.props.handleColorChange('lowDomain', -value)
        }
        this.setState({
            colorSettings: newArray
        });
        this.props.handleColorChange(name, value)
    };


    render() {

        let {active, handleToggle} = this.props;

        return (
            <Dialog
                active={active}
                onEscKeyDown={handleToggle}
                onOverlayClick={handleToggle}
                title='Edit Colors'
            >
                <table width="100%">
                    <tbody>
                    <tr>
                        <td>
                            High Color
                        </td>
                        <td>
                            <Input type='color'
                                   name='highColor'
                                   value={this.state.colorSettings.highColor}
                                   onChange={this.handleChange.bind(this, 'highColor')}
                                   style={{width: 50, height: 40}}
                            />
                        </td>
                        <td>
                            <Input type='number'
                                   name='highDomain'
                                   value={this.state.colorSettings.highDomain}
                                   onChange={this.handleChange.bind(this, 'highDomain')}
                                   style={{width: 50}}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Neutral Color
                        </td>
                        <td>
                            <Input type='color' name='midColor'
                                   value={this.state.colorSettings.midColor}
                                   onChange={this.handleChange.bind(this, 'midColor')}
                                   style={{width: 50, height: 40}}
                            />
                        </td>
                        <td>
                            <Input type='number' name='midDomain'
                                   value={this.state.colorSettings.midDomain}
                                   onChange={this.handleChange.bind(this, 'midDomain')}
                                   style={{width: 50}}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Low Color
                        </td>
                        <td>
                            <Input type='color' name='lowColor'
                                   value={this.state.colorSettings.lowColor}
                                   onChange={this.handleChange.bind(this, 'lowColor')}
                                   style={{width: 50, height: 40}}
                            />
                        </td>
                        <td>
                            <Input type='number' name='lowDomain'
                                   value={this.state.colorSettings.lowDomain}
                                   onChange={this.handleChange.bind(this, 'lowDomain')}
                                   style={{width: 50}}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Gamma
                        </td>
                        <td>
                            <Input type='number' name='gamma'
                                   value={this.state.colorSettings.gamma}
                                   onChange={this.handleChange.bind(this, 'gamma')}
                                   style={{width: 50}}
                            />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            Gene Color Intensity
                        </td>
                        <td>
                            <Input type='number' name='shadingValue'
                                   value={this.state.colorSettings.shadingValue}
                                   onChange={this.handleChange.bind(this, 'shadingValue')}
                                   style={{width: 50}}
                            />
                        </td>
                    </tr>
                    </tbody>
                </table>
            </Dialog>
        );

    }

}

ColorEditor.propTypes = {
    active: PropTypes.any.isRequired,
    colorSettings: PropTypes.any.isRequired,
    handleToggle: PropTypes.any.isRequired,
    handleColorChange: PropTypes.any.isRequired,
};
