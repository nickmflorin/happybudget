import React, { useMemo } from "react";
import { isNil, find } from "lodash";

import { tabling, ui } from "lib";
import { Icon } from "components";

interface FormLabelContentProps {
  readonly columnType?: Table.ColumnTypeId;
  readonly children: React.ReactNode | undefined;
}

const FormLabelContent = ({ columnType, ...props }: FormLabelContentProps): JSX.Element => {
  const cType: Table.ColumnType | undefined = useMemo(() => {
    return !isNil(columnType) ? find(tabling.models.ColumnTypes, obj => obj.id === columnType) : undefined;
  }, [columnType]);

  return (
    <React.Fragment>
      {!isNil(cType) && !isNil(cType.icon) && (
        <div className={"icon-wrapper"}>
          {ui.typeguards.iconIsJSX(cType.icon) ? cType?.icon : <Icon icon={cType.icon} weight={"regular"} />}
        </div>
      )}
      {props.children}
    </React.Fragment>
  );
};

export default FormLabelContent;
