import React, { Component} from 'react';
import { Alert as alert } from 'react-bootstrap';

export default class Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: true,
    };
  }

  render() {

    const handleDismiss = () => this.setState({ show: false });

    if (this.state.show) {
      return (
        <alert variant={this.props.variant} onClose={handleDismiss} dismissible>
          {this.props.children}
        </alert>
      );
    }
  }
}