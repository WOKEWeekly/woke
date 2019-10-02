import React, { PureComponent } from 'react';
import { Col, Row, Button, ButtonGroup } from 'react-bootstrap';
import { connect } from 'react-redux';

import { setAlert } from '~/components/alert.js';
import { ConfirmModal } from '~/components/modal.js';
import { Title, Subtitle, Paragraph, QuoteWrapper, ExpandText, truncateText } from '~/components/text.js';
import { Slider } from '~/components/transitioner.js';
import Rator from '~/components/rator.js';

import CLEARANCES from '~/constants/clearances.js';
import request from '~/constants/request.js';

import css from '~/styles/home.scss';

class Review extends PureComponent {
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      modalVisible: false,
      showFullText: props.showFullText
    }
  }

  componentDidMount(){
    this.setState({isLoaded: true});
  }
  
  /** Delete review from database */
  deleteReview = () => {
    const { item, user } = this.props;
    const review = item;
    request({
      url: '/deleteReview',
      method: 'DELETE',
      body: JSON.stringify(item),
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully deleted ${review.referee}'s review.` });
        location.href = '/reviews';
      }
    });
  }

  /** Show and hide confirmation modal */
  showModal = () => { this.setState({modalVisible: true})}
  hideModal = () => { this.setState({modalVisible: false})}

  render(){
    const { item, idx, user, showAdminControls } = this.props;
    const { showFullText } = this.state;
    item.description = item.description && item.description.trim().length > 0 ? item.description : 'No description.';

    const limit = window.matchMedia('(max-width: 576px)').matches ? 40 : 60;
    const beyondLimit = item.description.split(' ').length > limit;

    const isEven = (idx % 2 == 0);

    const ReviewerImage = () => {
      if (!item.image) return null;
      return (
        <img
          src={`/static/images/reviews/${item.image}`}
          alt={item.fullname}
          className={css.image} />
      );
    }

    return (
      <React.Fragment>
        <Slider
          key={idx}
          determinant={this.state.isLoaded}
          duration={750}
          delay={1000 + (500 * idx)}
          direction={isEven ? 'left' : 'right'}>
          <div className={css.item}>
            <Row>
              <Col md={{span: 3, order: isEven ? 1 : 2}}>
                <ReviewerImage/>
              </Col>
              <Col md={{span: 9, order: isEven ? 2 : 1}} style={{display: 'flex', flexDirection: 'column'}}>
                <div className={css.details} style={{textAlign: isEven ? 'left' : 'right'}}>
                  <Title className={css.title}>{item.referee}</Title>
                  <Subtitle className={css.subtitle}>{item.position}</Subtitle>
                  <Rator rating={item.rating} changeable={false} style={{justifyContent: isEven ? 'flex-start' : 'flex-end'}} />
                  <QuoteWrapper>
                    <div>
                      <Paragraph className={css.paragraph}>
                        {showFullText ? item.description : truncateText(item.description, limit)}
                      </Paragraph>
                      {!showFullText && beyondLimit ? <ExpandText text={'Click to read more...'} onClick={() => this.setState({showFullText: true})} /> : null}
                    </div>
                  </QuoteWrapper>
                </div>
                {showAdminControls && user.clearance >= CLEARANCES.ACTIONS.CRUD_REVIEWS ?
                  <ButtonGroup className={css.buttons} style={{alignSelf: isEven ? 'flex-start' : 'flex-end'}}>
                    <Button variant={'success'} onClick={() => location.href = (`/reviews/edit/${item.id}`)}>Edit</Button>
                    <Button variant={'danger'} onClick={this.showModal}>Delete</Button>
                  </ButtonGroup> : null}
              </Col>
            </Row>
          </div>
        </Slider>

        <ConfirmModal
          visible={this.state.modalVisible}
          message={'Are you sure you want to delete this review?'}
          confirmFunc={this.deleteReview}
          confirmText={'Delete'}
          close={this.hideModal} />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Review);