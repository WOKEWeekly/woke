import React, { Component, memo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { zDate } from 'zavid-modules';

import { AdminButton } from '@components/button.js';
import { CloudinaryImage } from '@components/image';
import { Shader, Spacer } from '@components/layout.js';
import { Loader, Empty } from '@components/loader.js';
import { Title, Subtitle, VanillaLink } from '@components/text.js';
import { BottomToolbar } from '@components/toolbar.js';
import { Zoomer, Fader } from '@components/transitioner.js';

import CLEARANCES from '@constants/clearances.js';
import request from '@constants/request.js';

import css from '@styles/pages/Articles.module.scss';

class Blog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      isLoaded: false
    };

    // TODO: Remove when finished
    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_ARTICLES) {
      return (location.href = '/');
    }
  }

  /** Get published articles on mount */
  componentDidMount() {
    this.getPublishedArticles();
  }

  /** Get published articles */
  getPublishedArticles = () => {
    request({
      url: '/api/v1/articles/published?order=DESC',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (articles) => {
        this.setState({
          articles: articles,
          isLoaded: true
        });
      }
    });
  };

  render() {
    const { isLoaded, articles } = this.state;
    const { user } = this.props;

    const ArticleCollection = () => {
      if (!isLoaded) {
        return <Loader />;
      } else if (articles.length === 0) {
        return <Empty message={'No articles found.'} />;
      } else {
        const items = articles.map((article, index) => {
          return <Article key={index} idx={index} article={article} />;
        });

        return <div className={css.igrid}>{items}</div>;
      }
    };

    return (
      <Shader>
        <Spacer gridrows={'auto 1fr auto'}>
            <Fader determinant={isLoaded} duration={1500}>
              <ArticleCollection />
            </Fader>
        </Spacer>

        <BottomToolbar>
          {user.clearance >= CLEARANCES.ACTIONS.CRUD_ARTICLES ? (
            <AdminButton
              title={'Blog Admin'}
              onClick={() => (location.href = '/admin/articles')}
            />
          ) : null}
        </BottomToolbar>
      </Shader>
    );
  }
}

const Article = memo(({ article, idx }) => {
  const [isLoaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  return (
    <Zoomer
      determinant={isLoaded}
      duration={400}
      delay={75 * idx}
      className={css.icontainer}>
      <VanillaLink href={`/blog/${article.slug}`}>
        <div className={css.cell}>
          <CloudinaryImage
            src={article.image}
            alt={article.title}
            className={css.image}
            lazy={'mw'}
          />
          <div className={css.details}>
            <div className={css.authorImage}>
              <CloudinaryImage
                src={article.authorImage}
                title={article.authorName}
                lazy={'ss'}
              />
            </div>
            <div>
              <Title className={css.title}>{article.title}</Title>
              <Subtitle className={css.date}>
                {zDate.formatDate(article.datePublished, true)}
              </Subtitle>
            </div>
          </div>
        </div>
      </VanillaLink>
    </Zoomer>
  );
});

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(Blog);
