import { ValueOf } from '~/libs/types/value-of.type';
import { ApplicationErrorCause } from '~/libs/exceptions/application-error/libs/enums/application-error-cause.enum';

type Constructor = {
  message: string;
  cause: ValueOf<typeof ApplicationErrorCause>;
};

class ApplicationError extends Error {
  public constructor({ message, cause }: Constructor) {
    super(message, {
      cause,
    });
  }
}

export { ApplicationError };
