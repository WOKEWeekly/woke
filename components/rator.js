import React, { Component} from 'react';
import { Icon } from './icon.js';
import css from '~/styles/_components.scss';

export default class Rator extends Component {
  constructor(props){
    super(props);
    this.state = {
      rating: 0,
      isLoaded: false,
      changeable: props.changeable
    }
  }

  componentDidMount(){
    this.setState({ isLoaded: true})
  }

  // componentWillReceiveProps(props) {
  //   this.setState({ hasVoted: props.hasVoted });  
  // }

  /** Update the rating */
  changeRating = (e) => {
    const rating = parseInt(e.currentTarget.value)
    this.setState({ rating });
  }

  render(){
    if (!this.state.isLoaded) return null;
    const { rating } = this.state;

    const Stars = () => {
      const stars = [];
      for (let i = 0; i < rating; i++){
        stars.push(
          <button value={i+1} className={css.invisible_button} style={{padding: 0}} onClick={this.changeRating}>
            <Icon name={'star'} style={{fontSize: 30}} />
          </button>
        );
      }
      for (let i = 0; i < 5 - rating; i++){
        stars.push(
          <button value={i+1+rating} className={css.invisible_button} style={{padding: 0}} onClick={this.changeRating}>
            <Icon prefix={'far'} name={'star'} style={{fontSize: 30}} />
          </button>
        );
      }
      return stars;
    }

    return (
      <div style={{display: 'flex'}}><Stars/></div>
    )
  }
}