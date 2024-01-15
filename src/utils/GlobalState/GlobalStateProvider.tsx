import type { GuildUser } from "@prisma/client";
import produce from "immer";
import { debounce } from "lodash";
import React, { type Reducer } from "react";
import { type FiltersModel as IssuesFiltersModel } from "../../components/Issue/Filters";
import { type FiltersModel as PRFiltersModel } from "../../components/PullRequest/Filters";
import { localStorageActions } from "../../hooks/useLocalStorage";
import { useUser } from "../../hooks/useUser";
import type { Role } from "../../shared/roles";
import { type ThemeNames } from "../../theme";

export type UserStateModel = {
  profile?: GuildUser;
  roles?: Role[];
};

export type ContextModel = {
  themeName: ThemeNames;
  isLoading: boolean;
  user: UserStateModel;
  issues: {
    searchFilters: IssuesFiltersModel;
  };
  pullRequests: {
    searchFilters: PRFiltersModel;
  };
};

export enum ActionTypes {
  INIT = "INIT",
  SET_THEME_NAME = "SET_THEME_NAME",
  SET_LOADING = "SET_LOADING",
  SET_USER = "SET_USER",
  SET_DEFAULT_USER_LAB = "SET_DEFAULT_USER_LAB",
  REMOVE_USER = "REMOVE_USER",
  SET_ISSUE_FILTERS = "SET_ISSUE_FILTERS",
  SET_PULLREQUEST_FILTERS = "SET_PULLREQUEST_FILTERS",
}

type InitActionType = {
  type: ActionTypes.INIT;
  payload: Partial<ContextModel>;
};

type SetThemeNameActionType = {
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

type SetDefaultUserLabType = {
  type: ActionTypes.SET_DEFAULT_USER_LAB;
  payload: string | null;
};

type RemoveUserActionType = {
  type: ActionTypes.REMOVE_USER;
  payload: undefined;
};

type SetIssueFiltersActionType = {
  type: ActionTypes.SET_ISSUE_FILTERS;
  payload: Partial<ContextModel["issues"]["searchFilters"]>;
};

type SetPullRequestFiltersActionType = {
  type: ActionTypes.SET_PULLREQUEST_FILTERS;
  payload: Partial<ContextModel["pullRequests"]["searchFilters"]>;
};

type Actions =
  | InitActionType
  | SetThemeNameActionType
  | SetLoadingActionType
  | SetUserActionType
  | SetDefaultUserLabType
  | RemoveUserActionType
  | SetIssueFiltersActionType
  | SetPullRequestFiltersActionType;

type ActionHandler<P> = (payload: P, fx?: (payload: P) => void) => void;

export interface ContextHandlers {
  state: ContextModel;
  dispatch: React.Dispatch<Actions>;
  actions: {
    init: ActionHandler<InitActionType["payload"]>;
    setThemeName: ActionHandler<SetThemeNameActionType["payload"]>;
    setLoading: ActionHandler<SetLoadingActionType["payload"]>;
    setUser: ActionHandler<SetUserActionType["payload"]>;
    setDefaultUserLab: ActionHandler<SetDefaultUserLabType["payload"]>;
    removeUser: () => void;
    setIssueFilters: ActionHandler<SetIssueFiltersActionType["payload"]>;
    setPullRequestFilters: ActionHandler<SetPullRequestFiltersActionType["payload"]>;
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
      case ActionTypes.SET_DEFAULT_USER_LAB:
        if (draft.user.profile) {
          draft.user.profile.defaultLabId = action.payload;
        }
        break;
      case ActionTypes.REMOVE_USER:
        draft.user.profile = undefined;
        draft.user.roles = undefined;
        break;
      case ActionTypes.SET_ISSUE_FILTERS:
        draft.issues.searchFilters.id = action.payload.id;
        draft.issues.searchFilters.title = action.payload.title;
        draft.issues.searchFilters.author = action.payload.author;
        draft.issues.searchFilters.type = action.payload.type;
        break;
      case ActionTypes.SET_PULLREQUEST_FILTERS:
        draft.pullRequests.searchFilters.id = action.payload.id;
        draft.pullRequests.searchFilters.title = action.payload.title;
        draft.pullRequests.searchFilters.author = action.payload.author;
        draft.pullRequests.searchFilters.status = action.payload.status;
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
  issues: {
    searchFilters: {},
  },
  pullRequests: {
    searchFilters: {},
  },
};

export function GlobalStateProvider({
  initialState: _initialState,
  children,
}: DataProviderProps) {
  const [state, dispatch] = React.useReducer(
    GlobalStateProducer,
    initialState
  );

  console.log(state)

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
      setDefaultUserLab: (payload, fx) => {
        dispatch({ type: ActionTypes.SET_DEFAULT_USER_LAB, payload });
        fx?.(payload);
      },
      removeUser: () => {
        dispatch({ type: ActionTypes.REMOVE_USER, payload: undefined });
      },
      setIssueFilters: (payload, fx) => {
        dispatch({ type: ActionTypes.SET_ISSUE_FILTERS, payload });
        fx?.(payload);
      },
      setPullRequestFilters: (payload, fx) => {
        dispatch({ type: ActionTypes.SET_PULLREQUEST_FILTERS, payload });
        fx?.(payload);
      },
    }),
    []
  );

  useInitGlobalState(state, actions);

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

export const useInitGlobalState = (
  state: ContextHandlers["state"],
  actions: ContextHandlers["actions"]
) => {
  const { parsed: themeName } =
    localStorageActions.get<ThemeNames>("currentTheme");

  const fetchUser = !state.user.profile && !state.user.roles?.length;

  const { user, roles, isLoading: isLoadingUser } = useUser(fetchUser);

  React.useEffect(() => {
    actions.setLoading(isLoadingUser);
  }, [actions, isLoadingUser]);

  React.useEffect(() => {
    if (fetchUser) {
      actions.setUser({
        profile: user,
        roles: roles,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, user, roles]);

  React.useEffect(() => {
    if (themeName) {
      actions.setThemeName(themeName);
    }
  }, [actions, themeName]);
};

export const useLoading = (loading?: boolean | "setOnly") => {
  const { state, actions } = useGlobalState();

  // Make sure we don't dispatch as often.
  const debouncedSetLoading = React.useMemo(
    () => debounce(actions.setLoading, 1000, { leading: true, trailing: true }),
    [actions.setLoading]
  );

  React.useEffect(() => {
    if (loading !== "setOnly") {
      debouncedSetLoading(Boolean(loading));

      // If incoming is distinct from state we don't wait for debounce.
      if (Boolean(loading) !== state.isLoading) {
        debouncedSetLoading.flush();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return {
    isLoading: state.isLoading,
    setLoading: debouncedSetLoading,
  };
};
