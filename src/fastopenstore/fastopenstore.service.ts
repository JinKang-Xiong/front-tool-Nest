import { Memo } from './../memo/schemase/memo.schema';
import { Note, NoteDocument } from './../noteList/schemas/note.schema';
import { async } from 'rxjs';
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FastOpenStoreDocument } from './schemase/fastopenstore.schema';
import { Model } from 'mongoose';
import { CodeDocument } from 'src/codeList/schemase/code.schema';
import { Mode } from 'fs';
import { NoteBookDocument } from 'src/noteList/schemas/noteBook.schema';
import { BookDocument } from 'src/book/schemas/book.schema';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { UPDATESUCCESS } from 'src/constant/TaskConstant';
import { StoreItem } from './dto/fastopenstore.dto';
import { MemoDocument } from 'src/memo/schemase/memo.schema';
import { PictureDocument } from 'src/picture/schemase/picture.schema';

@Injectable()
export class FastopenstoreService {
    constructor(
        @InjectModel('fastopen_manager') private fastopenModel: Model<FastOpenStoreDocument>,
        @InjectModel('code_snippets') private codeModel: Model<CodeDocument>,
        @InjectModel('notebook_manager') private notebookModel: Model<NoteBookDocument>,
        @InjectModel('books_manager') private bookModel: Model<BookDocument>,
        @InjectModel('note_manager') private noteModel: Model<NoteDocument>,
        @InjectModel('memo_manager') private memoModel: Model<MemoDocument>,
        @InjectModel('picture_manager') private pictureModel: Model<PictureDocument>) { }


    /**
     * 查询用户的快捷仓库
     * @param userId 
     */
    async FindByUser(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const data = await this.fastopenModel.findOne({ userId })
        if (!data) {
            return data
        }
        const codearr = []
        for (let _id of data.codeList) {
            const codedata = await this.codeModel.findOne({ _id })
            codearr.push({ storeName: codedata.storeName, storeId: codedata._id })
        }
        const notebookarr = []
        for (let _id of data.noteList) {
            const notebookdata = await this.notebookModel.findOne({ _id })
            notebookarr.push({ storeName: notebookdata.notebookName, storeId: notebookdata._id })
        }
        const bookarr = []
        for (let _id of data.bookList) {
            const bookdata = await this.bookModel.findOne({ _id })
            bookarr.push({ storeName: bookdata.bookName, storeId: bookdata._id })
        }

        return { _id: data._id, codearr, notebookarr, bookarr }
    }

