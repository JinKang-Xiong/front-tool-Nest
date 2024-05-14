import { BaseRespone } from "./InterfaceBase"
import { ErrorCode } from "./ErrorCode"
/**
 * 统一的返回方法
 */
export class ResultUtils {

    /**
     * 成功的返回结果
     * @param data 
     */



    static success<T>(data: T): BaseRespone<T> {
        return {
            code: 0,
            data: data,
            message: 'OK',
            description: ''
        }
    }

    static suceess<T>(data: T, description: string): BaseRespone<T> {
        return {
            code: 0,
            data: data,
            message: '',
            description: description
        }
    }
    /**
     * 返回警告
     * @param data 
     * @param description 
     * @returns 
     */
    static warn<T>(data: T): BaseRespone<T> {
        return {
            code: 1,
            data: data,
            message: '请检查参数',
            description: ''
        }
    }


    /**
     * 失败的返回效果
     */

    static error<T>(errorcode: ErrorCode): BaseRespone<T> {
        return {
            code: errorcode.code,
            data: null,
            message: errorcode.message,
            description: errorcode.description

        }
    }
}