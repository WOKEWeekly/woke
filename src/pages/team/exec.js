import React, { Component, PureComponent } from 'react';
import { Container, Col, Row } from 'react-bootstrap';

import { Cover, Shader, Spacer } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { Title, Subtitle, Divider, Paragraph, VanillaLink, truncateText } from '~/components/text.js';
import { Slider } from '~/components/transitioner.js';

import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';

import css from '~/styles/pages/Members.module.scss';

export default class Executives extends Component {
  constructor(){
    super();
    this.state = {
      exec: [],
      isLoaded: false
    };
  }

  componentDidMount(){
    this.getExec();
  }

  getExec = () => {
    request({
      url: '/api/v1/members/executives',
      method: 'GET',
      headers: { 'Authorization': process.env.AUTH_KEY },
      onSuccess: (exec) => {
        this.setState({
          exec: exec,
          isLoaded: true
        });
      }
    });
  }

  render(){
    const { exec, isLoaded } = this.state;

    const heading = 'Meet The Executives';
    const description = 'The masterminds behind the cause.';

    const ExecList = () => {
      if (!isLoaded){
        return <Loader/>;
      } else if (exec.length === 0){
        return <Empty message={'No executive members found.'}/>;
      } else {
        const items = [];
        for (const [index, item] of exec.entries()) {
          items.push(<Exec key={index} idx={index} item={item} />);
        }
        return <Container className={css.list}>{items}</Container>;
      }
    };

    return (
      <Shader>
        <Spacer gridrows={'auto 1fr auto'}>
          <Cover
            title={heading}
            subtitle={description}
            image={'header-team.jpg'}
            height={200}
            backgroundPosition={'center'} />

          <ExecList/>
        </Spacer>
      </Shader>
    )
  }
}

class Exec extends PureComponent {
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
    item.fullname = `${item.firstname} ${item.lastname}`;
    item.description = item.description && item.description.trim().length > 0 ? item.description : 'No description.';

    const isEven = (idx % 2 == 0);

    const link = `/executives/${item.slug}`;

    return (
      <Slider
        key={idx}
        determinant={this.state.isLoaded}
        duration={750}
        delay={1000 + (500 * idx)}
        direction={isEven ? 'left' : 'right'}>
        <VanillaLink href={link}>
          <div className={css.item}>
            <Row>
              <Col md={{span: 4, order: isEven ? 1 : 2}}>
                <img
                  src={`${cloudinary.url}/${item.image}`}
                  alt={item.fullname}
                  className={css.image} />
              </Col>
              <Col md={{span: 8, order: isEven ? 2 : 1}}>
                <div className={css.details}>
                  <Title className={css.title}>{item.fullname}</Title>
                  <Subtitle className={css.subtitle}>{item.role}</Subtitle>
                  <Divider />
                  <Paragraph
                    className={css.paragraph}
                    link={link}
                    moretext={`More on ${item.firstname}`}>
                    {truncateText(item.description, 60)}
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </VanillaLink>
      </Slider>
    );
  }
}