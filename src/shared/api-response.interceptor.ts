import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable, map } from "rxjs";
import { isPaginatedResult } from "./api-response";

@Injectable()
export class ApiResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const response = context.switchToHttp().getResponse<{ statusCode: number }>();
    const request = context.switchToHttp().getRequest<{ method: string }>();

    return next.handle().pipe(
      map((result: unknown) => {
        const statusCode = response.statusCode;
        const message = this.successMessage(request.method);

        if (isPaginatedResult(result)) {
          return {
            success: true,
            statusCode,
            message,
            data: result.items,
            meta: {
              page: result.page,
              limit: result.limit,
              total: result.total,
              totalPages: Math.ceil(result.total / result.limit),
            },
          };
        }

        return {
          success: true,
          statusCode,
          message,
          data: result,
        };
      })
    );
  }

  private successMessage(method: string) {
    switch (method) {
      case "GET":
        return "Data fetched successfully";
      case "POST":
        return "Data created successfully";
      case "PUT":
      case "PATCH":
        return "Data updated successfully";
      case "DELETE":
        return "Data deleted successfully";
      default:
        return "Request completed successfully";
    }
  }
}
