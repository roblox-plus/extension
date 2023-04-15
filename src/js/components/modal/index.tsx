import { Fragment } from 'react';
import ReactDOM from 'react-dom/client';
import Modal from './modal';

type ConfirmationModalInput = {
  title: string;

  body: JSX.Element;

  confirmText: string;

  confirmClass: 'alert' | 'control';

  cancelText: string;
};

// Renders a confirmation modal onto the web page.
// The returned promise will return whether or not the user accepted the confirmation (true = confirmed, false = cancelled).
const showConfirmationModal = ({
  title,
  body,
  confirmText,
  confirmClass,
  cancelText,
}: ConfirmationModalInput): Promise<boolean> => {
  const modalContainer = document.createElement('div');
  modalContainer.setAttribute('class', 'rplus-modal');
  const root = ReactDOM.createRoot(modalContainer);

  const closeModal = () => {
    root.unmount();
    modalContainer.remove();
  };

  return new Promise((resolve, reject) => {
    document.body.appendChild(modalContainer);

    const decide = (decision: boolean) => {
      closeModal();
      resolve(decision);
    };

    root.render(
      <Modal
        title={title}
        body={body}
        buttons={
          <Fragment>
            <button
              type="button"
              className={`modal-button btn-${confirmClass}-md`}
              onClick={() => decide(true)}
            >
              {confirmText}
            </button>
            <button
              type="button"
              className="modal-button btn-control-md"
              onClick={() => decide(false)}
            >
              {cancelText}
            </button>
          </Fragment>
        }
        onClose={() => decide(false)}
      />
    );
  });
};

export { showConfirmationModal };
