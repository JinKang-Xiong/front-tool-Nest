import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type NoteDocument = Note & Document
@Schema()
export class Note {
    //笔记本
    @Prop({ default: '' })
    noteName: string

    //笔记内容
    @Prop({ default: '' })
    noteContent: string

    //笔记字数
    @Prop({ default: 0 })
    noteCount: string

    //笔记标签
    @Prop({ default: [] })
    noteTag: string[]

    //是否公开
    @Prop({ default: 0 })
    isPartPublic: number

    //是否处于监控期
    @Prop({ default: 0 })
    isMonitor: number

    //监控次数
    @Prop({ default: 0 })
    monitorNumber: number

    //是否置顶
    @Prop({ default: 0 })
    isTop: number

    //打开次数
    @Prop({ default: 0 })
    openNumber: number

    //收藏夹数
    @Prop({ default: 0 })
    collectNumber: number

    //点赞数
    @Prop({ default: 0 })
    likeNumber: number

    //举报数
    @Prop({ default: 0 })
    tipoffNumber: number

    //创建时间
    @Prop({ default: () => new Date() })
    createTime: Date

    //修改时间
    @Prop()
    updateTime: Date[]

    //删除状态
    @Prop({ default: 0 })
    deleteStatus: number

    //书籍id
    @Prop({ default: [] })
    bookId: string[]

    //笔记本id
    @Prop()
    notebookId: string

    //用户id
    @Prop()
    userId: string

}

export const NoteSchema = SchemaFactory.createForClass(Note)

//在执行save和findOneAndUpdate时会执行中间件
NoteSchema.pre('save', function (this: Note, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime.push(new Date());
    next();
});

