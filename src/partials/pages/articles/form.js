import React, { useEffect, useState } from 'react';
import { Col } from 'react-bootstrap';
import { connect } from 'react-redux';

import { SubmitButton, CancelButton } from 'components/button.js';
import { AuthoredDatePicker } from 'components/datepicker.js';
import {
  Heading,
  Group,
  Label,
  LabelInfo,
  TextInput,
  ShortTextArea,
  LongTextArea,
  Select
} from 'components/form';
import {
  FileSelector,
  ASPECT_RATIO,
  SELECTOR_LOOK
} from 'components/form/fileselector';
import { Shader, Spacer } from 'components/layout.js';
import { ConfirmModal } from 'components/modal.js';
import { categories } from 'constants/categories.js';
import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import { ARTICLE_STATUS } from 'constants/strings.js';
import css from 'styles/pages/Articles.module.scss';

const ArticleForm = ({
  article,
  heading,
  confirmText,
  confirmFunc,
  cancelFunc,
  handlers,
  operation,
  isPublish,
  compileFillerImages,
  removeFillerImage,
  user
}) => {
  if (user.clearance < CLEARANCES.ACTIONS.CRUD_ARTICLES) {
    return (location.href = '/');
  }

  const [isLoaded, setLoaded] = useState(false);
  const [authors, setAuthors] = useState([]);
  const [isDateFieldVisible, setVisibility] = useState(false);
  const [isPublishModalVisible, setPublishModalVisibility] = useState(false);

  const { handleText, handleDate, handleFile, removeFile } = handlers;

  useEffect(() => {
    request({
      url: '/api/v1/members/authors',
      method: 'GET',
      headers: { Authorization: process.env.AUTH_KEY },
      onSuccess: (response) => {
        const authors = response
          .map((author) => {
            return {
              value: author.id,
              label: `${author.firstname} ${author.lastname}`
            };
          })
          .sort((a, b) => {
            a = a.label;
            b = b.label;
            return a < b ? -1 : a > b ? 1 : 0;
          });
        setAuthors(authors);
        setLoaded(true);
      }
    });
  }, [isLoaded]);

  useEffect(() => {
    setVisibility(article.status === ARTICLE_STATUS.PUBLISHED);
  });

  // Cater for null filler images
  if (article.fillerImages === null)
    article.fillerImages = [null, null, null, null];

  return (
    <Shader>
      <Spacer className={css['article-form']}>
        <div>
          <Heading>{heading}</Heading>

          <Group>
            <Col md={7}>
              <Label>Title:</Label>
              <TextInput
                name={'title'}
                value={article.title}
                onChange={handleText}
                placeholder={'Enter the title.'}
              />
            </Col>
            <Col md={5}>
              <Label>Category:</Label>
              <Select
                name={'category'}
                value={article.category}
                placeholder={'Select a category.'}
                items={categories}
                onChange={handleText}
              />
            </Col>
          </Group>
          <Group>
            <Col>
              <LabelInfo>Content:</LabelInfo>
              <LongTextArea
                name={'content'}
                value={article.content}
                onChange={handleText}
                placeholder={'Write your thoughts. Express yourself.'}
              />
            </Col>
          </Group>
          <Group>
            <Col>
              <Label>Excerpt:</Label>
              <ShortTextArea
                name={'excerpt'}
                value={article.excerpt}
                onChange={handleText}
                placeholder={"Enter this article's excerpt."}
              />
            </Col>
          </Group>
          <Group>
            <Col md={6}>
              <Label>Author:</Label>
              <Select
                name={'authorId'}
                value={article.authorId}
                placeholder={'Select the author.'}
                items={authors}
                onChange={handleText}
              />
            </Col>
            <Col md={{ span: 4, offset: 2 }}>
              <Label>Status:</Label>
              <Select
                name={'status'}
                value={article.status}
                placeholder={'Select a status.'}
                items={Object.keys(ARTICLE_STATUS).map((key) => key)}
                onChange={handleText}
              />
            </Col>
          </Group>
          <DatePublished
            isDateFieldVisible={isDateFieldVisible}
            datePublished={article.datePublished}
            handleDate={handleDate}
          />
          <Group>
            <Col>
              <FileSelector
                name={'coverImage'}
                image={article.coverImage}
                operation={operation}
                onChange={handleFile}
                placeholder={"Choose this article's cover image..."}
                removeImage={removeFile}
                aspectRatio={ASPECT_RATIO.WIDE}
                selectorLook={SELECTOR_LOOK.PLACEHOLDER}
              />
            </Col>
          </Group>
          <Group>
            <Col>
              <Label>Tags:</Label>
              <ShortTextArea
                name={'tags'}
                value={article.tags}
                onChange={handleText}
                placeholder={
                  'Add a comma-separated list of tags (e.g. woke, society, black women)'
                }
              />
            </Col>
          </Group>
          <Group>
            <Col>
              <Label>Additional Images:</Label>
              <FillerImagesGroup
                article={article}
                operation={operation}
                compileFillerImages={compileFillerImages}
                removeImage={removeFillerImage}
              />
            </Col>
          </Group>
        </div>

        <div>
          <Group>
            <Col>
              <SubmitButton
                onClick={
                  isPublish
                    ? () => setPublishModalVisibility(true)
                    : confirmFunc
                }
                className={'mr-2'}>
                {confirmText}
              </SubmitButton>
              <CancelButton onClick={cancelFunc}>Cancel</CancelButton>
            </Col>
          </Group>
        </div>

        <ConfirmModal
          visible={isPublishModalVisible}
          message={
            "By publishing this article, you'll be notifying all subscribers of this new release. Please confirm that you want to publish."
          }
          confirmFunc={confirmFunc}
          confirmText={'Confirm'}
          close={() => setPublishModalVisibility(false)}
        />
      </Spacer>
    </Shader>
  );
};

const DatePublished = ({ isDateFieldVisible, datePublished, handleDate }) => {
  if (!isDateFieldVisible) return null;

  return (
    <Group>
      <Col>
        <Label>Date Published:</Label>
        <AuthoredDatePicker
          name={'datePublished'}
          date={datePublished}
          onConfirm={handleDate}
        />
      </Col>
    </Group>
  );
};

const FillerImagesGroup = ({
  article,
  operation,
  compileFillerImages,
  removeImage
}) => {
  const fileSelectors = [];
  for (let i = 0; i < 4; i++) {
    fileSelectors.push(
      <FileSelector
        image={article.fillerImages[i]}
        operation={operation}
        onChange={(e) => compileFillerImages(e, i)}
        aspectRatio={ASPECT_RATIO.WIDE}
        placeholderContainerWidth={'24%'}
        removeImage={() => removeImage(i)}
        selectorLook={SELECTOR_LOOK.PLACEHOLDER}
      />
    );
  }

  return <div className={css['article-filler-images']}>{fileSelectors}</div>;
};

const mapStateToProps = (state) => ({
  user: state.user
});

export default connect(mapStateToProps)(ArticleForm);
