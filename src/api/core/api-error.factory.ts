import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
  UnprocessableEntityError,
  TooManyRequestsError,
} from '@volontariapp/errors';

export const createApiError = (
  status: number,
  message: string,
  details?: Record<string, unknown>,
): Error => {
  const code = String(status);
  switch (status) {
    case 400:
      return new BadRequestError(message, code, details);
    case 401:
      return new UnauthorizedError(message, code, details);
    case 403:
      return new ForbiddenError(message, code, details);
    case 404:
      return new NotFoundError(message, code, details);
    case 409:
      return new ConflictError(message, code, details);
    case 422:
      return new UnprocessableEntityError(message, code, details);
    case 429:
      return new TooManyRequestsError(message, code, details);
    default:
      return new InternalServerError(message, code, details);
  }
};
