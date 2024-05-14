import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { v4 as uuidv4 } from 'uuid'


export type MessageDocument = Message & Document

@Schema()
export class Message extends Document {
    //用户id
    @Prop()
    userId: string

    //管理员id
    @Prop()
    bigManagerId: string

    //消息内容
    @Prop()
    message: string

    //消息状态
    @Prop({ default: 0 })
    messageStatus: number

    //创建时间
    @Prop({ default: () => new Date() })
    createTime: Date

    //修改时间
    @Prop()
    updateTime: Date

    //删除状态
    @Prop({ default: 0 })
    deleteStatus: number

}

export const MessageSchema = SchemaFactory.createForClass(Message)

//在执行save和findOneAndUpdate时会执行中间件
MessageSchema.pre('save', function (this: Message, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    next();
});

MessageSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    next();
});