import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import { Col, Row } from 'react-bootstrap';

import { AddEntityButton, RadioButtonGroup } from '~/components/button.js';
import { SortDropdown } from '~/components/dropdown.js';
import { Icon } from '~/components/icon.js';
import { Default, Mobile, Cover, Shader, Spacer } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { ConfirmModal } from '~/components/modal.js';
import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';
import { Zoomer, Slider, Fader } from '~/components/transitioner.js';

import CLEARANCES from '~/constants/clearances.js';
import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';

import { zDate } from 'zavid-modules';

import css from '~/styles/articles.scss';

class BlogAdmin extends Component {
  constructor(props){
    super(props);
    this.state = {
      articles: [],
      isLoaded: false
    }

    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_ARTICLES){
      return location.href = '/';
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
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: (articles) => {
        this.setState({
          articles: articles,
          isLoaded: true
        });
      }
    });
  }

  render(){

    const { isLoaded, articles } = this.state;
    if (!isLoaded){
      return <Loader/>;
    } else if (articles.length === 0) {
      return <Empty message={'No articles found.'} />;
    }

    const items = [];

    for (const [index, item] of articles.entries()) {
      items.push(<Article key={index} idx={index} article={item} getArticles={this.getArticles} />);
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
          <span/>
          <span/>
          <span/>
        </div>
      )

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
      return (
        <React.Fragment>
          <Default><ArticleTable/></Default>
          <Mobile><ArticleList/></Mobile>
        </React.Fragment>
      )
    }

    return (
      <React.Fragment>
        <Shader className={css.articleTabler}>
          <Title className={css.heading}>Blog Articles</Title>
          <ArticleCollection/>
        </Shader>

        <BottomToolbar>
          <AddEntityButton
            title={'Add Article'}
            onClick={() => location.href = '/admin/articles/add'} />
        </BottomToolbar>
      </React.Fragment>
    );
  }
}

class IArticle extends PureComponent {
  constructor(props){
    super(props);
    this.state = {
      ...props.article,
      isLoaded: false,
      deleteVisible: false,
    }
  }

  componentDidMount(){
    this.setState({isLoaded: true});
  }

  /** Go to edit article */
  editArticle = (article) => location.href = `/admin/articles/edit/${article.id}`;

  /** Delete article */
  deleteArticle = () => {
    const { title } = this.state;
    request({
      url: `/api/v1/articles/${this.state.id}`,
      method: 'DELETE',
      body: JSON.stringify(this.state),
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        alert.success(`You've deleted article: ${title}.`);
        this.closeDelete();
        this.props.getArticles();
      }
    });
  }

  openDelete = () => this.setState({ deleteVisible: true});
  closeDelete = () => this.setState({ deleteVisible: false});

  render(){
    const { deleteVisible } = this.state;
    const { article, idx } = this.props;

    const LinkButton = () => {
      if (!article.slug) return null;

      return (
        <button className={css.invisible_button} onClick={() => location.href = `/blog/${article.slug}`}>
          <Icon name={'external-link-alt'} />
        </button>
      );
    }

    const ArticleImage = () => {
      if (!article.image) return 'None';
      return <img
        src={`${cloudinary.url}/${cloudinary.lazy_wide}/${article.image}`}
        alt={article.title}
        className={css.image} />
    }

    return (
      <Fader
        key={idx}
        determinant={this.state.isLoaded}
        duration={500 + (idx * 100)}
        className={css.row}
        postTransitions={'background-color .1s ease'}>
        <Default>
          <span>{idx+1}</span>
          <span>{article.title}</span>
          <span>{article.author}</span>
          <span>{article.category}</span>
          <span><ArticleImage/></span>
          <span>{article.status}</span>
          <span><LinkButton/></span>
          <span><button className={css.invisible_button} onClick={() => this.editArticle(article)}><Icon name={'edit'} /></button></span>
          <span><button className={css.invisible_button} onClick={this.openDelete}><Icon name={'trash'} /></button></span>
        </Default>
        <Mobile>
          <div>
            <span><Icon name={'user'}/></span>
            <span className={css.name}>{article.title}</span>
          </div>
          <div>
            <span><Icon name={'star'}/></span>
            <span>{article.category}</span>
          </div>
          <div>
            <span><Icon name={'signature'}/></span>
            <span>{article.image}</span>
          </div>
          <div>
            <span><Icon name={'globe-africa'}/></span>
            <span>{article.status}</span>
          </div>
          <div className={css.index}>{idx+1}</div>
          <div className={css.crud}>
            <LinkButton />
            <button className={css.invisible_button} onClick={() => this.editArticle(article)}><Icon name={'edit'} /></button>
            <button className={css.invisible_button} onClick={this.openDelete}><Icon name={'trash'} /></button>
          </div>
        </Mobile>

        <ConfirmModal
          visible={deleteVisible}
          message={`Are you sure you want to delete article: ${article.title}?`}
          confirmFunc={this.deleteArticle}
          confirmText={'Delete'}
          close={this.closeDelete} />
        
      </Fader>
    ); 
  }
}

const mapStateToProps = state => ({
  user: state.user
});

const Article = connect(mapStateToProps)(IArticle);
export default connect(mapStateToProps)(BlogAdmin);