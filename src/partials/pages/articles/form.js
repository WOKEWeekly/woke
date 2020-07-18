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
  Select
} from 'components/form';
import {
  FileSelector,
  ASPECT_RATIO,
  SELECTOR_LOOK
} from 'components/form/fileselector';
import { ShortTextArea, LongTextArea } from 'components/form/v2/textarea';
import { Shader } from 'components/layout.js';
import { ConfirmModal } from 'components/modal.js';
import { Paragraph } from 'components/text.js';
import { Fader } from 'components/transitioner.js';
import { categories } from 'constants/categories.js';
import CLEARANCES from 'constants/clearances.js';
import request from 'constants/request.js';
import { ARTICLE_STATUS } from 'constants/strings.js';
import css from 'styles/pages/Articles.module.scss';

import { FILLER_IMAGE_LIMIT } from './helpers';

/**
 * The page for the article form and editor preview.
 * @param {object} props - The component props.
 * @param {object} props.article - The article object.
 * @param {object} props.user - The current user.
 * @returns {React.Component} The component.
 */
const ArticleForm = (props) => {
  const { article, user } = props;

  if (user.clearance < CLEARANCES.ACTIONS.ARTICLES.MODIFY) {
    return (location.href = '/');
  }

  const [isLoaded, setLoaded] = useState(false);
  const [previewVisible, setPreviewVisibility] = useState(false);

  useEffect(() => {
    setLoaded(true);
  }, [isLoaded]);

  return (
    <Shader>
      <Fader
        determinant={isLoaded}
        duration={500}
        className={previewVisible ? css['article-editor'] : undefined}>
        <ArticleEditorForm
          {...props}
          previewVisible={previewVisible}
          setPreviewVisibility={setPreviewVisibility}
        />
        <ArticleEditorPreview visible={previewVisible} text={article.content} />
      </Fader>
    </Shader>
  );
};

/**
 * The form of the article editor.
 * @param {object} props - The component props.
 * @param {object} props.article - The article object.
 * @param {Function} props.cancelFunc - The function called on clicking 'Cancel'.
 * @param {Function} props.compileFillerImages - The hook for compiling article filler images.
 * @param {Function} props.confirmFunc - The function called on clicking 'Confirm'.
 * @param {string} props.confirmText - The text shown on the confirmation button.
 * @param {object} props.handlers - The hooks for handling form input.
 * @param {string} props.heading - The form heading.
 * @param {boolean} props.isPublish - Indicates whether the operation is a publish.
 * @param {string} props.operation - Either a CREATE or an UPDATE.
 * @param {boolean} props.previewVisible - Hook state indicating if editor preview is visible.
 * @param {Function} props.removeFillerImage - The function for removing a filler image from selection.
 * @param {Function} props.setImagesChanged - The hook for setting whether images have changed in the form.
 * @param {Function} props.setPreviewVisibility - The hook for setting editor visibility.
 * @returns {React.Component} The component.
 */
const ArticleEditorForm = ({
  article,
  cancelFunc,
  compileFillerImages,
  confirmFunc,
  confirmText,
  handlers,
  heading,
  isPublish,
  operation,
  previewVisible,
  removeFillerImage,
  setImagesChanged,
  setPreviewVisibility
}) => {
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
  }, [isLoaded, previewVisible]);

  useEffect(() => {
    setVisibility(article.status === ARTICLE_STATUS.PUBLISHED);
  });

  return (
    <>
      <div
        className={
          css[previewVisible ? 'article-editor-form' : 'article-form']
        }>
        <Group>
          <Col lg>
            <Heading>{heading}</Heading>
          </Col>
          <Col lg className={css['preview-toggle-container']}>
            <button className={css['preview-toggle-button']} onClick={() => setPreviewVisibility(!previewVisible)}>
              {previewVisible ? 'Hide Preview' : 'Show Preview'}
            </button>
          </Col>
        </Group>

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
              placeholder={'Write your thoughts. Express yourself.'}
              onChange={handleText}
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
        <DatePublishedField
          isDateFieldVisible={isDateFieldVisible}
          datePublished={article.datePublished}
          handleDate={handleDate}
        />
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
          <Col sm={6}>
            <FileSelector
              image={article.coverImage}
              operation={operation}
              onChange={(img) => {
                handleFile(img, 'coverImage');
                setImagesChanged(true);
              }}
              placeholder={"Choose this article's cover image..."}
              removeImage={() => {
                removeFile();
                setImagesChanged(true);
              }}
              aspectRatio={ASPECT_RATIO.WIDE}
              selectorLook={SELECTOR_LOOK.PLACEHOLDER}
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
        <Group>
          <Col>
            <SubmitButton
              onClick={
                isPublish ? () => setPublishModalVisibility(true) : confirmFunc
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
    </>
  );
};

/**
 * The editor preview of the article content.
 * @param {object} props - The component props.
 * @param {string} props.text - The article content to be previewed.
 * @param {boolean} props.visible - Indicates whether the editor preview should be visible.
 * @returns {React.Component} The component.
 */
const ArticleEditorPreview = ({ text, visible }) => {
  if (!visible) return null;

  return (
    <div className={css['article-editor-preview']}>
      <Paragraph>{text}</Paragraph>
    </div>
  );
};

/**
 * The date published field.
 * @param {object} props - The component props.
 * @param {string} props.datePublished - The date the article was published.
 * @param {string} props.handleDate - The hook for handling date changes.
 * @param {boolean} props.isDateFieldVisible - Indicates whether this field should be visible.
 * @returns {React.Component} The component.
 */
const DatePublishedField = ({ isDateFieldVisible, datePublished, handleDate }) => {
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

/**
 * The article filler images.
 * @param {object} props - The component props.
 * @param {string} props.article - The article object.
 * @param {string} props.compileFillerImages - compileFillerImages - The hook for compiling article filler images.
 * @param {boolean} props.operation - Either a CREATE or an UPDATE.
 * @param {boolean} props.removeImage - The function for removing a filler image from selection.
 * @returns {React.Component} The component.
 */
const FillerImagesGroup = ({
  article,
  operation,
  compileFillerImages,
  removeImage
}) => {
  const fileSelectors = [];
  for (let i = 0; i < FILLER_IMAGE_LIMIT; i++) {
    // if (i === 0 || (i > 0 && article.fillerImages[i - 1] !== null)
    fileSelectors.push(
      <FileSelector
        key={i}
        image={article.fillerImages[i]}
        operation={operation}
        onChange={(e) => compileFillerImages(e, i)}
        aspectRatio={ASPECT_RATIO.WIDE}
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
