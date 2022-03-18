import React, { useMemo } from "react";
import { isNil, find } from "lodash";

import { tabling, ui } from "lib";
import { Icon } from "components";

interface FormLabelContentProps {
  readonly dataType?: Table.ColumnDataTypeId;
  readonly children: React.ReactNode | undefined;
}

const FormLabelContent = ({ dataType, ...props }: FormLabelContentProps): JSX.Element => {
  const cType: Table.ColumnDataType | undefined = useMemo(() => {
    return !isNil(dataType) ? find(tabling.columns.ColumnTypes, obj => obj.id === dataType) : undefined;
  }, [dataType]);

  return (
    <React.Fragment>
      {!isNil(cType) && !isNil(cType.icon) && (
        <div className={"icon-wrapper"}>
          {ui.iconIsJSX(cType.icon) ? cType?.icon : <Icon icon={cType.icon} weight={"regular"} />}
        </div>
      )}
      {props.children}
    </React.Fragment>
  );
};

export default React.memo(FormLabelContent);
