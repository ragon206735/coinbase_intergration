import { Fragment } from "react";
import "./Overlay.css";

export function Overlay({ isOpen, onClose, children }) {
  return (
    <Fragment>
      {isOpen && (
        <div className="overlay">
          <div className="overlay__background"/>
          <div className="overlay__container">
            <div className="overlay__controls">
            </div>
            {children}
          </div>
        </div>
      )}
    </Fragment>
  );
}

export default Overlay;