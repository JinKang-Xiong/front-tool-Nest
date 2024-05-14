import { HttpException } from '@nestjs/common'
import { ErrorCode } from 'src/common/ErrorCode';

export class BusinessException extends HttpException {

    private _description: string;
    public get description(): string {
        return this._description;
    }
    public set description(value: string) {
        this._description = value;
    }
    constructor(errorCode: ErrorCode)
    constructor(errorCode: ErrorCode, description: string)

    constructor(errorCode: ErrorCode, description?: string) {
        super(errorCode.message, errorCode.code)
        this._description = errorCode.description || description
    }



}