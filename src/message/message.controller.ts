/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Put, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { BaseRespone } from 'src/common/InterfaceBase';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';

@Controller('message')
export class MessageController {
    constructor(private readonly messageService: MessageService) { }

    /**
     * 
     * @param userId 查询用户的全部消息
     * @returns 
     */
    @Get('findall')
    async FindAllCon(@Query("userId") userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == "") {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FindAllData = await this.messageService.FindAll(userId)
        return ResultUtils.success(FindAllData);
    }

    /**
     * 删除用户的全部消息
     * @param userId 
     */
    @Put('deleteall')
    async DeleteAllCon(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == "") {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const DeleteAllData = await this.messageService.DeleteAll(userId)
        if (!DeleteAllData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(DeleteAllData);
    }


    /**
     * 删除单个消息
     * @param _id 
     */
    @Put('deleteone')
    async DeleteOneCon(@Query('userId') userId: string, @Query('_id') _id: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '' || _id == null || _id == "") {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const dataCon = await this.messageService.DeleteOne(userId, _id)
        if (!dataCon) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(dataCon);

    }

    /**
     * 修改全部消息为已读
     * @param userId 
     */
    @Put('updateall')
    async UpdateAllStatusCon(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const updatedata = await this.messageService.UpdateAllStatus(userId)
        if (!updatedata) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(updatedata)
    }

    /**
     * 查询消息的状态
     * @param userId 
     * @returns 
     */
    @Get('findallstatus')
    async FinAllStatusCOn(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == "") {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FindAllData = await this.messageService.FindAllStatus(userId)
        return ResultUtils.success(FindAllData);
    }
}
