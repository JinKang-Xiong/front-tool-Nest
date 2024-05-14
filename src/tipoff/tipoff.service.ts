import { Message } from './../message/schemase/message.schema';
import { async, retry } from 'rxjs';
import { AddTipOff } from './dto/tipoff.dto';
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TipoffModule } from './tipoff.module';
import mongoose, { Model, model } from 'mongoose';
import { TipOffDocument } from './schemas/tipoff.schema';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { MessageDocument } from 'src/message/schemase/message.schema';
import { Mode } from 'fs';
import { CodeDocument } from 'src/codeList/schemase/code.schema';
import { NoteDocument } from 'src/noteList/schemas/note.schema';
import { BookDocument } from 'src/book/schemas/book.schema';
import { BaseRespone } from 'src/common/InterfaceBase';
import { MESSAGEUSER, RESOURCEERR, RESOURCESUCCESS } from 'src/constant/TaskConstant';

@Injectable()
export class TipoffService {
    // constructor(@InjectModel("picture_manager") private pictureModule: Model<PictureDocument>) { }


    constructor(
        @InjectModel('user_tipoff') private tipoffModule: Model<TipOffDocument>,
        @InjectModel('message_manager') private messageModule: Model<MessageDocument>,
        @InjectModel('code_snippet') private codeModule: Model<CodeDocument>,
        @InjectModel('note_manager') private noteModule: Model<NoteDocument>,
        @InjectModel('books_manager') private bookModule: Model<BookDocument>) { }

