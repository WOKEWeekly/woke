const cloudinary = require('cloudinary').v2;
const { formatISODate } = require('../constants/date.js');
const { DIRECTORY } = require('../constants/strings.js');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = {
  uploadImage: (entity, directory, next) => {
    let filename;

    switch (directory){
      case DIRECTORY.SESSIONS:
        entity.slug = constructCleanSlug(entity.title, entity.id);
        filename = generateSessionFilename(entity.id, entity.dateHeld, entity.slug);
        break;
      case DIRECTORY.BLACKEXCELLENCE:
        entity.slug = constructCleanSlug(entity.name, entity.id);
        filename = generateCandidateFilename(entity.id, entity.slug);
        break;
      case DIRECTORY.TEAM:
        entity.slug = constructCleanSlug(`${entity.firstname} ${entity.lastname}`);
        filename = generateMemberFilename(entity.slug);
        if (!entity.verified) entity.slug = null;
        break;
      case DIRECTORY.REVIEWS:
        filename = generateReviewFilename(entity.rating, constructCleanSlug(entity.referee));
        break;
    }

    const env = process.env.LOCAL_ENV === 'true' ? 'dev' : 'prod';

    cloudinary.uploader.upload(entity.image, {
      public_id: `${env}/${directory}/${filename}`,
      width: 1000,
      height: 1000,
      crop: 'limit',
      unique_filename: false
    }, (err, result) => {
      if (err) return next(err);
      const { public_id, version, format } = result;
      entity.image = `v${version}/${public_id}.${format}`;
      next(null, entity);
    });
  },

  /**
   * Delete an image from Cloudinary.
   * @param {string} image - The string identifier for the image.
   * @param {Function} next - Calls the next function.
   */
  destroyImage: (image, next) => {
    if (!image) return next(null);
    
    const public_id = image.substring(image.indexOf('/') + 1, image.indexOf('.'));
    cloudinary.uploader.destroy(public_id, (err) => {
      if (err) console.warn(err);
      next(null);
    });
  }
}

/**
 * Created formatted slugs for URLs.
 * @param {string} value - The value which the slug is based off.
 * @param {number} [id] - The unique identifier of the entity.
 * @returns {string} A clean slug.
 */
const constructCleanSlug = (value, id) => {
  const value = value.toLowerCase()      // Turn to lowercase
  .replace(/[^a-zA-Z 0-9]+/g, '')   // Remove all non-alphanumeric characters
  .replace(/\s+/g, '-');            // Replace spaces with dashes

  return id ? `${id}-${value}` : value;
};

/** Generate filenames from entities */
const generateSessionFilename = (id, date, slug) => `${formatISODate(date)}_${id}_${slug}`;
const generateCandidateFilename = (id, slug) => `${id}_${slug}`;
const generateMemberFilename = (slug) => slug;
const generateReviewFilename = (rating, slug) => `${rating}-${slug}`;