import React from "react";
import Loader from "../Loader";

type Phase = {
  label: string;
  isSuccess: boolean;
  isError: boolean;
  isLoading: boolean;
};

export type OpenPhasesProps = {
  phases: Phase[];
};

export const OpenPhases = ({ phases }: OpenPhasesProps): JSX.Element => {
  return (
    <div className="m-8 flex flex-col justify-center">
      {phases.map(({ label, isSuccess, isError, isLoading }, index) => {
        return (
          <div key={index} className="mb-1 flex flex-1">
            <p className="flex-1 text-lg font-semibold">{label}</p>

            <div
              className="relative flex items-center justify-center"
              style={{ minWidth: 16, minHeight: 16 }}
            >
              {isSuccess && <span>✅</span>}
              {isError && <span>❌</span>}

              {isLoading && (
                <Loader.Island size="sm" isLoading overlayOpacity={0} />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
