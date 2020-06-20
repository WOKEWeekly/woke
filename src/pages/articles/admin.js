import React, { Component, memo, useState, useEffect } from 'react';
import { connect } from 'react-redux';

import { alert } from 'components/alert.js';
import { AddEntityButton, BackButton } from 'components/button.js';
import { Icon } from 'components/icon.js';
import { CloudinaryImage } from 'components/image.js';
import { Default, Mobile, Shader } from 'components/layout.js';
import { Loader, Empty } from 'components/loader.js';
import { ConfirmModal } from 'components/modal.js';
import { Title } from 'components/text.js';
import { BottomToolbar } from 'components/toolbar.js';
import { Fader } from 'components/transitioner.js';

import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';

import css from 'styles/pages/Articles.module.scss';

class BlogAdmin extends Component {
  constructor(props) {
    super(props);
    this.state = {
      articles: [],
      isLoaded: false
    };

    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_ARTICLES) {
      return (location.href = '/');
    }
  }

  /** Get articles on mount */
  componentDidMount() {
    this.getArticles();
  }

  /** Get all articles */
  getArticles = () => {
    request({
      url: '/api/v1/articles',
      method: 'GET',
      headers: { Authorization: `Bearer ${this.props.user.token}` },
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

    const items = [];

    for (const [index, item] of articles.entries()) {
      items.push(
        <Article
          key={index}
          idx={index}
          article={item}
          getArticles={this.getArticles}
        />
      );
    }

    const ArticleTable = () => {
      const headerRow = (
        <div className={css.header}>
          <span>#</span>
          <span>Title</span>
          <span>Author</span>
          <span>Category</span>
          <span>Image</span>
          <span>Status</span>
          <span />
          <span />
          <span />
        </div>
      );

      return (
        <div className={css.grid}>
          {headerRow}
          {items}
        </div>
      );
    };

    const ArticleList = () => {
      return <div className={css.list}>{items}</div>;
    };

    const ArticleCollection = () => {
      if (!isLoaded) {
        return <Loader />;
      } else if (!articles.length) {
        return <Empty message={'There are no articles.'} />;
      }

      return (
        <>
          <Title className={css.heading}>Blog Articles</Title>
          <Default>
            <ArticleTable />
          </Default>
          <Mobile>
            <ArticleList />
          </Mobile>
        </>
      );
    };

    return (
      <>
        <Shader className={css.articleTabler}>
          <ArticleCollection />
        </Shader>

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
      </>
    );
  }
}

const IArticle = memo(({ article, idx, user, getArticles }) => {
  const [isLoaded, setLoaded] = useState(false);
  const [isDeleteModalVisible, setVisibility] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  /** Go to edit article */
  const editArticle = () =>
    (location.href = `/admin/articles/edit/${article.id}`);

  /** Delete article */
  const deleteArticle = () => {
    request({
      url: `/api/v1/articles/${article.id}`,
      method: 'DELETE',
      body: JSON.stringify(article),
      headers: { Authorization: `Bearer ${user.token}` },
      onSuccess: () => {
        alert.success(`You've deleted article: ${article.title}.`);
        setVisibility(false);
        getArticles();
      }
    });
  };

  const LinkButton = () => {
    if (!article.slug) return null;

    return (
      <button
        className={css.invisible_button}
        onClick={() => (location.href = `/blog/${article.slug}`)}>
        <Icon name={'external-link-alt'} />
      </button>
    );
  };

  const ArticleImage = () => {
    if (!article.image) return 'None';
    return (
      <CloudinaryImage
        src={article.image}
        lazy={'sw'}
        alt={article.title}
        className={css.image}
      />
    );
  };

  return (
    <Fader
      key={idx}
      determinant={isLoaded}
      duration={500 + idx * 100}
      className={css.row}
      postTransitions={'background-color .1s ease'}>
      <Default>
        <span>{idx + 1}</span>
        <span>{article.title}</span>
        <span>{article.authorName}</span>
        <span>{article.category}</span>
        <span>
          <ArticleImage />
        </span>
        <span>{article.status}</span>
        <span>
          <LinkButton />
        </span>
        <span>
          <button
            className={css.invisible_button}
            onClick={() => editArticle()}>
            <Icon name={'edit'} />
          </button>
        </span>
        <span>
          <button
            className={css.invisible_button}
            onClick={() => setVisibility(true)}>
            <Icon name={'trash'} />
          </button>
        </span>
      </Default>
      <Mobile>
        <MobileField
          icon={'heading'}
          text={article.title}
          className={css.name}
        />
        <MobileField icon={'user'} text={article.authorName} />
        <MobileField icon={'star'} text={article.category} />
        <MobileField icon={'unlock'} text={article.status} />
        <div className={css.index}>{idx + 1}</div>
        <div className={css.crud}>
          <LinkButton />
          <button
            className={css.invisible_button}
            onClick={() => editArticle()}>
            <Icon name={'edit'} />
          </button>
          <button
            className={css.invisible_button}
            onClick={() => setVisibility(true)}>
            <Icon name={'trash'} />
          </button>
        </div>
        <CloudinaryImage
          src={article.image}
          lazy={'sw'}
          className={css.listImage}
        />
      </Mobile>

      <ConfirmModal
        visible={isDeleteModalVisible}
        message={`Are you sure you want to delete article: ${article.title}?`}
        confirmFunc={deleteArticle}
        confirmText={'Delete'}
        close={() => setVisibility(false)}
      />
    </Fader>
  );
});

// TODO: Abstract for all mobile-table conversions
const MobileField = ({ icon, text, className }) => {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '8% auto',
        alignItems: 'baseline'
      }}>
      <Icon name={icon} style={{ textAlign: 'right' }} />
      <span className={className}>{text}</span>
    </div>
  );
};

const mapStateToProps = (state) => ({
  user: state.user
});

const Article = connect(mapStateToProps)(IArticle);
export default connect(mapStateToProps)(BlogAdmin);
