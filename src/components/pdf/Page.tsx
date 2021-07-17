import { isNil } from "lodash";

import { View, BasePage } from "./primitive";
import { BasePageProps } from "./primitive/Page";
import { Label } from "./text";

interface PageProps extends BasePageProps {
  readonly header?: JSX.Element | null;
  readonly footer?: JSX.Element | null;
}

const Page = ({ header, footer, children, ...props }: PageProps): JSX.Element => {
  return (
    <BasePage {...props}>
      {!isNil(header) ? (
        <View className={"page-header"} wrap={false}>
          {header}
        </View>
      ) : (
        <></>
      )}
      <View className={"page-content"}>{!isNil(children) ? children : <></>}</View>
      {!isNil(footer) ? (
        <View className={"page-footer"} wrap={false}>
          {footer}
        </View>
      ) : (
        <></>
      )}
      <View className={"page-footer"} wrap={false}>
        <Label
          fixed={true}
          className={"page-number"}
          render={(params: Pdf.PageRenderParams) => `Page ${params.pageNumber}`}
        />
      </View>
    </BasePage>
  );
};

export default Page;
