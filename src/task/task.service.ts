import mongoose, { Model } from 'mongoose';
import { Task, TaskDocument, TaskList } from './schemase/task.schemase';
import { TaskModule } from './task.module';
import { v4 as uuidv4 } from 'uuid'
import { DELETESUCESS } from 'src/constant/TaskConstant';
/*
https://docs.nestjs.com/providers#services
*/

import { InjectModel } from '@nestjs/mongoose';
import { Injectable } from '@nestjs/common';
import { InserTaskDto, InsertTaskListDto } from './dto/task.dto';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { config } from 'process';

@Injectable()
export class TaskService {
    constructor(@InjectModel("task_manager") private taskModule: Model<TaskDocument>) { }

    /**
     * 新增加任务集
     * @param task 
     */
    async inserTaskList(task: InsertTaskListDto): Promise<Task> {
        let taskList = task.taskList;
        let userId = task.userId;
        if (taskList == null || userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);

        }
        const createTask = new this.taskModule(task);
        return await createTask.save()
    }


    /**
     * 新增加任务集中的任务
     * @param task 
     */
    async insertTask(_id: string, taskName: string, taskTime: number, taskDirection: string, taskBackImg: string, taskStatus: number): Promise<Task> {
        console.log("进来了1")
        console.log(taskName, _id)
        console.log(taskDirection)
        if (taskDirection == '正向计时') {
            taskTime = 0
        }
        if (_id == null || taskName == null || taskTime == null ||
            taskDirection == null || taskBackImg == null || taskStatus == null) {
            console.log("是空吗")
            throw new BusinessException(ErrorCode.PARAM_NULL);

        }

        const myTask = await this.taskModule.findById(_id)
        const newTaskList: TaskList = {
            taskName: taskName, taskTime: taskTime, taskDirection: taskDirection,
            taskBackImg: taskBackImg
        };
        myTask.taskList.push(newTaskList)
        myTask.save()
        return myTask;
    }

    /**
     * 对完成的时间量进行一个保存，包括完成时的时间进行统计
     * @param _id 
     * @param taskuuid 
     * @param taskName 
     * @param taskStatus 
     * @param taskFinshTime 
     * @param finshStatus 
     * @returns 
     */
    async updatefinshStatus(_id: string, taskuuid: string, taskName: string, taskStatus: number, taskFinshTime: string, finshStatus: number): Promise<any> {
        if (_id == null || taskuuid == null || taskName == null || taskStatus == null || taskFinshTime == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        const updatedata = this.taskModule.updateOne(
            { _id: _id, 'taskList.taskuuid': taskuuid },
            {
                $push: { 'taskList.$.taskFinshTime': taskFinshTime, 'taskList.$.finshStatus': finshStatus },
                $set: { 'taskList.$.taskStatus': 2 }
            }
        )

        if (updatedata == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }

        return updatedata;
    }

    /**
     * 编辑任务集中的单个任务
     * @param _id 
     * @param taskuuid 
     * @param taskName 
     * @param taskTime 
     * @param taskDirection 
     * @returns 
     */
    async updateTask(_id: string, taskuuid: string, taskName: string, taskTime: number, taskDirection: string): Promise<any> {
        if (_id == null || taskuuid == null || taskName == null || taskTime == null || taskDirection == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const updatedata = this.taskModule.updateOne(
            { _id: _id, 'taskList.taskuuid': taskuuid },
            { $set: { 'taskList.$.taskName': taskName, 'taskList.$.taskTime': taskTime, 'taskList.$.taskDirection': taskDirection } }
        )
        if (updatedata == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }

        return updatedata
    }

    /**
     * 删除任务集中单个任务
     * @param _id 
     * @param taskuuid 
     * @returns 
     */
    async updateTaskDeleteStatus(_id: string, taskuuid: string): Promise<any> {
        if (_id == null || taskuuid == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        const updatedata = this.taskModule.updateOne(
            { _id: _id, 'taskList.taskuuid': taskuuid },
            { $set: { 'taskList.$.taskDeleteStatus': 1 } }
        )
        if (updatedata == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }

        return updatedata
    }

    /**
     * 查询全部用户的全部数据
     * @param userId 
     * @returns 
     */
    async findAllByuserId(userId: string, taskListStatus: number): Promise<Task[]> {
        if (userId == null || userId == '' || taskListStatus == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        const findData = this.taskModule.aggregate([
            { $match: { userId: userId, taskListStatus: taskListStatus, deleteStatus: 0 } },
            {
                $project: {
                    _id: 1,
                    taskList: {
                        $filter: {
                            input: '$taskList',
                            as: 'task',
                            cond: { $eq: ['$$task.taskDeleteStatus', 0] }
                        }
                    },
                    taskListStatus: 1,
                    performance: 1,
                    createTime: 1,
                    updateTime: 1,
                    deleteStatus: 1,
                    userId: 1
                }
            }
        ])
        console.log('-----findData-----')
        return findData;
    }

    /**
     * 查询任务集中单个任务
     * @param _id 
     * @param uuid 
     * @returns 
     */
    async findTaskByuuid(_id: string, uuid: string): Promise<Task> {
        if (_id == null || uuid == null || _id == '' || uuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const findData = this.taskModule.findOne({ _id: _id, 'taskList.taskuuid': uuid }, { 'taskList.$': 1 })
        if (findData == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }

        return findData;
    }

    /**
     * 归档功能
     * @param _id 
     * @param finshStatusArray 
     * @param taskTimeArray 
     * @returns 
     */
    async fileTaskList(_id: string, finshStatusArray: number[], taskTimeArray: number[]): Promise<Task> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        let finshSum = finshStatusArray.reduce((accumulator, currentValue) => {
            return accumulator + currentValue
        }, 0)
        let taskTimeSum = taskTimeArray.reduce((accumulator, currentValue) => {
            return accumulator + currentValue
        }, 0)
        console.log('finshSum=' + finshSum + 'taskTimeSum=' + taskTimeSum)
        let divideData = finshSum / taskTimeSum
        console.log(divideData)
        const fileTask = this.taskModule.findByIdAndUpdate(_id, { performance: divideData, taskListStatus: 1 })
        if (fileTask == null) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库修改失败');
        }
        return fileTask
    }


    /**删除归档的任务集
     * @param _id 
     */
    async deleteFileTask(_id: string, userId: string): Promise<any> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }

        console.log(_id + userId)
        const DeleteFileTaskData = await this.taskModule.findOneAndUpdate({ _id, userId }, { $set: { deleteStatus: 1 } })
        console.log(DeleteFileTaskData)
        if (!DeleteFileTaskData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        return DELETESUCESS
    }

}
