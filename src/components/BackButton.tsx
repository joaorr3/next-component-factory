import { InteractionElement } from "./InteractionElement";

export type BackButtonProps = {
  href: string;
};

export const BackButton = ({ href }: BackButtonProps): JSX.Element => {
  return (
    <div className="mb-3">
      <InteractionElement text="Back" href={href} />
    </div>
  );
};
