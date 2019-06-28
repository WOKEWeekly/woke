import React, { Component } from 'react';
import { Transition } from 'react-transition-group';

export class FadeTransitioner extends Component {
  render(){

    const { duration, delay, style } = this.props;

    const defaultStyle = {
      transition: `opacity ${duration}ms ease ${delay}ms`,
      opacity: 0,
    }

    const transitionStyles = {
      entered:  { opacity: 1 },
    };

    return (
      <Template
        {...this.props}
        defaultStyle={defaultStyle}
        transitionStyles={transitionStyles} />
    )
  }
}

export class ZoomTransitioner extends Component {
  render(){

    const { duration, delay, style } = this.props;

    const defaultStyle = {
      transition: `transform ${duration}ms ease ${delay}ms`,
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

export class SlideTransitioner extends Component {
  render(){

    const { duration, delay, direction, style } = this.props;

    const defaultStyle = {
      transition: `${direction} ${duration}ms ease ${delay}ms`,
      [direction]: '-100vw',
      position: 'relative'
    }

    const transitionStyles = {
      entering: { [direction]: '-100vw' },
      entered:  { [direction]: '0' },
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
    const { duration, determinant, className, defaultStyle, transitionStyles, style } = this.props;

    return (
      <Transition
        in={determinant}
        timeout={{
          appear: 0,
          enter: duration,
          exit: duration
        }}
        {...this.props}>
        {state => (
          <div className={className} style={{...defaultStyle, ...transitionStyles[state], ...style}}>
            {this.props.children}
          </div>
        )}
        </Transition>
    )
  }
}