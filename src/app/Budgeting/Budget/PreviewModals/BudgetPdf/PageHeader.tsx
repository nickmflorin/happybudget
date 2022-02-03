import React from "react";
import { useMemo } from "react";
import { isNil } from "lodash";
import { SourceObject } from "@react-pdf/types";

import { View, Text, RichText, Image } from "components/pdf";

type SubHeaderItemImage = {
  readonly image: string;
};

type SubHeaderItemInfo = {
  readonly info: Pdf.HTMLNode[];
};

type SubHeaderImageAndInfo = {
  readonly image: string;
  readonly info: Pdf.HTMLNode[];
};

type SubHeaderItem = SubHeaderItemImage | SubHeaderItemInfo | SubHeaderImageAndInfo;

const subHeaderItemHasImage = (item: SubHeaderItem): item is SubHeaderImageAndInfo | SubHeaderItemImage => {
  return (item as SubHeaderImageAndInfo | SubHeaderItemImage).image !== undefined;
};

const subHeaderItemHasInfo = (item: SubHeaderItem): item is SubHeaderImageAndInfo | SubHeaderItemInfo => {
  return (item as SubHeaderImageAndInfo | SubHeaderItemInfo).info !== undefined;
};

interface PageHeaderProps {
  readonly header: PdfBudgetTable.Options["header"];
  readonly date: PdfBudgetTable.Options["date"];
}

const PageHeader = (props: PageHeaderProps): JSX.Element => {
  /* Note: We cannot use hooks with @react-pdf components, in particular because
     of the render callbacks. */
  let subHeaderLeft: SubHeaderItem | null = null;
  const leftInfoMissing = isNil(props.header.left_info) || props.header.left_info.length === 0;
  if (!(leftInfoMissing && isNil(props.header.left_image))) {
    if (!isNil(props.header.left_info)) {
      subHeaderLeft = { info: props.header.left_info };
    }
    if (!isNil(props.header.left_image)) {
      subHeaderLeft = {
        ...subHeaderLeft,
        image: props.header.left_image.url
      };
    }
  }

  /* Note: We cannot use hooks with @react-pdf components, in particular because
		 of the render callbacks. */
  let subHeaderRight: SubHeaderItem | null = null;
  const rightInfoMissing = isNil(props.header.right_info) || props.header.right_info.length === 0;
  if (!(rightInfoMissing && isNil(props.header.right_image))) {
    if (!isNil(props.header.right_info)) {
      subHeaderRight = { info: props.header.right_info };
    }
    if (!isNil(props.header.right_image)) {
      subHeaderRight = {
        ...subHeaderRight,
        image: props.header.right_image.url
      };
    }
  }

  const getImageSrc = useMemo(
    () =>
      (image: string): SourceObject => {
        let headers = {};
        if (process.env.NODE_ENV === "production") {
          /* We need to include Cache-Control headers in the passed in src object
					   because there is a bug with React PDF as it relates to AWS.
						 However, if we include these locally, we get a CORS error. */
          headers = { ...headers, "Cache-Control": "no-cache", "Access-Control-Allow-Origin": "*" };
        }
        return {
          uri: image,
          method: "GET",
          body: "",
          headers
        };
      },
    []
  );

  return (
    <React.Fragment>
      <View className={"budget-page-primary-header"}>
        <RichText nodes={props.header.header} />
        <Text className={"budget-page-date"}>{props.date}</Text>
      </View>
      {(!isNil(subHeaderLeft) || !isNil(subHeaderRight)) && (
        <View className={"budget-page-sub-header"}>
          {!isNil(subHeaderLeft) && (
            <View className={"budget-page-sub-header-left"}>
              {subHeaderItemHasImage(subHeaderLeft) && (
                <Image className={"budget-page-sub-header-image"} src={getImageSrc(subHeaderLeft.image)} />
              )}
              {subHeaderItemHasInfo(subHeaderLeft) && (
                <RichText className={"budget-page-sub-header-rich-text"} nodes={subHeaderLeft.info} />
              )}
            </View>
          )}
          {!isNil(subHeaderRight) && (
            <View className={"budget-page-sub-header-right"}>
              {subHeaderItemHasImage(subHeaderRight) && (
                <Image className={"budget-page-sub-header-image"} src={getImageSrc(subHeaderRight.image)} />
              )}
              {subHeaderItemHasInfo(subHeaderRight) && (
                <RichText className={"budget-page-sub-header-rich-text"} nodes={subHeaderRight.info} />
              )}
            </View>
          )}
        </View>
      )}
    </React.Fragment>
  );
};

export default PageHeader;