    /**
     * 新建快捷仓库和添加仓库到快捷仓库中
     * @param store 
     * @param _id 
     */
    async AddAndUpdate(store: StoreItem[], userId: string, _id: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        if (!_id) {
            let codearr = []
            let notebookarr = []
            let bookarr = []
            store.forEach(async item => {
                switch (item.mark) {
                    case 0:
                        codearr.push(item.storeId)
                        break;
                    case 1:
                        notebookarr.push(item.storeId)
                        break;
                    case 2:
                        bookarr.push(item.storeId)
                        break
                }
            })
            const fastopenstore = new this.fastopenModel({ userId, codeList: codearr, noteList: notebookarr, bookList: bookarr })
            const data = await fastopenstore.save()
            if (!data) {
                throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库新建失败')
            }
            return fastopenstore
        } else {
            store.forEach(async item => {
                switch (item.mark) {
                    case 0:
                        const codedata = await this.fastopenModel.findOneAndUpdate({ _id, userId }, { $push: { codeList: item.storeId } })
                        if (!codedata) {
                            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '插入codeList数据失败')
                        }
                        break
                    case 1:
                        const notebookdata = await this.fastopenModel.findOneAndUpdate({ _id, userId }, { $push: { noteList: item.storeId } })
                        if (!notebookdata) {
                            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '插入notebook数据失败')
                        }
                        break
                    case 2:
                        const bookdata = await this.fastopenModel.findOneAndUpdate({ _id, userId }, { $push: { bookList: item.storeId } })
                        if (!bookdata) {
                            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "插入bookList数据失败")
                        }
                        break
                }
            })
            return UPDATESUCCESS
        }
    }


    async UpdateStore(_id: string, mark: number, storeId: string): Promise<any> {
        if (_id == null || _id === '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        switch (mark) {
            case 0:
                const codedata = await this.fastopenModel.findOneAndUpdate({ _id }, { $pull: { codeList: storeId } })
                if (!codedata) {
                    throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '插入codeList数据失败')
                }
                return codedata
            case 1:
                const notebookdata = await this.fastopenModel.findOneAndUpdate({ _id }, { $pull: { noteList: storeId } })
                if (!notebookdata) {
                    throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '插入notebook数据失败')
                }
                return notebookdata
            case 2:
                const bookdata = await this.fastopenModel.findOneAndUpdate({ _id }, { $pull: { bookList: storeId } })
                if (!bookdata) {
                    throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "插入bookList数据失败")
                }
                return bookdata
        }
    }


    /**
     * 统计文档的私人和公共资源的数量
     * @param userId 
     */
    async CountPrivateTotalByUser(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        //代码片段的私有资源总数
        let codePrivateTotal = 0
        const codeCountPrivate = await this.codeModel.aggregate([
            { $match: { userId, deleteStatus: 0, isPartPublic: 1 } },
            { $unwind: '$codeList' },
            { $match: { 'codeList.codeIsPrivate': 0, 'codeList.codeDeleteStatus': 0 } },
            { $group: { _id: null, count: { $sum: 1 } } }
        ])
        if (codeCountPrivate[0]) {
            //代码片段的资源总数
            codePrivateTotal = codeCountPrivate[0].count
        }
        const codeByUser = await this.codeModel.find({ userId, deleteStatus: 0 })
        var codeTotal = 0
        codeByUser.forEach(item => {
            codeTotal = codeTotal + item.codeList.length
        })

        //代码片段的公共资源总数
        var codePublicTotal = codeTotal - codePrivateTotal

        //笔记私有资源总数
        const noteCountPrivate = await this.noteModel.countDocuments({ userId, deleteStatus: 0, isPartPublic: 0 })

        //笔记资源公有资源总数
        const noteCountPublic = await this.noteModel.countDocuments({ userId, deleteStatus: 0, isPartPublic: 1 })


        //书籍私有资源总数
        const bookCountPrivate = await this.bookModel.countDocuments({ userId, deleteStatus: 0, isPrivate: 0 })

        //书籍公有资源的总数
        const bookCountPublic = await this.bookModel.countDocuments({ userId, deleteStatus: 0, isPrivate: 1 })
        let privateTotal = codePrivateTotal + noteCountPrivate + bookCountPrivate
        let publicTotal = codePublicTotal + noteCountPublic + bookCountPublic
        //总资源
        return { privateTotal, publicTotal }
    }


    /**
     * 统计每月创建资源的数量
     * @param userId 
     */
    async CountCreateTotalByMonth(userId: string, year: number): Promise<any> {
        // const total = await this.noteModel.countDocuments({ createTime: { "$gte": startOfYear, "$lt": endOfYear }, deleteStatus: 0, userId })
        let mounth = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
        var data = []
        for (let item of mounth) {
            let startmounth = new Date(year, item)
            let endmounth = new Date(year, item + 1)
            const codedata = await this.codeModel.aggregate([
                { $match: { userId, deleteStatus: 0 } },
                { $unwind: '$codeList' },
                { $match: { 'codeList.codeCreateTime': { "$gte": startmounth, "$lt": endmounth } } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
            let codeCount
            if (codedata.length == 0) {
                codeCount = 0
            } else {
                codeCount = codedata[0].count
            }
            const picturedata = await this.pictureModel.aggregate([
                { $match: { userId, deleteStatus: 0 } },
                { $unwind: '$pictureList' },
                { $match: { 'pictureList.pictureCreateTime': { "$gte": startmounth, "$lt": endmounth } } },
                { $group: { _id: null, count: { $sum: 1 } } }
            ])
            let pictureCount
            if (picturedata.length == 0) {
                pictureCount = 0
            } else {
                pictureCount = picturedata[0].count
            }
            const noteCount = await this.noteModel.countDocuments({ userId, deleteStatus: 0, createTime: { "$gte": startmounth, "$lt": endmounth } })
            const bookCount = await this.bookModel.countDocuments({ userId, deleteStatus: 0, createTime: { '$gte': startmounth, "$lt": endmounth } })
            data.push({ mounth: item, codeCount, pictureCount, noteCount, bookCount })
        }
        return data
    }

    /**
     * 统计未归档小灵的比例
     * @param userId 
     */
    async CountMemo(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        //未归档小灵
        const memodata1 = await this.memoModel.countDocuments({ userId, deleteStatus: 0, memoListStatus: 0 })

        //统计用户全部下灵
        const memodata2 = await this.memoModel.countDocuments({ userId, deleteStatus: 0 })

        return { unfinished: memodata1, memototal: memodata2 }
    }

}
