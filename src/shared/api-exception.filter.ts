import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";

type RequestDetails = {
  method?: string;
  originalUrl?: string;
};

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<{
      status: (statusCode: number) => { json: (body: unknown) => void };
    }>();
    const request = host.switchToHttp().getRequest<RequestDetails>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const isServerError = statusCode >= HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isServerError
      ? "Internal server error. Please try again later."
      : this.messageFrom(exceptionResponse);

    if (isServerError) {
      const detail =
        exception instanceof Error ? (exception.stack ?? exception.message) : String(exception);
      this.logger.error(
        `${request.method ?? "UNKNOWN"} ${request.originalUrl ?? ""}`.trim(),
        detail
      );
    }

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      data: null,
    });
  }

  private messageFrom(exceptionResponse: string | object | undefined) {
    if (typeof exceptionResponse === "string") return exceptionResponse;
    if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "message" in exceptionResponse
    ) {
      const message = exceptionResponse.message;
      return Array.isArray(message) ? message.join(", ") : String(message);
    }
    return "Request could not be completed.";
  }
}
