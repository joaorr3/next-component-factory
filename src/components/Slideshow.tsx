import { type IssuesMedia } from "@prisma/client";
import {
  ReactSlipAndSlide,
  type ReactSlipAndSlideRef,
} from "@react-slip-and-slide/web";
import React from "react";
import { MediaPreview } from "./MediaPreview";
import Modal, { type ModalProps } from "./Modal";

export type SlideshowProps = {
  data: Pick<IssuesMedia, "url" | "contentType">[];
  isOpen?: boolean;
} & Pick<ModalProps, "onChange">;

export const Slideshow = React.forwardRef(
  (
    { data, isOpen, onChange }: SlideshowProps,
    ref?: React.Ref<ReactSlipAndSlideRef>
  ): JSX.Element => {
    return (
      <Modal isOpen={isOpen} onChange={onChange}>
        <div className="flex items-center rounded-2xl bg-neutral-800 p-5">
          <ReactSlipAndSlide
            ref={ref}
            data={data}
            centered
            snap
            itemWidth={600}
            itemHeight={600}
            renderItem={({ item }) => {
              return (
                <div className="flex h-full items-center">
                  <div className="flex w-full justify-center">
                    <MediaPreview
                      url={item.url}
                      contentType={item.contentType}
                      width={590}
                      height={590}
                    />
                  </div>
                </div>
              );
            }}
          />
        </div>
      </Modal>
    );
  }
);