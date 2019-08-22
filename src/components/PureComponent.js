
import { Component } from 'react';
import { isEqual } from 'underscore';

class PureComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(nextProps, this.props) || !isEqual(nextState, this.state);
  }
}

export default PureComponent;
