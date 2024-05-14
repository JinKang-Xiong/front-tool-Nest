import { FindAll } from './../../memo/dto/memo.dto';
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Delete } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CodeModule } from './code.module';
import Module from 'module';
import { Code, CodeDocument, CodeListOne } from '../schemase/code.schema';
import mongoose, { Model } from 'mongoose';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { DELETESUCESS, UPDATEERR } from 'src/constant/TaskConstant';
import { TipOffDocument } from 'src/tipoff/schemas/tipoff.schema';

@Injectable()
export class CodeService {
    constructor(@InjectModel("code_snippet") private codeModel: Model<CodeDocument>,
        @InjectModel('user_tipoff') private tipoffModel: Model<TipOffDocument>) { }

    /**
     * 增加代码库
     * @param storeName 
     * @param storeDescription 
     * @param groupId 
     * @param userId 
     * @returns 
     */
    async AddCodeStore(storeName: string, storeDescription: string, groupId: string, userId: string): Promise<any> {
        if (storeName == null || storeName == '' || storeDescription == null || storeDescription == '' || groupId == null || groupId == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        try {
            const Code = new this.codeModel({ storeName, storeDescription, groupId, userId })
            const CodeData = await Code.save()
            //不能把其插入的原数据返回，不安全，理解为数据过滤
            return { storeName: CodeData.storeName, storeDescription: CodeData.storeDescription }
        } catch (err) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }

    }


