// @volontariapp/errors est ESM uniquement et inutilisable sous Jest (voir jest.setup.js).
class MockBaseError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
  }
}

export class BadRequestError extends MockBaseError {}
export class UnauthorizedError extends MockBaseError {}
export class ForbiddenError extends MockBaseError {}
export class NotFoundError extends MockBaseError {}
export class ConflictError extends MockBaseError {}
export class InternalServerError extends MockBaseError {}
export class UnprocessableEntityError extends MockBaseError {}
export class TooManyRequestsError extends MockBaseError {}
