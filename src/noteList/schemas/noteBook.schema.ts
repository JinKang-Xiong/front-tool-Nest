import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type NoteBookDocument = NoteBook & Document

@Schema()
export class NoteBook {

    //用户id
    @Prop()
    userId: string

    //笔记本名
    @Prop()
    notebookName: string

    //笔记本描述
    @Prop()
    notebookDescription: string

    //笔记的id
    @Prop({ default: [] })
    noteList: string[]

    //创建时间
    @Prop({ default: () => new Date() })
    createTime: Date

    //修改时间
    @Prop()
    updateTime: Date

    //笔记本删除状态 0是未删除状态
    @Prop({ default: 0 })
    deleteStatus: number

    //是不是默认笔记本 0是默认笔记本
    @Prop({ default: 0 })
    isDefault: number

}

export const NoteBookSchema = SchemaFactory.createForClass(NoteBook)

//在执行save和findOneAndUpdate时会执行中间件
NoteBookSchema.pre('save', function (this: NoteBook, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    next();
});

NoteBookSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    // 检查是否要更新 codeList 数组对象
    next();
});