import { BaseRespone } from 'src/common/InterfaceBase';
import { FileTaskList, FinshTask, InserTaskDto, InsertTaskListDto } from './dto/task.dto';
import { TaskService } from './task.service';
/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Post, Put, Query, HttpException, HttpStatus } from '@nestjs/common';
import { Task, } from './schemase/task.schemase';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';
import { query } from 'express';
import { config } from 'process';

@Controller("task")
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    /**
     * 新增加任务集
     * @param taskadd 
     * @returns 
     */
    @Post('addtasklist')
    async addTaskList(@Body() tasklistadd: InsertTaskListDto): Promise<BaseRespone<Task>> {
        let userId = tasklistadd.userId;
        let taskList = tasklistadd.taskList;
        if (userId == null || taskList == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const data = await this.taskService.inserTaskList(tasklistadd)
        if (data == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }

        return ResultUtils.success(data)
    }

    /**
     * 新增加任务集中的任务
     * @param taskadd 
     * @returns 
     */
    @Post('addtask')
    async addTask(@Body() taskadd: InserTaskDto): Promise<BaseRespone<Task>> {
        console.log("进来啦")
        let _id = taskadd._id;
        let taskList = taskadd.taskList;
        console.log(_id, taskList)
        if (taskList == null || _id == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }

        const data = await this.taskService.insertTask(_id, taskList.taskName, taskList.taskTime, taskList.taskDirection, taskList.taskBackImg, taskList.taskStatus)
        console.log('执行方法')
        if (data == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }

        return ResultUtils.success(data)
    }

    /**
     * 提前完成计时和完成计时功能
     * @param finshtask 
     * @returns 
     */
    @Post('finshtask')
    async finshTask(@Body() finshtask: FinshTask): Promise<BaseRespone<any>> {
        let _id = finshtask._id;
        let taskuuid = finshtask.taskList.taskuuid;
        let taskName = finshtask.taskList.taskName;
        let taskStatus = finshtask.taskList.taskStatus
        let taskFinshTime = finshtask.taskList.taskFinshTime;
        let finshStatus = finshtask.taskList.finshStatus;
        if (_id == null || taskuuid == null || taskName == null || taskStatus == null || taskFinshTime == null || finshStatus == null ||
            _id == '' || taskuuid == '' || taskName == '' || taskFinshTime == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const finshdata = await this.taskService.updatefinshStatus(_id, taskuuid, taskName, taskStatus, taskFinshTime, finshStatus)
        if (finshdata == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }

        return ResultUtils.success(finshdata);
    }

    /**
     * 编辑任务集中的单个任务
     * @param data 
     * @returns 
     */
    @Post('updatetask')
    async updateTask(@Body() data: InserTaskDto): Promise<BaseRespone<any>> {
        let _id = data._id;
        let taskuuid = data.taskList.taskuuid;
        let taskName = data.taskList.taskName;
        let taskTime = data.taskList.taskTime;
        let taskDirection = data.taskList.taskDirection;
        if (_id == null || taskuuid == null || taskName == null || taskTime == null || taskDirection == null ||
            _id == '' || taskuuid == '' || taskName == '' || taskDirection == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        if (taskDirection != '倒计时' && taskDirection != '正向计时') {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据格式不正确')
        }
        const updatedata = await this.taskService.updateTask(_id, taskuuid, taskName, taskTime, taskDirection)
        if (updatedata == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }

        return ResultUtils.success(updatedata)
    }

    /**
     * 删除单个任务集
     * @param _id 
     * @param taskuuid 
     * @returns 
     */
    @Put('deletetask')
    async deleteTask(@Query('_id') _id: string, @Query('taskuuid') taskuuid: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || taskuuid == null || taskuuid == '') {
            console.log('有异常')
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        const deletedata = await this.taskService.updateTaskDeleteStatus(_id, taskuuid)
        if (deletedata == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }

        return ResultUtils.success(deletedata)
    }

    /**
     * 查询用户的全部数据_归档的和未归档的
     * @param userId 
     * @returns 
     */
    @Get('findall')
    async finAll(@Query('userId') userId: string, @Query('taskListStatus') taskListStatus: number): Promise<BaseRespone<Task[]>> {
        if (userId == null || userId == '' || taskListStatus == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        let taskListStatus1 = Number(taskListStatus)
        const findallData = await this.taskService.findAllByuserId(userId, taskListStatus1);
        return ResultUtils.success(findallData)
    }

    /**
     * 查询任务集中的单个任务
     * @param _id 
     * @param uuid 
     * @returns 
     */
    @Get('findtask')
    async findTask(@Query('_id') _id: string, @Query('uuid') uuid: string): Promise<BaseRespone<Task>> {
        console.log(_id + uuid)
        if (_id == null || _id == '' || uuid == null || uuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }

        const findTaslData = await this.taskService.findTaskByuuid(_id, uuid);
        if (findTaslData == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }

        return ResultUtils.success(findTaslData);

    }

    /**
     * 归档功能
     * @param filedata 
     * @returns 
     */
    @Post('filetasklist')
    async FileTaskList(@Body() filedata: FileTaskList): Promise<BaseRespone<Task>> {
        console.log(filedata)
        if (filedata._id == null || filedata._id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL, "控制器参数为空")
        }

        const serviceData = await this.taskService.fileTaskList(filedata._id, filedata.finshStatusArray, filedata.taskTimeArray);
        if (serviceData == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "控制器参数报错")
        }
        return ResultUtils.success(serviceData)
    }


    @Put('deletefiletask')
    async DeleteFileTaskCon(@Query('_id') _id: string, @Query('userId') userId: string): Promise<BaseRespone<Task>> {
        console.log(_id)
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const DeleteFileTaskConData = await this.taskService.deleteFileTask(_id, userId)
        if (!DeleteFileTaskConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(DeleteFileTaskConData)
    }

}
