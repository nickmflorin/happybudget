import { formatMessage } from "./inject";
import * as types from "./types";

export type IMessage<
  P extends Record<string, unknown>,
  F extends types.MessageFormatters<P> = types.MessageFormatters<P>,
> = {
  format: (params?: Partial<P> | undefined, options?: types.InjectMessageOptions<P, F>) => string;
};

class MessageObj<
  P extends Record<string, unknown>,
  F extends types.MessageFormatters<P> = types.MessageFormatters<P>,
> implements IMessage<P, F>
{
  private readonly _data: types.MessageData;
  private readonly _options: types.MessageOptions<P, F>;

  constructor(data: types.MessageData, options?: types.MessageOptions<P, F>) {
    this._data = data;
    this._options = options || {};
  }

  public format = (params?: Partial<P> | undefined, options?: types.InjectMessageOptions<P>) =>
    formatMessage(this._data, params, { ...this._options, ...options });
}

/**
 * Creates a representation of a formattable string, {@link string}, or set of strings,
 * {@link string[]}, that may or may not be accompanied by options that dictate how parameters
 * are injected into the string, {@link string}, or set of strings, {@link string[]}.
 *
 * @param {MessageData} data The string or set of strings that will be formatted.
 * @param {MessageOptions<P>} options Options that dictate the formatting of the string.
 */
export const Message = <
  P extends Record<string, unknown>,
  F extends types.MessageFormatters<P> = types.MessageFormatters<P>,
>(
  data: types.MessageData,
  options?: types.MessageOptions<P, F>,
) => new MessageObj<P, F>(data, options);
