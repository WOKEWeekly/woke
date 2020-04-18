import React, { Component, PureComponent } from 'react';
import { connect } from 'react-redux';
import Link from 'next/link';

import { AdminButton } from '~/components/button.js';
import { Shader, Spacer } from '~/components/layout.js';
import { Loader, Empty } from '~/components/loader.js';
import { Title, Subtitle, } from '~/components/text.js';
import {BottomToolbar} from '~/components/toolbar.js';
import { Zoomer, Fader } from '~/components/transitioner.js';

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

    // TODO: Remove when finished
    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_ARTICLES){
      return location.href = '/';
    }
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

    const { isLoaded, articles } = this.state;
    const { user } = this.props;

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

        return <div className={css.igrid}>{items}</div>
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
          {user.clearance >= CLEARANCES.ACTIONS.CRUD_ARTICLES ?
          <AdminButton
            title={'Blog Admin'}
            onClick={() => location.href = '/admin/articles'} /> : null}
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
        className={css.icontainer}>
        <Link href={`/blog/${item.slug}`}>
          <div className={css.cell}>
            <img
              src={`${cloudinary.url}/${cloudinary.lazy_wide}/${item.image}`}
              alt={item.title}
              className={css.image}
              onLoad={() => this.setState({isLoaded: true})} />
            <div className={css.details}>
              <Title className={css.title}>{item.title}</Title>
              <Subtitle className={css.date}>{zDate.formatDate(item.datePublished, true)}</Subtitle>
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