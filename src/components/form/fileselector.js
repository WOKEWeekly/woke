import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';

import { Zoomer } from 'components/transitioner.js';
import { cloudinary } from 'constants/settings.js';
import { OPERATIONS } from 'constants/strings.js';
import css from 'styles/components/form/FileSelector.module.scss';

export const ASPECT_RATIO = {
  SQUARE: '50% 0',
  WIDE: '28.125% 0'
};

export const SELECTOR_LOOK = {
  INPUT: 'input',
  PLACEHOLDER: 'placeholder'
};

export const IFileSelector = ({
  aspectRatio,
  operation,
  image,
  theme,
  onChange,
  placeholder = 'Choose a file...',
  placeholderContainerWidth,
  selectorLook = SELECTOR_LOOK.INPUT
}) => {
  const [sImage, setImage] = useState(image);
  const [sFilename, setFilename] = useState('');
  const [sType, setType] = useState('image');

  const imageRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => {
    if (operation === OPERATIONS.CREATE) return;

    if (cloudinary.check(image)) {
      const cloudPath = `${cloudinary.url}/${image}`;
      setImage(cloudPath);
      setFilename(cloudPath.substring(cloudPath.lastIndexOf('/') + 1));
    }
  }, [image]);

  const previewImage = () => {
    const preview = imageRef.current;
    const file = fileRef.current.files[0];
    const reader = new FileReader();

    reader.addEventListener(
      'load',
      () => {
        const source = reader.result;
        preview.src = source;
        setImage(source);
        setFilename(file.name);
        setType(file.type);
        onChange(source);
      },
      false
    );

    if (file) reader.readAsDataURL(file);
  };

  const display = sImage && sType.includes('image') ? 'block' : 'none';

  if (selectorLook === SELECTOR_LOOK.INPUT) {
    return (
      <InputSelector
        display={display}
        filename={sFilename}
        fileRef={fileRef}
        image={sImage}
        imageRef={imageRef}
        placeholder={placeholder}
        previewImage={previewImage}
        theme={theme}
      />
    );
  } else {
    return (
      <PlaceholderImageSelector
        aspectRatio={aspectRatio}
        display={display}
        filename={sFilename}
        fileRef={fileRef}
        image={sImage}
        imageRef={imageRef}
        placeholder={placeholder}
        placeholderContainerWidth={placeholderContainerWidth}
        previewImage={previewImage}
        theme={theme}
      />
    );
  }
};

const InputSelector = ({
  display,
  filename,
  fileRef,
  image,
  imageRef,
  placeholder,
  previewImage,
  theme
}) => {
  return (
    <>
      <div className={css['file']}>
        <label className={css[`file-button-${theme}`]}>
          Browse...
          <input
            type={'file'}
            style={{ display: 'none' }}
            onChange={previewImage}
            ref={fileRef}
          />
        </label>
        <input
          type={'text'}
          disabled
          value={filename}
          placeholder={placeholder}
          className={css['file-input']}
        />
      </div>
      <Zoomer
        determinant={image}
        duration={400}
        className={css['file-image']}
        style={{ display }}>
        <img src={image} alt={'Image preview...'} ref={imageRef} />
      </Zoomer>
    </>
  );
};

const PlaceholderImageSelector = ({
  aspectRatio = ASPECT_RATIO.SQUARE,
  display,
  fileRef,
  image,
  imageRef,
  placeholder,
  placeholderContainerWidth = '50%',
  previewImage
}) => {
  const ChoiceImage = () => {
    return (
      <Zoomer determinant={image} duration={400} style={{ display }}>
        <img
          src={image}
          alt={'Image preview...'}
          ref={imageRef}
          className={css['placeholder-image']}
        />
      </Zoomer>
    );
  };
  const ChoosePrompt = () => {
    if (image) return null;
    return (
      <>
        <label
          className={css['placeholder-image-text']}
          style={{
            padding: aspectRatio
          }}>
          <input
            type={'file'}
            style={{ display: 'none' }}
            onChange={previewImage}
            ref={fileRef}
          />
          {placeholder}
        </label>
      </>
    );
  };
  return (
    <div style={{ width: placeholderContainerWidth }}>
      <div className={css['placeholder-image-container']}>
        <ChoosePrompt />
        <ChoiceImage />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  theme: state.theme
});

export const FileSelector = connect(mapStateToProps)(IFileSelector);
