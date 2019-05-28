import React, { Component } from 'react';
import { Container } from 'react-bootstrap';
import css from '~/styles/_components.scss';

export default class Toolbar extends Component {
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
        <div className={css.toolbar}>
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