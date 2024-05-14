import { Collect } from './../schemase/collect.schema';
import { async } from 'rxjs';
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

@Injectable()
export class CollectService {
    constructor(@InjectModel('collect_relation') private collectModule: Model<CollectDocument>,
        @InjectModel('code_snippet') private codeModule: Model<CodeDocument>) { }


    /**
     * 查询用户收藏关系
     * @param userId 
     * @returns 
     */
    async FindCollect(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FindByUserIdData = await this.collectModule.find({ userId, deleteStatus: 0 })

        return FindByUserIdData
    }

    /**
     * 增加用户的收藏夹
     * @param userId 
     * @param collectName 
     * @param collectDescription 
     * @returns 
     */
    async AddCollect(userId: string, collectName: string, collectDescription: string): Promise<any> {
        if (userId == '' || userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        try {
            const AddCollectData = new this.collectModule({ userId, collectName, collectDescription })
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
    async FindByCodeSnippet(_id: string, userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FindByCodeId = await this.collectModule.findOne({ _id, userId, deleteStatus: 0 })
        const CodeArr = [];
        for (const item of FindByCodeId.codeSnippsetCollect) {
            const codeId = item.codeId;
            const codeuuid = item.codeuuid;
            const res = await this.codeModule.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(codeId) } },
                { $unwind: '$codeList' },
                { $match: { 'codeList.codeuuid': codeuuid, 'codeList.codeDeleteStatus': 0, 'codeList.codeIsPrivate': 1 } }
            ])
            // const res = await this.codeModule.findOne({ _id: codeId, 'codeList.codeuuid': codeuuid, 'codeList.codeIsPrivate': 1 }, { 'codeList.$': 1, 'userId': 1 });
            CodeArr.push(...res);

        }
        return CodeArr;
    }



    /**
     * 增加用户的收藏的关系
     * @param _id 
     * @param codeuuid 
     * @param codeNumber 
     */
    async AddCodeSnipeet(userId: string, codeId: string, codeuuid: string, collectNumber: number, _id?: string): Promise<any> {
        if (codeId == null || codeId == '' || codeuuid == null || codeuuid == '' || collectNumber == null || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let newcollectNumber = collectNumber + 1
        const AddData = this.collectModule.findOneAndUpdate({ _id, userId }, { $push: { codeSnippsetCollect: { codeId, codeuuid } } })
        if (!AddData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        const CodeData = await this.codeModule.findOneAndUpdate({ _id: codeId, 'codeList.codeuuid': codeuuid }, { $set: { 'codeList.$.collectNumber': newcollectNumber } })
        return AddData
    }


    /**
     * 取消收藏得功能
     * @param _id 
     * @param userId 
     * @param codeId 
     * @returns 
     */
    async UpdateCodeSnippetCollect(_id: string, userId: string, codeId: string): Promise<any> {
        if (_id == null || _id == '' || userId == '' || userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const Data = await this.collectModule.findOneAndUpdate({ _id, userId }, { $pull: { codeSnippsetCollect: { codeId } } })
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
        const UpdateNameAndDesData = await this.collectModule.findOneAndUpdate({ _id, userId }, { $set: { collectName, collectDescription } })
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
        const UpdateDeleteStatusData = await this.collectModule.findOneAndUpdate({ _id, userId }, { deleteStatus: 1 })
        if (!UpdateDeleteStatusData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库修改失败')
        }
        return UpdateDeleteStatusData;
    }

}
