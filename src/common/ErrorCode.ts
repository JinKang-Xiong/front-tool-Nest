export class ErrorCode {

    private _code: number;
    public get code(): number {
        return this._code;
    }
    public set code(value: number) {
        this._code = value;
    }
    private _message: string;
    public get message(): string {
        return this._message;
    }
    public set message(value: string) {
        this._message = value;
    }
    private _description: string;
    public get description(): string {
        return this._description;
    }
    public set description(value: string) {
        this._description = value;
    }

    static SUCCESS = new ErrorCode(0, 'OK', '成功');
    static PARAM_NULL = new ErrorCode(40000, '请求参数为空', '');
    static PARAM_NULL_SER = new ErrorCode(4000, "服务层参数为空", '')
    static PARAM_ERROR = new ErrorCode(40001, '请求参数错误', '');
    static PARAM_ERROR_SER = new ErrorCode(40001, "服务层参数错误", '')
    static NO_LOGIN = new ErrorCode(40100, '未登录', '');
    static SYSYTEN_ERROR = new ErrorCode(50000, '系统错误', '')

    constructor(code: number, message: string, description: string) {
        this._code = code;
        this._message = message;
        this._description = description;
    }



}
