import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Dialog from "react-toolbox/lib/dialog";
import Input from "react-toolbox/lib/input";
import Grid from "react-bootstrap/es/Grid";
import Row from "react-bootstrap/es/Row";
import Col from "react-bootstrap/es/Col";
import Checkbox from "react-bootstrap/es/Checkbox";


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
        let col1 = 2;
        let col2 = 5;
        let col3 = 2;

        return (
            <Dialog
                active={active}
                onEscKeyDown={handleToggle}
                onOverlayClick={handleToggle}
                title='Edit Score Colors'
            >
                <Grid>
                    <Row>
                        <Col md={col1}>
                            High Color
                        </Col>
                        <Col md={col2}>
                            <Input type='color' label='High Color' name='highColor'
                                   value={this.state.colorSettings.highColor}
                                   onChange={this.handleChange.bind(this, 'highColor')} maxLength={16}/>
                        </Col>
                        <Col md={col3}>
                            <Input type='number' label='High Domain' name='highDomain'
                                   value={this.state.colorSettings.highDomain}
                                   onChange={this.handleChange.bind(this, 'highDomain')} maxLength={16}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={col1}>
                            Mid Color
                        </Col>
                        <Col md={col2}>
                            <Input type='color' label='Mid Color' name='midColor'
                                   value={this.state.colorSettings.midColor}
                                   onChange={this.handleChange.bind(this, 'midColor')} maxLength={16}/>
                        </Col>
                        <Col md={col3}>
                            <Input type='number' label='Mid Domain' name='midDomain'
                                   value={this.state.colorSettings.midDomain}
                                   onChange={this.handleChange.bind(this, 'midDomain')} maxLength={16}/>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={col1}>
                            Low Color
                        </Col>
                        <Col md={col2}>
                            <Input type='color' label='Low Color' name='lowColor'
                                   value={this.state.colorSettings.lowColor}
                                   onChange={this.handleChange.bind(this, 'lowColor')} maxLength={16}/>
                        </Col>
                        <Col md={col3}>
                            <Input type='number' label='Low Domain' name='lowDomain'
                                   value={this.state.colorSettings.lowDomain}
                                   onChange={this.handleChange.bind(this, 'lowDomain')} maxLength={16}/>
                        </Col>
                    </Row>
                    {/*<Row>*/}
                        {/*<Col md={col1}>*/}
                            {/*Link Domains*/}
                        {/*</Col>*/}
                        {/*<Col md={col2}>*/}
                            {/*<Checkbox*/}
                                {/*checked={this.state.colorSettings.linkDomains}*/}
                                {/*label='Link Domains'*/}
                                {/*onChange={this.handleChange.bind(this, 'linkDomains')}*/}
                            {/*/>*/}
                        {/*</Col>*/}
                    {/*</Row>*/}
                    <Row>
                        <Col md={col1}>
                            Gamma
                        </Col>
                        <Col md={col2}>
                            <Input type='number' label='Gamma' name='gamma' value={this.state.colorSettings.gamma}
                                   onChange={this.handleChange.bind(this, 'gamma')} maxLength={16}/>
                        </Col>
                    </Row>
                </Grid>
            </Dialog>
        );

    }

}

