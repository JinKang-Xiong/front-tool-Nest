/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { CollectDocument } from '../schemase/collect.schema';
import { Code, CodeDocument } from '../schemase/code.schema';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { Like, LikeDocument } from '../schemase/like.schema';
import { NoteDocument } from 'src/noteList/schemas/note.schema';
@Injectable()
export class LikeService {
    constructor(@InjectModel('user_like') private likeModule: Model<LikeDocument>,
        @InjectModel('code_snippet') private codeModule: Model<CodeDocument>,
        @InjectModel('note_manager') private noteModule: Model<NoteDocument>) { }

    /**
     * 用户新建点赞
     * @param _id 
     * @param codeuuid 
     * @param likeNumber 
     * @param userId 
     * @returns 
     */
    async AddLike(_id: string, codeId: string, codeuuid: string, likeNumber: number, userId: string): Promise<any> {
        if (codeId == null || codeuuid == null || codeId == '' || codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const newLikeNumber = likeNumber + 1
        const AddLikeData = await this.codeModule.findOneAndUpdate({ _id: codeId, 'codeList.codeuuid': codeuuid }, { $set: { 'codeList.$.likeNumber': newLikeNumber } })
        if (!AddLikeData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库修改失败')
        }
        var LikeData: any
        if (!_id) {
            const LikeData1 = new this.likeModule({ userId, codeSnippsetLike: [{ codeId, codeuuid }] })
            LikeData = LikeData1.save()
        } else {
            LikeData = await this.likeModule.findOneAndUpdate({ userId, _id }, { $push: { codeSnippsetLike: { codeId, codeuuid } } })
        }
        return LikeData
    }


    /**
     * 取消点赞
     * @param _id 
     * @param codeId 
     * @param codeuuid 
     * @param likeNumber 
     * @param userId 
     * @returns 
     */
    async CancelLike(_id: string, codeId: string, codeuuid: string, likeNumber: number, userId: string): Promise<any> {
        if (_id == null || _id == '' || codeId == null || codeId == '' || codeuuid == '' || codeuuid == null || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let likeNumber1 = likeNumber - 1
        if (likeNumber1 < 0) {
            likeNumber1 = 0
        }
        const LikeData = await this.likeModule.findOneAndUpdate({ _id, userId }, { $pull: { codeSnippsetLike: { codeuuid } } })
        if (!LikeData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'user_like数据库修改失败')
        }
        const CodeData = await this.codeModule.findOneAndUpdate({ _id: codeId, 'codeList.codeuuid': codeuuid }, { $set: { 'codeList.$.likeNumber': likeNumber1 } })
        if (!CodeData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'code_manager数据库修改失败')
        }
        return LikeData

    }


    /**
     * 公共资源笔记点赞
     * @param _id 
     * @param noteId 
     * @param likeNumber 
     * @param userId 
     * @returns 
     */
    async AddNoteLike(_id: string, noteId: string, likeNumber: number, userId: string): Promise<any> {
        if (noteId == null || noteId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const newLikeNumber = likeNumber + 1
        const AddLikeData = await this.noteModule.findOneAndUpdate({ _id: noteId, }, { $set: { likeNumber: newLikeNumber } })
        if (!AddLikeData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库修改失败')
        }
        var LikeData: any
        if (!_id) {
            const LikeData1 = new this.likeModule({ userId, noteLike: [{ noteId }] })
            LikeData = LikeData1.save()
        } else {
            console.log('用户不是新用户')
            LikeData = await this.likeModule.findOneAndUpdate({ userId, _id }, { $push: { noteLike: { noteId } } })
        }
        return LikeData
    }


    /**
     * 公共资源笔记取消点赞
     * @param _id 
     * @param codeId 
     * @param codeuuid 
     * @param likeNumber 
     * @param userId 
     * @returns 
     */
    async CancelNoteLike(_id: string, noteId: string, likeNumber: number, userId: string): Promise<any> {
        if (_id == null || _id == '' || noteId == '' || noteId == null || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let likeNumber1 = likeNumber - 1
        if (likeNumber1 < 0) {
            likeNumber1 = 0
        }
        const LikeData = await this.likeModule.findOneAndUpdate({ _id, userId }, { $pull: { noteLike: { noteId } } })
        if (!LikeData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'user_like数据库修改失败')
        }
        const CodeData = await this.noteModule.findOneAndUpdate({ _id: noteId }, { $set: { likeNumber: likeNumber1 } })
        if (!CodeData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'code_manager数据库修改失败')
        }
        return LikeData

    }


    /**
     * 查询用户的全部点赞
     * @param userId 
     */
    async FindAll(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FindAllData = await this.likeModule.find({ userId, deleteStatus: 0 })
        return FindAllData
    }





}
