import { forwardRef, useState, useEffect, useMemo, useImperativeHandle, ForwardedRef } from "react";
import { isNil } from "lodash";
import { DatePicker } from "components/fields";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

type DateEditorProps = Table.EditorParams<Tables.ActualRowData, Model.Actual>;

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
const DateEditor = (props: DateEditorProps, ref: ForwardedRef<any>): JSX.Element => {
  const [date, setDate] = useState<Date | null>(!isNil(props.value) ? new Date(props.value) : null);
  const [editing, setEditing] = useState(true);

  useEffect(() => {
    if (!editing) {
      props.api?.stopEditing();
    }
  }, [editing]);

  useImperativeHandle(ref, () => {
    return {
      getValue: () => {
        return date;
      },
      isCancelBeforeStart() {
        return props.keyPress === KEY_BACKSPACE || props.keyPress === KEY_DELETE;
      },
      isCancelAfterEnd() {
        return false;
      }
    };
  });

  const onChange = useMemo(
    () => (selectedDate: Date | null) => {
      setDate(selectedDate);
      setEditing(false);
    },
    [setDate, setEditing]
  );

  return <DatePicker selected={date} dateFormat={"dd/MM/yyyy"} onChange={onChange} inline />;
};

export default forwardRef(DateEditor);
