import { FindAll } from './../../memo/dto/memo.dto';
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Group, GroupDocument } from '../schemase/group.schema';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { CodeDocument } from '../schemase/code.schema';

@Injectable()
export class GroupService {
    constructor(@InjectModel("group_relation") private groupModule: Model<GroupDocument>,
        @InjectModel("code_snippet") private codeModel: Model<CodeDocument>) { }

    /**
     * 查询用户的全部代码库
     * @param userId 
     * @returns 
     */
    async FindAll(userId: string): Promise<Group[]> {
        if (userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL, "服务层参数为空")
        }
        const FindAllDate = this.groupModule.find({ userId: userId, deleteStatus: 0 }).sort({ createTime: -1 })
        return FindAllDate
    }


    /**
     * 新增加分组
     * @param groupName 
     * @param userId 
     * @param isDelete 
     * @param firstGroup 
     */
    async AddGroup(groupName: string, userId: string, isDelete: number, firstGroup: number): Promise<any> {
        if (groupName == null || userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        if (isDelete != 0 && isDelete != 1) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "isDelete参数格式错误")
        }
        if (firstGroup != 0 && firstGroup != 1) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "firstGroup参数格式错误")
        }
        try {
            const addgroup = new this.groupModule({ groupName, userId, isDelete, firstGroup })
            const addgroupData = addgroup.save()
            return addgroupData
        }
        catch (err) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, err)
        }
    }

    /**
     * 修改分组的组名
     * @param _id 
     * @param groupName 
     */
    async UpdateGroupName(_id: string, groupName: string): Promise<any> {
        if (_id == null || groupName == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const UpdateGroupNameData = await this.groupModule.findByIdAndUpdate(_id, { groupName })
        console.log("UpdateGroupNameDate")
        console.log(UpdateGroupNameData)
        if (!UpdateGroupNameData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "数据库插入失败")
        }
        return UpdateGroupNameData
    }


    /**
     * 删除分组，并转移用户 ？？？
     * @param _id 
     * @param userId 
     * @param deleteStatus 
     * @param isDelete 
     * @param firstGroup 
     * @returns 
     */
    async DeleteGroup(_id: string, userId: string, deleteStatus: number, isDelete: number, firstGroup: number): Promise<any> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        if (deleteStatus != 0 && deleteStatus != 1) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "deleteStatus参数格式错误")
        }
        //判断其是默认分组，直接返回
        if (firstGroup == 1 && isDelete == 1) {
            return 1
        }
        if (firstGroup == 0 && isDelete == 0) {
            const FirstId = await this.groupModule.findOne({ userId, firstGroup: 1, isDelete: 1, deleteStatus: 0 })
            const UpdateGroupIdData = await this.codeModel.updateMany({ groupId: _id, userId }, { groupId: FirstId._id })
            const DeleteGroupData = await this.groupModule.findOneAndUpdate({ _id }, { $set: { deleteStatus: 1 } })
            return DeleteGroupData
        } else {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, "参数错误")
        }

    }

}
