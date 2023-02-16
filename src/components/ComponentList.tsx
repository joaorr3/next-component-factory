import { type Component, type ComponentCategory } from "@prisma/client";
import { debounce, groupBy, startCase } from "lodash";
import React from "react";
import styled from "styled-components";
import { customScrollBar } from "../styles/GlobalStyles";
import { cn } from "../styles/utils";
import { trpc } from "../utils/trpc";
import { TextField } from "./Form/Fields";
import Loader from "./Loader";

const ScrollView = styled.div`
  ${customScrollBar}
`;

export type ComponentListProps = {
  selectedComponentName?: Component["name"];
  onItemPress?: (item: Component) => void;
};

export type ComponentListRef = {
  refetch: () => void;
};

const parseComponentsData = (component?: Component[]) => {
  const grouped = groupBy(component, "category");
  const entries = Object.entries(grouped) as [ComponentCategory, Component[]][];
  const mapped = entries.map(([category, components]) => {
    return {
      category: startCase(category.toLowerCase()),
      components,
    };
  });

  return mapped;
};

export const ComponentList = React.forwardRef(
  (
    { selectedComponentName, onItemPress }: ComponentListProps,
    ref?: React.Ref<ComponentListRef>
  ): JSX.Element => {
    const { data, isLoading, fetchStatus, refetch } =
      trpc.components.all.useQuery();

    const [searchValue, setSearchValue] = React.useState<string>("");

    const [searchResults, setSearchResults] = React.useState<Component[]>([]);

    const parsedData = React.useMemo(
      () => parseComponentsData(searchResults),
      [searchResults]
    );

    React.useImperativeHandle<ComponentListRef, ComponentListRef>(ref, () => ({
      refetch,
    }));

    React.useEffect(() => {
      if (data) {
        setSearchResults(data);
      }
    }, [data]);

    const handleSearch = debounce((value: string) => {
      setSearchValue(value);
      if (value) {
        const filtered = data?.filter(({ name }) => {
          const normalizedName = name.toLowerCase();
          const normalizedValue = value.toLowerCase();
          return normalizedName.includes(normalizedValue);
        });

        if (filtered) {
          setSearchResults(filtered);
        }
      } else {
        if (data) {
          setSearchResults(data);
        }
      }
    }, 500);

    return (
      <div className="relative h-[70vh] w-full">
        <Loader.Island
          isLoading={isLoading && fetchStatus !== "idle"}
          size="md"
        />
        <div className="component-list flex h-full flex-col justify-between p-5 pb-0">
          <TextField
            placeholder="Search"
            defaultValue={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
          />
          <span className="text grow text-xs opacity-50">
            {searchResults.length} results
          </span>

          <div className="my-3 mb-0 h-4/5 overflow-hidden">
            <ScrollView className="h-full overflow-y-scroll">
              {parsedData.map(({ category, components }) => (
                <div
                  key={category}
                  className="mb-3 mr-3 rounded-2xl bg-neutral-400 bg-opacity-30 p-5 dark:bg-neutral-900 dark:bg-opacity-50"
                >
                  <div className="flex">
                    <p className="text mb-3 ml-3 mr-1 text-xs font-bold opacity-50">
                      {category}
                    </p>

                    <p className="text mb-3 text-xs font-semibold opacity-20">
                      ({components.length})
                    </p>
                  </div>

                  <div className="flex flex-wrap">
                    {components.map((component) => {
                      return (
                        <div
                          key={component.id}
                          onClick={() => {
                            onItemPress?.(component);
                          }}
                          className={cn(
                            "flex select-none items-center justify-center",
                            "mb-3 mr-3 max-w-max grow-0 cursor-pointer rounded-2xl bg-neutral-500 bg-opacity-30 p-3 font-bold outline-neutral-200 hover:bg-opacity-50",
                            selectedComponentName === component.name
                              ? "outline"
                              : ""
                          )}
                        >
                          {component.name}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </ScrollView>
          </div>
        </div>
      </div>
    );
  }
);
