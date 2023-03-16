import React from "react";

import hoistNonReactStatics from "hoist-non-react-statics";
import { map, isNil } from "lodash";
import { SingleValue, MultiValue, ActionMeta, SelectComponentsConfig } from "react-select";
import { Subtract } from "utility-types";

import { ui, model } from "lib";

import { ModelSelectOption } from "./options";

export type ModelSelectInjectedProps<M extends Model.Model> = {
  readonly getOptionLabel: (m: ModelSelectOption<M>) => string;
  readonly getOptionValue: (m: ModelSelectOption<M>) => string;
};

type SetDelete = (v: boolean) => void;

type WithModelSelectProps<
  M extends Model.Model,
  IsMulti extends boolean = false,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>,
> = {
  readonly getOptionLabel?: (m: M) => string;
  readonly optionCanDelete?: (m: M) => boolean;
  readonly onDelete?: (m: M, cb: SetDelete) => void;
  readonly components?: SelectComponentsConfig<ModelSelectOption<M>, IsMulti, G>;
};

const withModelSelect = <
  M extends Model.Model,
  IsMulti extends boolean = false,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>,
  T extends ModelSelectInjectedProps<M> = ModelSelectInjectedProps<M>,
>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<
  Subtract<T, ModelSelectInjectedProps<M>> & WithModelSelectProps<M, IsMulti, G>
> => {
  const WithModelSelect = (
    props: Subtract<T, ModelSelectInjectedProps<M>> & WithModelSelectProps<M, IsMulti, G>,
  ): JSX.Element => (
    <Component
      {...(props as T)}
      components={{ Option: ModelSelectOption, ...props.components }}
      getOptionLabel={(m: ModelSelectOption<M>) =>
        !isNil(props.getOptionLabel)
          ? props.getOptionLabel(ui.select.toSelectModel(m))
          : model.getModelName(ui.select.toSelectModel(m))
      }
      getOptionValue={(m: ModelSelectOption<M>) => m.id}
    />
  );
  return hoistNonReactStatics(WithModelSelect, React.memo(Component));
};

export type SingleModelSelectInjectedProps<M extends Model.Model> = ModelSelectInjectedProps<M> & {
  readonly onChange?: (
    newValue: SingleValue<ModelSelectOption<M>>,
    actionMeta: ActionMeta<ModelSelectOption<M>>,
  ) => void;
};

export type WithSingleModelSelectProps<
  M extends Model.Model,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>,
> = WithModelSelectProps<M, false, G> & {
  readonly onChange?: (ms: M["id"] | null) => void;
};

export const withSingleModelSelect = <
  M extends Model.Model,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>,
  T extends SingleModelSelectInjectedProps<M> & {
    readonly getOptionLabel?: (m: M) => string;
  } = SingleModelSelectInjectedProps<M> & { readonly getOptionLabel?: (m: M) => string },
>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<
  Subtract<T, SingleModelSelectInjectedProps<M>> & WithSingleModelSelectProps<M, G>
> => {
  const C = withModelSelect<M, false, G, T>(Component);

  const WithSingleModelSelect = (
    props: Subtract<T, SingleModelSelectInjectedProps<M>> & WithSingleModelSelectProps<M, G>,
  ): JSX.Element => (
    <C
      {...(props as T)}
      onChange={(newValue: SingleValue<ModelSelectOption<M>>) =>
        props.onChange?.(newValue !== null ? ui.select.toSelectModel(newValue).id : newValue)
      }
    />
  );
  return hoistNonReactStatics(WithSingleModelSelect, React.memo(Component));
};

export type MultiModelSelectInjectedProps<M extends Model.Model> = ModelSelectInjectedProps<M> & {
  readonly onChange: (
    newValue: MultiValue<ModelSelectOption<M>>,
    actionMeta: ActionMeta<ModelSelectOption<M>>,
  ) => void;
};

export type WithMultiModelSelectProps<
  M extends Model.Model,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>,
> = WithModelSelectProps<M, true, G> & {
  readonly onChange?: (ms: M["id"][]) => void;
};

export const withMultiModelSelect = <
  M extends Model.Model,
  G extends SelectGroupBase<ModelSelectOption<M>> = SelectGroupBase<ModelSelectOption<M>>,
  T extends MultiModelSelectInjectedProps<M> & {
    readonly getOptionLabel?: (m: M) => string;
  } = MultiModelSelectInjectedProps<M> & { readonly getOptionLabel?: (m: M) => string },
