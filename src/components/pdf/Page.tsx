import { ReactNode } from "react";
import { Page as ReactPDFPage } from "@react-pdf/renderer";
import classNames from "classnames";
import { PageSize } from "@react-pdf/types";

import { mergeStylesFromClassName } from "style/pdf";
import Text from "./Text";
import View from "./View";

interface PageProps extends StandardPdfComponentProps {
  readonly size?: PageSize;
  readonly children: ReactNode;
  readonly debug?: boolean;
  readonly title?: string;
  readonly subTitle?: string;
}

const Page = (props: PageProps): JSX.Element => {
  return (
    <ReactPDFPage
      size={props.size || "A4"}
      debug={props.debug}
      style={{ ...mergeStylesFromClassName(classNames("page", props.className)), ...props.style }}
      wrap={true}
    >
      <View className={"page-header"} fixed={true}>
        <Text className={"page-header-title"}>{props.title}</Text>
        <Text className={"page-header-subtitle"}>{props.subTitle}</Text>
      </View>
      <View className={"page-content"}>{props.children}</View>
      <Text
        fixed={true}
        className={"page-footer-page-no-text"}
        render={(params: { pageNumber: number }) => `Page ${params.pageNumber}`}
      />
    </ReactPDFPage>
  );
};

export default Page;
