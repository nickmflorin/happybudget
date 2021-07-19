import { useState, useMemo } from "react";
import classNames from "classnames";
import { AxiosResponse } from "axios";
import { isNil } from "lodash";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { Upload } from "antd";
import { UploadProps } from "antd/lib/upload";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/pro-light-svg-icons";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";

import * as api from "api";

import { RenderWithSpinner, Image } from "components";

import "./Uploader.scss";

interface UploaderContentProps {
  readonly imageUrl: string | null;
  readonly renderContent?: (imageUrl: string | null) => JSX.Element;
  readonly renderImage?: (imageUrl: string) => JSX.Element;
  readonly renderNoImage?: () => JSX.Element;
}

const UploaderContent = (props: UploaderContentProps): JSX.Element => {
  const imageComponent = useMemo<JSX.Element | null>(() => {
    if (!isNil(props.imageUrl)) {
      return !isNil(props.renderImage) ? (
        props.renderImage(props.imageUrl)
      ) : (
        <Image src={props.imageUrl} alt={"avatar"} style={{ width: "100%" }} />
      );
    }
    return null;
  }, [props.renderImage, props.imageUrl]);

  if (!isNil(props.renderContent)) {
    return props.renderContent(props.imageUrl);
  } else if (!isNil(imageComponent)) {
    return imageComponent;
  } else if (!isNil(props.renderNoImage)) {
    return props.renderNoImage();
  }
  return (
    <div className={"upload-indicator"}>
      <FontAwesomeIcon className={"icon"} icon={faUpload} />
    </div>
  );
};

export interface UploaderProps extends Omit<UploadProps, "onChange" | "beforeUpload" | "customRequest"> {
  readonly onChange: (file: File | Blob) => void;
  readonly onError: (error: string) => void;
  readonly initialValue?: string | null;
  readonly renderContent?: (imageUrl: string | null) => JSX.Element;
  readonly renderImage?: (imageUrl: string) => JSX.Element;
  readonly renderNoImage?: () => JSX.Element;
  readonly hoverOverlay?: (params: { visible: boolean; children: () => JSX.Element }) => JSX.Element;
}

const Uploader = ({
  className,
  style,
  renderContent,
  renderImage,
  renderNoImage,
  hoverOverlay,
  initialValue = undefined,
  onChange,
  onError,
  ...props
}: UploaderProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialValue || null);

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
          } else if (info.file.status === "done") {
            setLoading(false);
            if (!isNil(info.file.response) && !isNil(info.file.originFileObj)) {
              setImageUrl(info.file.response.fileUrl);
              onChange(info.file.originFileObj);
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
        {...props}
      >
        <RenderWithSpinner size={24} loading={loading}>
          <UploaderContent
            imageUrl={imageUrl}
            renderContent={renderContent}
            renderImage={renderImage}
            renderNoImage={renderNoImage}
          />
        </RenderWithSpinner>
      </Upload>
    </div>
  );
};

export default Uploader;