>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<
  Subtract<T, MultiModelSelectInjectedProps<M>> & WithMultiModelSelectProps<M, G>
> => {
  const C = withModelSelect<M, true, G, T>(Component);

  const convertMultiOptions = (options: MultiValue<ModelSelectOption<M>>): M["id"][] =>
    map(options, (o: ModelSelectOption<M>) => ui.select.toSelectModel(o).id);

  const WithMultiModelSelect = (
    props: Subtract<T, MultiModelSelectInjectedProps<M>> & WithMultiModelSelectProps<M, G>,
  ): JSX.Element => (
    <C
      {...(props as T & { readonly onChange?: (ms: M["id"][]) => void })}
      isMulti={true}
      onChange={(newValue: MultiValue<ModelSelectOption<M>>) =>
        props.onChange?.(convertMultiOptions(newValue))
      }
    />
  );
  return hoistNonReactStatics(WithMultiModelSelect, React.memo(Component));
};

export type ModelAsyncSelectInjectedProps<M extends Model.Model> = {
  readonly processResponse: (response: Http.ListResponse<M>) => ModelSelectOption<M>[];
};

export const withModelAsyncSelect = <
  M extends Model.Model,
  T extends ModelAsyncSelectInjectedProps<M> = ModelAsyncSelectInjectedProps<M>,
>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<Subtract<T, ModelAsyncSelectInjectedProps<M>>> => {
  const WithModelAsyncSelect = (
    props: Subtract<T, ModelAsyncSelectInjectedProps<M>>,
  ): JSX.Element => (
    <Component
      defaultOptions={true}
      {...(props as T)}
      processResponse={(rsp: Http.ListResponse<M>) =>
        map(rsp.data, (d: M) => ui.select.toModelSelectOption(d))
      }
    />
  );
  return hoistNonReactStatics(WithModelAsyncSelect, React.memo(Component));
};

export type MultiModelSyncSelectInjectedProps<M extends Model.Model> = {
  readonly value: MultiValue<ModelSelectOption<M>>;
  readonly defaultValue: MultiValue<ModelSelectOption<M>>;
  readonly options: ModelSelectOption<M>[];
};

export type WithMultiModelSyncSelectProps<M extends Model.Model> = {
  readonly options: M[];
  readonly value?: M["id"][];
  readonly defaultValue?: M["id"][];
};

export const withMultiModelSyncSelect = <
  M extends Model.Model,
  T extends MultiModelSyncSelectInjectedProps<M> = MultiModelSyncSelectInjectedProps<M>,
>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<
  Subtract<T, MultiModelSyncSelectInjectedProps<M>> & WithMultiModelSyncSelectProps<M>
> => {
  const WithMultiModelSyncSelect = (
    props: Subtract<T, MultiModelSyncSelectInjectedProps<M>> & WithMultiModelSyncSelectProps<M>,
  ): JSX.Element => {
    const { value, defaultValue, options, ...rest } = props;

    const pass = { ...rest } as Omit<
      Subtract<T, MultiModelSyncSelectInjectedProps<M>>,
      "value" | "defaultValue" | "options"
    >;

    const { value: convertedValue } = ui.select.useMultiModelSelect<M>({ value, options });
    const { value: convertedDefaultValue } = ui.select.useMultiModelSelect<M>({
      value: defaultValue,
      options,
    });
    return (
      <Component
        {...(pass as T)}
        value={convertedValue}
        defaultValue={convertedDefaultValue}
        options={map(options, (o: M) => ({ ...o, id: String(o.id) })) as ModelSelectOption<M>[]}
      />
    );
  };
  return hoistNonReactStatics(WithMultiModelSyncSelect, React.memo(Component));
};

export type MultiModelAsyncSelectInjectedProps<M extends Model.Model> =
  ModelAsyncSelectInjectedProps<M> & {
    readonly value: MultiValue<ModelSelectOption<M>> | undefined;
    readonly onResponse: (response: Http.ListResponse<M>) => void;
  };

export type WithMultiModelAsyncSelectProps<M extends Model.Model> = {
  readonly value?: M["id"][];
  readonly onResponse?: (response: Http.ListResponse<M>) => void;
};

