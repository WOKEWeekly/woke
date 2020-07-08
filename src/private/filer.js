/* eslint-disable jsdoc/require-returns */
const async = require('async');
const cloudinary = require('cloudinary').v2;
const { zDate, zNumber, zString } = require('zavid-modules');

const knex = require('./singleton/knex').getKnex();

const { DIRECTORY, ARTICLE_STATUS } = require('../constants/strings.js');

const env = process.env.NODE_ENV !== 'production' ? 'dev' : 'prod';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload image cloudinary
 * @param {object} iEntity - The initial entity object.
 * @param {string} directory - The Cloudinary directory the image should be uploaded to.
 * @param {boolean} imageHasChanged - Indicates whether the image has changed. If it has not,
 * this method will only construct the slug.
 * @param {Function} next - The next callback function in the series.
 */
exports.uploadImage = (iEntity, directory, imageHasChanged, next) => {
  // Construct the slug and image filename
  const { entity, filename } = generateSlugAndFilename(iEntity, directory);

  // Discontinue if image has not changed
  const noImageUpload = !imageHasChanged || !entity.image;
  if (noImageUpload) return next(null, entity);

  // Upload to cloudinary
  cloudinary.uploader.upload(
    entity.image,
    {
      public_id: `${env}/${directory}/${filename}`,
      unique_filename: false
    },
    (err, result) => {
      if (err) return next(err);
      const { public_id, version, format } = result;
      entity.image = `v${version}/${public_id}.${format}`;
      next(null, entity);
    }
  );
};

exports.uploadArticleImages = async (article, imagesHaveChanged, next) => {
  const directory = DIRECTORY.ARTICLES;

  // Construct the slug and image filename.
  const { entity, filename } = await generateSlugAndFilename(
    article,
    directory
  );

  const fillerImages = Array.isArray(entity.fillerImages)
    ? entity.fillerImages
    : JSON.parse(entity.fillerImages).filter((e) => e);

  // Map images to keys for reference.
  const imagesToUpload = {};
  [entity.coverImage].concat(fillerImages).forEach((image, key) => {
    imagesToUpload[key] = image;
  });

  // Discontinue if no images have been changed.
  const noImagesExistInRequest = !(entity.coverImage || fillerImages.length);
  const noImagesToUpload = !imagesHaveChanged || noImagesExistInRequest;
  if (noImagesToUpload) return next(null, entity);

  const appendKey = (key) => {
    return key > 0 ? '-' + zNumber.makeDoubleDigit(key) : '';
  };

  async.mapValues(
    imagesToUpload,
    function (image, key, callback) {
      if (!image) return callback(null);

      cloudinary.uploader.upload(
        image,
        {
          public_id: `${env}/${directory}/${filename}${appendKey(key)}`,
          unique_filename: false
        },
        (err, result) => {
          const { public_id, version, format } = result;
          callback(err, `v${version}/${public_id}.${format}`);
        }
      );
    },
    function (err, result) {
      if (err) return next(err);
      const images = Object.values(result);
      entity.coverImage = images.shift();
      entity.fillerImages = JSON.stringify(images);
      next(err, entity);
    }
  );
};

/**
 * Delete an image from Cloudinary.
 * @param {string} image - The string identifier for the image.
 * @param {Function} next - Calls the next function.
 */
exports.destroyImage = (image, next) => {
  if (!image) return next(null);

  // e.g. public_id = "dev/sessions/2020-08-03_manchester"
  const public_id = image.substring(image.indexOf('/') + 1, image.indexOf('.'));

  cloudinary.uploader.destroy(public_id, (err) => {
    if (err) console.warn(err);
    next(null);
  });
};

/**
 * Delete multiple images from Cloudinary.
 * @param {string[]} images - A list of image string identifiers.
 * @param {Function} next - Calls the next function.
 */
exports.destroyMultipleImages = (images, next) => {
  if (!images) return next(null);

  // e.g. public_id = "dev/sessions/2020-08-03_manchester"
  const publicIds = images.map((image) => {
    return image.substring(image.indexOf('/') + 1, image.indexOf('.'));
  });

  async.each(
    publicIds,
    function (publicId, callback) {
      cloudinary.uploader.destroy(publicId, (err) => {
        callback(err);
      });
    },
    function (err) {
      if (err) console.warn(err);
      next(null);
    }
  );
};

/**
 * Upload document to Cloudinary.
 * @param {object} document - The document to be uploaded.
 * @param {Function} next - The next callback function in the series.
 */
exports.uploadDocument = (document, hasChanged, next) => {
  // Extract a clean slug name
  const name = zString.constructCleanSlug(document.title);
  document.name = name;

  // Discontinue if file has not changed
  if (!hasChanged) return next(null, document);

  // Upload to cloudinary
  cloudinary.uploader.upload(
    document.file,
    {
      public_id: `${env}/documents/${name}`,
      unique_filename: false
    },
    (err, result) => {
      if (err) return next(err);
      const { version, format } = result;
      Object.assign(document, {
        version,
        file: `${name}.${format}`,
        lastModified: new Date()
      });
      return next(null, document);
    }
  );
};

/**
 * Delete a document from Cloudinary.
 * @param {string} document - The name of the document.
 * @param {Function} next - Calls the next function.
 */
exports.destroyDocument = (document, next) => {
  if (!document) return next(null);

  // e.g. public_id = "dev/sessions/2020-08-03_manchester"
  const public_id = `${env}/documents/${document}`;

  cloudinary.uploader.destroy(public_id, (err) => {
    if (err) console.warn(err);
    next(null);
  });
};

/**
 * Construct slug and filenames.
 * @param {object} entity - The entity object.
 * @param {string} directory - The Cloudinary directory the image should be uploaded to.
 * @returns {object} The filename as well as the entity with the assigned slug.
 */
const generateSlugAndFilename = async (entity, directory) => {
  let filename;

  switch (directory) {
    case DIRECTORY.ARTICLES:
      const res = await knex
        .select()
        .from('members')
        .where('id', entity.authorId);
      const [author] = res;
      entity.slug = zString.constructCleanSlug(
        `${author.firstname} ${author.lastname} ${entity.title}`
      );
      filename = entity.slug;
      if (entity.status === ARTICLE_STATUS.DRAFT) entity.slug = null;
      break;
    case DIRECTORY.CANDIDATES:
      const slug = zString.constructCleanSlug(entity.name);
      filename = createCandidateFilename(entity.id, slug);
      break;
    case DIRECTORY.MEMBERS:
      entity.slug = zString.constructSimpleNameSlug(
        `${entity.firstname} ${entity.lastname}`
      );
      filename = createMemberFilename(entity.slug);
      if (!entity.verified) entity.slug = null;
      break;
    case DIRECTORY.REVIEWS:
      const referee = zString.constructCleanSlug(entity.referee);
      filename = createReviewFilename(entity.rating, referee);
      break;
    case DIRECTORY.SESSIONS:
      const title = zString.constructCleanSlug(entity.title);
      entity.slug = `${title}-${entity.dateHeld}`;
      filename = createSessionFilename(entity.dateHeld, title);
      break;
  }

  return { entity, filename };
};

/** Generate filenames from entities */
const createCandidateFilename = (id, slug) => `${id}_${slug}`;
const createMemberFilename = (slug) => slug;
const createReviewFilename = (rating, slug) => `${rating}-${slug}`;
const createSessionFilename = (date, title) =>
  `${zDate.formatISODate(date)}_${title}`;
