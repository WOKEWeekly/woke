import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { zDate, zString } from 'zavid-modules';

import { setAlert } from '@components/alert.js';

import handlers from '@constants/handlers.js';
import request from '@constants/request.js';
import { cloudinary } from '@constants/settings.js';
import { ARTICLE_STATUS, OPERATIONS } from '@constants/strings.js';
import { isValidArticle } from '@constants/validations.js';

import ArticleForm from './form.js';

const ArticleCrud = ({ article: currentArticle, operation, title, user }) => {
  const [stateArticle, setArticle] = useState({
    id: 0,
    title: '',
    content: '',
    category: '',
    excerpt: '',
    image: null,
    authorId: null,
    status: ARTICLE_STATUS.DRAFT,
    datePublished: new Date(),
    tags: ''
  });
  const [isLoaded, setLoaded] = useState(false);

  const isCreateOperation = operation === OPERATIONS.CREATE;

  // Determine if article is being published
  let isPublish = false;
  if (isCreateOperation) {
    isPublish = stateArticle.status === ARTICLE_STATUS.PUBLISHED;
  } else {
    isPublish =
      currentArticle.status !== ARTICLE_STATUS.PUBLISHED &&
      stateArticle.status === ARTICLE_STATUS.PUBLISHED;
  }

  useEffect(() => {
    if (!isCreateOperation) {
      const tags = zString.convertArrayToCsv(JSON.parse(currentArticle.tags));
      const datePublished =
        currentArticle.status !== ARTICLE_STATUS.PUBLISHED
          ? new Date()
          : currentArticle.datePublished;
      setArticle(Object.assign({}, currentArticle, { tags, datePublished }));
    }
    setLoaded(true);
  }, [isLoaded]);

  const buildRequest = () => {
    const {
      title,
      content,
      category,
      excerpt,
      tags,
      image,
      authorId,
      status,
      datePublished
    } = stateArticle;

    // Only have published date if the status is published
    const date =
      status !== ARTICLE_STATUS.PUBLISHED
        ? null
        : zDate.formatISODate(datePublished);

    const articleToSubmit = {
      title: title.trim(),
      content: content.trim(),
      category: category.trim(),
      excerpt: excerpt.trim(),
      tags: JSON.stringify(zString.convertCsvToArray(tags)),
      image,
      authorId,
      status,
      datePublished: date
    };

    const imageHasChanged =
      image !== '' && image !== null && !cloudinary.check(image);

    const data = JSON.stringify(
      isCreateOperation
        ? { article: articleToSubmit, isPublish }
        : {
            article: articleToSubmit,
            changed: imageHasChanged,
            isPublish
          }
    );

    return data;
  };

  const submitArticle = () => {
    if (!isValidArticle(stateArticle)) return;
    const data = buildRequest();

    /** Add article to database */
    request({
      url: '/api/v1/articles',
      method: 'POST',
      body: data,
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully added the article titled: ${stateArticle.title}.`
        });
        location.href = '/admin/articles';
      }
    });
  };

  /** Update article on server */
  const updateArticle = () => {
    if (!isValidArticle(stateArticle)) return;
    const data = buildRequest();

    /** Update article in database */
    request({
      url: `/api/v1/articles/${currentArticle.id}`,
      method: 'PUT',
      body: data,
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        setAlert({
          type: 'success',
          message: `You've successfully edited the article titled: ${stateArticle.title}.`
        });
        location.href = '/admin/articles';
      }
    });
  };

  const confirmText = isPublish ? 'Save & Publish' : 'Save';

  return (
    <ArticleForm
      heading={title}
      article={stateArticle}
      handlers={handlers(setArticle, stateArticle)}
      confirmText={confirmText}
      confirmFunc={isCreateOperation ? submitArticle : updateArticle}
      cancelFunc={() => (location.href = '/admin/articles')}
      operation={operation}
      metaTitle={title}
      metaUrl={`/${operation}`}
    />
  );
};

ArticleCrud.getInitialProps = async ({ query }) => {
  return { ...query };
};

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(ArticleCrud);
