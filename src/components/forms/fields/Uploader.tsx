import { useState, forwardRef, useImperativeHandle, ForwardedRef } from "react";
import classNames from "classnames";
import { AxiosResponse } from "axios";
import { isNil } from "lodash";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { Upload } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload, faExclamationCircle } from "@fortawesome/pro-light-svg-icons";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";

import * as api from "api";

import { RenderWithSpinner, Image } from "components";

import "./Uploader.scss";

interface UploaderContentProps extends Omit<StandardComponentProps, "id"> {
  readonly imageStyle?: React.CSSProperties;
  readonly imageClassName?: string;
  readonly error: UploadError | null;
  readonly data: UploadedData | null;
  readonly loading: boolean;
  readonly onClear: () => void;
  readonly renderContent?: (params: UploadFileParams) => JSX.Element;
  readonly renderContentNoError?: (params: UploadFileParamsNoError) => JSX.Element;
  readonly renderImage?: (params: UploadFileParamsWithData) => JSX.Element;
  readonly renderNoImage?: (params: UploadFileParamsNoData) => JSX.Element;
  readonly renderError?: (e: Error | string) => JSX.Element;
}

const UploaderContent = (props: UploaderContentProps): JSX.Element => {
  const baseParams = { loading: props.loading, onClear: props.onClear };
  if (!isNil(props.renderContent)) {
    if (!isNil(props.error)) {
      return props.renderContent({ error: props.error, ...baseParams });
    } else if (!isNil(props.data)) {
      return props.renderContent({ data: props.data, ...baseParams });
    }
    return props.renderContent({ ...baseParams });
  } else if (!isNil(props.error)) {
    return !isNil(props.renderError) ? (
      props.renderError(props.error)
    ) : (
      <div className={classNames("upload-indicator", props.className)} style={props.style}>
        <FontAwesomeIcon className={"icon"} icon={faExclamationCircle} />
      </div>
    );
  } else if (!isNil(props.renderContentNoError)) {
    if (!isNil(props.data)) {
      return props.renderContentNoError({ data: props.data, ...baseParams });
    }
    return props.renderContentNoError({ ...baseParams });
  } else if (!isNil(props.data)) {
    return !isNil(props.renderImage) ? (
      props.renderImage({ data: props.data, ...baseParams })
    ) : (
      <Image className={props.imageClassName} src={props.data.url} style={{ width: "100%", ...props.imageStyle }} />
    );
  } else if (!isNil(props.renderNoImage)) {
    return props.renderNoImage({ ...baseParams });
  }
  return (
    <div className={classNames("upload-indicator", props.className)} style={props.style}>
      <FontAwesomeIcon className={"icon"} icon={faUpload} />
    </div>
  );
};

export interface UploaderProps extends Omit<UploaderContentProps, "data" | "error" | "loading" | "onClear"> {
  readonly contentStyle?: React.CSSProperties;
  readonly contentClassName?: string;
  readonly initialValue?: string | null;
  readonly showLoadingIndicator?: boolean;
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
    initialValue = undefined,
    onChange,
    onError,
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
          const isJpgOrPng = file.type === "image/jpeg" || file.type === "image/png";
          if (!isJpgOrPng) {
            onError("You can only upload a JPG or PNG file.");
          }
          const isLt2M = file.size / 1024 / 1024 < 2;
          if (!isLt2M) {
            onError("The image must be smaller than 2MB.");
          }
          return isJpgOrPng && isLt2M;
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
            if (isNil(info.file.response) || isNil(info.file.originFileObj)) {
              /* eslint-disable no-console */
              console.error("Could not parse response from upload.");
              _onError("Unknown upload error.");
            } else {
              _setUploadData({
                url: info.file.response.fileUrl,
                file: info.file.originFileObj,
                name: info.file.name,
                fileName: info.file.fileName,
                size: info.file.size
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
