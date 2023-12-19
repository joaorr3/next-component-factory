import { animated } from "@react-spring/web";
import React from "react";
import { useClickOutside } from "../hooks/useClickOutside";
import { useKeyPress } from "../hooks/useKeyPress";
import { useSpringPopup } from "../hooks/useSpringPopup";
import { InteractionElement } from "./InteractionElement";

export type ModalProps = React.PropsWithChildren<{
  isOpen?: boolean;
  onChange?: (status: boolean) => void;
}>;

const Modal = ({ isOpen, onChange, children }: ModalProps) => {
  const { value, isVisible, close } = useSpringPopup(isOpen, onChange);
  const ref = React.useRef<HTMLDivElement>(null);

  useClickOutside({ ref, attach: isOpen, callback: close });
  useKeyPress({ targetKey: "Escape", cb: close, attach: isVisible });

  if (!isVisible) {
    return <React.Fragment />;
  }

  return (
    <animated.div
      className="modal fixed inset-0 flex items-center justify-center bg-neutral-900 bg-opacity-50 dark:bg-opacity-90"
      style={{
        opacity: value,
        zIndex: 120,
      }}
    >
      <animated.div
        className="modal flex w-full justify-center"
        style={{
          zIndex: 90,
          opacity: value,
          scale: value.to([0, 1], [0.94, 1], "clamp"),
          translateY: value.to([0, 1], [20, 0], "clamp"),
        }}
      >
        <div
          ref={ref}
          style={{
            zIndex: 120,
            maxHeight: "70vh",
            maxWidth: 672,
          }}
          className="modal relative m-3 flex w-full max-w-2xl flex-col justify-center rounded-xl bg-neutral-200 dark:bg-neutral-800"
        >
          <div className="modal absolute -top-16 right-0">
            <InteractionElement text="Close" onPress={close} />
          </div>

          <div className="modal-children h-full w-full">{children}</div>
        </div>
      </animated.div>
    </animated.div>
  );
};

export default Modal;
