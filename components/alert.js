import { toast } from 'react-toastify';
import { Fader } from '~/components/transitioner.js';

toast.configure({
  autoClose: 3000,
  draggable: false,
  hideProgressBar: true,
  position: toast.POSITION.BOTTOM_CENTER,
  // transition: (<Fader determinant={true} duration={1000} delay={0} />)
});

export const alert = {
  success: (message) => {
    toast(message, { className: 'alert alert-success' });
  },
  error: (message) => {
    toast(message, { className: 'alert alert-danger' });
  },
}