import { PageSize } from "@react-pdf/types";

import { BasePage, View } from "./primitive";
import { Text } from "./text";

interface PageProps extends StandardPdfComponentProps {
  readonly size?: PageSize;
  readonly debug?: boolean;
}

const NoDataPage = (props: PageProps): JSX.Element => {
  return (
    <BasePage {...props}>
      <View className={"page-no-data-content"}>
        <Text className={"page-no-data-text"}>{"No Data"}</Text>
      </View>
    </BasePage>
  );
};

export default NoDataPage;
