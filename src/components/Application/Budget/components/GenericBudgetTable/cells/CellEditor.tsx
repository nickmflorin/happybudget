import { forwardRef, useState, useRef, useImperativeHandle, useEffect } from "react";
import { Input } from "antd";
import { ICellEditorParams } from "ag-grid-community";

const CellEditor = forwardRef((props: ICellEditorParams, ref: any) => {
  const [value, setValue] = useState(props.value.value);
  const refInput = useRef<any>(null);

  useEffect(() => {
    setTimeout(() => refInput.current.focus());
  }, []);

  useImperativeHandle(ref, () => {
    return {
      getValue() {
        return { ...props.value, value };
      },

      isCancelBeforeStart() {
        return false;
      },

      // TODO: Depending on the cell editor type, reject values that are not
      // of the right type (i.e. reject string values for numeric cell types).
      isCancelAfterEnd() {
        return false;
      }
    };
  });

  return (
    <Input
      className={"cell-editor"}
      ref={refInput}
      value={value}
      onChange={event => setValue(event.target.value)}
      style={{ width: "100%" }}
    />
  );
});

export default CellEditor;
