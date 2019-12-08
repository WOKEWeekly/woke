const cloudinary = require('cloudinary').v2;
const { formatISODate } = require('../constants/date.js');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
})

module.exports = {
  uploadImage: (entity, directory, callback) => {
    let filename;

    switch (directory){
      case 'sessions':
        entity.slug = module.exports.generateSlug(entity.title);
        filename = module.exports.generateSessionFilename(entity.dateHeld, entity.slug);
        break;
      case 'blackexcellence':
        entity.slug = module.exports.generateSlug(entity.name);
        filename = module.exports.generateCandidateFilename(entity.id, entity.slug);
        break;
      case 'team':
        entity.slug = module.exports.generateSlug(`${entity.firstname} ${entity.lastname}`);
        filename = module.exports.generateMemberFilename(entity.slug);
        break;
      case 'reviews':
        entity.slug = module.exports.generateSlug(entity.referee);
        filename = module.exports.generateReviewFilename(entity.rating, entity.slug, entity.file);
        break;
    }

    cloudinary.uploader.upload(entity.image, {
      public_id: filename,
      eager: [{ width: 800, height: 800, crop: 'scale' }],
      folder: directory,
      unique_filename: false
    }, (err, result) => {
      const { public_id, version, format } = result;
      entity.image = `v${version}/${public_id}.${format}`;
      err ? callback(err) : callback(null, entity);
    });
  },

  destroyImage: (image, callback) => {
    const public_id = image.substring(image.indexOf('/') + 1, image.indexOf('.'));
    cloudinary.uploader.destroy(public_id, (err) => {
      if (err) console.warn(err);
      callback(null);
    });
  },

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
  generateSessionFilename: (date, slug) => `${formatISODate(date)}_${slug}`,
  generateCandidateFilename: (id, slug) => `${id}_${slug}`,
  generateMemberFilename: (slug) => slug,
  generateReviewFilename: (rating, slug) => `${rating}-${slug}`,
  
}

/** Retrieve file extension via string manipulation */
const getExtension = (file) => {
  const name = file.originalname || file.name;
  return name ? name.split('.').pop().toLowerCase() : '';
}