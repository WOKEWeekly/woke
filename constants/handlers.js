
export default (component) => {
  return module.exports = {
    handleText: (event) => {
      const { name, value } = event.target;
      component.setState({[name]: value});
    },
    handleBirthday: (birthday) => { component.setState({birthday}); },
    handleDateWritten: (date_written) => { component.setState({date_written}); },
    handleImage: (event) => { component.setState({image: event.target.files[0]}); }
  }
}