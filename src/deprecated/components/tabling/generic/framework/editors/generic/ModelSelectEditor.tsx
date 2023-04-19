import { ForwardedRef, forwardRef } from "react";

import { isNil } from "lodash";

import GenericModelMenuEditor, { GenericModelMenuEditorProps } from "./GenericModelMenuEditor";
import useModelMenuEditor, { UseModelMenuEditorParams } from "./useModelMenuEditor";

export interface ModelSelectEditorProps<
  CM extends Model.HttpModel,
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
> extends GenericModelMenuEditorProps<CM, CM, R, M, C, S>,
    UseModelMenuEditorParams<CM, R, M, C, S>,
    StandardComponentProps {
  readonly models: CM[];
  readonly tagProps?: Omit<TagProps<CM>, "children" | "model" | "text">;
}

const ModelSelectEditor = <
  CM extends Model.HttpModel,
  R extends Table.RowData,
  M extends model.RowTypedApiModel = model.RowTypedApiModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>,
>(
  { models, ...props }: ModelSelectEditorProps<CM, R, M, C, S>,
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  ref: ForwardedRef<any>,
) => {
  const [editor] = useModelMenuEditor<CM, CM, R, M, C, S>({ ...props, forwardedRef: ref });

  return (
    <GenericModelMenuEditor<CM, CM, R, M, C, S>
      {...props}
      className={props.className}
      editor={editor}
      selected={!isNil(editor.value) ? editor.value.id : []}
      onChange={(params: MenuChangeEvent<MenuItemSelectedState, CM>) =>
        editor.onChange(params.model, params.event)
      }
      models={models}
    />
  );
};

export default forwardRef(ModelSelectEditor) as {
  <
    CM extends Model.HttpModel,
    R extends Table.RowData,
    M extends model.RowTypedApiModel = model.RowTypedApiModel,
    C extends Table.Context = Table.Context,
    S extends Redux.TableStore<R> = Redux.TableStore<R>,
  >(
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    props: ModelSelectEditorProps<CM, R, M, C, S> & { ref: ForwardedRef<any> },
  ): JSX.Element;
};
