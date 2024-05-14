import { FindAll } from './../../memo/dto/memo.dto';
import { BaseRespone } from 'src/common/InterfaceBase';
/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Query, Post, Put, Delete } from '@nestjs/common';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';
import { NotebookService } from './notebook.service';
import { AddNoteBook } from '../dto/noteList.dto';

@Controller('notebook')
export class NotebookController {

    constructor(private readonly notebookService: NotebookService) { }

    /**
     * 查询用户
     * @param userId 
     * @param isDefault 
     */
    @Get('findall')
    async FindAllCon(@Query('userId') userId: string, @Query('isDefault') isDefault: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        let isDefault1 = Number(isDefault)
        const FindAllConData = await this.notebookService.FindAll(userId, isDefault1)
        return ResultUtils.success(FindAllConData)
    }

    /**
     * 新增加笔记本
     * @param data 
     */
    @Post('add')
    async AddCon(@Body() data: AddNoteBook): Promise<BaseRespone<any>> {
        if (data.userId == null || data.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const AddConData = await this.notebookService.Add(data.userId, data.notebookName, data.notebookDescription, data.isDefault)
        if (!AddConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(AddConData)
    }

    /**
     * 修改笔记本的基本信息
     * @param notebookName 
     * @param notebookDescription 
     * @param _id 
     * @param userId 
     */
    @Put('update')
    async UpdateCon(
        @Query('notebookName') notebookName: string,
        @Query('notebookDescription') notebookDescription: string,
        @Query('_id') _id: string,
        @Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const UpdateDate = await this.notebookService.Update(_id, userId, notebookName, notebookDescription)
        if (!UpdateDate) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库修改失败')
        }
        return ResultUtils.success(UpdateDate)
    }


    /**
     * 删除笔记本
     * @param _id 
     * @returns 
     */
    @Put('delete')
    async DeleteCon(@Query('_id') _id: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const DeleteConData = await this.notebookService.Delete(_id)
        if (!DeleteConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(DeleteConData)
    }


}
