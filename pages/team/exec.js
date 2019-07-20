import React, { Component, PureComponent } from 'react';
import { Container, Col, Row } from 'react-bootstrap';
import Link from 'next/link';

import { Cover, Shader, Spacer } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { Title, Subtitle, Divider, TruncatedParagraph } from '~/components/text.js';
import { Slider } from '~/components/transitioner.js';


import css from '~/styles/team.scss';
import '~/styles/_categories.scss';

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
    fetch('/getExec', {
      method: 'GET',
      headers: {
        'Authorization': process.env.AUTH_KEY,
        'Content-Type': 'application/json',
      }
    })
    .then(response => response.json())
    .then(exec => {
      this.setState({
        exec: exec,
        isLoaded: true
      });
    })
    .catch(error => console.error(error));
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
            image={'team-header.jpg'}
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

    return (
      <Slider
        key={idx}
        determinant={this.state.isLoaded}
        duration={750}
        delay={1000 + (500 * idx)}
        direction={isEven ? 'left' : 'right'}>
        <Link href={`/executives/${item.slug}`}>
          <div className={css.item}>
            <Row>
              <Col md={{span: 4, order: isEven ? 1 : 2}}>
                <img
                  src={`/static/images/team/${item.image}`}
                  alt={item.fullname}
                  className={css.image} />
              </Col>
              <Col md={{span: 8, order: isEven ? 2 : 1}}>
                <div className={css.details}>
                  <Title className={css.title}>{item.fullname}</Title>
                  <Subtitle className={css.date}>{item.role}</Subtitle>
                  <Divider />
                  <TruncatedParagraph className={css.description}>{item.description}</TruncatedParagraph>
                </div>
              </Col>
            </Row>
          </div>
        </Link>
      </Slider>
    );
  }
}