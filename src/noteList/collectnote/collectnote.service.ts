/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CollectNoteDocument } from '../schemas/collectnote.schema';
import { Model } from 'mongoose';
import { NoteDocument } from '../schemas/note.schema';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';

@Injectable()
export class CollectnoteService {


    constructor(@InjectModel('collectnote_relation') private collectnoteModule: Model<CollectNoteDocument>,
        @InjectModel('note_manager') private noteModule: Model<NoteDocument>) { }


    /**
     * 查询用户笔记收藏关系
     * @param userId 
     * @returns 
     */
    async FindCollectNote(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FindByUserIdData = await this.collectnoteModule.find({ userId, deleteStatus: 0 })

        return FindByUserIdData
    }

    /**
     * 增加用户笔记的收藏夹
     * @param userId 
     * @param collectName 
     * @param collectDescription 
     * @returns 
     */
    async AddCollectNote(userId: string, collectName: string, collectDescription: string): Promise<any> {
        if (userId == '' || userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        try {
            const AddCollectData = new this.collectnoteModule({ userId, collectName, collectDescription })
            const AddCollect = await AddCollectData.save()
            return AddCollect
        } catch (error) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库插入失败')
        }
    }


    /**
     * 查询用户收藏的代码片段
     * @param userId 
     */
    async FindByNoteSnippet(_id: string, userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        console.log(_id + userId)
        const FindByCodeId = await this.collectnoteModule.findOne({ _id, userId, deleteStatus: 0 })
        console.log(FindByCodeId)
        const CodeArr = [];
        for (const item of FindByCodeId.noteCollect) {
            const res = await this.noteModule.findOne({ _id: item, isPartPublic: 1 });
            if (res) {
                CodeArr.push(res);
            }

        }
        return CodeArr;
    }



    /**
     * 增加用户的收藏的关系
     * @param _id 
     * @param codeuuid 
     * @param codeNumber 
     */
    async AddNoteSnipeet(userId: string, noteId: string, collectNumber: number, _id?: string): Promise<any> {
        if (noteId == null || noteId == '' || collectNumber == null || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let newcollectNumber = collectNumber + 1
        const AddData = this.collectnoteModule.findOneAndUpdate({ _id, userId }, { $push: { noteCollect: noteId } })
        if (!AddData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        const CodeData = await this.noteModule.findOneAndUpdate({ _id: noteId }, { $set: { likeNumber: newcollectNumber } })
        if (!CodeData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'note数据库修改失败')
        }
        return AddData
    }


    /**
     * 取消收藏得功能
     * @param _id 
     * @param userId 
     * @param codeId 
     * @returns 
     */
    async UpdateNoteCollect(_id: string, userId: string, noteId: string): Promise<any> {
        if (_id == null || _id == '' || userId == '' || userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const Data = await this.collectnoteModule.findOneAndUpdate({ _id, userId }, { $pull: { noteCollect: noteId } })
        console.log(Data)
        if (!Data) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库修改失败')
        }
        return Data
    }

    /**
     * 修改收藏夹
     * @param _id 
     * @param userId 
     * @param collectName 
     * @param collectDescription 
     * @returns 
     */
    async UpdateNameAndDes(_id: string, userId: string, collectName: string, collectDescription: string): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const UpdateNameAndDesData = await this.collectnoteModule.findOneAndUpdate({ _id, userId }, { $set: { collectName, collectDescription } })
        if (!UpdateNameAndDesData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库修改失败")
        }
        return UpdateNameAndDesData
    }

    /**
     * 删除收藏夹
     * @param _id 
     * @param userId 
     */
    async UpdateDeleteStatus(_id: string, userId: string): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const UpdateDeleteStatusData = await this.collectnoteModule.findOneAndUpdate({ _id, userId }, { deleteStatus: 1 })
        if (!UpdateDeleteStatusData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库修改失败')
        }
        return UpdateDeleteStatusData;
    }


}
