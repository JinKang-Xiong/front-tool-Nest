/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Query } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { NoteBookDocument } from '../schemas/noteBook.schema';
import { ALREADTEXIST, DELETEERR } from 'src/constant/TaskConstant';

@Injectable()
export class NotebookService {
    constructor(@InjectModel('notebook_manager') private notebookModel: Model<NoteBookDocument>) { }

    /**
     * 查询用户
     * @param userId 
     * @param isDefault 
     */
    async FindAll(userId: string, isDefault: number): Promise<any> {
        if (userId == '' || userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let findAllData
        if (isDefault == 1) {
            findAllData = await this.notebookModel.findOne({ userId, isDefault, deleteStatus: 0 })
        } else {
            findAllData = await this.notebookModel.find({ userId, deleteStatus: 0 })
        }
        return findAllData
    }


    /**
     * 新增笔记本
     * @param userId 
     * @param notebookName 
     * @param notebookDescription 
     * @param isDefault 
     */
    async Add(userId: string, notebookName: string, notebookDescription: string, isDefault: number): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        if (isDefault == 1) {
            const FindIsDefault = await this.notebookModel.findOne({ userId, isDefault: 1 })
            if (FindIsDefault) {
                return ALREADTEXIST
            }
        }
        const Note = new this.notebookModel({ userId, notebookName, notebookDescription, isDefault })
        const NoteData = Note.save()
        if (!NoteData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库插入失败')
        }
        return NoteData
    }

    /**
     * 修改笔记本
     * @param _id 
     * @param userId 
     * @param notebookName 
     * @param notebookDescription 
     */
    async Update(_id: string, userId: string, notebookName: string, notebookDescription: string): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const UpdateData = await this.notebookModel.findOneAndUpdate({ _id, userId }, { $set: { notebookName, notebookDescription } })
        if (!UpdateData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库插入失败')
        }
        return UpdateData
    }


    /**
     * 删除非默认笔记本
     * @param _id 
     * @returns 
     */
    async Delete(_id: string): Promise<any> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const NoteData = await this.notebookModel.findOne({ _id })
        if (NoteData.isDefault == 1) {
            return DELETEERR
        }
        const DeleteData = await this.notebookModel.findOneAndUpdate({ _id, isDefault: 0 }, { deleteStatus: 1 })
        return DeleteData
    }

}
