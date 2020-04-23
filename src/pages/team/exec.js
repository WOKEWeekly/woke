import React, { Component, PureComponent } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import Link from 'next/link';

import { Cover, Shader, Spacer } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import { Slider } from '~/components/transitioner.js';

import fetch from 'node-fetch';

import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';

import css from '~/styles/pages/Members.module.scss';

class Executives extends Component {
  constructor(){
    super();
    this.state = {
      isLoaded: true
    };
  }

  render(){
    const { isLoaded } = this.state;
    const { exec } = this.props;

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
        determinant={true}
        duration={750}
        delay={1000 + (500 * idx)}
        direction={isEven ? 'left' : 'right'}>
        <Link href={link}>
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
                    moreText={`More on ${item.firstname}`}>
                    {truncateText(item.description, 60)}
                  </Paragraph>
                </div>
              </Col>
            </Row>
          </div>
        </Link>
      </Slider>
    );
  }
}

export async function getServerSideProps(){
  const response = await fetch("http://localhost:3000/api/v1/members/executives", { headers: { 'Authorization': process.env.AUTH_KEY }});
  const data = await response.json();

  return {
    props: {
      exec: data
    }
  }
}

export default Executives;