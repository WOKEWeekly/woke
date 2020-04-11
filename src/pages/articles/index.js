import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import { Col, Row } from 'react-bootstrap';

import { AdminButton } from '~/components/button.js';
import { SortDropdown } from '~/components/dropdown.js';
import { Icon } from '~/components/icon.js';
import { Cover, Shader, Spacer } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { Title, Subtitle, Divider, Paragraph, truncateText } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';
import { Zoomer, Slider, Fader } from '~/components/transitioner.js';

import CLEARANCES from '~/constants/clearances.js';
import request from '~/constants/request.js';
import { cloudinary } from '~/constants/settings.js';

import { zDate } from 'zavid-modules';

import css from '~/styles/articles.scss';

class Blog extends Component {
  constructor(props){
    super(props);
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
      url: '/api/v1/articles/published',
      method: 'GET',
      headers: { 'Authorization': process.env.AUTH_KEY },
      onSuccess: (articles) => {
        this.setState({
          articles: articles,
          isLoaded: true
        }, () => {
          this.sortArticles(this.state.sort);
        });
      }
    });
  }

  /** Sort articles by descending order of date published */
  sortArticles = (sort) => {
    const { articles } = this.state;

    articles.sort(function (a,b) {
      a = a.date_published;
      b = b.date_published;
      return a < b ? -1 : a > b ? 1 : 0
		});

    this.setState({
      articles: articles.reverse(),
      sort: sort
    });
  }

  render(){

    const { isLoaded, articles } = this.state;

    const ArticleCollection = () => {
      if (!isLoaded){
        return <Loader/>;
      } else if (articles.length === 0) {
        return <Empty message={'No articles found.'} />;
      } else {
        const items = [];

        for (const [index, item] of articles.entries()) {
          items.push(<Article key={index} idx={index} item={item} />);
        }

        return <div className={css.blogGrid}>{items}</div>
      }
    }

    return (
      <Shader>
        <Spacer gridrows={'auto 1fr auto'}>
          <Fader determinant={isLoaded} duration={1500}>
            <ArticleCollection/>
          </Fader>
        </Spacer>

        <BottomToolbar>
          <AdminButton
            title={'Blog Admin'}
            onClick={() => location.href = '/admin/articles'} />
        </BottomToolbar>
      </Shader>
    );
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
      <Zoomer
        determinant={this.state.isLoaded}
        duration={400}
        delay={75 * idx}
        className={css.container}>
        <Link href={`/blog/${item.slug}`}>
          <div className={css.cell}>
            <img
              src={`${cloudinary.url}/${cloudinary.lazy_wide}/${item.image}`}
              alt={item.title}
              className={css.image}
              onLoad={() => this.setState({isLoaded: true})} />
            <div className={css.details}>
              <Title className={css.title}>{item.title}</Title>
              <Subtitle className={css.date}>{zDate.formatDate(item.date_published, true)}</Subtitle>
            </div>
          </div>
        </Link>
      </Zoomer>
    );
    
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(Blog);