/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Post, Body, Param, Get, Put, Query, Delete } from '@nestjs/common';
import { MemoService } from './memo.service';
import { EditMemo, FindAll, InsertMemoDto } from './dto/memo.dto';
import { BaseRespone } from 'src/common/InterfaceBase';
import { BusinessException } from 'src/exception/BusinessException';
import { ResultUtils } from 'src/common/ResultUtils';
import { Memo } from './schemase/memo.schema';
import { ErrorCode } from 'src/common/ErrorCode';

@Controller("memo")
export class MemoController {
    constructor(private readonly memoService: MemoService) { }

    /**
     * 
     * @param memodata 增加小灵
     * @returns 
     */
    @Post('add')
    async inserMemo(@Body() memodata: InsertMemoDto): Promise<BaseRespone<Memo>> {
        if (memodata.memoList == null || memodata.memoConfirm == null || memodata.memoListStatus == null || memodata.memoListTag == null || memodata.userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }

        const insertres = await this.memoService.insertMemo(memodata)
        if (insertres == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(insertres)

    }

    /**
     * 查询用户的全部小灵
     * @param userId 用户ID
     * @returns 
     */
    @Get('findall')
    async findall(@Query('userId') userId: string, @Query('memoListStatus') memoListStatus: number, @Query('tagName') tagName: string): Promise<BaseRespone<FindAll[]>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        console.log(userId + ',' + memoListStatus + ',' + tagName)
        let memoListStatus1 = Number(memoListStatus)
        const memoList = await this.memoService.queryAll(userId, memoListStatus1, tagName)
        return ResultUtils.success(memoList)
    }

    /**
     * 小记置顶功能
     * @param _id 
     * @param isTop --0是false 1-true
     * @returns 
     */
    @Put('updatetop')
    async updateTop(@Query('_id') _id: string, @Query('isTop') isTop: number): Promise<any> {
        if (_id == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        let isTop1 = Number(isTop)
        const updataRes = await this.memoService.updateTop(_id, isTop1)
        if (updataRes == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }

        return ResultUtils.success(updataRes)
    }

    /**
     * 修改小灵感——要做增加，必要把这些全部传回来，不能只传修改的 
     * @param editMemo 
     * @returns 
     */
    @Post('editmemo')
    async editMemo(@Body() editMemo: EditMemo): Promise<BaseRespone<Memo>> {
        const memoList = editMemo.memoList;
        const memoListTag = editMemo.memoListTag;
        const _id = editMemo._id

        if (memoList == null || memoListTag == null || _id == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        const editdata = await this.memoService.updateMemo(_id, memoList, memoListTag);
        if (editdata == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }
        console.log("editdata=" + editdata);
        return ResultUtils.success(editdata)
    }


    /**
     * 查询用户的标签
     * @param userId 
     * @returns 
     */
    @Get('findtag')
    async findTag(@Query('userId') userId: string, @Query('memoListStatus') memoListStatus: string,): Promise<BaseRespone<any>> {
        if (userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        let memoListStatus1 = Number(memoListStatus)
        const findTagData = await this.memoService.findTag(userId, memoListStatus1)
        if (findTagData == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }

        return ResultUtils.success(findTagData)

    }


    /**
     * 小灵归档
     * @param _id 
     * @param memoListStatus 
     * @returns 
     */
    @Put('filememo')
    async updateMemoListStatus(@Query('_id') _id: string, @Query('memoListStatus') memoListStatus: number): Promise<BaseRespone<Memo>> {
        if (_id == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        let memoListStatus1 = Number(memoListStatus)
        const updatadata = await this.memoService.memofile(_id, memoListStatus1)
        if (updatadata == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }

        return ResultUtils.success(updatadata);
    }


    /**
     * 删除小记
     * @param _id 
     * @returns 
     */
    @Delete('deletememo')
    async deleteMemo(@Query('_id') _id: string): Promise<BaseRespone<Memo>> {
        if (_id == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        const deletedata = await this.memoService.deletememo(_id)
        if (deletedata == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }

        return ResultUtils.success(deletedata)
    }



}
