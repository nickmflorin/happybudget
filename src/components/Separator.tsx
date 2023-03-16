import React, { useMemo } from "react";

import classNames from "classnames";
import { isNil } from "lodash";

type SeparatorProps = StandardComponentProps & {
  readonly margin?: string | number;
  readonly color?: string;
};

const Separator: React.FC<SeparatorProps> = ({ style, margin, color, ...props }) => {
  const _style = useMemo(() => {
    let mutatedStyle = { ...style };
    if (!isNil(margin)) {
      mutatedStyle = { ...mutatedStyle, marginTop: margin, marginBottom: margin };
    }
    if (!isNil(color)) {
      mutatedStyle = { ...mutatedStyle, borderBottom: `1px solid ${color}` };
    }
    return mutatedStyle;
  }, [style, margin, color]);

  return <div {...props} className={classNames("separator", props.className)} style={_style}></div>;
};

export default React.memo(Separator);
