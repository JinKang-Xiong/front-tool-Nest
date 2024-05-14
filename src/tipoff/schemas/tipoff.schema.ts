
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { v4 as uuidv4 } from 'uuid'
import { Document } from 'mongoose';


export type TipOffDocument = TipOff & Document
export type TipOffOneDocument = TipOffOne & Document

@Schema({ _id: false })
export class TipOffOne {

    //用户id
    @Prop()
    userId: string

    //用户的名称
    @Prop()
    username: string

    //用户头像
    @Prop()
    userAvatarUrl: string

    //反馈类型
    @Prop({ default: '' })
    type: string

    //反馈内容
    @Prop()
    content: string

}

export const TipOffOneSchema = SchemaFactory.createForClass(TipOffOne)

@Schema()
export class TipOff extends Document {

    //用户ID
    @Prop()
    userId: string

    //模块种类-代码片段管理，书籍管理，笔记管理
    @Prop()
    moduleType: string

    //反馈信息
    @Prop({ type: [TipOffOneSchema], default: [] })
    tipoffContent: TipOffOne[]

    //反馈的代码片段在哪个库
    @Prop({ default: '' })
    codeId: string

    //反馈的代码片段的id
    @Prop({ default: '' })
    codeuuid: string

    //反馈的笔记id
    @Prop({ default: '' })
    noteId: string

    //反馈的书籍id
    @Prop({ default: '' })
    bookId: string

    //监控期的状态
    @Prop({ default: 0 })
    resourceStatus: number

    //是否处理了 0-默认-没处理
    @Prop({ default: 0 })
    isDisPose: number

    //处理的状态 0 ——进行中，1-是通过,2-是封禁
    @Prop({ default: 0 })
    disPostStatus: number

    //创建时间
    @Prop({ default: () => new Date() })
    createTime: Date

    //修改时间
    @Prop()
    updateTime: Date

    //删除状态-0默认不删除
    @Prop({ default: 0 })
    deleteStatus: number

    //处理该消息的管理员的Id
    @Prop({ default: '' })
    bigManagerId: string

    //管理员对封禁消息的标注
    @Prop({ default: '' })
    bigManagerMessage: string

    //管理员账号
    @Prop({ default: '' })
    bigManagerAccount: string

}

export const TipOffSchema = SchemaFactory.createForClass(TipOff)

//在执行save和findOneAndUpdate时会执行中间件
TipOffSchema.pre('save', function (this: TipOff, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    next();
});

TipOffSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    next();
});