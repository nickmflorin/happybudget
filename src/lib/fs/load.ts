import { errors } from "application";

type LoadFileReturnType<S extends true | undefined> = true extends S ? string : string | null;

type LoadFileOptions<S extends true | undefined> = {
  readonly strict?: S;
  readonly mimeType: string;
};

export const synchronouslyLoadFile = <S extends true | undefined>(
  filePath: string,
  options?: LoadFileOptions<S>,
): LoadFileReturnType<S> => {
  const xmlhttp = new XMLHttpRequest();
  xmlhttp.open("GET", filePath, false);
  if (options?.mimeType !== undefined) {
    if (xmlhttp.overrideMimeType) {
      xmlhttp.overrideMimeType(options?.mimeType);
    }
  }
  xmlhttp.send();
  if (xmlhttp.status == 200 && xmlhttp.readyState == 4) {
    return xmlhttp.responseText;
  } else if (options?.strict) {
    throw new errors.FileLoadError({
      message: `The file at ${filePath} could not be loaded.`,
      statusCode: xmlhttp.status,
    });
  }
  return null as LoadFileReturnType<S>;
};
