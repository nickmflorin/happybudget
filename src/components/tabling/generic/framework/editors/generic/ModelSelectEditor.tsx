import { ForwardedRef, forwardRef } from "react";
import { isNil } from "lodash";

import useModelMenuEditor, { UseModelMenuEditorParams } from "./useModelMenuEditor";
import GenericModelMenuEditor, { GenericModelMenuEditorProps } from "./GenericModelMenuEditor";

export interface ModelSelectEditorProps<
  C extends Model.Model,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
> extends GenericModelMenuEditorProps<C, C, R, M, S>,
    UseModelMenuEditorParams<C, R, M, S>,
    StandardComponentProps {
  readonly models: C[];
  readonly tagProps?: Omit<TagProps<C>, "children" | "model" | "text">;
}

/* eslint-disable indent */
const ModelSelectEditor = <
  C extends Model.Model,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
>(
  { models, ...props }: ModelSelectEditorProps<C, R, M, S>,
  ref: ForwardedRef<any>
) => {
  const [editor] = useModelMenuEditor<C, C, R, M, S>({ ...props, forwardedRef: ref });

  return (
    <GenericModelMenuEditor<C, C, R, M, S>
      {...props}
      className={props.className}
      editor={editor}
      selected={!isNil(editor.value) ? editor.value.id : []}
      onChange={(params: MenuChangeEvent<C>) => editor.onChange(params.model, params.event)}
      models={models}
    />
  );
};

export default forwardRef(ModelSelectEditor) as {
  <
    C extends Model.Model,
    R extends Table.RowData = Table.RowData,
    M extends Model.Model = Model.Model,
    S extends Redux.TableStore<R, M> = Redux.TableStore<R, M>
  >(
    props: ModelSelectEditorProps<C, R, M, S> & { ref: ForwardedRef<any> }
  ): JSX.Element;
};