export const withMultiModelAsyncSelect = <
  M extends Model.Model,
  T extends MultiModelAsyncSelectInjectedProps<M> = MultiModelAsyncSelectInjectedProps<M>,
>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<
  Subtract<T, MultiModelAsyncSelectInjectedProps<M>> & WithMultiModelAsyncSelectProps<M>
> => {
  const C = withModelAsyncSelect<M, T>(Component);

  const WithMultiModelAsyncSelect = (
    props: Subtract<T, MultiModelAsyncSelectInjectedProps<M>> & WithMultiModelAsyncSelectProps<M>,
  ): JSX.Element => {
    const { value, onResponse } = ui.select.useMultiModelSelect<M>({
      value: props.value,
      isAsync: true,
    });
    return (
      <C
        defaultOptions={true}
        {...(props as T)}
        value={value}
        onResponse={(rsp: Http.ListResponse<M>) => {
          onResponse(rsp);
          props.onResponse?.(rsp);
        }}
      />
    );
  };
  return hoistNonReactStatics(WithMultiModelAsyncSelect, React.memo(Component));
};

export type SingleModelAsyncSelectInjectedProps<M extends Model.Model> =
  ModelAsyncSelectInjectedProps<M> & {
    readonly value: SingleValue<ModelSelectOption<M>>;
    readonly onResponse: (response: Http.ListResponse<M>) => void;
  };

export type WithSingleModelAsyncSelectProps<M extends Model.Model> = {
  readonly value?: M["id"] | null;
  readonly onResponse?: (response: Http.ListResponse<M>) => void;
};

export const withSingleModelAsyncSelect = <
  M extends Model.Model,
  T extends SingleModelAsyncSelectInjectedProps<M> = SingleModelAsyncSelectInjectedProps<M>,
>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<
  Subtract<T, SingleModelAsyncSelectInjectedProps<M>> & WithSingleModelAsyncSelectProps<M>
> => {
  const C = withModelAsyncSelect<M, T>(Component);

  const WithSingleModelAsyncSelect = (
    props: Subtract<T, SingleModelAsyncSelectInjectedProps<M>> & WithSingleModelAsyncSelectProps<M>,
  ): JSX.Element => {
    const { value, onResponse } = ui.select.useSingleModelSelect<M>({
      value: props.value,
      isAsync: true,
    });
    return (
      <C
        defaultOptions={true}
        {...(props as T)}
        value={value}
        onResponse={(rsp: Http.ListResponse<M>) => {
          onResponse(rsp);
          props.onResponse?.(rsp);
        }}
      />
    );
  };
  return hoistNonReactStatics(WithSingleModelAsyncSelect, React.memo(Component));
};

export type SingleModelSyncSelectInjectedProps<M extends Model.Model> = {
  readonly value: SingleValue<ModelSelectOption<M>>;
  readonly defaultValue: SingleValue<ModelSelectOption<M>>;
  readonly options: ModelSelectOption<M>[];
};

export type WithSingleModelSyncSelectProps<M extends Model.Model> = {
  readonly options: M[];
  readonly value?: M["id"] | null;
  readonly defaultValue?: M["id"] | null;
};

export const withSingleModelSyncSelect = <
  M extends Model.Model,
  T extends SingleModelSyncSelectInjectedProps<M> = SingleModelSyncSelectInjectedProps<M>,
>(
  Component: React.FunctionComponent<T>,
): React.FunctionComponent<
  Subtract<T, SingleModelSyncSelectInjectedProps<M>> & WithSingleModelSyncSelectProps<M>
> => {
  const WithSingleModelSyncSelect = (
    props: Subtract<T, SingleModelSyncSelectInjectedProps<M>> & WithSingleModelSyncSelectProps<M>,
  ): JSX.Element => {
    const { value } = ui.select.useSingleModelSelect<M>({
      value: props.value,
      options: props.options,
    });
    const { value: defaultValue } = ui.select.useSingleModelSelect<M>({
      value: props.defaultValue,
      options: props.options,
    });
    return (
      <Component
        {...({
          ...props,
          value,
          defaultValue,
          options: map(props.options, (o: M) => ({
            ...o,
            id: String(o.id),
          })) as ModelSelectOption<M>[],
        } as T)}
      />
    );
  };
  return hoistNonReactStatics(WithSingleModelSyncSelect, React.memo(Component));
};
