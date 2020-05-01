import React, { Component, PureComponent } from 'react';

import { zDate } from 'zavid-modules';

import { Loader } from '~/components/loader.js';
import { Title, Subtitle, Divider } from '~/components/text.js';
import { Zoomer } from '~/components/transitioner.js';

import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';

import css from '~/styles/pages/Articles.module.scss';

export default class ArticleSidebar extends Component {
  constructor(){
    super();
    this.state = {
      articles: [],
      isLoaded: false
    }
  }

  /** Get published articles on mount */
  componentDidMount() {
    this.getPublishedArticles();
  }

  /** Get published articles */
  getPublishedArticles = () => {
    request({
      url: '/api/v1/articles/published?limit=3&order=DESC',
      method: 'GET',
      headers: { 'Authorization': process.env.AUTH_KEY },
      onSuccess: (articles) => {
        this.setState({
          articles: articles,
          isLoaded: true
        });
      }
    });
  }

  render(){
    const { articles, isLoaded } = this.state;

    const ArticleList = () => {
      if (!isLoaded){
        return <Loader/>;
      } else if (articles.length === 0) {
        return <Empty message={'No other articles.'} />;
      } else {
        const items = [];

        for (const [index, item] of articles.entries()) {
          items.push(<Article key={index} idx={index} item={item} />);
        }

        return <div>{items}</div>
      }
    }
    return (
      <div className={css.sidebar}>
        <Title className={css.heading}>Recent Posts</Title>
        <Divider/>
        <ArticleList />
      </div>
    )
  }
}

class Article extends PureComponent {
  constructor(){
    super();
    this.state = { isLoaded: false }
  }

  render(){
    const { item, idx } = this.props;
  
    return (
      <React.Fragment>
      <Zoomer
        determinant={this.state.isLoaded}
        duration={400}
        delay={75 * idx}>
        <a href={`/blog/${item.slug}`}>
          <div className={css.item}>
            <img
              src={`${cloudinary.url}/${cloudinary.lazy_wide}/${item.image}`}
              alt={item.title}
              className={css.image}
              onLoad={() => this.setState({isLoaded: true})} />
            <div>
              <Title className={css.title}>{item.title}</Title>
              <Subtitle className={css.details}>{zDate.formatDate(item.datePublished, true)}</Subtitle>
            </div>
          </div>
        </a>
      </Zoomer>
      <Divider/>
      </React.Fragment>
    );
    
  }
}