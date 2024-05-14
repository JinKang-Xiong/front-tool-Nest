//取消收藏的数据模型
export class CancelLike {
    _id: string
    codeId: string
    codeuuid: string
    likeNumber: number
    userId: string
}

//取消收藏笔记的数据模型
export class CancelNoteLike {
    _id: string
    noteId: string
    likeNumber: number
    userId: string
}

//新增加点赞
export class InserLike {
    _id?: string
    codeId: string
    codeuuid: string
    likeNumber: number
    userId: string
}

//新增加笔记点赞
export class InserBookLike {
    _id?: string
    noteId: string
    likeNumber: number
    userId: string
}