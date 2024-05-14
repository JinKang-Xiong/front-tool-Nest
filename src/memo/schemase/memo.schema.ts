import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from 'mongoose';

export type MemoDocument = Memo & Document;

class MemoList {
    @Prop()
    firstcheck: boolean
    @Prop()
    lastinput: string
    @Prop()
    isCheck: boolean
}

@Schema()
export class Memo extends Document {
    //备忘集——备忘名——备忘状态 0未完成，1完成，2不是状态是想法
    @Prop({ type: MemoList })
    memoList: MemoList[];

    //是否点击小灵一下 1是点击
    @Prop({ default: 1 })
    memoConfirm: number;

    //是否归档 0不归档
    @Prop({ default: 0 })
    memoListStatus: number;

    //小灵的标签
    @Prop()
    memoListTag: string[];

    //是否置顶 false不置顶，1是置顶
    @Prop({ default: false })
    isTop: boolean;

    //创建时间
    @Prop({ default: () => new Date() })
    createTime: Date;

    //修改时间
    @Prop()
    updateTime: Date;

    //删除状态 0（默认）不删除，1是删除
    @Prop({ default: 0, required: true })
    deleteStatus: number;

    //用户的ID
    @Prop({ required: true })
    userId: string
}


export const MemoSchema = SchemaFactory.createForClass(Memo)

//在执行save和findOneAndUpdate时会执行中间件
MemoSchema.pre('save', function (this: Memo, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    next();
});

MemoSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    next();
});