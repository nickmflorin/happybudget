import React from "react";
import { isNil } from "lodash";

import useModelMenuEditor from "../ModelMenuEditor";
import ExpandedModelTagCellEditor from "../ExpandedModelTagCellEditor";

export interface ChoiceCellEditorProps<M extends Model.Model> extends Table.CellEditorParams {
  models: M[];
  searchIndices: SearchIndicies;
  style?: React.CSSProperties;
}

interface _ChoiceCellEditorProps<M extends Model.Model> extends ChoiceCellEditorProps<M> {
  /* eslint-disable react/no-unused-prop-types */
  forwardedRef: any;
}

const ChoiceCellEditor = <M extends Model.Model>({
  models,
  searchIndices,
  style,
  ...props
}: _ChoiceCellEditorProps<M>) => {
  const [editor] = useModelMenuEditor<M>(props);

  return (
    <ExpandedModelTagCellEditor<M>
      editor={editor}
      searchIndices={searchIndices}
      style={style}
      selected={!isNil(editor.value) ? editor.value.id : null}
      onChange={(m: M, e: Table.CellDoneEditingEvent) => editor.onChange(m, e)}
      menuRef={editor.menuRef}
      models={models}
    />
  );
};

export default ChoiceCellEditor;
