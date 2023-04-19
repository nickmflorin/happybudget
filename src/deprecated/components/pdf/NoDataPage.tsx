import React, { useMemo } from "react";

import { isNil } from "lodash";

import { BasePage, View } from "./primitive";
import { Text } from "./text";

const NoDataPage = (props: Pdf.NoDataDocumentProps): JSX.Element => {
  const text = useMemo<string | null>(() => {
    if (!isNil(props.text) && props.text !== true) {
      return typeof props.text === "string" ? props.text : null;
    }
    return "No Data";
  }, [props.text]);
  return (
    <BasePage {...props}>
      <View className="page-no-data-content">
        {/* @react-pdf does not play well with boolean values for children (i.e.
				in this case, `false` if we did props.withText !== false && ...) */}
        {text !== null ? (
          <Text className="page-no-data-text">{text}</Text>
        ) : (
          <React.Fragment></React.Fragment>
        )}
      </View>
    </BasePage>
  );
};

export default React.memo(NoDataPage);
