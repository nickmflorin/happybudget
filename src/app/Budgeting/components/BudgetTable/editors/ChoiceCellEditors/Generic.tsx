import { isNil } from "lodash";

import useModelMenuEditor from "../ModelMenuEditor";
import ExpandedModelTagCellEditor from "../ExpandedModelTagCellEditor";

export interface ChoiceCellEditorProps<R extends Table.Row, M extends Model.Model, C extends Model.Model>
  extends Table.CellEditorParams<R, M>,
    StandardComponentProps {
  readonly models: C[];
  readonly searchIndices: SearchIndicies;
  readonly tagProps?: TagProps<C>;
}

interface _ChoiceCellEditorProps<R extends Table.Row, M extends Model.Model, C extends Model.Model>
  extends ChoiceCellEditorProps<R, M, C> {
  /* eslint-disable react/no-unused-prop-types */
  forwardedRef: any;
}

const ChoiceCellEditor = <R extends Table.Row, M extends Model.Model, C extends Model.Model>({
  models,
  searchIndices,
  style,
  tagProps,
  ...props
}: _ChoiceCellEditorProps<R, M, C>) => {
  const [editor] = useModelMenuEditor<R, M, C>(props);

  return (
    <ExpandedModelTagCellEditor<C>
      className={props.className}
      editor={editor}
      searchIndices={searchIndices}
      style={style}
      selected={!isNil(editor.value) ? editor.value.id : null}
      onChange={(m: C, e: Table.CellDoneEditingEvent) => editor.onChange(m, e)}
      menuRef={editor.menuRef}
      models={models}
      tagProps={tagProps}
    />
  );
};

export default ChoiceCellEditor;
