import { Schema, Prop, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type FastOpenStoreDocument = FastOpenStore & Document
/**
 * 快捷打开仓库的表
 */
@Schema()
export class FastOpenStore {

    //用户id
    @Prop()
    userId: string

    //代码库的列表
    @Prop({ default: [] })
    codeList: string[]

    //笔记库的列表
    @Prop({ default: [] })
    noteList: string[]

    //书籍的列表
    @Prop({ default: [] })
    bookList: string[]

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

export const FastOpenStoreSchema = SchemaFactory.createForClass(FastOpenStore)


//在执行save和findOneAndUpdate时会执行中间件
FastOpenStoreSchema.pre('save', function (this: FastOpenStore, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    next();
});

FastOpenStoreSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    next();
});

