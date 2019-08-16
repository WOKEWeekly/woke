import React, { Component} from 'react';
import classNames from 'classnames';
import css from '~/styles/_components.scss';

import { Mover } from '~/components/transitioner.js';

/** For voting widgets */
export class Voter extends Component {
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      hasVoted: props.hasVoted
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true})
  }

  componentWillReceiveProps(props) {
    this.setState({ hasVoted: props.hasVoted });  
  }

  /** Submit the vote and set voter to disabled */
  makeVote = (event) => {
    if (this.state.hasVoted) return false;
    this.props.onVote(event);
    this.setState({ hasVoted: true })
  }

  render(){
    const { isLoaded, hasVoted } = this.state;
    if (!isLoaded) return null;

    const { option1, option2, result1, result2 } = this.props;
    const classes = classNames(css.voter, this.props.className);

    const pct1 = result1 > 0 ? `${Math.ceil(result1)}%` : '';
    const pct2 = result2 > 0 ? `${Math.floor(result2)}%` : '';

    return (
      <div className={classes}>
        <Mover
          name={'yes'}
          determinant={hasVoted}
          duration={500}
          width={hasVoted ? result1 : 50}
          notDiv>
          <button
            name={'yes'}
            onClick={event => this.makeVote(event)}
            className={hasVoted ? css.yesVoted : css.yes}>
            {hasVoted ? pct1 : option1}
          </button>
        </Mover>
        <Mover
          name={'no'}
          determinant={hasVoted}
          duration={500}
          width={hasVoted ? result2 : 50}
          notDiv>
          <button
            name={'no'}
            onClick={event => this.makeVote(event)}
            className={hasVoted ? css.noVoted : css.no}>
            {hasVoted ? pct2: option2}
          </button>
        </Mover>
      </div>
    )
  }
}