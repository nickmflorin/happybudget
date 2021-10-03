import React, { useMemo } from "react";
import { isNil, find } from "lodash";

import { FormItemProps } from "antd/lib/form";
import { tabling, ui } from "lib";

import { Icon } from "components";
import FormItem from "./FormItem";

interface FormColumnItemProps extends FormItemProps {
  readonly columnType: Table.ColumnTypeId;
}

const FormColumnItem = ({ columnType, ...props }: FormColumnItemProps): JSX.Element => {
  const cType: Table.ColumnType | undefined = useMemo(() => {
    return find(tabling.models.ColumnTypes, obj => obj.id === columnType);
  }, [columnType]);

  const label = useMemo(() => {
    return (
      <React.Fragment>
        {!isNil(cType) && !isNil(cType.icon) && (
          <div className={"icon-wrapper"}>
            {ui.typeguards.iconIsJSX(cType.icon) ? cType?.icon : <Icon icon={cType.icon} weight={"regular"} />}
          </div>
        )}
        {props.label}
      </React.Fragment>
    );
  }, [columnType]);

  return <FormItem {...props} className={"form-column-item"} label={label} />;
};

export default FormColumnItem;
