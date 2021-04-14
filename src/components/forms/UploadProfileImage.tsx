import { useState } from "react";
import { AxiosResponse } from "axios";
import { isNil } from "lodash";
import { UploadRequestOption } from "rc-upload/lib/interface";
import { Upload } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";

import { client } from "api";
import { UploadChangeParam } from "antd/lib/upload";
import { UploadFile } from "antd/lib/upload/interface";

interface UploadProfileImageProps {
  onChange: (file: File | Blob) => void;
  onError: (error: string) => void;
  initialValue: string | undefined;
}

const UploadProfileImage = ({ initialValue = undefined, onChange, onError }: UploadProfileImageProps): JSX.Element => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | undefined>(initialValue);

  return (
    <Upload
      name={"avatar"}
      listType={"picture-card"}
      className={"avatar-uploader"}
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
        <div>
          {loading ? <LoadingOutlined /> : <PlusOutlined />}
          <div style={{ marginTop: 8 }}>{"Upload"}</div>
        </div>
      )}
    </Upload>
  );
};

export default UploadProfileImage;
