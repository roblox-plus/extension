import ReactDOM from 'react-dom/client';
import Modal from './modal';

type ConfirmationModalInput = {
  title: string;

  body: string;

  confirmText: string;

  cancelText: string;
};

const showConfirmationModal = ({
  title,
  body,
  confirmText,
  cancelText,
}: ConfirmationModalInput) => {
  const modalContainer = document.createElement('div');
  modalContainer.setAttribute('class', 'rplus-modal');
  const root = ReactDOM.createRoot(modalContainer);

  const closeModal = () => {
    root.unmount();
    modalContainer.remove();
  };

  return new Promise((resolve, reject) => {
    document.body.appendChild(modalContainer);

    root.render(<Modal title={title} onClose={closeModal} />);
  });
};

export { showConfirmationModal };
