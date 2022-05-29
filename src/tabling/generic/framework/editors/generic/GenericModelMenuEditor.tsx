import React from "react";
import { ModelTagsMenu, ModelTagsMenuProps } from "components/menus";
import { IEditor } from "./useModelMenuEditor";

export interface GenericModelMenuEditorProps<
  V extends Table.RawRowValue,
  CM extends Model.HttpModel,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.EditorProps<R, M, C, S, V | null>,
    ModelTagsMenuProps<CM, MenuItemSelectedState>,
    StandardComponentProps {
  readonly searchIndices?: SearchIndicies;
  readonly editor: IEditor<V, CM, R, M, C, S>;
  readonly tagProps?: Omit<TagProps<CM>, "children" | "model" | "text">;
}

const GenericModelMenuEditor = <
  V extends Table.RawRowValue,
  CM extends Model.HttpModel,
  R extends Table.RowData,
  M extends Model.RowHttpModel = Model.RowHttpModel,
  C extends Table.Context = Table.Context,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>(
  props: GenericModelMenuEditorProps<V, CM, R, M, C, S>
) => {
  return (
    <ModelTagsMenu<CM>
      clientSearching={true}
      {...props}
      menu={props.editor.menu}
      includeSearch={true}
      focusSearchOnCharPress={true}
    />
  );
};

export default React.memo(GenericModelMenuEditor) as typeof GenericModelMenuEditor;
