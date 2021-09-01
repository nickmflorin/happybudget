import React, { useMemo } from "react";
import { isNil, find } from "lodash";

import { FormItemProps } from "antd/lib/form";
import { tabling, ui } from "lib";

import { Icon } from "components";
import FormItem from "./FormItem";

interface FormColumnItemProps extends FormItemProps {
  readonly columnType: Table.ColumnTypeId;
}

const FormColumnItem = (props: FormColumnItemProps): JSX.Element => {
  const columnType: Table.ColumnType | undefined = useMemo(() => {
    return find(tabling.models.ColumnTypes, obj => obj.id === props.columnType);
  }, [props.columnType]);

  const label = useMemo(() => {
    return (
      <React.Fragment>
        {!isNil(columnType) && !isNil(columnType.icon) && (
          <div className={"icon-wrapper"}>
            {ui.typeguards.iconIsJSX(columnType.icon) ? (
              columnType?.icon
            ) : (
              <Icon icon={columnType.icon} weight={"regular"} />
            )}
          </div>
        )}
        {props.label}
      </React.Fragment>
    );
  }, [props.columnType]);

  return <FormItem {...props} className={"form-column-item"} label={label} />;
};

export default FormColumnItem;
