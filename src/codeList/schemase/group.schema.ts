import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { type } from "os";


export type GroupDocument = Group & Document

@Schema()
export class Group extends Document {

    //定义组名
    @Prop()
    groupName: string

    //定义用户ID
    @Prop()
    userId: string

    //定义创建时间
    @Prop({ default: () => new Date() })
    createTime: Date

    //定义修改时间
    @Prop()
    updateTime: Date

    //删除状态 0-不是删除状态
    @Prop({ default: 0 })
    deleteStatus: number

    //是否可以删除 1-可以删除 0-不可删除
    @Prop({ default: 1 })
    isDelete: number

    //是否默认分组 1-不是 0-是
    @Prop({ default: 1 })
    firstGroup: number

}

export const GroupSchema = SchemaFactory.createForClass(Group)

//在执行save和findOneAndUpdate时会执行中间件
GroupSchema.pre('save', function (this: Group, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    next();
});

GroupSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    next();
});