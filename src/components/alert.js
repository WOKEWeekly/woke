import { toast, cssTransition } from 'react-toastify';
import classNames from 'classnames';
import css from '~/styles/components/Alert.module.scss';

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

export const alert = {
  success: (message) => {
    toast(message, { className: classNames('alert-success', defaultClasses) });
  },
  error: (message) => {
    toast(message, { className: classNames('alert-danger', defaultClasses) });
  },
  info: (message) => {
    toast(message, { className: classNames('alert-primary', defaultClasses) });
  }
}

export const setAlert = (alert) => {
  sessionStorage.setItem('alert', JSON.stringify(alert));
}

export const checkAlert = () => {
  const notification = JSON.parse(sessionStorage.getItem('alert'));
  if (notification){
    const { type, message } = notification;
    alert[type](message);
    sessionStorage.clear();
  }
}

export const displayErrorMessage = (err) => {
  if (process.env.NODE_ENV !== 'production'){
    alert.error(err.toString());
  } else {
    alert.error('Something went wrong. Please try again later.');
    console.error(err.toString());
  }
}