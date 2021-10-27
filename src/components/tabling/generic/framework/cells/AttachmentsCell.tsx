import { useMemo } from "react";
import { isNil } from "lodash";

import { AttachmentText } from "components/files";

import { Cell } from "./generic";

interface AttachmentsCellProps<
  R extends Tables.ActualRowData | Tables.SubAccountRowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
> extends Table.CellProps<R, M, S, Model.SimpleAttachment[]> {}

/* eslint-disable indent */
const AttachmentsCell = <
  R extends Tables.ActualRowData | Tables.SubAccountRowData,
  M extends Model.HttpModel = Model.HttpModel,
  S extends Redux.TableStore<R> = Redux.TableStore<R>
>({
  value,
  ...props
}: AttachmentsCellProps<R, M, S>): JSX.Element => {
  const [attachment, additionalCount] = useMemo(() => {
    if (!isNil(value) && value.length !== 0) {
      return [value[0], value.slice(1).length];
    }
    return [null, 0];
  }, [value]);

  return (
    <Cell {...props}>
      <div style={{ display: "flex", justifyContent: "left" }}>
        {!isNil(attachment) && <AttachmentText additionalCount={additionalCount}>{attachment}</AttachmentText>}
      </div>
    </Cell>
  );
};

export default AttachmentsCell;
