const cloudinary = require('cloudinary').v2;
const { formatISODate } = require('../constants/date.js');
const { DIRECTORY } = require('../constants/strings.js');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});

module.exports = {

  /**
   * Construct slug and upload image cloudinary
   * @param {object} entity - The entity object.
   * @param {string} directory - The Cloudinary directory the image should be uploaded to.
   * @param {boolean} imageHasChanged - Indicates whether the image has changed. If it has not,
   * this method will only construct the slug.
   * @param {Function} next - The next callback function in the series.
   */
  uploadImage: (entity, directory, imageHasChanged, next) => {
    let filename;

    // Construct the slug and image filename
    switch (directory){
      case DIRECTORY.SESSIONS:
        const title = constructCleanSlug(entity.title);
        entity.slug = `${title}-${entity.dateHeld}`;
        filename = generateSessionFilename(entity.dateHeld, title);
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
        const referee = constructCleanSlug(entity.referee);
        filename = generateReviewFilename(entity.rating, referee);
        break;
    }

    // Discontinue if image has not changed
    const noImageUpload = !imageHasChanged || !entity.image.length;
    if (noImageUpload) return next(null, entity);

    // Upload to cloudinary
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
    
    // e.g. public_id = "dev/sessions/2020-08-03_manchester"
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
 * @returns {string} A clean slug.
 */
const constructCleanSlug = (value) => {
  return value.toLowerCase()      // Turn to lowercase
  .replace(/[^a-zA-Z 0-9]+/g, '')   // Remove all non-alphanumeric characters
  .replace(/\s+/g, '-');            // Replace spaces with dashes
};

/** Generate filenames from entities */
const generateSessionFilename = (date, title) => `${formatISODate(date)}_${title}`;
const generateCandidateFilename = (id, slug) => `${id}_${slug}`;
const generateMemberFilename = (slug) => slug;
const generateReviewFilename = (rating, slug) => `${rating}-${slug}`;