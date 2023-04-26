import { type Saga } from "redux-saga";

import {
  BudgetReduxConfig,
  TemplateReduxConfig,
  PublicBudgetReduxConfig,
} from "deprecated/app/Budgeting/config";
import DashboardReduxConfig from "deprecated/app/Dashboard/config";


import { Reducer, Action } from "../../application/store/types";

export const moduleConfig = <
  S,
  PUBLIC extends boolean,
  L extends string,
  A extends Action = Action,
>(
  c: ModuleConfig<S, PUBLIC, L, A>,
): ModuleConfig<S, PUBLIC, L, A> => c;

export interface ModuleConfig<
  S,
  PUBLIC extends boolean = false,
  L extends string = string,
  A extends Action = Action,
> {
  readonly rootSaga?: Saga;
  readonly rootReducer: Reducer<S, A>;
  readonly initialState: S;
  readonly label: L;
  readonly isPublic: PUBLIC;
}

export const MODULE_CONFIGS = {
  [DashboardReduxConfig.label]: DashboardReduxConfig,
  [TemplateReduxConfig.label]: TemplateReduxConfig,
  [PublicBudgetReduxConfig.label]: PublicBudgetReduxConfig,
  [BudgetReduxConfig.label]: BudgetReduxConfig,
} as const;

type InferModuleStore<C> = C extends ModuleConfig<infer S, boolean, ModuleLabel> ? S : never;

export type ModuleConfigs = typeof MODULE_CONFIGS;
export type ModuleLabel = keyof ModuleConfigs;

export type PublicModuleLabel = keyof {
  [key in keyof ModuleConfigs as ModuleConfigs[key]["isPublic"] extends true
    ? key
    : never]: ModuleConfigs[key];
};

export type AuthenticatedModuleLabel = keyof {
  [key in keyof ModuleConfigs as ModuleConfigs[key]["isPublic"] extends false
    ? key
    : never]: ModuleConfigs[key];
};

export type ModuleStores = { [key in ModuleLabel]: InferModuleStore<ModuleConfigs[key]> };

export type PublicModuleStores = { [key in PublicModuleLabel]: ModuleStores[key] };
export type AuthenticatedModuleStores = { [key in AuthenticatedModuleLabel]: ModuleStores[key] };

export type PublicModuleConfigs = {
  [key in PublicModuleLabel]: ModuleConfigs[key];
};

export const PUBLIC_MODULE_CONFIGS: PublicModuleConfigs = Object.keys(MODULE_CONFIGS).reduce(
  (prev: PublicModuleConfigs, curr: string): PublicModuleConfigs => {
    if (MODULE_CONFIGS[curr as ModuleLabel].isPublic === false) {
      return prev;
    }
    return { ...prev, [curr as PublicModuleLabel]: MODULE_CONFIGS[curr as PublicModuleLabel] };
  },
  {} as PublicModuleConfigs,
);

export const PUBLIC_MODULE_LABELS: PublicModuleLabel[] = Object.keys(
  PUBLIC_MODULE_CONFIGS,
) as PublicModuleLabel[];

export type AuthenticatedModuleConfigs = {
  [key in AuthenticatedModuleLabel]: ModuleConfigs[key];
};

export const AUTH_MODULE_CONFIGS: AuthenticatedModuleConfigs = Object.keys(MODULE_CONFIGS).reduce(
  (prev: AuthenticatedModuleConfigs, curr: string): AuthenticatedModuleConfigs => {
    if (MODULE_CONFIGS[curr as ModuleLabel].isPublic === true) {
      return prev;
    }
    return {
      ...prev,
      [curr as AuthenticatedModuleLabel]: MODULE_CONFIGS[curr as AuthenticatedModuleLabel],
    };
  },
  {} as AuthenticatedModuleConfigs,
);

export const AUTH_MODULE_LABELS: AuthenticatedModuleLabel[] = Object.keys(
  AUTH_MODULE_CONFIGS,
) as AuthenticatedModuleLabel[];

export type PublicModuleReducers = {
  [key in PublicModuleLabel]: ModuleConfigs[key]["rootReducer"];
};

export const PUBLIC_MODULE_REDUCERS: PublicModuleReducers = Object.keys(MODULE_CONFIGS).reduce(
  (prev: PublicModuleReducers, curr: string): PublicModuleReducers => {
    if (MODULE_CONFIGS[curr as ModuleLabel].isPublic === true) {
      return prev;
    }
    return {
      ...prev,
      [curr as PublicModuleLabel]: MODULE_CONFIGS[curr as PublicModuleLabel].rootReducer,
    };
  },
  {} as PublicModuleReducers,
);

export type AuthenticatedModuleReducers = {
  [key in AuthenticatedModuleLabel]: ModuleConfigs[key]["rootReducer"];
};

export const AUTH_MODULE_REDUCERS: AuthenticatedModuleReducers = Object.keys(MODULE_CONFIGS).reduce(
  (prev: AuthenticatedModuleReducers, curr: string): AuthenticatedModuleReducers => {
    if (MODULE_CONFIGS[curr as ModuleLabel].isPublic === true) {
      return prev;
    }
    return {
      ...prev,
      [curr as AuthenticatedModuleLabel]:
        MODULE_CONFIGS[curr as AuthenticatedModuleLabel].rootReducer,
    };
  },
  {} as AuthenticatedModuleReducers,
);

export const PUBLIC_MODULE_INITIAL_STATE: PublicModuleStores = Object.keys(MODULE_CONFIGS).reduce(
  (prev: PublicModuleStores, curr: string): PublicModuleStores => {
    if (MODULE_CONFIGS[curr as ModuleLabel].isPublic === true) {
      return prev;
    }
    return {
      ...prev,
      [curr as PublicModuleLabel]: MODULE_CONFIGS[curr as PublicModuleLabel].initialState,
    };
  },
  {} as PublicModuleStores,
);

export const AUTH_MODULE_INITIAL_STATE: AuthenticatedModuleStores = Object.keys(
  MODULE_CONFIGS,
).reduce((prev: AuthenticatedModuleStores, curr: string): AuthenticatedModuleStores => {
  if (MODULE_CONFIGS[curr as ModuleLabel].isPublic === true) {
    return prev;
  }
  return {
    ...prev,
    [curr as AuthenticatedModuleLabel]:
      MODULE_CONFIGS[curr as AuthenticatedModuleLabel].initialState,
  };
}, {} as AuthenticatedModuleStores);
