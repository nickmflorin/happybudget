import { forwardRef, useState, useEffect, useImperativeHandle } from "react";
import { isNil } from "lodash";
import DatePicker from "react-datepicker";

const KEY_BACKSPACE = 8;
const KEY_DELETE = 46;

type DateEditorProps = Table.EditorParams<Tables.ActualRow, Model.Actual>;

const DateEditor = (props: DateEditorProps, ref: any): JSX.Element => {
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

  const onChange = (selectedDate: Date) => {
    setDate(selectedDate);
    setEditing(false);
  };

  return <DatePicker selected={date} dateFormat={"dd/MM/yyyy"} onChange={onChange} inline />;
};

export default forwardRef(DateEditor);