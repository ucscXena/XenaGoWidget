import React from 'react'
import PureComponent from './PureComponent';
import PropTypes from 'prop-types';
import Dialog from "react-toolbox/lib/dialog";


export class ColorEditor extends PureComponent {

    constructor(props) {
        super(props);
        this.state = {
            active: this.props.active,
        };
    }


    render() {


        let {active,handleToggle} = this.props;

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
                title='My awesome dialog'
            >
                <p>Here you can add arbitrary content. Components like Pickers are using dialogs now.</p>
            </Dialog>
        );

    }

}

ColorEditor.propTypes = {
    active: PropTypes.any.required,
    handleToggle: PropTypes.any.required,
};
