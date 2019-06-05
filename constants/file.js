

/** Generate slugs for URLs */
export const generateSlug = (slug) => {
  return slug.toLowerCase()      // Turn to lowercase
  .replace(/[^a-zA-Z 0-9]+/g, '')   // Remove all non-alphanumeric characters
  .replace(/\s+/g, '-');            // Replace spaces with dashes
}

/** Get file extension */
export const getExtension = (file) => {
  return file.name.split('.').pop().toLowerCase();
}