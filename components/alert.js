import React, { Component} from 'react';
import { Alert as Template, Container } from 'react-bootstrap';
import { connect } from 'react-redux';

import css from '~/styles/_components.scss';
import { zIndices } from './layout';

class _Alert extends Component {
  constructor(props) {
    super(props);
    this.state = {
      show: props.visible,
    };
  }

  componentWillReceiveProps(props) {
    console.log(props);
    this.setState({ show: props.visible }, () => {
      if (props.visible === true){
        setTimeout(() => {
          this.setState({ show: false }); 
        }, 3000);
      }
    }); 
  }

  handleDismiss = () => this.setState({ show: false });

  render() {
    if (this.state.show) {
      const { alert } = this.props;

      return (
        <Container className={css.alert_container}>
          <Template
            className={css.alert}
            variant={alert.variant}
            onClose={this.handleDismiss}
            dismissible
            style={{ zIndex: zIndices.alerts}}
            {...this.props}>
            {alert.message}
          </Template>
        </Container>
      );
    } else {
      return null;
    }
  }
}

const mapStateToProps = state => ({
  alert: state.alert
});

export const Alert = connect(mapStateToProps)(_Alert);