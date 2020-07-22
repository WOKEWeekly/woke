import classnames from 'classnames';
import React, { useState, useEffect } from 'react';

import css from 'styles/components/Form.module.scss';

import { Icon } from './icon.js';

// export default class Rator extends Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       rating: props.rating || 0,
//       isLoaded: false,
//       changeable: props.changeable
//     };
//   }

//   componentDidMount() {
//     this.setState({ isLoaded: true });
//   }

//   static getDerivedStateFromProps(props) {
//     return { rating: props.rating };
//   }

//   /** Update the rating on star click */
//   changeRating = (e) => {
//     if (!this.state.changeable) return;
//     this.props.onChange(e);
//   };

//   render() {
//     if (!this.state.isLoaded) return null;
//     const { rating } = this.state;

//     const Stars = () => {
//       const stars = [];
//       for (let i = 0; i < rating; i++) {
//         stars.push(
//           <button
//             key={i}
//             value={i + 1}
//             className={css.invisible_button}
//             onClick={this.changeRating}>
//             <Icon name={'star'} className={css.starIcon} />
//           </button>
//         );
//       }
//       for (let i = 0; i < 5 - rating; i++) {
//         stars.push(
//           <button
//             key={i + rating}
//             value={i + 1 + rating}
//             className={css.invisible_button}
//             onClick={this.changeRating}>
//             <Icon prefix={'far'} name={'star'} className={css.starIcon} />
//           </button>
//         );
//       }
//       return stars;
//     };

//     return (
//       <div
//         className={classnames(css.starBar, this.props.className)}
//         style={{ ...this.props.style }}>
//         <Stars />
//       </div>
//     );
//   }
// }

const Rator = ({
  rating: currentRating,
  changeable,
  containerClassName,
  starClassName,
  onChange,
  style
}) => {
  const [stateRating, setRating] = useState(0);
  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    setRating(currentRating);
    setLoaded(true);
  }, [isLoaded, stateRating]);

  const changeRating = (e) => {
    if (!changeable) return;
    setRating(e.target.value);
    onChange(e);
  };

  return (
    <div
      className={classnames(css['rator-star-bar'], containerClassName)}
      style={style}>
      <StarBar
        changeRating={changeRating}
        starClassName={starClassName}
        rating={stateRating}
      />
    </div>
  );
};

const StarBar = ({ changeRating, rating, starClassName }) => {
  const stars = [];
  for (let i = 0; i < rating; i++) {
    stars.push(
      <Star
        className={starClassName}
        changeRating={changeRating}
        value={i + 1}
        key={i}
      />
    );
  }
  for (let i = 0; i < 5 - rating; i++) {
    stars.push(
      <Star
        className={starClassName}
        empty={true}
        changeRating={changeRating}
        value={i + 1 + rating}
        key={i + rating}
      />
    );
  }
  return stars;
};

const Star = ({ changeRating, className, empty = false, value = 0 }) => {
  const iconProps = empty ? { prefix: 'far' } : {};
  return (
    <button
      value={value}
      className={css['rator-star-button']}
      onClick={changeRating}>
      <Icon {...iconProps} name={'star'} className={classnames(css['rator-star-icon'], className)} />
    </button>
  );
};

export default Rator;
