import React, {Component} from 'react';
import Responsive from 'react-responsive';
import {Container} from 'react-bootstrap';
import classNames from 'classnames';;
import css from '~/styles/_components.scss';
import { Fader } from '~/components/transitioner.js';


export class Cover extends Component {
  constructor(){
    super();
    this.state = { isLoaded: false };
  }

  componentDidMount(){
    this.setState({isLoaded: true});
  }

	render(){
    const { backgroundPosition, height, image, title, subtitle} = this.props;
    const classes = classNames(css.cover, this.props.className);
		return (
      <Fader determinant={this.state.isLoaded} duration={1000} delay={0}>
        <Container fluid={true} className={classes} style={{
          backgroundImage: `url(/static/images/bg/${image})`,
          backgroundPosition: backgroundPosition,
          minHeight: height,
        }}>
          <div>
            <Fader determinant={this.state.isLoaded} duration={500} delay={1000}>
              <div className={css.title}>{title}</div>
            </Fader>
            <Fader determinant={this.state.isLoaded} duration={500} delay={1500}>
              <div className={css.subtitle}>{subtitle}</div>
            </Fader>
          </div>
        </Container>
      </Fader>
		);
	}
}

export class Shader extends Component {
  render(){
    return (
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, .7)',
        width: '100%'
      }}>{this.props.children}</div>
    );
  }
}

export class Spacer extends Component {
  render(){
    return (
      <div
      {...this.props}
      style={{
        display: 'grid',
        height: '100%',
        gridTemplateRows: this.props.gridrows || '1fr auto'
      }}>{this.props.children}</div>
    );
  }
}

export const Desktop = props => <Responsive {...props} minWidth={992} />;
export const Tablet = props => <Responsive {...props} minWidth={768} maxWidth={991} />;
export const Mobile = props => <Responsive {...props} maxWidth={767} />;
export const Default = props => <Responsive {...props} minWidth={768} />;

export const zIndices = {
  topicTopToolbar: 0,
  filterMenu: 1010,
  accountMenu: 1050,
  alerts: 1100
}