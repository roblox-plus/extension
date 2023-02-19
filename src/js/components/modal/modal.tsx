import { Fragment } from 'react';

type ModalInputs = {
  title: string;

  body: JSX.Element;

  buttons: JSX.Element | null;

  onClose: () => void;
};

export default function Modal({ title, body, buttons, onClose }: ModalInputs) {
  return (
    <Fragment>
      <div className="modal">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <div className="modal-title">
                <h4>{title}</h4>
                <button className="close" type="button" onClick={onClose}>
                  <span className="icon-close"></span>
                </button>
              </div>
            </div>
            <div className="modal-body">{body}</div>
            {buttons && <div className="modal-buttons">{buttons}</div>}
          </div>
        </div>
      </div>
      <div className="modal-backdrop in" onClick={onClose}></div>
    </Fragment>
  );
}
