module.exports = (hook, state) => {
  return {
    /**
     * Handle changes to text input fields.
     * @param {Event} event - The text change DOM event.
     */
    handleText: (event) => {
      const { name, value } = event.target;
      hook(Object.assign({}, state, { [name]: value }));
    },

    /**
     * Handles the selection of dates.
     * @param {string} date - The date value.
     * @param {string} [name] - The name of the element. Default is 'date'.
     */
    handleDate: (date, name = 'date') => {
      hook(Object.assign({}, state, { [name]: date }));
    },

    /**
     * Handles the upload of images with a file selector.
     * @param {string} file - The base64 string of the image.
     * @param {string} [name] - The name of the element. Default is 'image'.
     */
    handleFile: (file, name = 'image') => {
      hook(Object.assign({}, state, { [name]: file }));
    },

    /**
     * Removes a file from state.
     * @param {string} [name] - The name of the element. Default is 'image'.
     */
    removeFile: (name = 'image') => {
      hook(Object.assign({}, state, { [name]: null }));
    },
  };
};
