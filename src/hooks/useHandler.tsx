import React from "react";

type ArgumentTypes<F> = F extends (...args: infer A) => any ? A : never;

export const useHandler = <F extends (...args: any[]) => ReturnType<F>>(
  fn: F,
  deps: React.DependencyList
) => {
  React.useDebugValue(`useHandler(${fn.name ?? "anonymous"})`);

  const fnRef = React.useRef<F>();
  const depsRef = React.useRef<typeof deps>();

  fnRef.current = fn;
  depsRef.current = deps;

  return React.useCallback(
    (...args: ArgumentTypes<F>) => fnRef.current?.(...args),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [depsRef]
  ) as F;
};
