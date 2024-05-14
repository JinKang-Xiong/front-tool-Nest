import { FindAll } from './../memo/dto/memo.dto';
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable, Session } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { PictureDocument } from './schemase/picture.schema';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { async } from 'rxjs';
import { config } from 'process';

@Injectable()
export class PictureService {
    // constructor(@InjectModel("task_manager") private taskModule: Model<TaskDocument>) { }

    constructor(@InjectModel("picture_manager") private pictureModule: Model<PictureDocument>) { }

    /**
     * 新增加图片库
     * @param storeName 
     * @param storeDescriptioin 
     * @param userId 
     * @returns 
     */
    async AddStore(storeName: string, storeDescription: string, userId: string): Promise<any> {
        if (storeName == null || storeName == '' || storeDescription == null || storeDescription == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        try {
            const Pciture = new this.pictureModule({ storeName, storeDescription, userId })
            const AddStore = await Pciture.save()
            return { storeName: AddStore.storeName, storeDescriptioin: AddStore.storeDescription }
        } catch (error) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '数据库新增失败')
        }

    }

    /**
     * 查询图片库
     * @param userId 
     */
    async FindAllStore(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }

        const FindAllPicture = await this.pictureModule.find({ userId: userId, deleteStatus: 0 })
        if (!FindAllPicture) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }

        return FindAllPicture;
    }


    /**
     * 修改代码库
     * @param _id 
     * @param storeName 
     * @param storeDescriptioin 
     */
    async UpdateStore(_id: string, storeName: string, storeDescription: string): Promise<any> {
        if (_id == null || storeName == null || storeDescription == null || _id == '' || storeName == '' || storeDescription == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const UpdateDate = await this.pictureModule.findByIdAndUpdate(_id, { storeName, storeDescription })
        if (!UpdateDate) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库修改失败")
        }
        return { storeName: UpdateDate.storeName, storeDescription: UpdateDate.storeDescription }
    }

    /**
     * 删除代码库
     * @param _id 
     */
    async DeleteStore(_id: string): Promise<any> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const DeleteData = await this.pictureModule.findByIdAndUpdate(_id, { deleteStatus: 1 })
        if (!DeleteData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库修改失败")
        }

        return { sotreName: DeleteData.storeName, storeDescription: DeleteData.storeDescription }
    }

    /**
     * 新增图片
     * @param _id 
     * @param pictureUrl 
     * @param pictureName 
     */
    async AddPicture(_id: string, pictureUrl: string, pictureName: string): Promise<any> {
        if (_id == null || _id == '' || pictureUrl == null || pictureUrl == '' || pictureName == null || pictureName == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const AddPictureData = await this.pictureModule.findByIdAndUpdate(_id, { $push: { pictureList: { pictureUrl, pictureName } } }, { new: true })
        if (!AddPictureData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库更新失败")
        }
        return AddPictureData
    }


    /**
     * 查询用户的全部图片
     * @param _id 
     * @param userId 
     */
    async FindAllPicture(_id: string, userId: string, limtDataIndex: number, countData: number): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        // const FindAllPictureData = await this.pictureModule.aggregate([
        //     { $match: { _id: new mongoose.Types.ObjectId(_id), userId } },
        //     {
        //         $project: {
        //             _id: 1,
        //             storeName: 1,
        //             storeDescription: 1,
        //             pictureList: {
        //                 $filter: {
        //                     input: '$pictureList',
        //                     as: 'picture',
        //                     cond: { $eq: ['$$picture.pictureDeleteStatus', 0] }
        //                 }
        //             },
        //             createTime: 1,
        //             updateTime: 1,
        //             deleteStatus: 1,
        //             userId: 1
        //         }
        //     },
        //     { $limit: 1 }, // 在 $project 阶段后添加 $limit 阶段限制整个查询结果只返回一条数据
        //     {
        //         $project: {
        //             _id: 1,
        //             storeName: 1,
        //             storeDescription: 1,
        //             pictureList: { $slice: ['$pictureList', limtDataIndex, countData] }, // 使用 $slice 操作符限制 pictureList 数组返回 10 条数据
        //             createTime: 1,
        //             updateTime: 1,
        //             deleteStatus: 1,
        //             userId: 1
        //         }
        //     }

        // ])
        const storedata = await this.pictureModule.findOne({ _id, userId, deleteStatus: 0 })
        if (storedata.pictureList.length == 0) {
            return [storedata]
        }
        const FindAllPictureData = await this.pictureModule.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(_id), userId } }, // Match specified _id and userId
            { $unwind: '$pictureList' }, // Unwind the pictureList array
            { $match: { 'pictureList.pictureDeleteStatus': 0 } }, // Filter only pictureList with pictureDeleteStatus = 0
            { $sort: { 'pictureList.pictureCreateTime': -1 } }, // Sort by pictureCreateTime descending
            {
                $group: {
                    _id: '$_id',
                    storeName: { $first: '$storeName' },
                    storeDescription: { $first: '$storeDescription' },
                    deleteStatus: { $first: '$deleteStatus' },
                    userId: { $first: '$userId' },
                    createTime: { $first: '$createTime' },
                    updateTime: { $first: '$updateTime' },
                    pictureList: { $push: '$pictureList' }, // Regroup pictureList array
                },
            },
            { $limit: 1 }, // Limit to one result (you mentioned this in your code)
            {
                $project: {
                    _id: 1,
                    storeName: 1,
                    storeDescription: 1,
                    pictureList: { $slice: ['$pictureList', limtDataIndex, countData] }, // Use $slice to limit pictureList array to 10 items
                    createTime: 1,
                    updateTime: 1,
                    deleteStatus: 1,
                    userId: 1
                }
            }])

        if (!FindAllPictureData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        return FindAllPictureData
    }

    /**
     * 查询图片库中有多少条数据
     * @param _id 
     * @param userId 
     * @returns 
     */
    async FindPictureCount(_id: string, userId: string): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }

        const Count = await this.pictureModule.aggregate([
            { $match: { _id: new mongoose.Types.ObjectId(_id), userId } },
            {
                $project: {
                    pictureList: {
                        $filter: {
                            input: '$pictureList',
                            as: 'picture',
                            cond: { $eq: ['$$picture.pictureDeleteStatus', 0] }
                        }
                    },

                }
            },
            {
                $project: {
                    arrayLength: { $size: "$pictureList" }
                }

            }
        ])

        return Count
    }

    /**
     * 删除图片库的图片
     * @param _id 
     * @param pictureuuid 
     */
    async DeletePicture(_id: string, pictureuuid: string): Promise<any> {
        if (_id == null || _id == '' || pictureuuid == null || pictureuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const DeletePictureData = await this.pictureModule.updateOne({ _id }, { $pull: { 'pictureList': { 'pictureuuid': pictureuuid } } })
        if (!DeletePictureData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库修改失败")
        }

        return DeletePictureData;
    }


    /**
     * 移动图片库中的图片
     * @param oldid 
     * @param newid 
     * @param pictureuuid 
     */
    async MoverPicture(oldid: string, newid: string, pictureuuid: string): Promise<any> {
        if (oldid == null || oldid == '' || newid == null || newid == '' || pictureuuid == null || pictureuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const oldDoc = await this.pictureModule.findById(oldid)

        if (!oldDoc) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库查询错误")
        }
        let picture;
        let pictureindex;
        oldDoc.pictureList.forEach((element, index) => {
            if (element.pictureuuid == pictureuuid) {
                picture = element
                pictureindex = index
            }
        });
        console.log(picture)
        oldDoc.pictureList.splice(pictureindex, 1)
        await oldDoc.save()
        const NewUpdate = await this.pictureModule.findByIdAndUpdate(newid, { $push: { pictureList: { pictureName: picture.pictureName, pictureUrl: picture.pictureUrl, pictureTag: picture.pictureTag } } }, { new: true })
        console.log("数据移动成功")
        return NewUpdate
    }

}
