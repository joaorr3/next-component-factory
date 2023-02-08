import { useRouter } from "next/router";
import { InteractionElement } from "./InteractionElement";

export type BackButtonProps = {
  href?: string;
};

export const BackButton = ({ href }: BackButtonProps): JSX.Element => {
  const router = useRouter();

  return (
    <div className="mb-3 flex">
      <InteractionElement
        text="Back"
        href={href}
        onPress={!href ? router.back : undefined}
      />
    </div>
  );
};
