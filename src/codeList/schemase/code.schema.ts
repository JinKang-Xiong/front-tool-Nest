
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { v4 as uuidv4 } from 'uuid'
import { Document } from "mongoose";
import { CodeCollectOneSchema } from "./collect.schema";

export type CodeListOneDocument = CodeListOne & Document

//单个代码片段对象
@Schema({ _id: false })
export class CodeListOne {

    //代码片段的uuid
    @Prop({ default: () => uuidv4() })
    codeuuid: string

    //代码片段标题
    @Prop()
    codeTitle: string

    //代码片段描述
    @Prop({ default: null })
    codeDescription: string

    //代码片段
    @Prop()
    codeSnippet: string

    @Prop({ default: [] })
    codeRunResult: string[]

    //代码语言类型
    @Prop()
    codeLanguage: string

    //代码片段标签
    @Prop()
    codeTag: string[]

    //代码创建时间
    @Prop({ default: () => new Date() })
    codeCreateTime: Date

    //代码修改时间
    @Prop()
    codeUpdateTime: Date

    //代码的删除状态 0-不删除
    @Prop({ default: 0 })
    codeDeleteStatus: number

    //代码是否可编辑 0-可编辑
    @Prop({ default: 0 })
    codeIsEdit: number

    //代码是否私有化 0-私有化 1-公有化
    @Prop({ default: 0 })
    codeIsPrivate: number

    //是否处于监控期
    @Prop({ default: 0 })
    isMonitor: number

    //监控次数
    @Prop({ default: 0 })
    monitorNumber: number

    //点赞量
    @Prop({ default: 0 })
    likeNumber: number

    //收藏量
    @Prop({ default: 0 })
    collectNumber: number

    //举报量
    @Prop({ default: 0 })
    tipoffNumber: number

}

export const CodeListOneSchema = SchemaFactory.createForClass(CodeListOne)

export type CodeDocument = Code & Document

@Schema()
export class Code extends Document {

    //父文件夹的id
    @Prop({ default: null })
    parentId: string

    //代码列表
    @Prop({ type: [CodeListOneSchema], default: [] })
    codeList: CodeListOne[];

    //代码库的名称
    @Prop()
    storeName: string

    //代码库的简介
    @Prop({ default: null })
    storeDescription: string

    //打开库的次数
    @Prop({ default: 0 })
    openStoreCount: number

    //库的公共资源是否有异常
    @Prop({ default: 0 })
    abnormalStatus: number

    //分组的组名id
    @Prop()
    groupId: string

    //创建时间
    @Prop({ default: () => new Date() })
    createTime: Date

    //修改是时间
    @Prop()
    updateTime: Date

    //用户ID
    @Prop()
    userId: string

    //代码库中是否有公共代码片段
    @Prop({ default: 0 })
    isPartPublic: number

    //删除状态 0-默认-不删除
    @Prop({ default: 0 })
    deleteStatus: number
}

export const CodeSchema = SchemaFactory.createForClass(Code)

//在执行save和findOneAndUpdate时会执行中间件
CodeSchema.pre('save', function (this: Code, next: Function) {
    console.log("我是MemoSchema的中间件，执行save的方法")
    this.updateTime = new Date();
    // 检查是否要更新 codeList 数组对象
    if (this.codeList && this.codeList.length > 0) {
        // 遍历更新的 codeList 数组对象
        this.codeList.forEach((item: any) => {
            // 设置 codeUpdateTime 字段为当前时间
            item.codeUpdateTime = new Date();
        });
    }
    next();
});

CodeSchema.pre('findOneAndUpdate', function (this: any, next: Function) {
    console.log("我是MemoSchema的中间件，执行了findOneAndUpdate方法")
    this._update.updateTime = new Date();
    // 检查是否要更新 codeList 数组对象
    if (this && this.codeList) {
        // 遍历更新的 codeList 数组对象
        this.codeList.forEach((item: any) => {
            // 设置 codeUpdateTime 字段为当前时间
            item.codeUpdateTime = new Date();
        });
    }
    next();
});
