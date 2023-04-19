import React from "react";

import classNames from "classnames";
import { map } from "lodash";

import { View } from "deprecated/components/pdf";

interface TableProps extends Pdf.StandardComponentProps {
  readonly generateRows: () => JSX.Element[];
}

const Table = ({ generateRows, ...props }: TableProps): JSX.Element => (
  <View className={classNames(props.className, "table")}>
    {map(generateRows(), (r: JSX.Element, index: number) => (
      <React.Fragment key={index}>{r}</React.Fragment>
    ))}
  </View>
);

export default Table;
