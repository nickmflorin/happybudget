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
import { RenderWithSpinner, Image } from "components";

import "./Uploader.scss";

const ACCCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];
const MAX_IMAGE_SIZE = 2; // In MB

interface UploaderContentProps extends Omit<StandardComponentProps, "id"> {
  readonly imageStyle?: React.CSSProperties;
  readonly imageClassName?: string;
  readonly error: UploadError | null;
  readonly data: UploadedData | null;
  readonly original: Model.Image | null;
  readonly loading: boolean;
  readonly onClear: () => void;
  readonly renderContent?: (params: UploadFileParams, original: Model.Image | null) => JSX.Element;
  readonly renderContentNoError?: (params: UploadFileParamsNoError, original: Model.Image | null) => JSX.Element;
  readonly renderImage?: (params: UploadFileParamsWithData | Model.Image) => JSX.Element;
  readonly renderNoImage?: (params: UploadFileParamsNoData) => JSX.Element;
  readonly renderError?: (e: Error | string, original: Model.Image | null) => JSX.Element;
}

const UploaderContent = (props: UploaderContentProps): JSX.Element => {
  const baseParams: Pick<UploadFileParams, "loading" | "onClear" | "source"> = {
    loading: props.loading,
    onClear: props.onClear,
    source: "upload"
  };
  if (!isNil(props.renderContent)) {
    if (!isNil(props.error)) {
      return props.renderContent({ error: props.error, ...baseParams }, props.original);
    } else if (!isNil(props.data)) {
      return props.renderContent({ data: props.data, ...baseParams }, props.original);
    }
    return props.renderContent({ ...baseParams }, props.original);
  } else if (!isNil(props.error)) {
    return !isNil(props.renderError) ? (
      props.renderError(props.error, props.original)
    ) : (
      <div className={classNames("upload-indicator", props.className)} style={props.style}>
        <FontAwesomeIcon className={"icon"} icon={faExclamationCircle} />
      </div>
    );
  } else if (!isNil(props.renderContentNoError)) {
    if (!isNil(props.data)) {
      return props.renderContentNoError({ data: props.data, ...baseParams }, props.original);
    }
    return props.renderContentNoError({ ...baseParams }, props.original);
  } else {
    const data: UploadedData | null = props.data;
    const image: Model.Image | null = props.original;
    if (!isNil(data)) {
      return !isNil(props.renderImage) ? (
        props.renderImage({ data, ...baseParams })
      ) : (
        <Image className={props.imageClassName} src={data.url} style={{ width: "100%", ...props.imageStyle }} />
      );
    } else if (!isNil(image)) {
      return !isNil(props.renderImage) ? (
        props.renderImage(image)
      ) : (
        <Image className={props.imageClassName} src={image.url} style={{ width: "100%", ...props.imageStyle }} />
      );
    } else if (!isNil(props.renderNoImage)) {
      return props.renderNoImage({ ...baseParams });
    } else {
      return (
        <div className={classNames("upload-indicator", props.className)} style={props.style}>
          <FontAwesomeIcon className={"icon"} icon={faUpload} />
        </div>
      );
    }
  }
};

export interface UploaderProps
  extends Omit<UploaderContentProps, "data" | "error" | "loading" | "onClear" | "original"> {
  readonly contentStyle?: React.CSSProperties;
  readonly contentClassName?: string;
  readonly initialValue?: Model.Image | null;
  readonly showLoadingIndicator?: boolean;
  readonly original?: Model.Image | null;
  readonly onChange: (params: UploadedData | null) => void;
  readonly onError: (error: Error | string) => void;
  readonly hoverOverlay?: (params: { visible: boolean; children: () => JSX.Element }) => JSX.Element;
}

const Uploader = (
  {
    className,
    style,
    contentStyle,
    contentClassName,
    hoverOverlay,
    showLoadingIndicator = true,
    onChange,
    onError,
    original,
    ...props
  }: UploaderProps,
  ref: ForwardedRef<IUploaderRef>
): JSX.Element => {
  const [error, setError] = useState<Error | string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadData, setUploadData] = useState<UploadedData | null>(null);

  const _onError = (e: string | Error) => {
    setError(e);
    onError(e);
  };

  const _setUploadData = (params: UploadedData | null) => {
    setUploadData(params);
    onChange(params);
  };

  useImperativeHandle(ref, () => ({
    clear: () => {
      setError(null);
      setLoading(false);
      _setUploadData(null);
    }
  }));

  return (
    <div className={classNames("image-uploader", className)} style={style}>
      <Upload
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
                  _setUploadData({
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
          <UploaderContent
            className={contentClassName}
            style={contentStyle}
            original={original || null}
            data={uploadData}
            error={error}
            loading={loading}
            onClear={() => {
              setError(null);
              setLoading(false);
              _setUploadData(null);
            }}
            {...props}
          />
        </RenderWithSpinner>
      </Upload>
    </div>
  );
};

export default forwardRef(Uploader);
