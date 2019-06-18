import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import css from '~/styles/_components.scss';

class Toolbar extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

  render(){

    const { isLoaded } = this.state;

    if (isLoaded){
      return (
        <div className={this.props.className}>
          <Container className={css.container}>
            {this.props.children}
          </Container>
        </div>
      )
    } else {
      return null;
    }
    
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