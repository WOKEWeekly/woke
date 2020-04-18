import React, { Component } from 'react';
import { connect } from 'react-redux';

import { setAlert } from '~/components/alert.js';

import { zDate, zHandlers, zString } from 'zavid-modules';
import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';
import { ARTICLE_STATUS, OPERATIONS } from '~/constants/strings.js';
import { isValidArticle } from '~/constants/validations.js';

import ArticleForm from './form.js';

class ArticleCrud extends Component {
  static async getInitialProps({ query }) {
    return { ...query };
  }

  constructor(){
    super();
    this.state = {
      id: 0,
      title: '',
      content: '',
      category: '',
      excerpt: '',
      image: null,
      authorId: null,
      status: ARTICLE_STATUS.DRAFT,
      datePublished: new Date(),
      tags: '',

      isCreateOperation: true
    }
  }

  componentDidMount(){
    const { article, operation } = this.props
    const tags = article && zString.convertArrayToCsv(JSON.parse(article.tags));
    const datePublished = article.status !== ARTICLE_STATUS.PUBLISHED ? (new Date()) : article.datePublished;
    this.setState({
      ...article,
      tags,
      datePublished,
      isCreateOperation: operation === OPERATIONS.CREATE
    });
  }

  buildRequest = () => {
    const { title, content, category, excerpt, tags, image, authorId, status, datePublished } = this.state;
    const { operation } = this.props;

    // Only have published date if the status is published
    const date = status !== ARTICLE_STATUS.PUBLISHED ? null : zDate.formatISODate(datePublished);

    const article = {
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

    let data;

    if (operation === OPERATIONS.CREATE){
      data = JSON.stringify(article);
    } else {
      data = JSON.stringify({
        article,
        changed: image !== '' && image !== null && !cloudinary.check(image)
      });
    }

    return data
  }

  submitArticle = () => {
    if (!isValidArticle(this.state)) return;
    const data = this.buildRequest();

    /** Add article to database */
    request({
      url: '/api/v1/articles',
      method: 'POST',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}` },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully added the article titled: ${this.state.title}.` });
        location.href = '/admin/articles';
      }
    });
  }

  /** Update article on server */
  updateArticle = () => {
    if (!isValidArticle(this.state)) return;
    const data = this.buildRequest();

    /** Update article in database */
    request({
      url: `/api/v1/articles/${this.props.article.id}`,
      method: 'PUT',
      body: data,
      headers: { 'Authorization': `Bearer ${this.props.user.token}`, },
      onSuccess: () => {
        setAlert({ type: 'success', message: `You've successfully edited the article titled: ${this.state.title}.` });
        location.href = '/admin/articles';
      }
    });
  }

  render(){

    const { title, operation } = this.props;
    const { isCreateOperation } = this.state;

    return (
      <ArticleForm
        heading={title}
        article={this.state}
        handlers={zHandlers(this)}

        confirmText={isCreateOperation ? 'Submit' : 'Update'}
        confirmFunc={isCreateOperation ? this.submitArticle : this.updateArticle}
        cancelFunc={() => location.href = '/admin/articles'}

        operation={operation}

        metaTitle={title}
        metaUrl={`/${operation}`} />
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(ArticleCrud);