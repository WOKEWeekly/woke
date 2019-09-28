const { formatISODate } = require('../constants/date.js');

module.exports = {
  /** Generate slugs for URLs */
  generateSlug: (slug) => {
    return slug.toLowerCase()      // Turn to lowercase
    .replace(/[^a-zA-Z 0-9]+/g, '')   // Remove all non-alphanumeric characters
    .replace(/\s+/g, '-');            // Replace spaces with dashes
  },

  /** Retrieve filename from field or selection.
   ** If object, use name value. If string, use value. Empty if null */
  getFilename: (image) => {
    return !image ? '' : typeof image === 'object' ? image.name : image;
  },

  /** Generate filenames from entities */
  generateSessionFilename: (date, slug, image) => `${formatISODate(date)}_${slug}.${getExtension(image)}`,
  generateCandidateFilename: (id, slug, image) => `${id}_${slug}.${getExtension(image)}`,
  generateMemberFilename: (slug, image) => `${slug}.${getExtension(image)}`,
  generateReviewFilename: (rating, slug, image) => `${rating}-${slug}.${getExtension(image)}`,
}

/** Retrieve file extension via string manipulation */
const getExtension = (file) => {
  const name = file.originalname || file.name;
  return name ? name.split('.').pop().toLowerCase() : '';
}