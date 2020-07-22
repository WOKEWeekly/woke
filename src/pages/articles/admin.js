import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import { alert } from 'components/alert.js';
import { AddEntityButton, BackButton } from 'components/button.js';
import { Icon } from 'components/icon.js';
import { Shader } from 'components/layout.js';
import { ConfirmModal } from 'components/modal.js';
import Tabler from 'components/tabler';
import { Title } from 'components/text.js';
import { BottomToolbar } from 'components/toolbar.js';
import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import css from 'styles/pages/Articles.module.scss';

const BlogAdmin = (props) => {
  const { user } = props;

  if (user.clearance < CLEARANCES.ACTIONS.ARTICLES.MODIFY) {
    return (location.href = '/');
  }

  return (
    <>
      <Shader>
        <ArticleCollection {...props} />

        <BottomToolbar>
          <BackButton
            title={'Go to Blog'}
            onClick={() => (location.href = '/blog')}
          />

          <AddEntityButton
            title={'Add Article'}
            onClick={() => (location.href = '/admin/articles/add')}
          />
        </BottomToolbar>
      </Shader>
    </>
  );
};

const ArticleCollection = ({ user }) => {
  const [articles, setArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState({});
  const [isLoaded, setLoaded] = useState(false);
  const [deleteModalVisible, setDeleteModalVisibility] = useState(false);

  useEffect(() => {
    getArticles();
  }, [isLoaded]);

  /** Get all articles */
  const getArticles = () => {
    request({
      url: '/api/v1/articles',
      method: 'GET',
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: (articles) => {
        setArticles(articles);
        setLoaded(true);
      }
    });
  };

  /** Delete article */
  const deleteArticle = () => {
    const { id, title } = selectedArticle;
    request({
      url: `/api/v1/articles/${id}`,
      method: 'DELETE',
      body: JSON.stringify(selectedArticle),
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        alert.success(`You've deleted article: ${title}.`);
        setDeleteModalVisibility(false);
        getArticles();
      }
    });
  };

  return (
    <>
      <Title className={css['admin-table-heading']}>Blog Articles</Title>
      <Tabler
        itemsLoaded={isLoaded}
        emptyMessage={'No articles found.'}
        columns={[
          '#',
          'Title',
          'Author',
          'Category',
          'Claps',
          'Status',
          'Cover'
        ]}
        items={articles.map((article, key) => {
          return [
            [key + 1, { type: 'index' }],
            [article.title, { icon: 'heading' }],
            [article.authorName, { icon: 'user' }],
            [article.category, { icon: 'star' }],
            [article.claps, { icon: 'sign-language' }],
            [article.status, { icon: 'unlock' }],
            [
              article.coverImage,
              {
                type: 'image',
                hideIfEmpty: true,
                imageOptions: {
                  css: css['article-admin-image'],
                  lazy: 'sw'
                }
              }
            ],
            [<LinkButton article={article} key={key} />, { type: 'button' }],
            [<EditButton id={article.id} key={key} />, { type: 'button' }],
            [
              <DeleteButton
                article={article}
                setDeleteModalVisibility={setDeleteModalVisibility}
                setSelectedArticle={setSelectedArticle}
                key={key}
              />,
              { type: 'button' }
            ]
          ];
        })}
        distribution={'4% 1.2fr 0.8fr .8fr 8% 0.6fr 8% 4% 4% 4%'}
      />
      <ConfirmModal
        visible={deleteModalVisible}
        message={`Are you sure you want to delete article: ${selectedArticle.title}?`}
        confirmFunc={deleteArticle}
        confirmText={'Delete'}
        close={() => setDeleteModalVisibility(false)}
      />
    </>
  );
};

/**
 * Navigate to the article's page.
 * @param {object} props - The component properties.
 * @param {object} props.article - The article object.
 * @returns {React.Component} The component.
 */
const LinkButton = ({ article }) => {
  if (!article.slug) return null;

  return (
    <button
      className={css.invisible_button}
      onClick={() => (location.href = `/blog/${article.slug}`)}>
      <Icon name={'external-link-alt'} />
    </button>
  );
};

/**
 * Navigate to edit a article.
 * @param {object} props - The component properties.
 * @param {number} props.id - The ID of the article.
 * @returns {React.Component} The component.
 */
const EditButton = ({ id }) => {
  const link = `/admin/articles/edit/${id}`;
  return (
    <button
      className={css.invisible_button}
      onClick={() => (location.href = link)}>
      <Icon name={'edit'} />
    </button>
  );
};

/**
 * Attempt to delete a article.
 * @param {object} props - The component properties.
 * @param {number} props.article - The article to be deleted.
 * @param {Function} props.setDeleteModalVisibility - The hook for setting modal visibility.
 * @param {Function} props.setSelectedArticle - The hook for setting the currently-selected article.
 * @returns {React.Component} The component.
 */
const DeleteButton = ({
  article,
  setDeleteModalVisibility,
  setSelectedArticle
}) => {
  return (
    <button
      className={css.invisible_button}
      onClick={() => {
        setDeleteModalVisibility(true);
        setSelectedArticle(article);
      }}>
      <Icon name={'trash'} />
    </button>
  );
};

const mapStateToProps = ({ user }) => ({
  user
});

export default connect(mapStateToProps)(BlogAdmin);
