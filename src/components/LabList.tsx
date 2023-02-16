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
          <div className="mb-5 flex-1 rounded-2xl bg-neutral-100 p-5 dark:bg-neutral-900 dark:bg-opacity-50">
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
                      "mb-3 mr-3 max-w-max grow-0 cursor-pointer rounded-2xl bg-neutral-200 p-3 font-bold dark:bg-neutral-700 dark:outline-neutral-200",
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
