import styled from "styled-components";
import { customScrollBar } from "../styles/GlobalStyles";
import { cn } from "../styles/utils";
import { useLoading } from "../utils/GlobalState/GlobalStateProvider";
import { trpc } from "../utils/trpc";

const ScrollView = styled.div`
  ${customScrollBar}
`;

type SelectedLab = {
  id: string;
  name: string;
};

export type LabListProps = {
  selectedLab?: SelectedLab;
  onItemPress?: (selectedLab: SelectedLab) => void;
};

export const LabList = ({
  selectedLab,
  onItemPress,
}: LabListProps): JSX.Element => {
  const { data, isLoading, fetchStatus } = trpc.user.userLabs.useQuery();

  useLoading(isLoading && fetchStatus !== "idle");

  return (
    <div className="p-5 pb-0">
      <div className="my-3 mb-0 overflow-hidden">
        <ScrollView className="h-96 overflow-y-scroll">
          <div className="mb-3 mr-3 rounded-2xl bg-neutral-900 bg-opacity-50 p-5">
            <div className="flex flex-wrap">
              {data?.map((lab) => {
                return (
                  <div
                    key={lab.id}
                    onClick={() => {
                      onItemPress?.(lab);
                    }}
                    className={cn(
                      "flex select-none items-center justify-center",
                      "mb-3 mr-3 max-w-max grow-0 cursor-pointer rounded-2xl bg-neutral-600 bg-opacity-40 p-3 font-bold outline-neutral-200 hover:bg-opacity-50",
                      selectedLab?.id === lab.id ? "outline" : ""
                    )}
                  >
                    {lab.name}
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollView>
      </div>
    </div>
  );
};
