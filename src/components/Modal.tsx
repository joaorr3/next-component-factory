import { animated } from "@react-spring/web";
import React from "react";
import { useSpringPopup } from "../hooks/useSpringPopup";

type ModalProps = React.PropsWithChildren<{
  isOpen?: boolean;
  onChange?: (status: boolean) => void;
}>;

const Modal = ({ isOpen, onChange, children }: ModalProps) => {
  const { value, isVisible, close } = useSpringPopup(isOpen, onChange);

  if (!isVisible) {
    return <React.Fragment />;
  }

  return (
    <animated.div
      className="fixed inset-0 flex items-center justify-center"
      style={{
        zIndex: 120,
        backgroundColor: "rgba(24, 24, 24, 0.9)",
        opacity: value,
        backdropFilter: value
          .to([0, 1], [0, 4], "clamp")
          .to((v) => `blur(${v}px)`),
      }}
      onClick={close}
    >
      <animated.span
        className="flex w-full justify-center"
        style={{
          zIndex: 90,
          scale: value.to([0, 1], [0.94, 1], "clamp"),
          translateY: value.to([0, 1], [20, 0], "clamp"),
        }}
      >
        <div
          style={{ zIndex: 120 }}
          className="relative m-3 flex w-full max-w-2xl flex-col justify-center rounded-xl bg-neutral-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            onClick={close}
            className="absolute -top-14 right-0 cursor-pointer rounded-2xl bg-neutral-700 p-3 font-bold"
          >
            close
          </div>

          {children}
        </div>
      </animated.span>
    </animated.div>
  );
};

export default Modal;
