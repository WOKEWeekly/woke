import React, { Component } from 'react';
import { Transition } from 'react-transition-group';

export class Fader extends Component {
  render(){

    const { duration, delay, postTransitions } = this.props;

    const defaultStyle = {
      transition: `opacity ${duration}ms ease ${delay || 0}ms`,
      opacity: 0,
    }

    const transitionStyles = {
      entered: { opacity: 1 },
    };

    return (
      <Template
        {...this.props}
        defaultStyle={defaultStyle}
        transitionStyles={transitionStyles} />
    )
  }
}

export class Zoomer extends Component {
  render(){

    const { duration, delay } = this.props;

    const defaultStyle = {
      transition: `transform ${duration}ms ease ${delay || 0}ms`,
      transform: 'scale(0)'
    }

    const transitionStyles = {
      entered:  { transform: 'scale(1)' },
    };

    return (
      <Template
        {...this.props}
        defaultStyle={defaultStyle}
        transitionStyles={transitionStyles} />
    )
  }
}

export class Slider extends Component {
  render(){

    const { duration, delay, direction, postTransitions } = this.props;

    const defaultStyle = {
      transition: `all ${duration}ms ease ${delay || 0}ms`,
      [direction]: '-100vw',
      opacity: 0,
      position: 'relative'
    }

    const transitionStyles = {
      entering: defaultStyle,
      entered:  {
        [direction]: '0',
        opacity: 1,
        transition: `${defaultStyle.transition}, ${postTransitions}`,
      },
    };

    return (
      <Template
        {...this.props}
        defaultStyle={defaultStyle}
        transitionStyles={transitionStyles} />
    )
  }
}

class Template extends Component {
  render(){
    const { notDiv, determinant, className, defaultStyle, transitionStyles, style, children } = this.props;

    return (
      <Transition
        in={determinant}
        timeout={{
          appear: 0,
          enter: 0,
          exit: 0
        }}
        {...this.props}>
        {state => {
          if (notDiv){
            return React.cloneElement(children, {
              style: {...defaultStyle, ...transitionStyles[state], ...style}
            });
          } else {
            return (
            <div className={className} style={{...defaultStyle, ...transitionStyles[state], ...style}}>
              {this.props.children}
            </div>
            )
          }
          
        }}
        </Transition>
    )
  }
}