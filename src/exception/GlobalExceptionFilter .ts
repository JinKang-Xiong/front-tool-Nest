import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from '@nestjs/common';
import { BusinessException } from './BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';

@Catch(BusinessException, HttpException)
export class GlobalExceptionFilter implements ExceptionFilter {
    catch(exception: BusinessException | HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();

        if (exception instanceof BusinessException) {
            // 处理 BusinessException
            response.status(HttpStatus.BAD_REQUEST).json({
                code: exception.getStatus(),
                message: exception.getResponse(),
                description: exception.description,
            });
        } else if (exception instanceof HttpException) {
            // 处理 HttpException
            response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                code: ErrorCode.SYSYTEN_ERROR,
                message: exception.message,
                description: '',
            });
        }
    }
}