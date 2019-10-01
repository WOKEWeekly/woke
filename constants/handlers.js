
export default (component) => {
  return module.exports = {
    
    /** Handle text input fields */
    handleText: (event) => {
      const { name, value } = event.target;
      component.setState({[name]: value});
    },

    /** Handle radio changes */
    handleRadio: (value, event) => {
      const { name } = event.target;
      component.setState({[name]: value});
    },

    /** Handle checkbox changes */
    handleCheckbox: (event) => {
      const { name, checked } = event.target;
      component.setState({[name]: checked})
    },

    /** Handle checkbox changes */
    handleCheckboxButton: (event) => {
      const { name, checked } = event;
      component.setState({[name]: !checked})
    },

    /** Handle date selections */
    handleBirthday: (birthday) => {component.setState({birthday}); },
    handleDate: (date) => {component.setState({date}); },
    handleDateWritten: (date_written) => { component.setState({date_written}); },

    /** Handle image selections */
    handleImage: (event) => { component.setState({image: event.target.files[0]}); },
    
    /** Store social media handle entries  */
    confirmSocials: (socials) => {component.setState({socials})},

    /** Clear country selections */
    clearSelection: (name) => { component.setState({[name]: ''})}
  }
}