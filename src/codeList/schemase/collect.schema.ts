

import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type CodeCollectOneDocument = CodeCollectOne & Document

@Schema({ _id: false })
export class CodeCollectOne {

    //代码库的id
    @Prop()
    codeId: string

    //代码片段的唯一标识
    @Prop()
    codeuuid: string

}

export const CodeCollectOneSchema = SchemaFactory.createForClass(CodeCollectOne)
export type CollectDocument = Collect & Document

@Schema()
export class Collect extends Document {

    //用户的id
    @Prop()
    userId: string

    //收藏夹得名字
    @Prop()
    collectName: string

    //收藏夹的描述
    @Prop()
    collectDescription: string

    //用户收藏的代码片段集
    @Prop({ type: [CodeCollectOneSchema], default: [] })
    codeSnippsetCollect: CodeCollectOne[]

    //创建时间
    @Prop({ default: () => new Date })
    createTime: Date

    //修改时间
    @Prop()
    updateTime: Date

    //删除状态 0-默认不删除
    @Prop({ default: 0 })
    deleteStatus: number

}


export const CollectSchema = SchemaFactory.createForClass(Collect)

//在执行save和findOneAndUpdate时会执行中间件
CollectSchema.pre('save', function (this: Collect, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    next();
});

CollectSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    next();
});
