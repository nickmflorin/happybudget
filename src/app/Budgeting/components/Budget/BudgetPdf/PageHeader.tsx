import { isNil } from "lodash";

import { View, RichText, Image } from "components/pdf";

type SubHeaderItemImage = {
  readonly image: UploadedImage | SavedImage;
};

type SubHeaderItemInfo = {
  readonly info: RichText.Block[];
};

type SubHeaderImageAndInfo = {
  readonly image: UploadedImage | SavedImage;
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
  readonly header: Omit<HeaderTemplateFormData, "name">;
}

const PageHeader = (props: PageHeaderProps): JSX.Element => {
  // Note: We cannot use hooks with @react-pdf components, in particular because of the
  // render callbacks.
  let subHeaderLeft: SubHeaderItem | null = null;
  const leftInfoMissing = isNil(props.header.left_info) || props.header.left_info.length === 0;
  if (!(leftInfoMissing && isNil(props.header.left_image))) {
    if (!isNil(props.header.left_info)) {
      subHeaderLeft = { info: props.header.left_info };
    }
    if (!isNil(props.header.left_image)) {
      subHeaderLeft = {
        ...subHeaderLeft,
        image: props.header.left_image
      };
    }
  }
  // Note: We cannot use hooks with @react-pdf components, in particular because of the
  // render callbacks.
  let subHeaderRight: SubHeaderItem | null = null;
  const rightInfoMissing = isNil(props.header.right_info) || props.header.right_info.length === 0;
  if (!(rightInfoMissing && isNil(props.header.right_image))) {
    if (!isNil(props.header.right_info)) {
      subHeaderRight = { info: props.header.right_info };
    }
    if (!isNil(props.header.right_image)) {
      subHeaderRight = {
        ...subHeaderRight,
        image: props.header.right_image
      };
    }
  }

  return (
    <View className={"budget-page-header"}>
      {!isNil(props.header.header) && (
        <View className={"budget-page-primary-header"}>
          <RichText blocks={props.header.header} />
        </View>
      )}
      {(!isNil(subHeaderLeft) || !isNil(subHeaderRight)) && (
        <View className={"budget-page-sub-header"}>
          {!isNil(subHeaderLeft) && (
            <View className={"budget-page-sub-header-left"}>
              {subHeaderItemHasImage(subHeaderLeft) && (
                // @ts-ignore React-PDF does not like the ArrayBuffer vs. Buffer, even though it works fine.
                <Image className={"budget-page-sub-header-image"} src={subHeaderLeft.image.data} />
              )}
              {subHeaderItemHasInfo(subHeaderLeft) && (
                <RichText className={"budget-page-sub-header-rich-text"} blocks={subHeaderLeft.info} />
              )}
            </View>
          )}
          {!isNil(subHeaderRight) && (
            <View className={"budget-page-sub-header-right"}>
              {subHeaderItemHasImage(subHeaderRight) && (
                // @ts-ignore React-PDF does not like the ArrayBuffer vs. Buffer, even though it works fine.
                <Image className={"budget-page-sub-header-image"} src={subHeaderRight.image.data} />
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
