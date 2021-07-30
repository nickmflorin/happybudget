import { isNil } from "lodash";

import { getBase64 } from "lib/util/files";
import { View, RichText, Image } from "components/pdf";

type SubHeaderItemImage = {
  readonly image: ArrayBuffer | string | Promise<ArrayBuffer | string>;
};

type SubHeaderItemInfo = {
  readonly info: RichText.Block[];
};

type SubHeaderImageAndInfo = {
  readonly image: ArrayBuffer | string | Promise<ArrayBuffer | string | void>;
  readonly info: RichText.Block[];
};

type SubHeaderItem = SubHeaderItemImage | SubHeaderItemInfo | SubHeaderImageAndInfo;

const subHeaderItemHasImage = (item: SubHeaderItem): item is SubHeaderImageAndInfo | SubHeaderItemImage => {
  return (item as SubHeaderImageAndInfo | SubHeaderItemImage).image !== undefined;
};

const subHeaderItemHasInfo = (item: SubHeaderItem): item is SubHeaderImageAndInfo | SubHeaderItemInfo => {
  return (item as SubHeaderImageAndInfo | SubHeaderItemInfo).info !== undefined;
};

interface PageHeaderProps {
  readonly options: PdfBudgetTable.Options;
}

const PageHeader = (props: PageHeaderProps): JSX.Element => {
  // Note: We cannot use hooks with @react-pdf components, in particular because of the
  // render callbacks.
  let subHeaderLeft: SubHeaderItem | null = null;
  if (!(props.options.leftInfo.length === 0 && isNil(props.options.leftImage))) {
    if (isNil(props.options.leftImage)) {
      subHeaderLeft = { info: props.options.leftInfo };
    } else {
      subHeaderLeft = {
        info: props.options.leftInfo,
        image: getBase64(props.options.leftImage).catch((e: Error) => {
          /* eslint-disable no-console */
          console.error(e);
        })
      };
    }
  }
  // Note: We cannot use hooks with @react-pdf components, in particular because of the
  // render callbacks.
  let subHeaderRight: SubHeaderItem | null = null;
  if (!(props.options.rightInfo.length === 0 && isNil(props.options.rightImage))) {
    if (isNil(props.options.rightImage)) {
      subHeaderRight = { info: props.options.rightInfo };
    } else {
      subHeaderRight = {
        info: props.options.rightInfo,
        image: getBase64(props.options.rightImage).catch((e: Error) => {
          /* eslint-disable no-console */
          console.error(e);
        })
      };
    }
  }

  return (
    <View className={"budget-page-header"}>
      {!isNil(props.options.header) && (
        <View className={"budget-page-primary-header"}>
          <RichText blocks={props.options.header} />
        </View>
      )}
      {(!isNil(subHeaderLeft) || !isNil(subHeaderRight)) && (
        <View className={"budget-page-sub-header"}>
          {!isNil(subHeaderLeft) && (
            <View className={"budget-page-sub-header-left"}>
              {subHeaderItemHasImage(subHeaderLeft) && (
                //  @ts-ignore React-PDF does not like the ArrayBuffer vs. Buffer, even though it works fine.
                <Image className={"budget-page-sub-header-image"} src={subHeaderLeft.image} />
              )}
              {subHeaderItemHasInfo(subHeaderLeft) && (
                <RichText className={"budget-page-sub-header-rich-text"} blocks={subHeaderLeft.info} />
              )}
            </View>
          )}
          {!isNil(subHeaderRight) && (
            <View className={"budget-page-sub-header-right"}>
              {subHeaderItemHasImage(subHeaderRight) && (
                //  @ts-ignore React-PDF does not like the ArrayBuffer vs. Buffer, even though it works fine.
                <Image className={"budget-page-sub-header-image"} src={subHeaderRight.image} />
              )}
              {subHeaderItemHasInfo(subHeaderRight) && (
                <RichText className={"budget-page-sub-header-rich-text"} blocks={subHeaderRight.info} />
              )}
            </View>
          )}
        </View>
      )}
    </View>
  );
};

export default PageHeader;
