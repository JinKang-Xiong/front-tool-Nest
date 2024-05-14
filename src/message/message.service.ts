import { Param } from '@nestjs/common';
/*
https://docs.nestjs.com/providers#services
*/

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { MessageDocument } from './schemase/message.schema';
import { Model } from 'mongoose';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';

@Injectable()
export class MessageService {
    constructor(@InjectModel('message_manager') private messageModel: Model<MessageDocument>) { }

    /**
     * 查询用户的全部消息
     * @param userId 
     */
    async FindAll(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }

        const data = await this.messageModel.find({ userId, deleteStatus: 0 }).sort({ createTime: -1 })
        return data
    }


    /**
     * 删除用户全部消息
     * @param userId 
     */
    async DeleteAll(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const updateDate = await this.messageModel.updateMany({ userId }, { $set: { deleteStatus: 1 } })
        if (!updateDate) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER, '修改失败')
        }
        return updateDate
    }

    /**
     * 删除单个消息
     * @param userId 
     * @param id 
     * @returns 
     */
    async DeleteOne(userId: string, _id: string): Promise<any> {
        if (userId == null || userId == "" || _id == null || _id == "") {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const updateOne = await this.messageModel.findOneAndUpdate({ _id, userId }, { $set: { deleteStatus: 1 } })
        if (!updateOne) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        return updateOne
    }

    /**
     * 把消息全部改为已读
     */
    async UpdateAllStatus(userId: string): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const updateData = await this.messageModel.updateMany({ userId }, { $set: { messageStatus: 1 } })
        if (!updateData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR_SER)
        }
        return updateData
    }


    /**
     * 查询用户全部消息的状态
     * @param userId 
     * @returns 
     */
    async FindAllStatus(userId): Promise<any> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        const findalldata = await this.messageModel.find({ userId, deleteStatus: 0 }, { messageStatus: 1 })
        return findalldata;
    }

}
