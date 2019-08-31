import React from 'react';
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Dialog from 'react-toolbox/lib/dialog';
import Input from 'react-toolbox/lib/input';


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
      if (name === 'shadingValue') {
        value = 1 / (value / 100.0) ;
      }
      newArray[name] = value;
      if (name === 'highDomain' && this.state.colorSettings.linkDomains) {
        newArray['lowDomain'] = -value;
        this.props.onColorChange('lowDomain', -value);
      }
      this.setState({
        colorSettings: newArray
      });
      this.props.onColorChange(name, value);
    };


    render() {

      let {active, onColorToggle} = this.props;

      return (
        <Dialog
          active={active}
          onEscKeyDown={onColorToggle}
          onOverlayClick={onColorToggle}
          title='Edit Colors'
        >
          <table width="100%">
            <tbody>
              <tr>
                <td>
                            Gene Set High Color
                </td>
                <td>
                  <Input
                    name='highColor'
                    onChange={this.handleChange.bind(this, 'highColor')}
                    style={{width: 50, height: 40}}
                    type='color'
                    value={this.state.colorSettings.highColor}
                  />
                </td>
                <td>
                  <Input
                    name='highDomain'
                    onChange={this.handleChange.bind(this, 'highDomain')}
                    style={{width: 50}}
                    type='number'
                    value={this.state.colorSettings.highDomain}
                  />
                </td>
              </tr>
              <tr>
                <td>
                            Gene Set Neutral Color
                </td>
                <td>
                  <Input
                    name='midColor' onChange={this.handleChange.bind(this, 'midColor')}
                    style={{width: 50, height: 40}}
                    type='color'
                    value={this.state.colorSettings.midColor}
                  />
                </td>
                <td>
                  <Input
                    name='midDomain' onChange={this.handleChange.bind(this, 'midDomain')}
                    style={{width: 50}}
                    type='number'
                    value={this.state.colorSettings.midDomain}
                  />
                </td>
              </tr>
              <tr>
                <td>
                            Gene Set Low Color
                </td>
                <td>
                  <Input
                    name='lowColor' onChange={this.handleChange.bind(this, 'lowColor')}
                    style={{width: 50, height: 40}}
                    type='color'
                    value={this.state.colorSettings.lowColor}
                  />
                </td>
                <td>
                  <Input
                    name='lowDomain' onChange={this.handleChange.bind(this, 'lowDomain')}
                    style={{width: 50}}
                    type='number'
                    value={this.state.colorSettings.lowDomain}
                  />
                </td>
              </tr>
              <tr>
                <td>
                            Gene Set Gamma
                </td>
                <td>
                  <Input
                    name='gamma' onChange={this.handleChange.bind(this, 'gamma')}
                    style={{width: 50}}
                    type='number'
                    value={this.state.colorSettings.gamma}
                  />
                </td>
              </tr>
              <tr>
                <td colSpan={3}>
                  <hr/>
                </td>
              </tr>
              <tr>
                <td>
                            Gene Gamma
                </td>
                <td>
                  <Input
                    name='gamma' onChange={this.handleChange.bind(this, 'geneGamma')}
                    style={{width: 50}}
                    type='number'
                    value={this.state.colorSettings.geneGamma}
                  />
                </td>
              </tr>
              <tr>
                <td>
                            Gene Saturation Percent (%)
                </td>
                <td>
                  <Input
                    name='shadingValue' onChange={this.handleChange.bind(this, 'shadingValue')}
                    style={{width: 50}}
                    type='number'
                    value={100.0 / this.state.colorSettings.shadingValue}
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
  onColorChange: PropTypes.any.isRequired,
  onColorToggle: PropTypes.any.isRequired,
};
