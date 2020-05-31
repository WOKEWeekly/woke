import React, { useEffect, useState, memo } from 'react';
import { Col, Row, Container } from 'react-bootstrap';
import { connect } from 'react-redux';
import { zDate, zText } from 'zavid-modules';

import { AdminButton, BackButton } from '@components/button.js';
import { Icon, PromoIconsBar } from '@components/icon.js';
import { CloudinaryImage } from '@components/image.js';
import { Partitioner, Shader, Spacer } from '@components/layout.js';
import { SocialMediaShareBlock } from '@components/socialmedia.js';
import { Title, Subtitle, Paragraph, Divider } from '@components/text.js';
import { BottomToolbar } from '@components/toolbar.js';
import { Fader } from '@components/transitioner.js';

import CLEARANCES from '@constants/clearances.js';

import css from '@styles/pages/Articles.module.scss';

import ArticleSidebar from './single.sidebar';

const ArticlePage = ({ article, user }) => {
  // TODO: Remove when finished
  if (user.clearance < CLEARANCES.ACTIONS.CRUD_ARTICLES) {
    return (location.href = '/');
  }

  const [isLoaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  const {
    authorName,
    authorImage,
    authorSlug,
    authorDescription,
    authorSocials,
    datePublished
  } = article;
  article.content = article.content.trim() || 'No content.';

  const shareMessage = `"${article.title}" by ${authorName} on The #WOKEWeekly Blog`;
  const link = `team/${authorSlug}`;

  /**
   * The blog title element.
   * @returns {React.Component} The component.
   */
  const BlogTitle = () => {
    return (
      <Fader determinant={isLoaded} duration={500}>
        <Subtitle className={css.title}>{article.title}</Subtitle>
      </Fader>
    );
  };

  /**
   * The details of the blog.
   * @returns {React.Component} The component.
   */
  const BlogDetails = () => {
    const date = datePublished && zDate.formatDate(datePublished, true);
    if (!authorName) return null;

    return (
      <Fader determinant={isLoaded} duration={500} delay={500}>
        {authorImage ? (
          <div className={css.detailsThumbnail}>
            <CloudinaryImage src={authorImage} alt={authorName} lazy={'ss'} />
          </div>
        ) : null}
        <Subtitle className={css.details}>
          Written by
          <a className={css.author} href={link}>
            {' '}
            {authorName}
          </a>
          <br />
          {date ? date : 'Unlisted'}
        </Subtitle>
      </Fader>
    );
  };

  /**
   * The blog's cover image.
   * @returns {React.Component} The component.
   */
  const CoverImage = () => {
    return (
      <Fader determinant={isLoaded} duration={500} delay={500}>
        <CloudinaryImage
          src={article.image}
          alt={article.title}
          className={css.image}
        />
      </Fader>
    );
  };

  /**
   * The content of the blog article.
   * @returns {React.Component} The component.
   */
  const Content = () => {
    return (
      <Fader determinant={isLoaded} duration={500} delay={1000}>
        <Paragraph className={css.content}>{article.content}</Paragraph>
      </Fader>
    );
  };

  /**
   * The block containing the article's tags.
   * @returns {React.Component} The component.
   */
  const TagBlock = () => {
    if (!article.tags) return null;
    const tags = JSON.parse(article.tags).map((tag, key) => {
      return <Tag key={key} word={tag} />;
    });

    return <div className={css.tagblock}>{tags}</div>;
  };

  const ReactionBlock = () => {
    return (
      <div className={css.reactionBlock}>
        <Icon name={'sign-language'} style={{ fontSize: '1.5rem' }} />
        <span className={css.clapCount}>{article.claps} claps</span>
      </div>
    );
  };

  /**
   * The author profile.
   * @returns {React.Component} The component.
   */
  const AuthorProfile = () => {
    return (
      <Fader
        determinant={isLoaded}
        duration={500}
        delay={1000}
        className={css.authorProfile}>
        <CloudinaryImage
          src={authorImage}
          alt={authorName}
          className={css.authorThumbnail}
          lazy={'ss'}
        />
        <Subtitle className={css.author}>Author</Subtitle>
        <Title className={css.name}>{authorName}</Title>
        <PromoIconsBar socials={authorSocials} />
        <Paragraph
          className={css.description}
          truncate={60}
          moretext={`Read more on ${authorName}`}
          moreclass={css.readmore}
          morelink={link}>
          {authorDescription}
        </Paragraph>
      </Fader>
    );
  };

  return (
    <Spacer>
      <Shader>
        <Partitioner>
          <Row>
            <Col md={8} className={css.columnparts}>
              <Container className={css.container}>
                <BlogTitle />
                <BlogDetails />
                <CoverImage />
                <Content />
                <TagBlock />
                <ReactionBlock />
                <SocialMediaShareBlock
                  message={shareMessage}
                  url={location.href}
                />
                <Divider />
                <AuthorProfile />
              </Container>
            </Col>
            <Col md={4} className={css.columnparts}>
              <ArticleSidebar />
            </Col>
          </Row>
        </Partitioner>
      </Shader>

      <BottomToolbar>
        <BackButton
          title={'Back to Blog'}
          onClick={() => (location.href = '/blog')}
        />

        {user.clearance >= CLEARANCES.ACTIONS.CRUD_ARTICLES ? (
          <AdminButton
            title={'Blog Admin'}
            onClick={() => (location.href = '/admin/articles')}
          />
        ) : null}
      </BottomToolbar>
    </Spacer>
  );
};

const Tag = memo(({ word }) => {
  return <span className={css.tag}>#{word.toUpperCase()}</span>;
});

ArticlePage.getInitialProps = async ({ query }) => {
  return { article: query.article };
};

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(ArticlePage);
