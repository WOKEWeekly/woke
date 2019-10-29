
export default (component) => {
  return module.exports = {
    
    /** Handle text input fields */
    handleText: (e) => {
      const { name, value } = e.target;
      component.setState({[name]: value});
    },

    /** Handle radio changes */
    handleRadio: (value, e) => {
      const { name } = e.target;
      component.setState({[name]: value});
    },

    /** Handle checkbox changes */
    handleCheckbox: (e) => {
      const { name, checked } = e.target;
      component.setState({[name]: checked})
    },

    /** Handle checkbox changes */
    handleCheckboxButton: (e) => {
      const { name, checked } = e;
      component.setState({[name]: !checked})
    },

    /** Handle date selections */
    handleBirthday: (birthday) => {component.setState({birthday}); },
    handleDate: (date) => {component.setState({date}); },
    handleDateWritten: (date_written) => { component.setState({date_written}); },

    /** Handle image selections */
    handleImage: (e) => { component.setState({image: e.target.files[0]}); },

    /** Handle new rating */
    handleRatingChange: (e) => {
      const rating = parseInt(e.currentTarget.value)
      component.setState({ rating });
    },
    
    /** Store social media handle entries  */
    confirmSocials: (socials) => {component.setState({socials})},

    /** Clear country selections */
    clearSelection: (name) => { component.setState({[name]: ''})}
  }
}