import { ForwardedRef, forwardRef } from "react";
import { isNil } from "lodash";

import useModelMenuEditor, { UseModelMenuEditorParams } from "./useModelMenuEditor";
import GenericModelMenuEditor, { GenericModelMenuEditorProps } from "./GenericModelMenuEditor";

export interface ChoiceSelectEditorProps<
  C extends Model.Choice<number, string>,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
> extends GenericModelMenuEditorProps<C, C, R, M, G, S>,
    UseModelMenuEditorParams<C, R, M, G, S>,
    StandardComponentProps {
  readonly models: C[];
  readonly tagProps?: Omit<TagProps<C>, "children" | "model" | "text">;
}

/* eslint-disable indent */
const ChoiceSelectEditor = <
  C extends Model.Choice<number, string>,
  R extends Table.RowData = Table.RowData,
  M extends Model.Model = Model.Model,
  G extends Model.Group = Model.Group,
  S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
>(
  { models, ...props }: ChoiceSelectEditorProps<C, R, M, G, S>,
  ref: ForwardedRef<any>
) => {
  const [editor] = useModelMenuEditor<C, C, R, M, G, S>({ ...props, forwardedRef: ref });

  return (
    <GenericModelMenuEditor<C, C, R, M, G, S>
      {...props}
      className={props.className}
      editor={editor}
      selected={!isNil(editor.value) ? editor.value.id : []}
      onChange={(params: MenuChangeEvent<C>) => editor.onChange(params.model, params.event)}
      models={models}
    />
  );
};

export default forwardRef(ChoiceSelectEditor) as {
  <
    C extends Model.Choice<number, string>,
    R extends Table.RowData = Table.RowData,
    M extends Model.Model = Model.Model,
    G extends Model.Group = Model.Group,
    S extends Redux.TableStore<R, M, G> = Redux.TableStore<R, M, G>
  >(
    props: ChoiceSelectEditorProps<C, R, M, G, S> & { ref: ForwardedRef<any> }
  ): JSX.Element;
};
