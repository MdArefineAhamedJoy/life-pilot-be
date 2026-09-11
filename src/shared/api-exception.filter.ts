import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse<{
      status: (statusCode: number) => { json: (body: unknown) => void };
    }>();
    const statusCode =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const exceptionResponse =
      exception instanceof HttpException ? exception.getResponse() : undefined;
    const message = this.messageFrom(exceptionResponse, exception);

    response.status(statusCode).json({
      success: false,
      statusCode,
      message,
      data: null,
    });
  }

  private messageFrom(exceptionResponse: string | object | undefined, exception: unknown) {
    if (typeof exceptionResponse === "string") return exceptionResponse;
    if (
      exceptionResponse &&
      typeof exceptionResponse === "object" &&
      "message" in exceptionResponse
    ) {
      const message = exceptionResponse.message;
      return Array.isArray(message) ? message.join(", ") : String(message);
    }
    return exception instanceof Error ? exception.message : "Internal server error";
  }
}
