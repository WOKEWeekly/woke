import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import css from '~/styles/components/Toolbar.module.scss';

class Toolbar extends Component {
  constructor(props) {
    super(props);
    this.state = { isLoaded: false };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  render() {
    if (!this.state.isLoaded) return null;

    const { children, className } = this.props;
    if (!children) return null;

    return (
      <div className={className}>
        <Container className={css.container}>{children}</Container>
      </div>
    );
  }
}

export class TopToolbar extends Component {
  render() {
    return <Toolbar className={css.top_toolbar} {...this.props} />;
  }
}

export class BottomToolbar extends Component {
  render() {
    return <Toolbar className={css.bottom_toolbar} {...this.props} />;
  }
}
