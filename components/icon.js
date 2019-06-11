import React, { Component } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { colors } from '~/constants/theme.js';

export class Icon extends Component {
  render(){
    return (
      <FontAwesomeIcon
        icon={['fas', this.props.name]}
        color={'white'}
        style={{ marginRight: 8 }} />
    ) 
  }
}

/** Header social media icons */
export class HeaderIcon extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

  render(){
    if (this.state.isLoaded){
      return (
        <a
          href={this.props.href}
          style={{fontSize: 24}}>
          <FontAwesomeIcon
            icon={['fab', this.props.icon]}
            color={colors.primary}
            style={{margin: '0 3px'}} />
        </a>
      )
    } else {
      return null;
    }
  }
}

/** Footer social media icons */
export class FooterIcon extends Component {
  constructor(){
    super();
    this.state = {
      isLoaded: false
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true });
  }

  render(){
    if (this.state.isLoaded){
      return (
        <div style={{
          backgroundColor: 'black',
          borderRadius: '30px',
          display: 'inline-block',
          padding: '1em 0',
          textAlign: 'center',
          width: '5.5em'
        }}>
          <a href={this.props.href}>
            <FontAwesomeIcon
              icon={["fab", this.props.icon]}
              color={colors.primary}
              size={'3x'} />
          </a>
        </div>
      )
    } else {
      return null;
    }
   
  }
}