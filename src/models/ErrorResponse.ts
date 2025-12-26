import { plainToClass } from "class-transformer";
import { ValidationError } from "class-validator";

export class ApiError {
  statusCode = 401;
  message = "Unknown error";

  constructor(e: unknown, statusCode?: number, message?: string) {
    console.error(e);
    if (e instanceof Error) {
      this.message = e.message;
    } else if (e instanceof ValidationError) {
      this.message = e.toString();
    }  else if (typeof e === 'string') {
      this.message = e;
    } else if(typeof e === 'object') {
      const err = plainToClass(ApiError, e);
      if(err.message) this.message = err.message;
    }

    if (statusCode) this.statusCode = statusCode;
    if (message) this.message = message;
  }
}
