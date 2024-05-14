/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { LikeService } from './like.service';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';
import { BaseRespone } from 'src/common/InterfaceBase';
import { CancelLike, CancelNoteLike, InserBookLike, InserLike } from '../dto/like.dto';

@Controller('like')
export class LikeController {
    constructor(private readonly likeService: LikeService) { }

    /**
 * 点赞功能
 * @param _id 
 * @param codeuuid 
 * @param likeNumber 
 */
    @Post('addlike')
    async AddLikeCon(@Body() data: InserLike): Promise<BaseRespone<any>> {
        if (data.codeId == null || data.codeId == '' || data.codeuuid == null || data.codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const AddLikeCon = await this.likeService.AddLike(data._id, data.codeId, data.codeuuid, data.likeNumber, data.userId)
        if (!AddLikeCon) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库查询失败')
        }
        return ResultUtils.success(AddLikeCon)

    }

    /**
     * 取消收藏
     * @param data 
     */
    @Post('cancel')
    async CancelLikeCon(@Body() data: CancelLike): Promise<BaseRespone<any>> {
        if (data._id == null || data._id == '' || data.codeId == null || data.codeId == '' || data.codeuuid == '' || data.codeuuid == null || data.userId == null || data.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const CancelLikeData = await this.likeService.CancelLike(data._id, data.codeId, data.codeuuid, data.likeNumber, data.userId)
        if (!CancelLikeData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(CancelLikeData)
    }


    /**
     * 增加笔记点赞
     * @param data 
     * @returns 
     */
    @Post('addlikenote')
    async AddLikeBookCon(@Body() data: InserBookLike): Promise<BaseRespone<any>> {
        if (data.noteId == null || data.noteId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const AddLikeCon = await this.likeService.AddNoteLike(data._id, data.noteId, data.likeNumber, data.userId)
        if (!AddLikeCon) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库查询失败')
        }
        return ResultUtils.success(AddLikeCon)

    }

    /**
     * 取消收藏
     * @param data 
     */
    @Post('cancelnote')
    async CancelLikeBookCon(@Body() data: CancelNoteLike): Promise<BaseRespone<any>> {
        if (data._id == null || data._id == '' || data.noteId == null || data.noteId == '' || data.userId == null || data.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const CancelLikeData = await this.likeService.CancelNoteLike(data._id, data.noteId, data.likeNumber, data.userId)
        if (!CancelLikeData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(CancelLikeData)
    }

    /**
     * 查询用户的收藏关系
     * @param userId 
     * @returns 
     */
    @Get('findallbyuser')
    async FindAllByUser(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindAllByUserData = await this.likeService.FindAll(userId)
        if (!FindAllByUserData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(FindAllByUserData)
    }

}
