import { useState } from "react";
import classNames from "classnames";
import { AxiosResponse } from "axios";
import { isNil } from "lodash";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { Upload } from "antd";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUpload } from "@fortawesome/pro-light-svg-icons";

import { client } from "api";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";

import { RenderOrSpinner } from "components";

import "./UploadUserImage.scss";

interface UploadUserImageProps extends StandardComponentProps {
  onChange: (file: File | Blob) => void;
  onError: (error: string) => void;
  initialValue?: string | null;
}

const UploadUserImage = ({
  initialValue = undefined,
  className,
  style = {},
  onChange,
  onError
}: UploadUserImageProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(initialValue || null);

  return (
    <Upload
      name={"avatar"}
      listType={"picture-card"}
      className={classNames("user-image-uploader", className)}
      style={style}
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
          if (!isNil(info.file.response) && !isNil(info.file.originFileObj)) {
            setImageUrl(info.file.response.fileUrl);
            onChange(info.file.originFileObj);
          }
        }
      }}
      customRequest={(options: UploadRequestOption<any>) => {
        const requestBody = new FormData();
        requestBody.append("image", options.file);
        client
          .upload<Http.FileUploadResponse>("/v1/users/temp_upload_user_image/", requestBody)
          .then((response: AxiosResponse<Http.FileUploadResponse>) => {
            !isNil(options.onSuccess) && options.onSuccess(response.data, response.request);
          })
          .catch((e: Error) => {
            // TODO: Improve error handling here.
            !isNil(options.onError) && options.onError(e);
          });
      }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={"avatar"} style={{ width: "100%" }} />
      ) : (
        <RenderOrSpinner size={24} loading={loading}>
          <div className={"upload-indicator"}>
            <FontAwesomeIcon className={"icon"} icon={faUpload} />
          </div>
        </RenderOrSpinner>
      )}
    </Upload>
  );
};

export default UploadUserImage;
