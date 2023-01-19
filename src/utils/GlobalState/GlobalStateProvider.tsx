import type { GuildUser } from "@prisma/client";
import produce from "immer";
import React, { type Reducer } from "react";
import { localStorageActions } from "../../hooks/useLocalStorage";
import { useUser } from "../../hooks/useUser";
import type { Role } from "../../shared/roles";
import { type ThemeNames } from "../../theme";

export type ContextModel = {
  themeName: ThemeNames;
  isLoading: boolean;
  user: {
    profile?: GuildUser;
    roles?: Role[];
  };
};

export enum ActionTypes {
  INIT = "INIT",
  SET_THEME_NAME = "SET_THEME_NAME",
  SET_LOADING = "SET_LOADING",
  SET_USER = "SET_USER",
  REMOVE_USER = "REMOVE_USER",
}

type InitActionType = {
  type: ActionTypes.INIT;
  payload: Partial<ContextModel>;
};

type SetThemeActionType = {
  type: ActionTypes.SET_THEME_NAME;
  payload: Partial<ContextModel["themeName"]>;
};

type SetLoadingActionType = {
  type: ActionTypes.SET_LOADING;
  payload: Partial<ContextModel["isLoading"]>;
};

type SetUserActionType = {
  type: ActionTypes.SET_USER;
  payload: Partial<ContextModel["user"]>;
};

type RemoveUserActionType = {
  type: ActionTypes.REMOVE_USER;
  payload: undefined;
};

type Actions =
  | InitActionType
  | SetThemeActionType
  | SetLoadingActionType
  | SetUserActionType
  | RemoveUserActionType;

type ActionHandler<P> = (payload: P, fx?: (payload: P) => void) => void;

export interface ContextHandlers {
  state: ContextModel;
  dispatch: React.Dispatch<Actions>;
  actions: {
    init: ActionHandler<Partial<ContextModel>>;
    setThemeName: ActionHandler<Partial<ContextModel["themeName"]>>;
    setLoading: ActionHandler<Partial<ContextModel["isLoading"]>>;
    setUser: ActionHandler<Partial<ContextModel["user"]>>;
    removeUser: () => void;
  };
}

const GlobalStateProducer = produce<Reducer<ContextModel, Actions>>(
  (draft, action) => {
    switch (action.type) {
      case ActionTypes.INIT:
        draft.user.profile = action.payload.user?.profile;
        draft.user.roles = action.payload.user?.roles;
        break;
      case ActionTypes.SET_THEME_NAME:
        if (action.payload !== draft.themeName) {
          draft.themeName = action.payload;
        }
        break;
      case ActionTypes.SET_LOADING:
        if (action.payload !== draft.isLoading) {
          draft.isLoading = action.payload;
        }
        break;
      case ActionTypes.SET_USER:
        draft.user.profile = action.payload?.profile;
        draft.user.roles = action.payload?.roles;
        break;
      case ActionTypes.REMOVE_USER:
        draft.user.profile = undefined;
        draft.user.roles = undefined;
        break;
    }
  }
);

const context = React.createContext<ContextHandlers>({} as ContextHandlers);

export type DataProviderProps = React.PropsWithChildren<{
  initialState?: ContextModel;
}>;

const initialState: ContextModel = {
  themeName: "dark",
  isLoading: false,
  user: {},
};

export function GlobalStateProvider({
  initialState: _initialState,
  children,
}: DataProviderProps) {
  const [state, dispatch] = React.useReducer(
    GlobalStateProducer,
    _initialState || initialState
  );
  // console.log("CONTEXT_STATE: ", state);

  const actions = React.useMemo(
    (): ContextHandlers["actions"] => ({
      init: (payload, fx) => {
        dispatch({ type: ActionTypes.INIT, payload });
        fx?.(payload);
      },
      setThemeName: (payload, fx) => {
        dispatch({ type: ActionTypes.SET_THEME_NAME, payload });
        fx?.(payload);
      },
      setLoading: (payload, fx) => {
        dispatch({ type: ActionTypes.SET_LOADING, payload });
        fx?.(payload);
      },
      setUser: (payload, fx) => {
        dispatch({ type: ActionTypes.SET_USER, payload });
        fx?.(payload);
      },
      removeUser: () => {
        dispatch({ type: ActionTypes.REMOVE_USER, payload: undefined });
      },
    }),
    []
  );

  useInitGlobalState(actions);

  const contextHandlers: ContextHandlers = React.useMemo(
    () => ({ state, actions, dispatch }),
    [actions, state]
  );

  return (
    <context.Provider value={contextHandlers}>{children}</context.Provider>
  );
}

export const useGlobalState = (): ContextHandlers => {
  const { state, actions, dispatch } = React.useContext<ContextHandlers>(
    context as React.Context<ContextHandlers>
  );
  return { state, actions, dispatch };
};

export const useInitGlobalState = (actions: ContextHandlers["actions"]) => {
  const { parsed: themeName } =
    localStorageActions.get<ThemeNames>("currentTheme");

  const { user, roles, isLoading: isLoadingUser } = useUser();

  React.useEffect(() => {
    actions.setLoading(isLoadingUser);
  }, [actions, isLoadingUser]);

  React.useEffect(() => {
    actions.setUser({
      profile: user,
      roles,
    });
  }, [actions, roles, user]);

  React.useEffect(() => {
    if (themeName) {
      actions.setThemeName(themeName);
    }
  }, [actions, themeName]);
};

export const useLoading = (loading?: boolean) => {
  const { state, actions } = useGlobalState();
  React.useEffect(() => {
    actions.setLoading(Boolean(loading));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return {
    isLoading: state.isLoading,
    setLoading: actions.setLoading,
  };
};
