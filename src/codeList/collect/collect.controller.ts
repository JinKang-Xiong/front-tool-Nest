import { async } from 'rxjs';
import { BaseRespone } from 'src/common/InterfaceBase';
/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Query, Post, Put } from '@nestjs/common';
import { CollectService } from './collect.service';
import { Collect } from '../schemase/collect.schema';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';
import { InsertCollect, InsertCollectSnippet, UpdateCollect } from '../dto/collect.dto';

@Controller('collect')
export class CollectController {
    constructor(private readonly collectService: CollectService) { }

    /**
     * 查询用户的收藏关系表
     * @param userId 
     * @returns 
     */
    @Get('find')
    async FindCollectCon(@Query('userId') userId: string): Promise<BaseRespone<Collect>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const FindCollectConData = await this.collectService.FindCollect(userId)
        return ResultUtils.success(FindCollectConData)
    }

    /**
     * 新增加收藏夹得功能
     * @param collectData 
     * @returns 
     */
    @Post('addcollect')
    async AddCollectCon(@Body() collectData: InsertCollect): Promise<BaseRespone<any>> {
        if (collectData.userId == null || collectData.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const AddCollectConData = await this.collectService.AddCollect(collectData.userId, collectData.collectName, collectData.collectDescription)
        if (!AddCollectConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库插入失败")
        }
        return ResultUtils.success(AddCollectConData)
    }



    /**
     * 查询用户收藏的代码片段
     * @param userId 
     */
    @Get('findcodeSnippet')
    async FindCodeSnippetCons(@Query('userId') userId: string, @Query('_id') _id: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '' || _id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const FindCodeSnippetConData = await this.collectService.FindByCodeSnippet(_id, userId)
        return ResultUtils.success(FindCodeSnippetConData)
    }


    /**
     * 增加代码关系表 and 代码片段表中的数据加1
     * @param colllect 
     * @returns 
     */
    @Post('addcodesnippet')
    async AddCodeSnippetCon(@Body() colllect: InsertCollectSnippet): Promise<BaseRespone<any>> {
        if (colllect.codeuuid == null || colllect.codeuuid == '' || colllect.userId == null || colllect.userId == '' || colllect.codeId == null || colllect.codeId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const AddConData = await this.collectService.AddCodeSnipeet(colllect.userId, colllect.codeId, colllect.codeuuid, colllect.collectNumber, colllect._id)
        if (!AddConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库查询失败")
        }
        return ResultUtils.success(AddConData)
    }

    /**
     * 取消收藏得功能
     * @param _id 
     * @param userId 
     * @param codeId 
     */
    @Put('cancel')
    async UpdateCollectCodeSnippetCon(@Query('_id') _id: string, @Query('userId') userId: string, @Query('codeId') codeId: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const DataCon = await this.collectService.UpdateCodeSnippetCollect(_id, userId, codeId)
        if (!DataCon) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库修改失败")
        }

        return ResultUtils.success(DataCon)

    }

    /**
     * 修改收藏夹
     * @param updateData 
     */
    @Post('updatename')
    async UpdateNameAndDescCon(@Body() updateData: UpdateCollect): Promise<BaseRespone<any>> {
        if (updateData._id == null || updateData._id == '' || updateData.userId == null || updateData.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const UpdateNameAndDescConData = await this.collectService.UpdateNameAndDes(updateData._id, updateData.userId, updateData.collectName, updateData.collectDescription)
        if (!UpdateNameAndDescConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库修改失败")
        }

        return ResultUtils.success(UpdateNameAndDescConData)
    }

    /**
     * 删除收藏夹
     * @param _id 
     * @param userId 
     * @returns 
     */
    @Put('delete')
    async UpdateDeleteStatus(@Query('_id') _id: string, @Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const UpdateDeleteStatusData = await this.collectService.UpdateDeleteStatus(_id, userId)
        if (!UpdateDeleteStatusData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库修改失败')
        }
        return ResultUtils.success(UpdateDeleteStatusData)
    }

}
