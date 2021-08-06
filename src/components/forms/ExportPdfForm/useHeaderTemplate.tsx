import { useState, useRef, useMemo, useEffect } from "react";
import { isNil } from "lodash";

import { model, hooks } from "lib";

import "./index.scss";

// Images must be of the UploadedImage form if we are setting the data on the form.
export type HeaderTemplateFormNewData = Omit<HeaderTemplateFormData, "left_image" | "right_image"> & {
  readonly left_image: UploadedImage | null;
  readonly right_image: UploadedImage | null;
};

interface UseHeaderTemplateProps {
  readonly template: Model.HeaderTemplate | null;
  readonly initialValues?: Partial<HeaderTemplateFormData>;
  readonly onValuesChange?: (changedValues: Partial<HeaderTemplateFormData>, values: HeaderTemplateFormData) => void;
}

const useHeaderTemplate = (
  props: UseHeaderTemplateProps
): [HeaderTemplateFormData, (data: Partial<HeaderTemplateFormNewData>) => void] => {
  const bulkChangeContext = useRef(false);
  const queuedChanges = useRef<Partial<HeaderTemplateFormData>>({});

  const [unsavedHeaderBlocks, setUnsavedHeaderBlocks] = useState<RichText.Block[]>(props.initialValues?.header || []);
  const [headerBlocks, _setHeaderBlocks] = useState<RichText.Block[] | null>(null);
  const [unsavedLeftInfoBlocks, setUnsavedLeftInfoBlocks] = useState<RichText.Block[]>(
    props.initialValues?.left_info || []
  );
  const [leftInfoBlocks, _setLeftInfoBlocks] = useState<RichText.Block[] | null>(null);
  const [unsavedRightInfoBlocks, setUnsavedRightInfoBlocks] = useState<RichText.Block[]>(
    props.initialValues?.right_info || []
  );
  const [rightInfoBlocks, _setRightInfoBlocks] = useState<RichText.Block[] | null>(null);
  const [unsavedLeftImage, setUnsavedLeftImage] = useState<UploadedImage | null>(null);
  const [leftImage, _setLeftImage] = useState<UploadedImage | SavedImage | null>(null);
  const [unsavedRightImage, setUnsavedRightImage] = useState<UploadedImage | null>(null);
  const [rightImage, _setRightImage] = useState<UploadedImage | SavedImage | null>(null);

  const flushQueue = () => {
    props.onValuesChange?.(queuedChanges.current, {
      left_image: leftImage,
      right_image: rightImage,
      header: headerBlocks,
      left_info: leftInfoBlocks,
      right_info: rightInfoBlocks,
      ...queuedChanges.current
    });
    queuedChanges.current = {};
    bulkChangeContext.current = false;
  };

  const headerPayload = useMemo(
    (): HeaderTemplateFormData => ({
      left_image: leftImage,
      right_image: rightImage,
      header: headerBlocks,
      left_info: leftInfoBlocks,
      right_info: rightInfoBlocks
    }),
    [leftImage, rightImage, headerBlocks, leftInfoBlocks, rightInfoBlocks]
  );

  const onValuesChange = (changedValues: Partial<HeaderTemplateFormData>, values: HeaderTemplateFormData) => {
    if (bulkChangeContext.current === false) {
      props.onValuesChange?.(changedValues, values);
    } else {
      queuedChanges.current = { ...queuedChanges.current, ...changedValues };
    }
  };

  const setHeaderBlocks = hooks.useDynamicCallback((data: RichText.Block[] | null) => {
    const blocks = !isNil(data) ? data : [];
    if (isNil(props.template)) {
      setUnsavedHeaderBlocks(blocks);
    }
    _setHeaderBlocks(blocks);
    onValuesChange({ header: blocks }, { ...headerPayload, header: blocks });
  });

  const setLeftInfoBlocks = hooks.useDynamicCallback((data: RichText.Block[] | null) => {
    const blocks = !isNil(data) ? data : [];
    if (isNil(props.template)) {
      setUnsavedLeftInfoBlocks(blocks);
    }
    _setLeftInfoBlocks(blocks);
    onValuesChange({ left_info: blocks }, { ...headerPayload, left_info: blocks });
  });

  const setRightInfoBlocks = hooks.useDynamicCallback((data: RichText.Block[] | null) => {
    const blocks = !isNil(data) ? data : [];
    if (isNil(props.template)) {
      setUnsavedRightInfoBlocks(blocks);
    }
    _setRightInfoBlocks(blocks);
    onValuesChange({ right_info: blocks }, { ...headerPayload, right_info: blocks });
  });

  const setLeftImage = (img: SavedImage | UploadedImage | null) => {
    if (isNil(props.template)) {
      // If the image is not associated with an active template, it should still just be an
      // uploaded image (and not a saved image).
      if (!isNil(img) && !model.typeguards.isUploadedImage(img)) {
        throw new Error("If a template is not populated, the image should be of uploaded form.");
      }
      setUnsavedLeftImage(img);
    }
    _setLeftImage(img);
    onValuesChange({ left_image: img }, { ...headerPayload, left_image: img });
  };

  const setRightImage = (img: SavedImage | UploadedImage | null) => {
    if (isNil(props.template)) {
      // If the image is not associated with an active template, it should still just be an
      // uploaded image (and not a saved image).
      if (!isNil(img) && !model.typeguards.isUploadedImage(img)) {
        throw new Error("If a template is not populated, the image should be of uploaded form.");
      }
      setUnsavedRightImage(img);
    }
    _setRightImage(img);
    onValuesChange({ right_image: img }, { ...headerPayload, right_image: img });
  };

  useEffect(() => {
    bulkChangeContext.current = true;
    if (!isNil(props.template)) {
      setHeaderBlocks(props.template.header);
      setLeftInfoBlocks(props.template.left_info);
      setRightInfoBlocks(props.template.right_info);
      setLeftImage(props.template.left_image);
      setRightImage(props.template.right_image);
    } else {
      setHeaderBlocks(unsavedHeaderBlocks);
      setLeftInfoBlocks(unsavedLeftInfoBlocks);
      setRightInfoBlocks(unsavedRightInfoBlocks);
      setRightImage(unsavedRightImage);
      setLeftImage(unsavedLeftImage);
    }
    flushQueue();
  }, [props.template]);

  const setData = (data: Partial<HeaderTemplateFormNewData>) => {
    /* eslint-disable no-unused-vars */
    const mapping: { [key in keyof HeaderTemplateFormNewData]: (value: any) => void } = {
      left_info: setLeftInfoBlocks,
      right_info: setRightInfoBlocks,
      header: setHeaderBlocks,
      left_image: setLeftImage,
      right_image: setRightImage
    };
    bulkChangeContext.current = true;
    Object.keys(data).forEach((key: string) => {
      const setter = mapping[key as keyof HeaderTemplateFormNewData];
      if (!isNil(setter)) {
        const value = data[key as keyof HeaderTemplateFormNewData];
        setter(value);
      }
    });
    flushQueue();
  };

  return [
    {
      left_image: leftImage,
      right_image: rightImage,
      header: headerBlocks,
      left_info: leftInfoBlocks,
      right_info: rightInfoBlocks
    },
    setData
  ];
};

export default useHeaderTemplate;
