import { Fragment } from "react";

type ModalInputs = {
  title: string;

  onClose: () => void;
};

export default function Modal({ title, onClose }: ModalInputs) {
  return (
    <Fragment>
      <div className="modal"></div>
      <div className="modal-backdrop in" onClick={onClose}></div>
    </Fragment>
  );
}
