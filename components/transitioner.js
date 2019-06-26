import React, { Component } from 'react';
import { Transition } from 'react-transition-group';

export class FadeTransitioner extends Component {
  render(){

    const { duration, delay } = this.props;

    const defaultStyle = {
      transition: `all ${duration}ms ease ${delay}ms`,
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

    const { duration, delay } = this.props;

    const defaultStyle = {
      transition: `all ${duration}ms ease ${delay}ms`,
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

    const { duration, delay, direction } = this.props;

    const defaultStyle = {
      transition: `all ${duration}ms ease ${delay}ms`,
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
    const { duration, determinant, className, defaultStyle, transitionStyles } = this.props;

    return (
      <Transition
        in={determinant}
        timeout={{
          appear: 0,
          enter: duration,
          exit: duration
        }}
        appear
        mountOnEnter
        unmountOnExit
        {...this.props}>
        {state => (
          <div className={className} style={{...defaultStyle, ...transitionStyles[state]}}>
            {this.props.children}
          </div>
        )}
        </Transition>
    )
  }
}