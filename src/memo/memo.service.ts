import { MemoModule } from './memo.module';
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Memo, MemoDocument } from './schemase/memo.schema';
import { Model } from 'mongoose';
import { FindAll, InsertMemoDto } from './dto/memo.dto';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';

@Injectable()
export class MemoService {
    constructor(@InjectModel("memo_manager") private memoModule: Model<MemoDocument>) { }

    /**
     * 增加小灵
     * @param memo——小灵集 
     * @returns 
     */
    async insertMemo(memo: InsertMemoDto): Promise<Memo> {
        let memoConfirm = memo.memoConfirm;
        let memoListStatus = memo.memoListStatus;
        if (memoConfirm != 0 && memoConfirm != 1) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "参数不符合规则");
        }
        if (memoListStatus != 0 && memoListStatus != 1) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "参数不符合规则")
        }
        const createMemo = new this.memoModule(memo);
        return await createMemo.save()
    }


    /**
     * 查询用户全部小灵
     * @param userId 用户ID
     * @returns 
     */
    async queryAll(userId: string, memoListStatus: number, tagName: string): Promise<FindAll[]> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        let MemoList;
        if (tagName == undefined) {
            MemoList = await this.memoModule.find({ userId: userId, memoListStatus: memoListStatus, deleteStatus: 0 }).sort({ createTime: -1 })

        } else {
            MemoList = await this.memoModule.find({ userId: userId, memoListStatus: memoListStatus, deleteStatus: 0, memoListTag: { $elemMatch: { $eq: tagName } } }).sort({ createTime: -1 })

        }

        return MemoList;
    }

    /**
     * 让小灵置顶
     * @param _id 
     * @param isTop 
     * @returns 
     */
    async updateTop(_id: string, isTop: number): Promise<any> {
        if (_id == null) {

        }
        let isTop1 = isTop == 0 ? false : true
        const upodateObject = await this.memoModule.findByIdAndUpdate(_id,
            { isTop: isTop1 }
        )
        if (upodateObject == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }

        return upodateObject;
    }


    /**
     * 编辑归档小灵感
     * @param _id 
     * @param memoList 
     * @param memoListTag 
     * @returns 
     */
    async updateMemo(_id: string, memoList: memoOne[], memoListTag: string[]): Promise<Memo> {
        if (_id == null || memoList == null || memoListTag == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        const updatedata = await this.memoModule.findByIdAndUpdate(_id, { memoList: memoList, memoListTag: memoListTag })
        if (updatedata == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }
        return updatedata;
    }


    /**
     * 查询用户的标签
     * @param userId 
     * @returns 
     */
    async findTag(userId: string, memoListStatus: number): Promise<any> {
        if (userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const findTagData = await this.memoModule.find({ userId: userId, memoListStatus, deleteStatus: 0 }, 'memoListTag')
        if (findTagData == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        let newarrTag = {}
        for (const result of findTagData) {
            result.memoListTag.forEach(item => {
                if (!newarrTag[item]) {
                    newarrTag[item] = 1
                } else {
                    newarrTag[item]++
                }
            })
        }
        return newarrTag;
    }


    /**
     * 小灵感归档功能
     * @param _id 
     * @param memoStatus 
     * @returns 
     */
    async memofile(_id: string, memoStatus: number): Promise<Memo> {
        if (_id == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        const data = await this.memoModule.findByIdAndUpdate(_id, { memoListStatus: memoStatus })
        if (data == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return data;
    }

    /**
     * 删除小灵感
     * @param _id 
     * @param deleteStatus 
     * @returns 
     */
    async deletememo(_id: string): Promise<Memo> {
        if (_id == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        const data = await this.memoModule.findByIdAndUpdate(_id, { deleteStatus: 1 })
        if (data == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }
        return data
    }

}
