import React, { Component, memo, useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { zDate } from 'zavid-modules';

import { AdminButton } from 'components/button.js';
import { CloudinaryImage } from 'components/image';
import { Shader, Spacer, Default, Mobile } from 'components/layout.js';
import { Loader, Empty } from 'components/loader.js';
import { Title, Subtitle, Paragraph, VanillaLink } from 'components/text.js';
import { BottomToolbar } from 'components/toolbar.js';
import { Zoomer, Fader } from 'components/transitioner.js';
import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import css from 'styles/pages/Articles.module.scss';

class Blog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      isLoaded: false
    };
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

        return <div className={css['article-grid']}>{items}</div>;
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
          {user.clearance >= CLEARANCES.ACTIONS.ARTICLES.MODIFY ? (
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

  const hyperlink = `/blog/${article.slug}`;

  return (
    <Zoomer
      determinant={isLoaded}
      duration={400}
      delay={75 * idx}
      className={css['article-cell']}
      postTransitions={'background-color .3s ease'}>
      <Default>
        <VanillaLink href={hyperlink}>
          <div className={css['article-cell-contents']}>
            <CloudinaryImage
              src={article.coverImage}
              alt={article.title}
              className={css['article-image']}
              lazy={'mw'}
            />
            <div className={css['article-details']}>
              <div className={css['author-image']}>
                <CloudinaryImage
                  src={article.authorImage}
                  title={article.authorName}
                  lazy={'ss'}
                />
              </div>
              <div>
                <Title className={css['article-title']}>{article.title}</Title>
                <Subtitle className={css['article-metadata']}>
                  Written by {article.authorName}
                </Subtitle>
                <Subtitle className={css['article-metadata']}>
                  {article.category} •{' '}
                  {zDate.formatDate(article.datePublished, true)}
                </Subtitle>
              </div>
            </div>
            <Paragraph
              className={css['article-paragraph']}
              truncate={35}
              morelink={hyperlink}
              moretext={'Read the full article'}
              moreclass={css['article-readmore']}
              cssOverrides={{
                paragraph: css['article-content']
              }}>
              {article.content}
            </Paragraph>
          </div>
        </VanillaLink>
      </Default>
      <Mobile>
        <div className={css['article-cell-contents']}>
          <Title className={css['article-title']}>{article.title}</Title>
          <VanillaLink href={hyperlink}>
            <CloudinaryImage
              src={article.coverImage}
              alt={article.title}
              className={css['article-image']}
              lazy={'mw'}
            />
          </VanillaLink>
          <div className={css['article-metadata-md']}>
            <CloudinaryImage
              src={article.authorImage}
              title={article.authorName}
              className={css['author-image-md']}
              lazy={'ss'}
            />
            <div>
              <Subtitle>
                {article.authorName} • {article.category}
              </Subtitle>
              <Subtitle>
                {zDate.formatDate(article.datePublished, true)}
              </Subtitle>
            </div>
          </div>
          <Paragraph
            className={css['article-paragraph']}
            truncate={30}
            morelink={hyperlink}
            moretext={'Read the full article'}
            moreclass={css['article-readmore']}
            cssOverrides={{
              paragraph: css['article-content']
            }}>
            {article.content}
          </Paragraph>
        </div>
      </Mobile>
    </Zoomer>
  );
});

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(Blog);
