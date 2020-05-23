import React, { useState, useEffect } from 'react';
import { zDate } from 'zavid-modules';

import { CloudinaryImage } from '@components/image.js';
import { Loader, Empty } from '@components/loader.js';
import { Title, Subtitle, Divider, VanillaLink } from '@components/text.js';
import { Zoomer } from '@components/transitioner.js';

import request from '@constants/request.js';

import css from '@styles/pages/Articles.module.scss';

const ArticleSidebar = () => {
  const [isLoaded, setLoaded] = useState(false);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    /** Get published articles */
    request({
      url: '/api/v1/articles/published?limit=3&order=DESC',
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
    <div className={css.sidebar}>
      <Title className={css.heading}>Recent Posts</Title>
      {/* <Divider /> */}
      <ArticleList />
    </div>
  );
};

const Article = ({ article, idx }) => {
  const [isLoaded, setLoaded] = useState(false);
  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  return (
    <>
      <Zoomer determinant={isLoaded} duration={400} delay={75 * idx}>
        <VanillaLink href={`/blog/${article.slug}`}>
          <div className={css.item}>
            <CloudinaryImage
              src={article.image}
              alt={article.title}
              className={css.image}
              lazy={'mw'}
            />
            <div>
              <Title className={css.title}>{article.title}</Title>
              <Subtitle className={css.details}>
                {zDate.formatDate(article.datePublished, true)}
              </Subtitle>
            </div>
          </div>
        </VanillaLink>
      </Zoomer>
      <Divider />
    </>
  );
};

export default ArticleSidebar;