/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { CollectnoteService } from './collectnote.service';
import { BaseRespone } from 'src/common/InterfaceBase';
import { CollectNote } from '../schemas/collectnote.schema';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';
import { InsertCollectNote, InsertCollectNoteManager, UpdateCollectNote } from '../dto/noteList.dto';

@Controller('collectnote')
export class CollectnoteController {

    constructor(private readonly collectnoteService: CollectnoteService) { }

    /**
     * 查询用户的收藏关系表
     * @param userId 
     * @returns 
     */
    @Get('find')
    async FindCollectNoteCon(@Query('userId') userId: string): Promise<BaseRespone<CollectNote>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const FindCollectConData = await this.collectnoteService.FindCollectNote(userId)
        return ResultUtils.success(FindCollectConData)
    }

    /**
     * 新增加收藏夹得功能
     * @param collectData 
     * @returns 
     */
    @Post('addcollect')
    async AddCollectNoteCon(@Body() collectData: InsertCollectNote): Promise<BaseRespone<any>> {
        if (collectData.userId == null || collectData.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const AddCollectConData = await this.collectnoteService.AddCollectNote(collectData.userId, collectData.collectName, collectData.collectDescription)
        if (!AddCollectConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库插入失败")
        }
        return ResultUtils.success(AddCollectConData)
    }



    /**
     * 查询用户收藏的代码片段
     * @param userId 
     */
    @Get('findnote')
    async FindNoteCons(@Query('userId') userId: string, @Query('_id') _id: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '' || _id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const FindCodeSnippetConData = await this.collectnoteService.FindByNoteSnippet(_id, userId)
        return ResultUtils.success(FindCodeSnippetConData)
    }


    /**
     * 增加代码关系表 and 代码片段表中的数据加1
     * @param colllect 
     * @returns 
     */
    @Post('addnote')
    async AddNoteCon(@Body() colllect: InsertCollectNoteManager): Promise<BaseRespone<any>> {
        if (colllect.noteId == null || colllect.noteId == '' || colllect.userId == null || colllect.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const AddConData = await this.collectnoteService.AddNoteSnipeet(colllect.userId, colllect.noteId, colllect.collectNumber, colllect._id)
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
    async UpdateCollectNoteCon(@Query('_id') _id: string, @Query('userId') userId: string, @Query('noteId') noteId: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const DataCon = await this.collectnoteService.UpdateNoteCollect(_id, userId, noteId)
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
    async UpdateNameAndDescCon(@Body() updateData: UpdateCollectNote): Promise<BaseRespone<any>> {
        if (updateData._id == null || updateData._id == '' || updateData.userId == null || updateData.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const UpdateNameAndDescConData = await this.collectnoteService.UpdateNameAndDes(updateData._id, updateData.userId, updateData.collectName, updateData.collectDescription)
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
        const UpdateDeleteStatusData = await this.collectnoteService.UpdateDeleteStatus(_id, userId)
        if (!UpdateDeleteStatusData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库修改失败')
        }
        return ResultUtils.success(UpdateDeleteStatusData)
    }

}
