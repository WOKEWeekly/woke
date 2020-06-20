import React, { useState, useEffect, useRef } from 'react';
import { connect } from 'react-redux';

import { Zoomer } from 'components/transitioner.js';
import { cloudinary } from 'constants/settings.js';
import { OPERATIONS } from 'constants/strings.js';
import css from 'styles/components/Form.module.scss';

export const IFileSelector = ({ operation, image, theme, onChange }) => {
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

  return (
    <>
      <div className={css.file}>
        <label className={css[`file_button-${theme}`]}>
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
          value={sFilename}
          placeholder={'Choose a file'}
          className={css.file_input}
        />
      </div>
      <Zoomer
        determinant={sImage}
        duration={400}
        className={css.fileImage}
        style={{ display }}>
        <img src={sImage} alt={'Image preview...'} ref={imageRef} />
      </Zoomer>
    </>
  );
};

const mapStateToProps = (state) => ({
  theme: state.theme
});

export const FileSelector = connect(mapStateToProps)(IFileSelector);
