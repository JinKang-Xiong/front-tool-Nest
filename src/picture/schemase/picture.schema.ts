
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { type } from "os";
import { v4 as uuidv4 } from 'uuid'

export type PictureDocument = Picture & Document
export type PictureListDocument = PictureList & Document

@Schema({ _id: false })
export class PictureList {
    //图片的uuid
    @Prop({ default: () => uuidv4() })
    pictureuuid: string

    //图片的名字
    @Prop({ default: null })
    pictureName: string

    //图片的地址
    @Prop()
    pictureUrl: string

    //创建时间
    @Prop({ default: () => new Date() })
    pictureCreateTime: Date

    //修改时间
    @Prop()
    pictureUpdateTie: Date

    //图片的标签
    @Prop({ default: [] })
    pictureTag: string[]

    //图片的删除状态 0-不删除
    @Prop({ default: 0 })
    pictureDeleteStatus: number


}

export const PictureListSchenma = SchemaFactory.createForClass(PictureList)



@Schema()
export class Picture {

    //库名
    @Prop()
    storeName: string

    //库的简介
    @Prop()
    storeDescription: string

    @Prop({ type: [PictureListSchenma], default: [] })
    pictureList

    //创建时间
    @Prop({ default: () => new Date() })
    createTime: Date

    //修改时间
    @Prop()
    updateTime: Date

    //删除状态 0-是不删除，1-是删除
    @Prop({ default: 0 })
    deleteStatus: number

    //用户的id
    @Prop()
    userId: string

}

export const PictureSchema = SchemaFactory.createForClass(Picture)

//在执行save和findOneAndUpdate时会执行中间件
PictureSchema.pre('save', function (this: Picture, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    // 检查是否要更新 codeList 数组对象
    if (this.pictureList && this.pictureList.length > 0) {
        // 遍历更新的 codeList 数组对象
        this.pictureList.forEach((item: any) => {
            // 设置 codeUpdateTime 字段为当前时间
            item.pictureUpdateTie = new Date();
        });
    }
    next();
});

PictureSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    // 检查是否要更新 codeList 数组对象
    if (this && this.pictureList) {
        // 遍历更新的 codeList 数组对象
        this.pictureLIst.forEach((item: any) => {
            // 设置 codeUpdateTime 字段为当前时间
            item.pictureUpdateTie = new Date();
        });
    }
    next();
});
