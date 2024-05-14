import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { BusinessException } from '../exception/BusinessException';

@Injectable()
export class ErrorLoggingInterceptor implements NestInterceptor {
    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        return next.handle().pipe(
            catchError(error => {
                if (error instanceof BusinessException) {
                    console.error(`BusinessException: message:${error.message},description:${error.description}`);
                } else {
                    console.error('An unexpected error occurred:', error);
                }
                return throwError(error);
            }),
        );
    }
}
