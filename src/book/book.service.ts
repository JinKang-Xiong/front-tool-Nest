import { async } from 'rxjs';
import { FindAll } from './../memo/dto/memo.dto';
import { Model } from 'mongoose';
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Delete } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { BookModule } from './book.module';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { AddBookDto, UpdateBookDto, } from './dto/book.dto';
import { BookDocument } from './schemas/book.schema';
import { TipOffDocument } from 'src/tipoff/schemas/tipoff.schema';
import { UPDATEERR } from 'src/constant/TaskConstant';

@Injectable()
export class BookService {
    constructor(@InjectModel('books_manager') private bookModule: Model<BookDocument>,
        @InjectModel('user_tipoff') private tipoffModule: Model<TipOffDocument>) { }

    /**
     * 增加书籍
     * @param bookName 
     * @param bookDescription 
     * @param bookImg 
     * @param bookTag 
     */
    async AddBook(bookData: AddBookDto): Promise<any> {
        if (bookData.bookName == null || bookData.bookName == '' || bookData.bookImg == '' || bookData.bookImg == null || bookData.bookUrl == null || bookData.bookUrl == '') {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        try {
            const data = new this.bookModule(bookData)
            const data1 = data.save()
            return data1
        } catch (err) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, err)
        }
    }

    /**
     * 修改书籍的基本信息
     * @param upBookData 
     */
    async UpdateBook(_id: string, userId: string, bookName: string, bookDescription: string, isPrivate: number, shareViewPoint: string, bookTag: string[]): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const data = await this.bookModule.findOneAndUpdate(
            { _id, userId },
            {
                $set: {
                    bookName, bookDescription, shareViewPoint, bookTag
                }
            })
        if (!data) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库的修改失败')
        }
        const bookdata = await this.bookModule.findOne({ _id })
        if (bookdata.isMonitor == 1) {
            if (isPrivate == 1) {
                const tipoffbook = await this.tipoffModule.findOneAndUpdate({ bookId: _id, moduleType: '书籍管理', isDisPose: 1 }, { $set: { resourceStatus: 1 } })
                if (!tipoffbook) {
                    throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
                }
                return tipoffbook
            } else {
                return UPDATEERR
            }
        } else {
            const dataisPrivate = await this.bookModule.findOneAndUpdate({ _id, userId }, { $set: { isPrivate } })
            return data
        }

    }

    /**
     * 查询用户的全部书籍
     * @param userId 
     */
    async FindAll(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        try {
            const FindAllData = await this.bookModule.find({ userId, deleteStatus: 0 })
            return FindAllData
        } catch (err) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, err)
        }

    }

    /**
     * 根据ID和userId来查询用户单本书籍
     * @param _id 
     * @param userId 
     */
    async FindById(_id: string): Promise<any> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let FindByIdData = await this.bookModule.findOne({ _id, deleteStatus: 0, })
        if (!FindByIdData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库查询失败')
        }
        return FindByIdData
    }


    /**
     * 删除图书
     * @param _id 
     * @param userId 
     */
    async DeleteBook(_id: string, userId: string): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const DeleteBookData = await this.bookModule.findOneAndUpdate({ _id, userId }, { $set: { deleteStatus: 1 } })
        if (!DeleteBookData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库查询失败')
        }
        return DeleteBookData
    }

    /**
     * 修改书籍封面
     * @param _id 
     * @param userId 
     * @param bookImg 
     * @returns 
     */
    async UpdateBookImg(_id: string, userId: string, bookImg: string): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const UpdateBookImgData = await this.bookModule.findOneAndUpdate({ _id, userId }, { $set: { bookImg } })
        if (!UpdateBookImgData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库修改失败')
        }
        return UpdateBookImgData
    }


    /**
     * 根据标签搜索用户的书籍
     * @param userId 
     * @param bookTag 
     */
    async FindByTag(userId: string, bookTag: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        console.log(typeof bookTag)
        console.log(bookTag)
        const FindByTagData = await this.bookModule.find({ userId, deleteStatus: 0, bookTag: { $regex: bookTag, $options: 'i' } })

        return FindByTagData
    }


    /**
     * 根据标签和书名查询用户的书籍
     * @param userId 
     * @param bookTag 
     * @param bookName 
     */
    async FindByTagAndName(userId: string, inputValue: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FinByTagAndNameData = await this.bookModule.find({ userId, deleteStatus: 0, $or: [{ bookTag: { $regex: inputValue, $options: 'i' } }, { bookName: { $regex: inputValue, $options: 'i' } }] })
        return FinByTagAndNameData
    }


    /**
     * 修改书籍的阅读次数 
     * @param _id 
     * @param userId 
     * @param readNumber 
     */
    async UpdateReadNumber(_id: string, userId: string, readNumber: number) {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const UPdateReadNUmberData = await this.bookModule.findOneAndUpdate({ _id, userId }, { $set: { readNumber } })
        if (!UPdateReadNUmberData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        return UPdateReadNUmberData
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
        const FinByTagAndNameData = await this.bookModule.find({ isPrivate: 1, deleteStatus: 0, $or: [{ bookTag: { $regex: inputValue, $options: 'i' } }, { bookName: { $regex: inputValue, $options: 'i' } }] })
        return FinByTagAndNameData
    }


    /**
     * 收藏资源数
     * @param bookName 
     * @param bookTag 
     * @param bookDescription 
     * @param bookImg 
     * @param bookUrl 
     * @param shareViewPoint 
     * @param _id 
     * @param userId 
     * @param collectNumber 
     */
    async CollectBookByUser(
        bookName: string,
        bookTag: string[],
        bookDescription: string,
        bookImg: string,
        bookUrl: string,
        shareViewPoint: string,
        _id: string,
        userId: string,
        collectNumber: number): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let collectNumber1 = collectNumber + 1
        const updatecollect = await this.bookModule.findOneAndUpdate({ _id }, { $set: { collectNumber: collectNumber1 } })
        if (!updatecollect) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '原资源的收藏数更新失败')
        }
        const book = new this.bookModule({ bookName, bookTag, bookDescription, bookImg, bookUrl, shareViewPoint, userId })
        const booksave = book.save()
        if (!booksave) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '新资源插入失败')
        }
        return booksave
    }


    /**
     * 获取热门的公共资源
     */
    async FindHotPublicBook(): Promise<any> {
        const data = await this.bookModule.find({ isPrivate: 1, deleteStatus: 0 }).sort({ likeNumber: -1 }).limit(3)
        return data
    }

}