    /**
     * 增加代码片段反馈
     * @param userId 
     * @param moduleType 
     * @param type 
     * @param content 
     * @param codeId 
     * @param codeuuid 
     */
    async Add(userId: string, username: string, userAvatarUrl: string, moduleType: string, type: string, content: string, codeId: string, codeuuid: string): Promise<any> {
        if (userId == null || userId == '' || moduleType == null || moduleType == '' || type == null || type == null || content == null || content == '' || codeId == null || codeId == '' || codeuuid == '' || codeuuid == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const tipoffdata = await this.tipoffModule.findOne({ codeId, codeuuid, deleteStatus: 0, isDisPose: 0 })
        console.log(tipoffdata)
        let AddTipOffData
        if (!tipoffdata) {
            const AddTipOff = new this.tipoffModule({ moduleType, tipoffContent: [{ userId, username, userAvatarUrl, type, content }], codeId, codeuuid })
            AddTipOffData = AddTipOff.save()
        } else {
            let tipoffdataId = tipoffdata._id
            AddTipOffData = await this.tipoffModule.findOneAndUpdate({ _id: tipoffdataId }, { $push: { tipoffContent: { userId, username, userAvatarUrl, type, content } } })
        }
        if (!AddTipOffData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库操作失败')
        }
        return AddTipOffData
    }

    /**
     * 书籍资源的反馈
     * @param userId 
     * @param moduleType 
     * @param type 
     * @param content 
     * @param codeId 
     * @returns 
     */
    async AddBook(userId: string, username: string, userAvatarUrl: string, moduleType: string, type: string, content: string, bookId: string,): Promise<any> {
        if (userId == null || userId == '' || moduleType == null || moduleType == '' || type == null || type == null || content == null || content == '' || bookId == null || bookId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const tipoffdata = await this.tipoffModule.findOne({ bookId, deleteStatus: 0, isDisPose: 0 })
        let AddTipOffData
        if (!tipoffdata) {
            const AddTipOff = new this.tipoffModule({ tipoffContent: [{ userId, username, userAvatarUrl, type, content }], moduleType, bookId })
            AddTipOffData = AddTipOff.save()
        } else {
            let tipoffdataId = tipoffdata._id
            AddTipOffData = await this.tipoffModule.findOneAndUpdate({ _id: tipoffdataId }, { $push: { tipoffContent: { userId, username, userAvatarUrl, type, content } } })
        }
        if (!AddTipOffData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库操作失败')
        }
        return AddTipOffData
    }

    /**
     * 增加笔记资源反馈
     * @param userId 
     * @param moduleType 
     * @param type 
     * @param content 
     * @param bookId 
     * @returns 
     */
    async AddNote(userId: string, username: string, userAvatarUrl: string, moduleType: string, type: string, content: string, noteId: string,): Promise<any> {
        if (userId == null || userId == '' || moduleType == null || moduleType == '' || type == null || type == null || content == null || content == '' || noteId == null || noteId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const tipoffdata = await this.tipoffModule.findOne({ noteId, deleteStatus: 0, isDisPose: 0 })
        let AddTipOffData
        if (!tipoffdata) {
            const AddTipOff = new this.tipoffModule({ tipoffContent: [{ userId, username, userAvatarUrl, type, content }], moduleType, noteId })
            AddTipOffData = AddTipOff.save()
        } else {
            let tipoffdataId = tipoffdata._id
            AddTipOffData = await this.tipoffModule.findOneAndUpdate({ _id: tipoffdataId }, { $push: { tipoffContent: { userId, username, userAvatarUrl, type, content } } })
        }
        if (!AddTipOffData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库操作失败')
        }
        return AddTipOffData
    }

    /**
     * 查询模块未处理的反馈
     * @param moduleType 
     * @param isDisPost 
     * @param pageSize 
     * @param pageNumber 
     * @returns 
     */
    async FindAll(moduleType: string, isDisPose: number, pageSize: number, pageNumber: number): Promise<any> {
        let skipValue = (pageNumber - 1) * pageSize
        const total = await this.tipoffModule.countDocuments({ moduleType, isDisPose: isDisPose, deleteStatus: 0 })
        const data = await this.tipoffModule.find({ moduleType, isDisPose: isDisPose, deleteStatus: 0 }).skip(skipValue).limit(pageSize)
        let dataarr = []
        switch (moduleType) {
            case '代码片段管理':
                for (let item of data) {
                    const codedata = await this.codeModule.aggregate([
                        { $match: { _id: new mongoose.Types.ObjectId(item.codeId) } },
                        { $unwind: '$codeList' },
                        { $match: { 'codeList.codeuuid': item.codeuuid, 'codeList.codeDeleteStatus': 0 } }
                    ])
                    if (codedata[0]) {
                        let totaldata = { code: codedata[0], tipoff: item }
                        dataarr.push(totaldata)
                    }
                }
                break;
            case '书籍管理':
                for (let item of data) {
                    const bookdata = await this.bookModule.findOne({ _id: item.bookId })
                    if (bookdata) {
                        let totaldata = { book: bookdata, tipoff: item }
                        dataarr.push(totaldata)
                    }

                }
                break;
            case '笔记管理':
                for (let item of data) {
                    const notedata = await this.noteModule.findOne({ _id: item.noteId })
                    if (notedata) {
                        let totaldata = { note: notedata, tipoff: item }
                        dataarr.push(totaldata)
                    }

                }
                break;
        }
        return { total, dataarr }
    }


    /**
     * 根据模块和资源id查询反馈信息
     * @param moduleType 
     * @param typeId 
     * @param codeuuid 
     * @returns 
     */
    async FindById(moduleType: string, typeId: string, isDisPost: number, codeuuid?: string) {
        if (moduleType == '代码片段管理') {
            const datacode = await this.tipoffModule.find({ moduleType, codeId: typeId, codeuuid, deleteStatus: 0, isDisPose: isDisPost })
            return datacode
        }
        if (moduleType == '书籍管理') {
            const databook = await this.tipoffModule.find({ moduleType, bookId: typeId, deleteStatus: 0, isDisPose: isDisPost })
            return databook
        }
        if (moduleType == '笔记管理') {
            const datanote = await this.tipoffModule.find({ moduleType, noteId: typeId, deleteStatus: 0, isDisPose: isDisPost })
            return datanote
        }
        return 0
    }

    /**
     * 封禁和通过的操作
     * @param _id 反馈表id
     * @param moduleType 资源类型-资源表准备
     * @param typeId 资源id-资源表准备
     * @param disPostStatus -处理的状态，通过1，封禁2
     * @param monitorNumner1 资源表的监控次数-资源表准备
     * @param bigManagerId 管理员id
     * @param bigManagerMessage 管理员标注
     * @param userList 反馈者id,为消息表准备
     * @param resourceId 资源拥有者id
     * @param resourcename 资源的名字或标题
     * @param codeuuid 
     */
    async Update(
        _id: string,
        moduleType: string,
        typeId: string,
        disPostStatus: number,
        monitorNumner1: number,
        bigManagerId: string,
        bigManagerAccount: string,
        bigManagerMessage: string,
        userList: string[],
        resourceId: string,
        resourcename: string,
        messageFirst: number,
        codeuuid?: string,): Promise<any> {
        if (_id == null || _id == '' || moduleType == null || moduleType == '' || typeId == '' || typeId == null || bigManagerId == null || bigManagerId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }

        //对反馈表的操作
        let monitorNumner = monitorNumner1 + 1
        let tipoffdata
        let successdata;
        if (disPostStatus == 1) {
            tipoffdata = await this.tipoffModule.findOneAndUpdate({ _id }, { $set: { isDisPose: 2, disPostStatus, bigManagerId, bigManagerAccount, bigManagerMessage, resourceStatus: 2 } })
            switch (moduleType) {
                case '代码片段管理':
                    successdata = await this.codeModule.findOneAndUpdate(
                        { _id: typeId, 'codeList.codeuuid': codeuuid },
                        { $set: { 'codeList.$.codeIsPrivate': 1, 'codeList.$.isMonitor': 0 } })
                    break;
                case '书籍管理':
                    successdata = await this.bookModule.findOneAndUpdate({ _id: typeId }, { $set: { isPrivate: 1, isMonitor: 0, } })
                    break;
                case '笔记管理':
                    successdata = await this.noteModule.findOneAndUpdate({ _id: typeId }, { $set: { isPartPublic: 1, isMonitor: 0 } })
                    break;
            }
            if (!successdata) {
                throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
            }
            //对资源的拥有者的消息
            const Message = new this.messageModule({ userId: resourceId, message: RESOURCESUCCESS(resourcename) })
            const messagedata = Message.save()
            if (!messagedata) {
                throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
            }

        } else if (disPostStatus == 2) {
            tipoffdata = await this.tipoffModule.findOneAndUpdate({ _id }, { $set: { isDisPose: 1, disPostStatus, bigManagerAccount, bigManagerId, bigManagerMessage, } })
            //对资源表的操作
            let resourceData;
            switch (moduleType) {
                case '代码片段管理':
                    resourceData = await this.codeModule.findOneAndUpdate(
                        { _id: typeId, 'codeList.codeuuid': codeuuid },
                        { $set: { 'codeList.$.codeIsPrivate': 2, 'codeList.$.isMonitor': 1, 'codeList.$.monitorNumber': monitorNumner } })
                    break;
                case '书籍管理':
                    resourceData = await this.bookModule.findOneAndUpdate({ _id: typeId }, { $set: { isPrivate: 2, isMonitor: 1, monitorNumner } })
                    break;
                case '笔记管理':
                    resourceData = await this.noteModule.findOneAndUpdate({ _id: typeId }, { $set: { isPartPublic: 2, isMonitor: 1, monitorNumner } })
                    break;
            }
            if (!resourceData) {
                throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
            }

            //对资源的拥有者的消息
            const Message = new this.messageModule({ userId: resourceId, message: RESOURCEERR(resourcename) })
            const messagedata = Message.save()
            if (!messagedata) {
                throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
            }

        }

        //对反馈者消息表的操作
        if (messageFirst == 0) {
            for (let item of userList) {
                const message = new this.messageModule({ userId: item, message: MESSAGEUSER })
                const messagedata = message.save()
                if (!messagedata) {
                    throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
                }
            }
        }

    }


    /**
     * 统计待审核，监控期，已完成
     * @param moduleType 
     */
    async CountisDisPose(moduleType: string): Promise<any> {
        if (moduleType == null || moduleType == '') {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        const DisPose0 = await this.tipoffModule.countDocuments({ moduleType, isDisPose: 0 })
        const DisPose1 = await this.tipoffModule.countDocuments({ moduleType, isDisPose: 1 })
        const DisPose2 = await this.tipoffModule.countDocuments({ moduleType, isDisPose: 2 })
        if (!DisPose0 && !DisPose1 && !DisPose2) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        return { DisPose0, DisPose1, DisPose2 }
    }




}
