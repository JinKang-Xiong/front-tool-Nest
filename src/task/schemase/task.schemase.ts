

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { type } from "os";
import { v4 as uuidv4 } from 'uuid'

export type TaskDocument = Task & Document

@Schema({ _id: false })
export class TaskList {
    //任务的id，保持其在数组中的唯一性
    @Prop({ default: () => uuidv4() })
    taskuuid?: string;

    //任务名
    @Prop()
    taskName: string;

    //任务状态 0-未开始，1进行中，2完成
    @Prop({ default: 0 })
    taskStatus?: number;

    //任务时间
    @Prop()
    taskTime: number;

    //任务方向 是正向计时还是倒计时
    @Prop()
    taskDirection: string;

    //任务背景
    @Prop()
    taskBackImg: string;

    //任务删除状态 0计时不删除
    @Prop({ default: 0 })
    taskDeleteStatus?: number;

    //任务完成时间
    @Prop({ default: [] })
    taskFinshTime?: string[];

    //任务完成状态
    @Prop({ default: [], required: false })
    finshStatus?: number[];
}

export type TaskListDocument = TaskList & Document
export const TaskListSchenma = SchemaFactory.createForClass(TaskList)

@Schema()
export class Task extends Document {
    //任务集
    @Prop({ type: [TaskListSchenma], default: [] })
    taskList: TaskList[];

    //归档状态
    @Prop({ default: 0 })
    taskListStatus: number;

    //完成情况
    @Prop()
    performance: number;

    //创建时间
    @Prop({ default: () => new Date() })
    createTime: Date;

    //修改时间
    @Prop()
    updateTime: Date;

    //删除状态 0 不删除 1是删除
    @Prop({ default: 0 })
    deleteStatus: number;

    //用户ID
    @Prop()
    userId: string;

}

export const TaskSchema = SchemaFactory.createForClass(Task)

//在执行save和findOneAndUpdate时会执行中间件
TaskSchema.pre('save', function (this: Task, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    next();
});

TaskSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    next();
});
