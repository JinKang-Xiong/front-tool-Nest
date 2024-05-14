import { async, retry } from 'rxjs';
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Query } from '@nestjs/common';
import { NoteModule } from './note.module';
import { Model } from 'mongoose';
import { NoteDocument } from '../schemas/note.schema';
import { InjectModel } from '@nestjs/mongoose';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { BaseRespone } from 'src/common/InterfaceBase';
import { Mode } from 'fs';
import { NoteBookDocument } from '../schemas/noteBook.schema';
import { TipOffDocument } from 'src/tipoff/schemas/tipoff.schema';
import { UPDATEERR, UPDATESUCCESS } from 'src/constant/TaskConstant';

@Injectable()
export class NoteService {
    constructor(@InjectModel('note_manager') private noteModel: Model<NoteDocument>,
        @InjectModel('notebook_manager') private notebookModel: Model<NoteBookDocument>,
        @InjectModel('user_tipoff') private tipoffModel: Model<TipOffDocument>) { }

    /**
     * 实现分页结果的返回的查询
     * @param userId 
     * @param pageNumber 
     * @param pageSize 
     */
    async FindAll(userId: string, pageNumber: number, pageSize: number): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let skipValue = (pageNumber - 1) * pageSize
        const total = await this.noteModel.countDocuments({ userId, deleteStatus: 0 })
        const FindAllData = await this.noteModel.find({ userId, deleteStatus: 0 }).sort({ createTime: -1 }).skip(skipValue).limit(pageSize)
        return { FindAllData, total }
    }

    /**
     * 增加笔记
     * @param noteName 
     * @param noteContent 
     * @param noteCount 
     * @param noteTag 
     * @param userId 
     * @param bookId 
     */
    async Add(noteName: string, noteContent: string, noteCount: number, noteTag: string[], userId: string, bookId: string[], isPartPublic: number, notebookId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let date = new Date()
        const note = new this.noteModel({ noteName, noteContent, noteCount, noteTag, userId, bookId, isPartPublic, notebookId, updateTime: [date] })
        const AddData = await note.save()
        if (!AddData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'note数据库保存成功')
        }
        let _id = AddData._id.toString()
        const noteBook = await this.notebookModel.findOneAndUpdate({ _id: notebookId, userId }, { $push: { noteList: _id } })
        if (!noteBook) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'notebook数据库修改失败')
        }

        return AddData
    }


    /**
     * 根据id去查询笔记
     * @param userId 
     * @param _id 
     */
    async FindById(_id: string, userId: string): Promise<any> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        if (!userId) {
            const publicdata = await this.noteModel.findOne({ _id })
            return publicdata
        }
        const FindByIdData = await this.noteModel.findOne({ _id, deleteStatus: 0 })
        return FindByIdData
    }


    /**
     * 修改笔记
     * @param _id 
     * @param noteName 
     * @param noteContent 
     * @param noteCount 
     * @param noteTag 
     * @param userId 
     * @param bookId 
     * @param isPartPublic 
     * @param notebookId 
     * @param oldnotbookId 
     * @returns 
     */
    async Update(_id: string, noteName: string, noteContent: string, noteCount: number, noteTag: string[], userId: string, bookId: string[], isPartPublic: number, notebookId: string, oldnotbookId: string): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const notedata = await this.noteModel.findOne({ _id })
        const UpdateData = await this.noteModel.findOneAndUpdate({ _id, userId }, { $set: { noteName, noteContent, noteCount, noteTag, bookId, notebookId }, $push: { updateTime: new Date() } })
        if (!UpdateData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'UpdateData数据库修改错误')
        }
        const RemoveNoteBook = await this.notebookModel.findOneAndUpdate({ _id: oldnotbookId, userId }, { $pull: { noteList: _id } })
        if (!RemoveNoteBook) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'RemoveNoteBook数据库修改错误')
        }
        const UpdateNoteBook = await this.notebookModel.findOneAndUpdate({ _id: notebookId, userId }, { $push: { noteList: _id } })
        if (!UpdateNoteBook) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'UpdateNoteBook数据库修改错误')
        }
        if (notedata.isMonitor == 1) {
            if (isPartPublic == 1) {
                const tipoffbook = await this.tipoffModel.findOneAndUpdate({ noteId: _id, moduleType: '笔记管理', isDisPose: 1 }, { $set: { resourceStatus: 1 } })
                if (!tipoffbook) {
                    throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
                }
                return UPDATEERR
            } else {
                return UPDATEERR
            }
        }
        const UpdateDataIsPart = await this.noteModel.findOneAndUpdate({ _id, userId }, { $set: { isPartPublic } })
        return UPDATESUCCESS


    }

    /**
     * 根据笔记本来查询笔记
     * @param _id 
     * @param pageNumber 
     * @param pageSize 
     */
    async FindByNoteBook(_id: string, pageNumber: number, pageSize: number): Promise<any> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const noteBook = await this.notebookModel.findOne({ _id, deleteStatus: 0 })
        let noteList = noteBook.noteList
        let start = (pageNumber - 1) * pageSize
        let end = start + pageSize
        let noteId = noteList.slice(start, end)
        let noteArr = []
        for (let _id of noteId) {
            const note = await this.noteModel.findOne({ _id, deleteStatus: 0 })
            noteArr.push(note)
        }
        return { total: noteList.length, note: noteArr }
    }

    /**
     * 根据标签查询笔记
     * @param tag 
     * @param pageNumber 
     * @param pageSize 
     */
    async FindByTag(tag: string, userId: string, pageNumber: number, pageSize: number): Promise<any> {
        if (tag == null || tag == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let skipValue = (pageNumber - 1) * pageSize
        const total = await this.noteModel.countDocuments({ noteTag: { $in: [tag] }, deleteStatus: 0, userId })
        const note = await this.noteModel.find({ noteTag: { $in: [tag] }, deleteStatus: 0, userId }).sort({ createTime: -1 }).skip(skipValue).limit(pageSize)
        return { note, total }
    }


    /**
     * 根据年份去搜索笔记
     * @param yearValue 
     * @param pageNumber 
     * @param pageSize 
     */
    async FindByYear(yearValue: string, userId: string, pageNumber: number, pageSize: number): Promise<any> {
        if (yearValue == null || yearValue == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let skipValue = (pageNumber - 1) * pageSize
        const startOfYear = new Date(yearValue);
        const endOfYear = new Date(yearValue);
        endOfYear.setFullYear(endOfYear.getFullYear() + 1); // 将结束日期调整到下一年
        const total = await this.noteModel.countDocuments({ createTime: { "$gte": startOfYear, "$lt": endOfYear }, deleteStatus: 0, userId })
        const note = await this.noteModel.find({ createTime: { "$gte": startOfYear, "$lt": endOfYear }, deleteStatus: 0, userId }).skip(skipValue).limit(pageSize)
        return { total, note }
    }


    /**
     * 根据笔记名字查询
     * @param userId 
     * @param name 
     */
    async FindByName(userId: string, name: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const regexPattern = new RegExp(name, "i");
        const note = await this.noteModel.find({ noteName: regexPattern, userId, deleteStatus: 0 })
        return note
    }


    /**
     * 查询用户标签
     * @param userId 
     */
    async FindTag(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const tag = await this.noteModel.find({ userId }, { noteTag: 1 })
        const newtag = []
        tag.forEach(item => {
            item.noteTag.forEach(el => {
                if (!newtag.includes(el)) {
                    newtag.push(el)
                }
            })
        })
        return newtag
    }


    /**
     * 查询用户的年份
     * @param userId 
     */
    async FindYear(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const year = await this.noteModel.find({ userId }, { createTime: 1 })
        let yeararr = []
        year.forEach(item => {
            let itemyear = item.createTime.getFullYear()
            if (!yeararr.includes(itemyear)) {
                yeararr.push(itemyear)
            }
        })
        return yeararr
    }

    /**
 * 搜索公共资源书籍
 * @param inputValue 
 * @returns 
 */
    async SearchPublicBook(inputValue: string): Promise<any> {
        if (inputValue == null || inputValue == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FinByTagAndNameData = await this.noteModel.find({ isPartPublic: 1, deleteStatus: 0, $or: [{ noteTag: { $regex: inputValue, $options: 'i' } }, { noteName: { $regex: inputValue, $options: 'i' } }] })
        return FinByTagAndNameData
    }


    /**
     * 查询公共热门资源
     */
    async FindHotPublicNote(): Promise<any> {
        const data = await this.noteModel.find({ isPartPublic: 1, deleteStatus: 0 }).sort({ likeNumber: -1 }).limit(3)
        return data
    }


    /**
     * 根据时间轴查询笔记
     * @param userId 
     */
    async FindUpdateTime(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        const finddata = await this.noteModel.find({ userId, deleteStatus: 0 }, { noteName: 1, updateTime: 1 })
        let data = []
        finddata.forEach(item => {
            let itemname = item.noteName;
            item.updateTime.forEach((el, index) => {
                if (index == 0) {
                    data.push({ color: 0, name: itemname, time: el })
                    return
                }
                data.push({ color: 1, name: itemname, time: el })
            })
        })
        data.sort((a, b) => {
            return new Date(a.time).getTime() - new Date(b.time).getTime()
        })

        return data
    }


    /**
     * 修改打开次数
     * @param _id 
     * @param openNumber 
     */
    async UpdateOpen(_id: string, openNumber: number): Promise<any> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let open = openNumber + 1
        const data = await this.noteModel.findOneAndUpdate({ _id }, { $set: { openNumber: open } })
        if (!data) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        return data
    }


    /**
     * 查询打开次数前十的笔记
     * @param userId 
     */
    async FindByOpen(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const findData = await this.noteModel.find({ userId }).sort({ openNumber: -1 }).limit(10)
        return findData
    }


    /**
     * 删除笔记
     * @param _id 
     * @param userId 
     */
    async DeleteNote(_id: string, userId: string): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == "") {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const deleteData = await this.noteModel.findOneAndUpdate({ _id, userId }, { $set: { deleteStatus: 1 } })
        if (!deleteData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        return deleteData
    }



}
