import React, { Component} from 'react';
import { Col, Row, Container } from 'react-bootstrap';
import { connect } from 'react-redux';

import { AdminButton, BackButton } from '~/components/button.js';
import { Subtitle, Paragraph, Divider } from '~/components/text.js';
import { BottomToolbar } from '~/components/toolbar.js';
import { Partitioner, Shader, Spacer } from '~/components/layout.js';
import { Fader, Slider } from '~/components/transitioner.js';

import CLEARANCES from '~/constants/clearances.js';
import { cloudinary } from '~/constants/settings.js';

import { zDate } from 'zavid-modules';

import css from '~/styles/articles.scss';

import ArticleSidebar from './sidebar';

class ArticlePage extends Component {
  constructor(){
    super();
    this.state = {
      isLoaded: false,
    }
  }

  /** Retrieve article from server */
  static async getInitialProps({ query }) {
    return { article: query.article };
  }

  componentDidMount(){
    this.setState({isLoaded: true})
  }

  render(){
    const { article, user } = this.props;
    article.content = article.content.trim().length > 0 ? article.content : 'No content.';

    const { isLoaded } = this.state;

    /** The blog title element */
    const BlogTitle = () => {
      return (
        <Fader
          determinant={isLoaded}
          duration={500}>
          <Subtitle className={css.title}>{article.title}</Subtitle>
        </Fader>
      );
    };

    /** The details of the blog */
    const BlogDetails = () => {
      const { authorName, authorLevel, authorSlug, datePublished } = article;
      if (!authorName) return null;

      let link = '';
      if (authorLevel === 'Executive')	
        link = `/executives/${authorSlug}`;	
      else	
        link = `/team/member/${authorSlug}`;

      return (
        <Fader
          determinant={isLoaded}
          duration={500}
          delay={500}>
          <Subtitle className={css.details}>
            Written by 
            <a className={css.author} href={link}> {authorName}</a> • {zDate.formatDate(datePublished, true)}
          </Subtitle>
        </Fader>
      );
    }

    /** The cover image */
    const CoverImage = () => {
      return (
        <Slider
          determinant={isLoaded}
          duration={800}
          direction={'left'}> 
          <img
            src={`${cloudinary.url}/${cloudinary.lazy_wide}/${article.image}`}
            alt={article.title}
            className={css.image} />
        </Slider>
      )
    };

    /** The blog content */
    const Content = () => {
      return (
        <Fader
          determinant={isLoaded}
          duration={500}
          delay={1000}>
          <Paragraph className={css.content}>{article.content}</Paragraph>
        </Fader>
      )
    };

    return (
      <Spacer>
        <Shader>
          <Partitioner>
            <Row>
              <Col md={8}>
                <Container className={css.container}>
                  <BlogTitle/>
                  <BlogDetails/>
                  <Divider/>
                  <CoverImage/>
                  <Content/>
                </Container>
              </Col>
              <Col md={4}>
                <ArticleSidebar/>
              </Col>
            </Row>
          </Partitioner>
        </Shader>
        
        <BottomToolbar>
          <BackButton
            title={'Back to Blog'}
            onClick={() => location.href = '/blog'} />

          {user.clearance >= CLEARANCES.ACTIONS.CRUD_ARTICLES ?
            <AdminButton
              title={'Blog Admin'}
              onClick={() => location.href = '/admin/articles'} /> : null}
        </BottomToolbar>
      </Spacer>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(ArticlePage);