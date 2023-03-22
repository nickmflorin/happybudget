export class FileLoadError extends Error {
  readonly statusCode: number;

  constructor(message: string, options: { statusCode: number }) {
    super(message);
    this.statusCode = options.statusCode;
  }
}

export class InvalidFileExtensionError extends Error {
  constructor(ext: string) {
    super(`The file extension ${ext} is invalid.`);
  }
}

export class InvalidFileNameError extends Error {
  constructor(filename: string) {
    super(`The filename ${filename} is invalid.`);
  }
}
