import { Note } from './../../noteList/schemas/note.schema';


import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { type } from "os";

export type CodeLikeOneDocument = CodeLikeOne & Document
export type NoteLikeOneDocument = NoteLikeOne & Document


@Schema({ _id: false })
export class CodeLikeOne {

    //代码库的id
    @Prop()
    codeId: string

    //代码片段的唯一标识
    @Prop()
    codeuuid: string

}

@Schema({ _id: false })
export class NoteLikeOne {

    //笔记的id
    @Prop()
    noteId: string

}



export const CodeLikeOneSchema = SchemaFactory.createForClass(CodeLikeOne)
export const NoteLikeOneSchema = SchemaFactory.createForClass(NoteLikeOne)

export type LikeDocument = Like & Document
@Schema()
export class Like extends Document {

    //用户的id
    @Prop()
    userId: string

    //用户点赞的代码片段集
    @Prop({ type: [CodeLikeOneSchema], default: [] })
    codeSnippsetLike: CodeLikeOne[]

    //用户点赞的的笔记
    @Prop({ type: [NoteLikeOneSchema], default: [] })
    noteLike: NoteLikeOne[]

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

export const LikeSchema = SchemaFactory.createForClass(Like)

//在执行save和findOneAndUpdate时会执行中间件
LikeSchema.pre('save', function (this: Like, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    next();
});

LikeSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    next();
});
