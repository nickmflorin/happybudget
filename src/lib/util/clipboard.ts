// Support for older browsers.
const fallbackCopyTextToClipboard = (
  text: string,
  onSuccess?: () => void,
  onCopyError?: (e: Error | string) => void
) => {
  const textArea = document.createElement("textarea");
  textArea.value = text;

  textArea.style.top = "0";
  textArea.style.left = "0";
  textArea.style.position = "fixed";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const successful = document.execCommand("copy");
    if (successful === false) {
      onCopyError?.("There was an error copying the text to the clipboard.");
    } else {
      onSuccess?.();
    }
  } catch (e: unknown) {
    onCopyError?.(e as Error);
  }
  document.body.removeChild(textArea);
};

export const copyTextToClipboard = (
  text: string,
  onSuccess?: () => void,
  onCopyError?: (e: Error | string) => void
): void => {
  if (!navigator.clipboard) {
    fallbackCopyTextToClipboard(text);
    return;
  }
  navigator.clipboard
    .writeText(text)
    .then(() => onSuccess?.())
    .catch((e: Error) => onCopyError?.(e));
};
