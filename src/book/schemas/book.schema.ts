import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { type } from "os";

export type ReadTimeOneDocument = ReadTimeOne & Document
@Schema({ _id: false })
export class ReadTimeOne extends Document {

    //阅读日期
    @Prop()
    readDate: string

    //阅读时长
    @Prop()
    readTime: number
}

export const ReadTimeOneSchema = SchemaFactory.createForClass(ReadTimeOne)

export type BookDocument = Book & Document
@Schema()
export class Book extends Document {
    //书名
    @Prop()
    bookName: string

    //书籍标签
    @Prop({ default: [] })
    bookTag: string[]

    //书籍描述
    @Prop()
    bookDescription: string

    //书籍的封面
    @Prop()
    bookImg: string

    //书籍的URl
    @Prop()
    bookUrl: string

    //分享者的理解
    @Prop({ default: '' })
    shareViewPoint: string

    //收藏数
    @Prop({ default: 0 })
    collectNumber: number

    //点赞数
    @Prop({ default: 0 })
    likeNumber: number

    //举报数
    @Prop({ default: 0 })
    tipoffNumber: number

    //是否是私有 0私有，1-公有，2-监控
    @Prop({ default: 0 })
    isPrivate: number

    //是否处于监控期
    @Prop({ default: 0 })
    isMonitor: number

    //监控次数
    @Prop({ default: 0 })
    monitorNumber: number

    //阅读次数
    @Prop({ default: 0 })
    readNumber: number

    //阅读时长
    @Prop({ type: [ReadTimeOneSchema], default: [] })
    readTimeList: ReadTimeOne[]

    //创建时间
    @Prop({ default: () => new Date() })
    createTime: Date

    //修改时间
    @Prop()
    updateTime: Date

    //是否是删除状态
    @Prop({ default: 0 })
    deleteStatus: number

    //用户的Id
    @Prop()
    userId: string

}

export const BookSchema = SchemaFactory.createForClass(Book)

//在执行save和findOneAndUpdate时会执行中间件
BookSchema.pre('save', function (this: Book, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    next();
});

BookSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    next();
});



