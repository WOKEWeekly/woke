import React, { Component } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SubmitButton, CancelButton } from '~/components/button.js';
import { AuthoredDatePicker } from '~/components/datepicker.js';
import { Heading, Group, Label, TextInput, ShortTextArea, LongTextArea, FileSelector, Select } from '~/components/form.js';
import { Shader, Spacer } from '~/components/layout.js';

import { categories } from '~/constants/categories.js';
import CLEARANCES from '~/constants/clearances.js';
import request from '~/constants/request.js';
import { ARTICLE_STATUS } from '~/constants/strings.js';

import css from '~/styles/articles.scss';

class ArticleForm extends Component {
  constructor(props){
    super(props);

    this.state = {
      authors: []
    }
    
    if (props.user.clearance < CLEARANCES.ACTIONS.CRUD_ARTICLES){
      return location.href = '/blog';
    }
  }

  componentDidMount(){
    request({
      url: '/api/v1/members/authors',
      method: 'GET',
      headers: { 'Authorization': process.env.AUTH_KEY },
      onSuccess: (response) => {
        const authors = [];
        response.forEach(author => {
          authors.push({value: author.id, label: `${author.firstname} ${author.lastname}` })
        });
        authors.sort((a, b) => {
          a = a.label;
          b = b.label;
          return a < b ? -1 : a > b ? 1 : 0;
        });
        this.setState({ authors });
      }
    });
  }

  render(){

    const { heading, confirmText, confirmFunc, cancelFunc, handlers, operation } = this.props;
    const { handleText, handleDate, handleImage } = handlers;
    const { title, content, category, excerpt, image, authorId, status, datePublished, tags } = this.props.article;

    const DatePublished = () => {
      if (status !== ARTICLE_STATUS.PUBLISHED) return null;

      return (
        <Group>
          <Col>
            <Label>Date Published:</Label>
            <AuthoredDatePicker name={'datePublished'} date={datePublished} onConfirm={handleDate} />
          </Col>
        </Group>
      )
    }
    
    return (
      <Shader>
        <Spacer className={css.form}>
          <div>
            <Heading>{heading}</Heading>

            <Group>
              <Col md={7}>
                <Label>Title:</Label>
                <TextInput
                  name={'title'}
                  value={title}
                  onChange={handleText}
                  placeholder={"Enter the title."} />
              </Col>
              <Col md={5}>
                <Label>Category:</Label>
                <Select
                  name={'category'}
                  value={category}
                  placeholder={'Select a category.'}
                  items={categories}
                  onChange={handleText} />
              </Col>
            </Group>
            <Group>
              <Col>
                <Label>Content:</Label>
                <LongTextArea
                  name={'content'}
                  value={content}
                  onChange={handleText}
                  placeholder={"Write your thoughts. Express yourself."} />
              </Col>
            </Group>
            <Group>
              <Col>
                <Label>Excerpt:</Label>
                <ShortTextArea
                  name={'excerpt'}
                  value={excerpt}
                  onChange={handleText}
                  placeholder={"Enter this article's excerpt."} />
              </Col>
            </Group>
            <Group>
              <Col md={6}>
                <Label>Author:</Label>
                <Select
                  name={'authorId'}
                  value={authorId}
                  placeholder={'Select the author.'}
                  items={this.state.authors}
                  onChange={handleText} />
              </Col>
              <Col md={{span: 4, offset: 2}}>
                <Label>Status:</Label>
                <Select
                  name={'status'}
                  value={status}
                  placeholder={'Select a status.'}
                  items={Object.keys(ARTICLE_STATUS).map(key => key)}
                  onChange={handleText} />
              </Col>
            </Group>
            <DatePublished/>
            <Group>
              <Col>
                <FileSelector
                  image={image}
                  operation={operation}
                  onChange={handleImage} />
              </Col>
            </Group>
            <Group>
              <Col>
                <Label>Tags:</Label>
                <ShortTextArea
                  name={'tags'}
                  value={tags}
                  onChange={handleText}
                  placeholder={"e.g. woke, society, black women"} />
              </Col>
            </Group>
          </div>

          <div>
            <Group>
              <Col>
                <SubmitButton onClick={confirmFunc} className={'mr-2'}>{confirmText}</SubmitButton>
                <CancelButton onClick={cancelFunc}>Cancel</CancelButton>
              </Col>
            </Group>
          </div>
        </Spacer>
      </Shader>
    )
  }
}

const mapStateToProps = state => ({
  user: state.user
});

export default connect(mapStateToProps)(ArticleForm);