import { toast, cssTransition } from 'react-toastify';
import classNames from 'classnames';
import css from '~/styles/_components.scss';

const animation = cssTransition({
  enter: css.fadeIn,
  exit: css.fadeOut,
  duration: 500
});

toast.configure({
  autoClose: 2500,
  closeButton: false,
  draggable: false,
  hideProgressBar: true,
  position: toast.POSITION.BOTTOM_CENTER,
  toastStyle: {
    borderRadius: '10px',
    fontFamily: 'Raleway'
  },
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
}

export const universalErrorMsg = 'Something went wrong. Please try again later.';