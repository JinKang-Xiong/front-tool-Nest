
//插入收藏表中的模型
export class InsertCollectSnippet {
    _id: string;
    userId: string;
    codeId: string
    codeuuid: string;
    collectNumber: number
}

//新增加收藏夹
export class InsertCollect {
    userId: string;
    collectName: string;
    collectDescription: string
}

//修改收藏夹
export class UpdateCollect {
    _id: string
    userId: string
    collectName: string
    collectDescription: string
}