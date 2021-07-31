import { useState, forwardRef, useImperativeHandle, ForwardedRef } from "react";
import classNames from "classnames";
import { AxiosResponse } from "axios";
import { isNil, includes } from "lodash";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { Upload } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faExclamationCircle } from "@fortawesome/pro-light-svg-icons";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";

import * as api from "api";
import { fileSizeInMB, getBase64 } from "lib/util/files";
import { RenderWithSpinner, Image, ShowHide } from "components";
import { ImageClearButton } from "components/buttons";

import "./Uploader.scss";
import { useEffect } from "react";

const ACCCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 2; // In MB

interface UploaderImageProps extends StandardComponentProps {
  readonly image: UploadedImage | SavedImage;
}

const UploaderImage = (props: UploaderImageProps): JSX.Element => {
  return (
    <div className={"uploader-image-wrapper"}>
      <Image className={props.className} src={props.image.url} style={{ width: "100%", ...props.style }} />
    </div>
  );
};

interface UploaderContentProps extends Omit<StandardComponentProps, "id"> {
  readonly imageStyle?: React.CSSProperties;
  readonly imageClassName?: string;
  readonly error: UploadError | null;
  readonly image: UploadedImage | SavedImage | null;
  readonly loading: boolean;
  readonly onClear: () => void;
  readonly renderContent?: (params: UploadImageParams) => JSX.Element;
  readonly renderContentNoError?: (params: UploadImageParams) => JSX.Element;
  readonly renderImage?: (params: UploadImageParams) => JSX.Element;
  readonly renderNoImage?: (params: UploadImageParamsNoImage) => JSX.Element;
  readonly renderError?: (params: UploadImageParams) => JSX.Element;
}

const UploaderContent = (props: UploaderContentProps): JSX.Element => {
  const params: UploadImageParamsNoImage = {
    loading: props.loading,
    onClear: props.onClear,
    error: props.error
  };
  if (!isNil(props.renderContent)) {
    if (!isNil(props.image)) {
      return props.renderContent({ ...params, image: props.image });
    }
    return props.renderContent(params);
  } else if (!isNil(props.error)) {
    return !isNil(props.renderError) ? (
      props.renderError(params)
    ) : (
      <div className={classNames("upload-indicator", props.className)} style={props.style}>
        <FontAwesomeIcon className={"icon"} icon={faExclamationCircle} />
      </div>
    );
  } else if (!isNil(props.renderContentNoError)) {
    if (!isNil(props.image)) {
      return props.renderContentNoError({ ...params, image: props.image });
    }
    return props.renderContentNoError(params);
  } else {
    if (!isNil(props.image)) {
      return !isNil(props.renderImage) ? (
        props.renderImage(params)
      ) : (
        <UploaderImage className={props.imageClassName} image={props.image} style={props.imageStyle} />
      );
    } else if (!isNil(props.renderNoImage)) {
      return props.renderNoImage(params);
    } else {
      return (
        <div className={classNames("upload-indicator", props.className)} style={props.style}>
          <FontAwesomeIcon className={"icon"} icon={faUpload} />
        </div>
      );
    }
  }
};

export interface UploaderProps extends Omit<UploaderContentProps, "data" | "error" | "loading" | "image" | "onClear"> {
  readonly contentStyle?: React.CSSProperties;
  readonly contentClassName?: string;
  readonly initialValue?: SavedImage | null;
  readonly showLoadingIndicator?: boolean;
  readonly value?: SavedImage | UploadedImage | null;
  readonly showClear?: boolean;
  readonly imageClearButtonProps?: StandardComponentProps;
  readonly onClear?: () => void;
  readonly onChange: (params: UploadedImage | null) => void;
  readonly onError: (error: Error | string) => void;
  readonly hoverOverlay?: (params: { visible: boolean; children: () => JSX.Element }) => JSX.Element;
}

