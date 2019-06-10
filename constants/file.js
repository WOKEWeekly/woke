import { formatISODate } from '~/constants/date.js';

/** Generate slugs for URLs */
export const generateSlug = (slug) => {
  return slug.toLowerCase()      // Turn to lowercase
  .replace(/[^a-zA-Z 0-9]+/g, '')   // Remove all non-alphanumeric characters
  .replace(/\s+/g, '-');            // Replace spaces with dashes
}

export const generateSessionFilename = (date, slug, image) => {
  return `${formatISODate(date)}_${slug}.${getExtension(image)}`;
}

/** Get file extension */
const getExtension = (file) => {
  return file.name ? file.name.split('.').pop().toLowerCase() : '';
}