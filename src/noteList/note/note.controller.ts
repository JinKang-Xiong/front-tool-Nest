import { FindAll } from './../../memo/dto/memo.dto';
/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Post, Put, Query } from '@nestjs/common';
import { NoteService } from './note.service';
import { BaseRespone } from 'src/common/InterfaceBase';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';
import { AddNote, UpdateNote } from '../dto/noteList.dto';
import { error } from 'console';

@Controller('note')
export class NoteController {
    constructor(private readonly noteService: NoteService) { }

    /**
     * 查询用户的全部笔记
     * @param userId 
     * @param pageNumber 页数
     * @param pageSize  页量
     */
    @Get('findall')
    async FindAllCon(@Query('userId') userId: string, @Query('pageNumber') pageNumber: string, @Query('pageSize') pageSize: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindAllConData = await this.noteService.FindAll(userId, Number(pageNumber), Number(pageSize))
        return ResultUtils.success(FindAllConData)
    }


    /**
     * 新增加用户笔记
     * @param note 
     */
    @Post('add')
    async AddCon(@Body() note: AddNote): Promise<BaseRespone<any>> {
        if (note.userId == null || note.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        let noteCount = note.noteContent.length
        const AddConData = await this.noteService.Add(note.noteName, note.noteContent, noteCount, note.noteTag, note.userId, note.bookId, note.isPartPublic, note.notebookId)
        if (!AddConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库新增加失败')
        }
        return ResultUtils.success(AddConData)
    }

    /**
     * 根据id查询笔记
     * @param _id 
     * @param userId 
     * @returns 
     */
    @Get('findbyid')
    async FindById(@Query('_id') _id: string, @Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindByIdData = await this.noteService.FindById(_id, userId)
        return ResultUtils.success(FindByIdData)

    }

    /**
     * 修改笔记
     * @param note 
     */
    @Post('update')
    async UpdateCon(@Body() note: UpdateNote): Promise<BaseRespone<any>> {
        if (note._id == null || note._id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        let noteCount = note.noteContent.length
        const UpdateConData = await this.noteService.Update(
            note._id,
            note.noteName, note.noteContent,
            noteCount, note.noteTag, note.userId,
            note.bookId, note.isPartPublic,
            note.notebookId, note.oldnotebookId)
        if (!UpdateConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库修改失败')
        }
        return ResultUtils.success(UpdateConData)
    }

    /**
     * 根据笔记本查询笔记
     * @param _id 
     * @param pageNumber 
     * @param pageSize 
     */
    @Get('searchbynotebook')
    async FindByNoteBook(@Query('_id') _id: string, @Query('pageNumber') pageNumber: string, @Query('pageSize') pageSize: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const Note = await this.noteService.FindByNoteBook(_id, Number(pageNumber), Number(pageSize))
        if (!Note) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(Note)
    }


    /**
     * 根据标签搜索
     * @param tag 
     * @param pageNumber 
     * @param pageSize 
     * @returns 
     */
    @Get('searchbytag')
    async FindByTag(@Query('tag') tag: string, @Query('userId') userId: string, @Query('pageNumber') pageNumber: string, @Query('pageSize') pageSize: string): Promise<BaseRespone<any>> {
        if (tag == null || tag == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindByTagData = await this.noteService.FindByTag(tag, userId, Number(pageNumber), Number(pageSize))
        return ResultUtils.success(FindByTagData)
    }

    /**
     * 根据年份搜索
     * @param tag 
     * @param pageNumber 
     * @param pageSize 
     * @returns 
     */
    @Get('searchbyyear')
    async FindByYear(@Query('yearValue') yearValue: string, @Query('userId') userId: string, @Query('pageNumber') pageNumber: string, @Query('pageSize') pageSize: string): Promise<BaseRespone<any>> {
        if (yearValue == null || yearValue == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindByTagData = await this.noteService.FindByYear(yearValue, userId, Number(pageNumber), Number(pageSize))
        return ResultUtils.success(FindByTagData)
    }

    /**
     * 根据笔记名来查询
     * @param userId 
     * @param name 
     * @returns 
     */
    @Get('searchname')
    async FindByName(@Query('userId') userId: string, @Query('name') name: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindByNameData = await this.noteService.FindByName(userId, name)
        return ResultUtils.success(FindByNameData)
    }

    /**
     * 根据标签来搜索
     * @param userId 
     * @returns 
     */
    @Get('tag')
    async FindTag(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindTag = await this.noteService.FindTag(userId)
        return ResultUtils.success(FindTag)
    }

    /**
     * 根据年来搜索笔记
     * @param userId 
     * @returns 
     */
    @Get('year')
    async FindYear(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindYear = await this.noteService.FindYear(userId)
        return ResultUtils.success(FindYear)
    }

    /**
     * 搜索公共的笔记资源
     * @param inputValue 
     * @returns 
     */
    @Get('searchpublic')
    async SearchPublicCon(@Query('inputValue') inputValue: string): Promise<BaseRespone<any>> {
        if (inputValue == null || inputValue == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const data = await this.noteService.SearchPublicBook(inputValue)
        return ResultUtils.success(data)
    }

    @Get('findhotpublic')
    async FindHotPublicCon(): Promise<BaseRespone<any>> {
        const datacon = await this.noteService.FindHotPublicNote()
        return ResultUtils.success(datacon)
    }

    /**
     * 查询时间轴的数据
     * @param userId 
     * @returns 
     */
    @Get('findupdatetime')
    async FindUpdateTime(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const timeData = await this.noteService.FindUpdateTime(userId)
        return ResultUtils.success(timeData)
    }

    /**
     * 修改打开次数
     * @param _id 
     * @param openNumber 
     * @returns 
     */
    @Put('updateopen')
    async UpdateOpen(@Query("_id") _id: string, @Query('openNumber') openNumber: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || openNumber == null || openNumber == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const dataCon = await this.noteService.UpdateOpen(_id, Number(openNumber))
        if (!dataCon) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(dataCon)
    }


    /**
     * 查询常用前十
     * @param userId 
     */
    @Get('findbyopen')
    async FindByOpenCon(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const dataCon = await this.noteService.FindByOpen(userId)
        return ResultUtils.success(dataCon)
    }


    /**
     * 删除笔记
     * @param _id 
     * @param userId 
     */
    @Put('delete')
    async DeleteNoteCon(@Query("_id") _id: string, @Query("userId") userId: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const deleteData = await this.noteService.DeleteNote(_id, userId)
        if (!deleteData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(deleteData)
    }


}