const Uploader = (
  {
    className,
    style,
    contentStyle,
    contentClassName,
    showLoadingIndicator = true,
    value,
    showClear,
    imageClearButtonProps,
    hoverOverlay,
    onChange,
    onError,
    onClear,
    ...props
  }: UploaderProps,
  ref: ForwardedRef<IUploaderRef>
): JSX.Element => {
  const [error, setError] = useState<Error | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [image, _setImage] = useState<UploadedImage | SavedImage | null>(null);

  const _onError = (e: string | Error) => {
    setError(e);
    onError(e);
  };

  const _onClear = () => {
    setError(null);
    setLoading(false);
    setImage(null);
    onClear?.();
  };

  const setImage = (img: UploadedImage | null) => {
    _setImage(img);
    onChange(img);
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      setError(null);
      setLoading(false);
      setImage(null);
    }
  }));

  useEffect(() => {
    if (value !== undefined) {
      _setImage(value);
    }
  }, [value]);

  return (
    <div className={classNames("image-uploader", className)} style={style}>
      <Upload
        className={classNames("image-uploader-upload", { "with-image": !isNil(image) })}
        name={"avatar"}
        listType={"picture-card"}
        showUploadList={false}
        beforeUpload={(file: File) => {
          if (!includes(ACCCEPTED_IMAGE_TYPES, file.type)) {
            _onError(
              `${file.type} is not an acceptable image type.  Must be one of ${ACCCEPTED_IMAGE_TYPES.join(", ")}.`
            );
            return false;
          } else if (fileSizeInMB(file) > 2) {
            _onError(`The image must be smaller than ${MAX_IMAGE_SIZE}MB.`);
            return false;
          }
          return true;
        }}
        onChange={(info: UploadChangeParam<UploadFile<Http.FileUploadResponse>>) => {
          if (info.file.status === "uploading") {
            setLoading(true);
            setError(null);
          } else if (info.file.status === "error") {
            setLoading(false);
            _onError(info.file.error || "Unknown upload error.");
          } else if (info.file.status === "done") {
            setLoading(false);
            const response: Http.FileUploadResponse | undefined = info.file.response;
            const file: File | undefined = info.file.originFileObj;
            if (!isNil(file) && !isNil(response)) {
              getBase64(file)
                .then((data: ArrayBuffer | string) => {
                  setImage({
                    url: response.fileUrl,
                    file,
                    name: info.file.name,
                    fileName: info.file.fileName,
                    size: info.file.size,
                    data
                  });
                })
                .catch((e: Error) => {
                  /* eslint-disable no-console */
                  console.error(e);
                  _onError("Uploaded file was corrupted.");
                });
            }
          }
        }}
        customRequest={(options: UploadRequestOption<any>) => {
          const requestBody = new FormData();
          requestBody.append("image", options.file);
          api
            .tempUploadImage(requestBody)
            .then((response: AxiosResponse<Http.FileUploadResponse>) => {
              !isNil(options.onSuccess) && options.onSuccess(response.data, response.request);
            })
            .catch((e: Error) => {
              // TODO: Improve error handling here.
              !isNil(options.onError) && options.onError(e);
            });
        }}
      >
        <RenderWithSpinner size={24} loading={loading && showLoadingIndicator}>
          <ShowHide show={!isNil(image) && showClear === true}>
            <ImageClearButton
              {...imageClearButtonProps}
              style={{ position: "absolute", top: -17, right: -17, ...imageClearButtonProps?.style }}
              onClick={(e: React.MouseEvent<any>) => {
                e.stopPropagation();
                e.preventDefault();
                _onClear();
              }}
            />
          </ShowHide>
          <UploaderContent
            className={contentClassName}
            style={contentStyle}
            image={image}
            error={error}
            loading={loading}
            onClear={_onClear}
            {...props}
          />
        </RenderWithSpinner>
      </Upload>
    </div>
  );
};

export default forwardRef(Uploader);
