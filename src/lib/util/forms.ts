export const payloadToFormData = <T extends { [key: string]: any } = { [key: string]: any }>(data: T): FormData => {
  const formData = new FormData();
  Object.keys(data).forEach((key: string) => {
    const value: any | undefined = data[key as keyof T];
    if (value !== undefined) {
      formData.append(key, value);
    }
  });
  return formData;
};
