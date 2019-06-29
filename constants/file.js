import { formatISODate } from '~/constants/date.js';

/** Generate slugs for URLs */
export const generateSlug = (slug) => {
  return slug.toLowerCase()      // Turn to lowercase
  .replace(/[^a-zA-Z 0-9]+/g, '')   // Remove all non-alphanumeric characters
  .replace(/\s+/g, '-');            // Replace spaces with dashes
}

/** Retrieve filename from field or selection.
 ** If object, use name value. If string, use value. Empty if null */
export const getFilename = (image) => {
  return !image ? '' : typeof image === 'object' ? image.name : image;
}

/** Generate the filename for sessions */
export const generateSessionFilename = (date, slug, image) => {
  return `${formatISODate(date)}_${slug}.${getExtension(image)}`;
}

/** Generate the filename for candidates */
export const generateCandidateFilename = (id, slug, image) => {
  return `${id}_${slug}.${getExtension(image)}`;
}

/** Generate the filename for candidates */
export const generateMemberFilename = (slug, image) => {
  return `${slug}.${getExtension(image)}`;
}


/** Retrieve file extension via string manipulation */
const getExtension = (file) => {
  return file.name ? file.name.split('.').pop().toLowerCase() : '';
}