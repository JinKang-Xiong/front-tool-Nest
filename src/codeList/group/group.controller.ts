
/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Get, Query, Post, Put, Body } from '@nestjs/common';
import { GroupService } from './group.service';
import { BaseRespone } from 'src/common/InterfaceBase';
import { Group } from '../schemase/group.schema';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';
import { AddGroupDto, DeleteGroupDto } from '../dto/group.dto';

@Controller("group")
export class GroupController {
    constructor(private readonly groupService: GroupService) { }

    /**
     * 查询用户的全部代码库
     * @param userId 
     * @returns 
     */
    @Get("findall")
    async FindAllCon(@Query('userId') userId: string): Promise<BaseRespone<Group[]>> {
        if (userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL, "控制器的参数为空")
        }
        const findallConDate = await this.groupService.FindAll(userId);

        return ResultUtils.success(findallConDate)
    }

    /**
     * 新增加分组
     * @param group 
     */
    @Post("add")
    async AddGroupCon(@Body() group: AddGroupDto): Promise<BaseRespone<Group>> {
        let groupName = group.groupName;
        let userId = group.userId;
        let isDelete = group.isDelete;
        let firstGroup = group.firstGroup;
        if (groupName == null || userId == null || groupName == '' || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL, "控制器参数为空")
        }
        if (isDelete != 0 && isDelete != 1) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "isDelete参数格式错误")
        }
        if (firstGroup != 0 && firstGroup != 1) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "firstGroup参数格式错误")
        }
        const AddGroupConData = await this.groupService.AddGroup(groupName, userId, isDelete, firstGroup)

        return ResultUtils.success(AddGroupConData)
    }

    /**
     * 修改任务
     * @param _id 
     * @param userId 
     * @returns 
     */
    @Put("updateName")
    async UpdateNameCon(@Query("_id") _id: string, @Query("groupName") groupName: string): Promise<BaseRespone<any>> {
        if (_id == null || groupName == null || _id == '' || groupName == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const UpdateNameConData = await this.groupService.UpdateGroupName(_id, groupName)
        if (!UpdateNameConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "插入数据库失败")
        }
        return ResultUtils.success(UpdateNameConData)
    }

    /**
     * 删除分组，并移动代码库
     * @param deletegroup 
     * @returns 
     */
    @Post("delete")
    async DeleteGroupCon(@Body() deletegroup: DeleteGroupDto): Promise<BaseRespone<any>> {
        let _id = deletegroup._id
        let userId = deletegroup.userId;
        let deleteStatus = deletegroup.deleteStatus;
        let isDelete = deletegroup.isDelete;
        let firstGroup = deletegroup.firstGroup;
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        if (deleteStatus != 0 && deleteStatus != 1 && isDelete != 0 && isDelete != 1 && firstGroup != 0 && firstGroup != 1) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "deleteStatus,isDelete,firstGroup的数据格式错误")
        }
        const DeleteGroupConData = await this.groupService.DeleteGroup(_id, userId, deleteStatus, isDelete, firstGroup);
        if (DeleteGroupConData == 1) {
            return ResultUtils.warn(DeleteGroupConData)
        }
        return ResultUtils.success(DeleteGroupConData)
    }

}
