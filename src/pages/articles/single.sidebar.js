import React, { useState, useEffect, memo } from 'react';
import { zDate } from 'zavid-modules';

import { SubscribeField } from 'components/form';
import { CloudinaryImage } from 'components/image.js';
import { Loader, Empty } from 'components/loader.js';
import { Title, Subtitle, Divider, VanillaLink } from 'components/text.js';
import { Zoomer } from 'components/transitioner.js';

import request from 'constants/request.js';

import css from 'styles/pages/Articles.module.scss';

const ArticleSidebar = memo(({ currentArticleId: id }) => {
  const [isLoaded, setLoaded] = useState(false);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    /** Get 3 most recent published articles */
    request({
      url: `/api/v1/articles/published?limit=3&order=DESC&exception=${id}`,
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (articles) => {
        setArticles(articles);
        setLoaded(true);
      }
    });
  }, [isLoaded]);

  const ArticleList = () => {
    if (!isLoaded) {
      return <Loader />;
    } else if (!articles.length) {
      return <Empty message={'No other articles.'} />;
    } else {
      const items = [];

      for (const [index, item] of articles.entries()) {
        items.push(<Article key={index} idx={index} article={item} />);
      }

      return <div>{items}</div>;
    }
  };

  return (
    <div className={css['recent-posts-sidebar']}>
      <Title className={css['heading']}>Recent Posts</Title>
      <ArticleList />
      <Divider />
      <SubscribeField />
    </div>
  );
});

const Article = memo(({ article, idx }) => {
  const [isLoaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  const articleHyperlink = `/blog/${article.slug}`;
  const isGuest = article.authorLevel === 'Guest';
  const authorHyperlink = isGuest
    ? `/author/${article.authorSlug}`
    : `/team/${article.authorSlug}`;

  return (
    <Zoomer determinant={isLoaded} duration={400} delay={75 * idx}>
      <div className={css['article-cell']}>
        <VanillaLink href={articleHyperlink}>
          <CloudinaryImage
            src={article.image}
            alt={article.title}
            className={css['article-image']}
            lazy={'mw'}
          />
        </VanillaLink>
        <Title className={css['article-title']}>{article.title}</Title>
        <div className={css['article-metadata']}>
          <CloudinaryImage
            src={article.authorImage}
            alt={article.authorName}
            className={css['author-image']}
            lazy={'ss'}
          />
          <div>
            <Subtitle className={css['article-details']}>
              Written by{' '}
              <a className={css['article-author-name']} href={authorHyperlink}>
                {article.authorName}
              </a>
            </Subtitle>
            <Subtitle className={css['article-details']}>
              {article.category} •{' '}
              {zDate.formatDate(article.datePublished, true)}
            </Subtitle>
          </div>
        </div>
      </div>
    </Zoomer>
  );
});

export default ArticleSidebar;
