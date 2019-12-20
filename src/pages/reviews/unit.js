import React, { PureComponent } from 'react';
import { Col, Row, Button, ButtonGroup } from 'react-bootstrap';
import { connect } from 'react-redux';
import LazyLoader from 'react-visibility-sensor';

import { setAlert } from '~/components/alert.js';
import { isSmallDevice, Default } from '~/components/layout.js';
import { ConfirmModal } from '~/components/modal.js';
import { Title, Subtitle, Paragraph, QuoteWrapper, Divider, ExpandText, truncateText } from '~/components/text.js';
import { Slider } from '~/components/transitioner.js';
import Rator from '~/components/rator.js';

import CLEARANCES from '~/constants/clearances.js';
import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';

import css from '~/styles/home.scss';

class Review extends PureComponent {
  constructor(props){
    super(props);
    this.state = {
      isLoaded: false,
      modalVisible: false,
      showFullText: props.showFullText,

      inView: false,
      detectViewChange: true
    }
  }

  componentDidMount(){
    this.setState({isLoaded: true});
  }

  toggleVisibility = (inView) => {
    this.setState({ inView, detectViewChange: inView === false });
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
    const { showFullText, inView, detectViewChange } = this.state;
    item.description = item.description && item.description.trim().length > 0 ? item.description : 'No description.';

    const limit = isSmallDevice() ? 40 : 60;
    const beyondLimit = item.description.split(' ').length > limit;

    const isEven = (idx % 2 == 0);

    /** Image of reviewer */
    const ReviewerImage = () => {
      if (!item.image) return null;
      return (
        <Col md={{span: 3, order: isEven ? 1 : 2}}>
          <img
            src={`${cloudinary.url}/${item.image}`}
            alt={item.fullname}
            className={css.image} />
        </Col>
      );
    }

    /** Admin buttons for each review */
    const AdminControls = () => {
      if (!(showAdminControls && user.clearance >= CLEARANCES.ACTIONS.CRUD_REVIEWS)) return null;

      const style = () => {
        if (isSmallDevice()) return null;
        return { alignSelf: isEven ? 'flex-start' : 'flex-end' };
      };

      return (
        <ButtonGroup className={css.buttons} style={style()}>
          <Button variant={'success'} onClick={() => location.href = (`/reviews/edit/${item.id}`)}>Edit</Button>
          <Button variant={'danger'} onClick={this.showModal}>Delete</Button>
        </ButtonGroup>
      );
    }

    const ReadMore = () => {
      if (showFullText || !beyondLimit) return null;

      return (
      <ExpandText
        text={'Click to read more...'}
        onClick={() => this.setState({showFullText: true})} />
      );
    }

    /** Details of the review */
    const ReviewDetails = () => {
      const colStyle = !isSmallDevice() ? { display: 'flex', flexDirection: 'column' } : null;
      const detailsStyle = !isSmallDevice() ? { textAlign: isEven ? 'left' : 'right' } : null;
      const ratorStyle = !isSmallDevice() ? { justifyContent: isEven ? 'flex-start' : 'flex-end' } : null;

      return (
        <Col md={{span: item.image ? 9 : 12, order: isEven ? 2 : 1}} style={colStyle}>
          <div className={css.details} style={detailsStyle}>
            <Default><Divider style={{marginTop: 0}} /></Default>
            <Title className={css.title}>{item.referee}</Title>
            <Subtitle className={css.subtitle}>{item.position}</Subtitle>
            <Rator rating={item.rating} changeable={false} style={ratorStyle} />
            <QuoteWrapper>
              <div>
                <Paragraph className={css.paragraph}>
                  {showFullText ? item.description : truncateText(item.description, limit)}
                </Paragraph>
                <ReadMore />
              </div>
            </QuoteWrapper>
          </div>
          <AdminControls />
        </Col>
      );
    };

    return (
      <React.Fragment>
        <LazyLoader onChange={this.toggleVisibility} partialVisibility={true} active={detectViewChange}>
          <Slider
            key={idx}
            determinant={inView}
            duration={750}
            direction={isEven ? 'left' : 'right'}>
            <div className={css.item}>
              <Row>
                <ReviewerImage/>
                <ReviewDetails />
              </Row>
            </div>
          </Slider>
        </LazyLoader>

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