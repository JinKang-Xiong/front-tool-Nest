/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Query, Post, Put, Get } from '@nestjs/common';
import { FastopenstoreService } from './fastopenstore.service';
import { promises } from 'dns';
import { BaseRespone } from 'src/common/InterfaceBase';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';
import { AddFastStore } from './dto/fastopenstore.dto';

@Controller('fastopenstore')
export class FastopenstoreController {
    constructor(private readonly fastopenService: FastopenstoreService) { }


    /**
     * 查询用户的快捷仓库
     * @param userId 
     */
    @Get('findbyuser')
    async FindByUserCon(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const dataCon = await this.fastopenService.FindByUser(userId)
        return ResultUtils.success(dataCon)

    }


    @Post('add')
    async AddAndUpdateCon(@Body() data: AddFastStore): Promise<BaseRespone<any>> {
        if (data.userId == null || data.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const dataCon = await this.fastopenService.AddAndUpdate(data.store, data.userId, data._id)
        if (!dataCon) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(dataCon)
    }

    /**
     * 移出快捷仓库中的代码库
     */
    @Put('update')
    async UpdateStoreCon(@Query('_id') _id: string, @Query('mark') mark: string, @Query('storeId') storeId: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || mark == null || mark == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const dataCon = await this.fastopenService.UpdateStore(_id, Number(mark), storeId)
        return dataCon
    }


    /**
     * 查询公共资源和私有资源的数量
     * @param userId 
     * @returns 
     */
    @Get('resourcetotal')
    async CountPrivateTotalByUserCon(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const data = await this.fastopenService.CountPrivateTotalByUser(userId)
        return ResultUtils.success(data)
    }

    /**
     * 统计用户每月创建资源的总数
     * @param userId 
     * @param year 
     * @returns 
     */
    @Get('createtotal')
    async CountCreateTotalByMonthCon(@Query('userId') userId: string, @Query('year') year: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const data = await this.fastopenService.CountCreateTotalByMonth(userId, Number(year))
        return ResultUtils.success(data)

    }

    /**
     * 统计未归档小灵的比例
     * @param userId 
     */
    @Get('memototal')
    async CountMemo(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const data = await this.fastopenService.CountMemo(userId)
        return ResultUtils.success(data)
    }


}