    /**
     * 查询用户的全部代码库
     * @param userId 
     */
    async FindAllStore(userId: string): Promise<Code[]> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FindAllData = await this.codeModel.find({ userId, deleteStatus: 0 }, { codeList: { $slice: -3 } })
        if (!FindAllData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库查询失败")
        }
        return FindAllData;
    }

    /**
     * 修改代码库
     * @param _id 
     * @param storeName 
     * @param storeDescription 
     */
    async UpdateStore(_id: string, storeName: string, storeDescription: string): Promise<any> {
        if (_id == null || _id == '' || storeName == null || storeName == '' || storeDescription == null || storeDescription == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const UpdateStoreData = await this.codeModel.findByIdAndUpdate(_id, { storeName, storeDescription })
        if (!UpdateStoreData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库修改失败")
        }
        return { storeName: UpdateStoreData.storeName, storeDescription: UpdateStoreData.storeDescription }
    }

    /**
     * 删除代码库
     * @param _id 
     */
    async DeleteStore(_id: string): Promise<any> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const DeleteStoreData = await this.codeModel.findByIdAndUpdate(_id, { deleteStatus: 1, })
        if (!DeleteStoreData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库删除失败")
        }
        return { storeName: DeleteStoreData.storeName, storeDescription: DeleteStoreData.storeDescription }
    }


    /**
     * 查询单个代码库中的全部代码片段
     * @param _id 
     * @param userId 
     */
    async FindAllSnippet(_id: string, userId: string, codeIsPrivate: number): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        console.log('codeIsPrivate=' + codeIsPrivate)
        let FindAllSnippetData
        if (codeIsPrivate == 3) {
            FindAllSnippetData = await this.codeModel.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(_id), userId } },
                {
                    $project: {
                        _id: 1,
                        codeList: {
                            $filter: {
                                input: '$codeList',
                                as: 'code',
                                cond: { $eq: ['$$code.codeDeleteStatus', 0] }
                            }
                        },
                        storeName: 1,
                        storeDescription: 1,
                        openStoreCount: 1,
                        abnirmalStatus: 1,
                        groupId: 1,
                        createTime: 1,
                        updateTime: 1,
                        deleteStatus: 1,
                        userId: 1
                    }
                }
            ])

        } else {
            FindAllSnippetData = await this.codeModel.aggregate([
                { $match: { _id: new mongoose.Types.ObjectId(_id), userId } },
                {
                    $project: {
                        _id: 1,
                        codeList: {
                            $filter: {
                                input: '$codeList',
                                as: 'code',
                                cond: {
                                    $and: [
                                        { $or: [{ $eq: ['$$code.codeIsPrivate', codeIsPrivate] }, { $eq: ['$$code.codeIsPrivate', 2] }] },
                                        { $eq: ['$$code.codeDeleteStatus', 0] }
                                    ]
                                }
                            }
                        },
                        storeName: 1,
                        storeDescription: 1,
                        openStoreCount: 1,
                        abnirmalStatus: 1,
                        groupId: 1,
                        createTime: 1,
                        updateTime: 1,
                        deleteStatus: 1,
                        userId: 1
                    }
                }
            ])
        }
        if (!FindAllSnippetData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库查询失败")
        }
        return FindAllSnippetData
    }

    /**
     * 根据id查询代码片段
     * @param _id 
     * @param codeuuid 
     */
    async FindSnippetById(_id: string, codeuuid: string): Promise<any> {
        if (_id == null || _id == '' || codeuuid == null || codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FindSnippetByIdData = await this.codeModel.findOne({ _id, 'codeList.codeuuid': codeuuid })
        if (!FindSnippetByIdData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        return FindSnippetByIdData
    }

    /**
     * 新增加代码片段
     * @param _id 
     * @param codeTitle 
     * @param codeDescription 
     * @param codeTag 
     */
    async AddSnippet(_id: string, codeTitle: string, codeRunResult: string[], codeSnippet: string, codeDescription: string, codeTag: string[], codeLanguage: string): Promise<any> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const AddSnippetData = await this.codeModel.findByIdAndUpdate({ _id }, { $push: { codeList: { codeTitle, codeDescription, codeSnippet, codeTag, codeLanguage, codeRunResult } } }, { new: true })
        if (!AddSnippetData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库修改失败")
        }

        return AddSnippetData
    }

    /**
 * 新增加代码片段
 * @param _id 
 * @param codeTitle 
 * @param codeDescription 
 * @param codeTag 
 */
    async AddSnippet1(_id: string, codeTitle: string, codeSnippet: string, codeDescription: string, codeTag: string[], codeLanguage: string): Promise<any> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const AddSnippetData = await this.codeModel.findByIdAndUpdate({ _id }, { $push: { codeList: { codeTitle, codeDescription, codeSnippet, codeTag, codeLanguage, } } }, { new: true })
        const AddSuccessData = AddSnippetData.codeList.slice(-1)
        if (!AddSnippetData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库修改失败")
        }

        return AddSuccessData
    }


    /**
     * 根据标题和标签来查询代码片段
     * @param _id 
     * @param userId 
     * @param inputValue 
     * @returns 
     */
    async FindSnippetByTitle(_id: string, userId: string, inputValue: string): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const FindSnippetByTitleData = await this.codeModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(_id), deleteStatus: 0, userId } },
            {
                $project: {
                    _id: 1, codeList: {
                        $filter: {
                            input: '$codeList', as: 'code', cond: {
                                $and: [
                                    { $eq: ['$$code.codeDeleteStatus', 0] },
                                    {
                                        $or: [
                                            { $regexMatch: { input: '$$code.codeTitle', regex: new RegExp(inputValue, 'i') } },
                                            {
                                                $anyElementTrue: {
                                                    $map: {
                                                        input: '$$code.codeTag', as: 'tag', in: { $regexMatch: { input: '$$tag', regex: new RegExp(inputValue, 'i') } }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                ]


                            }
                        }
                    },
                    storeName: 1,
                    storeDescription: 1,
                    openStoreCount: 1,
                    abnirmalStatus: 1,
                    groupId: 1,
                    createTime: 1,
                    updateTime: 1,
                    deleteStatus: 1,
                    userId: 1
                }
            }
        ])

        return FindSnippetByTitleData
    }


    /**
     * 修改代码库的代码片段
     * @param _id 
     * @param codeuuid 
     * @param codeTitle 
     * @param codeTag 
     * @param codeSnippet 
     * @returns 
     */
    async UpdateSnippet(_id: string, codeuuid: string, codeTitle: string, codeDescription: string, codeTag: string, codeSnippet: string, codeLanguage: string): Promise<any> {
        if (_id == null || _id == '' || codeuuid == null || codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const UpdateSnippetData = await this.codeModel.updateOne({ _id, 'codeList.codeuuid': codeuuid },
            { $set: { 'codeList.$.codeTitle': codeTitle, 'codeList.$.codeDescription': codeDescription, 'codeList.$.codeTag': codeTag, 'codeList.$.codeSnippet': codeSnippet, 'codeList.$.codeLanguage': codeLanguage } })
        if (!UpdateSnippetData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        return UpdateSnippetData

    }


    /**
     * 删除代码片段
     * @param _id 
     * @param codeuuid 
     */
    async DeleteSnippet(_id: string, codeuuid: string): Promise<any> {
        if (_id == null || codeuuid == null || _id == '' || codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const DeleteSnippteData = await this.codeModel.findOneAndUpdate({ _id }, { $pull: { 'codeList': { 'codeuuid': codeuuid } } })
        if (!DeleteSnippteData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库修改失败")
        }
        return DeleteSnippteData;
    }


    /**
     * 修改代码片段的私有性
     * @param _id 
     * @param codeuuid 
     * @param userId 
     * @param isPrivate 
     */
    async UpdateIsPriVate(_id: string, codeuuid: string, userId: string, isPrivate: number): Promise<any> {
        if (_id == null || _id == '' || userId == '' || userId == null || codeuuid == '' || codeuuid == null || isPrivate == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const codeData = await this.codeModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(_id) } },
            { $unwind: '$codeList' },
            { $match: { 'codeList.codeuuid': codeuuid, 'codeList.codeDeleteStatus': 0 } }
        ])
        if (codeData[0].codeList.isMonitor == 1) {
            if (isPrivate == 1) {
                const tipoff = await this.tipoffModel.findOneAndUpdate({ codeId: _id, codeuuid, isDisPose: 1 }, { $set: { resourceStatus: 1 } })
                if (!tipoff) {
                    throw new BusinessException(ErrorCode.PARAM_ERROR_SER, 'tipoff数据库修改失败')
                }
                return UPDATEERR
            } else {
                return UPDATEERR
            }
        }

        const UpdateIsPriVateData = await this.codeModel.updateOne({ _id, userId, 'codeList.codeuuid': codeuuid }, { $set: { 'codeList.$.codeIsPrivate': isPrivate } })


        //设置整个文档中是否有公有资源
        const FindCodeSnippetIsPrivate = await this.codeModel.findOne({ _id, codeList: { $elemMatch: { codeIsPrivate: 1 } } })
        if (FindCodeSnippetIsPrivate != null) {
            const UpdateIsPartPublic = await this.codeModel.updateOne({ _id, userId }, { $set: { isPartPublic: 1 } })
        } else {
            const UpdateIsPartPublic = await this.codeModel.updateOne({ _id, userId }, { $set: { isPartPublic: 0 } })

        }
        return UpdateIsPriVateData
    }


    /**
     * 搜索功能
     * @param searchByCodeValue 
     */
    async SearchByCode(searchByCodeValue: string): Promise<any> {
        const SearchByCodeData = await this.codeModel.aggregate([
            { $match: { deleteStatus: 0, isPartPublic: 1 } },
            { $unwind: '$codeList' },
            { $match: { 'codeList.codeIsPrivate': 1, $or: [{ "codeList.codeTitle": { $regex: searchByCodeValue, $options: "i" } }, { "codeList.codeTag": { $regex: searchByCodeValue, $options: "i" } }] } },
            {
                $project: {
                    _id: 1,
                    "codeList.codeuuid": 1,
                    "codeList.codeTitle": 1,
                    "codeList.codeDescript": 1,
                    "codeList.codeSnippet": 1,
                    "codeList.codeTag": 1,
                    "codeList.codeCreateTime": 1,
                    "codeList.codeUpdateTime": 1,
                    "codeList.codeDeleteStatus": 1,
                    "codeList.codeIsEdit": 1,
                    "codeList.codeIsPrivate": 1,
                    "codeList.likeNumber": 1,
                    "codeList.collectNumber": 1,
                    "codeList.tipoffNumber": 1,
                    "codeList.codeLanguage": 1
                }
            }])
        return SearchByCodeData
    }


    /**
     * 根据_id和codeuuid查询单个代码片段
     * @param _id 
     * @param codeuuid 
     */
    async FindByCodeuuid(_id: string, codeuuid: string): Promise<any> {
        if (_id == null || _id == '' || codeuuid == null || codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }

        const CodeSnippetData = await this.codeModel.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(_id) } },
            { $unwind: '$codeList' },
            { $match: { 'codeList.codeuuid': codeuuid, 'codeList.codeDeleteStatus': 0 } }
        ])
        if (!CodeSnippetData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库擦查询失败')
        }
        return CodeSnippetData
    }


    /**
     * 增加运行结果图
     * @param codeRunResult 
     */
    async CodeRunResultUpload(_id: string, codeuuid: string, codeRunResult: string): Promise<any> {
        if (_id == null || _id == '' || codeuuid == null || codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const CodeRunResultData = await this.codeModel.findOneAndUpdate({ _id, 'codeList.codeuuid': codeuuid }, { $push: { 'codeList.$.codeRunResult': codeRunResult } })
        if (!CodeRunResultData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库插入失败")
        }
        return CodeRunResultData
    }


    /**
     * 删除结果运行图
     * @param _id 
     * @param codeuuid 
     * @param codeRunResult 
     * @returns 
     */
    async CodeRunResultDelete(_id: string, codeuuid: string, codeRunResult: string): Promise<any> {
        if (_id == null || _id == '' || codeuuid == null || codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        console.log(codeRunResult)
        const CodeRunResultData = await this.codeModel.findOneAndUpdate({ _id, 'codeList.codeuuid': codeuuid }, { $pull: { 'codeList.$.codeRunResult': codeRunResult } }, {
            new: true, // 返回更新后的文档
        })
        if (!CodeRunResultData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库插入失败")
        }
        return DELETESUCESS
    }


    /**
     * 查询热门的代码片段
     */
    async FindHotPublicCode(): Promise<any> {
        const data = await this.codeModel.aggregate([
            { $match: { isPartPublic: 1, deleteStatus: 0 } },
            { $unwind: "$codeList" },
            { $match: { 'codeList.codeIsPrivate': 1, 'codeList.codeDeleteStatus': 0 } },
            {
                $project: {
                    codeList: 1
                }
            },
            {
                $sort: { 'codeList.likeNumber': -1 }
            },
            { $limit: 3 }
        ])
        return data
    }




}
