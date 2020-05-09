import React, { Component } from 'react';
import { Icon } from './icon.js';
import css from '~/styles/components/Form.module.scss';

export default class Rator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: props.rating || 0,
      isLoaded: false,
      changeable: props.changeable
    };
  }

  componentDidMount() {
    this.setState({ isLoaded: true });
  }

  static getDerivedStateFromProps(props) {
    return { rating: props.rating };
  }

  /** Update the rating on star click */
  changeRating = e => {
    if (!this.state.changeable) return;
    this.props.onChange(e);
  };

  render() {
    if (!this.state.isLoaded) return null;
    const { rating } = this.state;

    const Stars = () => {
      const stars = [];
      for (let i = 0; i < rating; i++) {
        stars.push(
          <button
            key={i}
            value={i + 1}
            className={css.invisible_button}
            onClick={this.changeRating}>
            <Icon name={'star'} className={css.starIcon} />
          </button>
        );
      }
      for (let i = 0; i < 5 - rating; i++) {
        stars.push(
          <button
            key={i + rating}
            value={i + 1 + rating}
            className={css.invisible_button}
            onClick={this.changeRating}>
            <Icon prefix={'far'} name={'star'} className={css.starIcon} />
          </button>
        );
      }
      return stars;
    };

    return (
      <div className={css.starBar} style={{ ...this.props.style }}>
        <Stars />
      </div>
    );
  }
}
