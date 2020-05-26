const { toast, cssTransition } = require('react-toastify');
const classNames = require('classnames');
const css = require('@styles/components/Alert.module.scss');

const animation = cssTransition({
  enter: css.fadeIn,
  exit: css.fadeOut,
  duration: 500
});

toast.configure({
  autoClose: 2500,
  className: css.toastContainer,
  closeButton: false,
  draggable: false,
  hideProgressBar: true,
  position: toast.POSITION.BOTTOM_CENTER,
  transition: animation
});

const defaultClasses = ['alert', css.message];

exports.alert = {
  success: (message) => {
    toast(message, { className: classNames('alert-success', defaultClasses) });
  },
  error: (message) => {
    toast(message, { className: classNames('alert-danger', defaultClasses) });
  },
  info: (message) => {
    toast(message, { className: classNames('alert-primary', defaultClasses) });
  }
};

/**
 * Set the alert to be viewed on the next page change.
 * @param {string} alert.type - The type of the alert.
 * @param {string} alert.message - The contents of the alert message.
 */
exports.setAlert = ({ type, message }) => {
  sessionStorage.setItem('alert', JSON.stringify({ type, message }));
};

/** Check whether an alert has been set by {@link setAlert}. */
exports.checkAlert = () => {
  const notification = JSON.parse(sessionStorage.getItem('alert'));
  if (notification) {
    const { type, message } = notification;
    this.alert[type](message);
    sessionStorage.clear();
  }
};