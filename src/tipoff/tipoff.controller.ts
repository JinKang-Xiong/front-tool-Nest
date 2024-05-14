/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Post, Query, Get } from '@nestjs/common';
import { TipoffService } from './tipoff.service';
import { AddTipBookOff, AddTipNoteOff, AddTipOff, TipOffUpdate } from './dto/tipoff.dto';
import { BaseRespone } from 'src/common/InterfaceBase';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';

@Controller('tipoff')
export class TipoffController {
    constructor(private readonly tipOffService: TipoffService) { }

    /**
     * 增加代码片段反馈
     * @param addTipOff 
     */
    @Post('add')
    async AddCon(@Body() addTipOff: AddTipOff): Promise<BaseRespone<any>> {
        if (addTipOff.userId == null || addTipOff.userId == '' || addTipOff.moduleType == null || addTipOff.moduleType == '' || addTipOff.type == null || addTipOff.type == null || addTipOff.content == null || addTipOff.content == '' || addTipOff.codeId == null || addTipOff.codeId == '' || addTipOff.codeuuid == '' || addTipOff.codeuuid == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const AddConData = await this.tipOffService.Add(addTipOff.userId, addTipOff.username, addTipOff.userAvatarUrl, addTipOff.moduleType, addTipOff.type, addTipOff.content, addTipOff.codeId, addTipOff.codeuuid)
        if (!AddConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(AddConData)
    }

    /**
     * 增加书籍资源反馈
     * @param addTipOff 
     * @returns 
     */
    @Post('addbook')
    async AddBookCon(@Body() addTipOff: AddTipBookOff): Promise<BaseRespone<any>> {
        if (addTipOff.userId == null || addTipOff.userId == '' || addTipOff.moduleType == null || addTipOff.moduleType == '' || addTipOff.type == null || addTipOff.type == null || addTipOff.content == null || addTipOff.content == '' || addTipOff.bookId == null || addTipOff.bookId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const AddConData = await this.tipOffService.AddBook(addTipOff.userId, addTipOff.username, addTipOff.userAvatarUrl, addTipOff.moduleType, addTipOff.type, addTipOff.content, addTipOff.bookId)
        if (!AddConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(AddConData)
    }

    /**
     * 增加笔记的反馈
     * @param addTipOff 
     * @returns 
     */
    @Post('addnote')
    async AddNoteCon(@Body() addTipOff: AddTipNoteOff): Promise<BaseRespone<any>> {
        if (addTipOff.userId == null || addTipOff.userId == '' || addTipOff.moduleType == null || addTipOff.moduleType == '' || addTipOff.type == null || addTipOff.type == "" || addTipOff.content == null || addTipOff.content == '' || addTipOff.noteId == null || addTipOff.noteId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const AddConData = await this.tipOffService.AddNote(addTipOff.userId, addTipOff.username, addTipOff.userAvatarUrl, addTipOff.moduleType, addTipOff.type, addTipOff.content, addTipOff.noteId)
        if (!AddConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(AddConData)
    }


    /**
     * 根据模块和处理情况查询反馈
     * @param moduleType 
     * @param isDisPose 
     * @returns 
     */
    @Get('findall')
    async FindAllCon(@Query('moduleType') moduleType: string, @Query('isDisPose') isDisPose: string, @Query('pageSize') pageSize: string, @Query('pageNumber') pageNumber: string): Promise<BaseRespone<any>> {
        const datacon = await this.tipOffService.FindAll(moduleType, Number(isDisPose), Number(pageSize), Number(pageNumber))
        return ResultUtils.success(datacon)
    }

    /**
     * 根据资源的id和模块查询该资源
     * @param moduleType 
     * @param typeId 
     * @param codeuuid 
     */
    @Get('findbyid')
    async FindAllByIdCon(@Query('moduleType') moduleType: string, @Query('typeId') typeId: string, @Query('isDisPost') isDisPost: string, @Query('codeuuid') codeuuid?: string): Promise<BaseRespone<any>> {
        const datacon = await this.tipOffService.FindById(moduleType, typeId, Number(isDisPost), codeuuid)
        return ResultUtils.success(datacon)
    }

    /**
     * 待审核的封禁和通过
     * @param data 
     */
    @Post('update')
    async UpdateCon(@Body() data: TipOffUpdate): Promise<BaseRespone<any>> {
        if (data._id == null || data._id == '' || data.typeId == null || data.typeId == '' || data.moduleType == null || data.moduleType == '' ||
            data.bigManagerId == null || data.bigManagerId == '' || data.resourceId == null || data.resourceId == '') {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        const dataCon = await this.tipOffService.Update(
            data._id, data.moduleType,
            data.typeId, data.disPostStatus,
            data.monitorNumber1, data.bigManagerId, data.bigManagerAccount,
            data.bigManagerMessage, data.userList,
            data.resourceId, data.resourcename, data.messageFirst,
            data.codeuuid
        )
        return ResultUtils.success(dataCon)

    }

    /**
     * 统计各任务处理情况
     * @param moduleType 
     * @returns 
     */
    @Get('countdispose')
    async CountisDisPoseCon(@Query('moduleType') moduleType: string): Promise<BaseRespone<any>> {
        if (moduleType == null || moduleType == '') {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        const data = await this.tipOffService.CountisDisPose(moduleType)
        return ResultUtils.success(data)
    }

}
