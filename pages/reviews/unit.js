import React, { PureComponent } from 'react';
import { Col, Row } from 'react-bootstrap';

import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import { Slider } from '~/components/transitioner.js';

import css from '~/styles/team.scss';
import '~/styles/_categories.scss';

export class Review extends PureComponent {
  constructor(){
    super();
    this.state = {
      isLoaded: false
    }
  }

  componentDidMount(){
    this.setState({isLoaded: true});
  }

  render(){
    const { item, idx } = this.props;
    item.description = item.description && item.description.trim().length > 0 ? item.description : 'No description.';

    const isEven = (idx % 2 == 0);

    const ReviewerImage = () => {
      if (!item.image) return null;
      return (
        <img
          src={`/static/images/team/${reviews.image}`}
          alt={reviews.fullname}
          className={css.image} />
      );
    }

    return (
      <Slider
        key={idx}
        determinant={this.state.isLoaded}
        duration={750}
        delay={1000 + (500 * idx)}
        direction={isEven ? 'left' : 'right'}>
        <div className={css.item}>
          <Row>
            <Col md={{span: 4, order: isEven ? 1 : 2}}>
              <ReviewerImage/>
            </Col>
            <Col md={{span: 8, order: isEven ? 2 : 1}}>
              <div className={css.details}>
                <Title className={css.title}>{item.referee}</Title>
                <Subtitle className={css.subtitle}>{item.position}</Subtitle>
                <Divider />
                <Paragraph
                  className={css.paragraph}>
                  {truncateText(item.description, 60)}
                </Paragraph>
              </div>
            </Col>
          </Row>
        </div>
      </Slider>
    );
  }
}