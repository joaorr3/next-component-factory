export type PickPartial<
  T extends { id: string | number },
  K extends keyof T
> = {
  [P in K]?: T[K];
} & Omit<T, K>;

export type PickRequired<T, R extends keyof T> = Partial<T> &
  Required<Pick<T, R>>;
