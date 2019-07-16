import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import css from '~/styles/_components.scss';
import { zIndices } from './layout';

class Toolbar extends Component {
  constructor(props){
    super(props);
    this.state = { isLoaded: false }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

  render(){
    if (!this.state.isLoaded) return null;

    return (
      <div className={this.props.className}>
        <Container className={css.container}>
          {this.props.children}
        </Container>
      </div>
    )
  }
}

export class TopToolbar extends Component {
  render(){
    return (
      <Toolbar
        className={css.top_toolbar}
        children={this.props.children} />
    )
  }
}

export class BottomToolbar extends Component {
  render(){
    return (
      <Toolbar className={css.bottom_toolbar} children={this.props.children} />
    )
  }
}