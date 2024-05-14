//新增加笔记本
export class AddNoteBook {
    userId: string
    notebookName: string
    notebookDescription: string
    isDefault: number
}

//新增加笔记和修改
export class AddNote {
    noteName: string
    noteContent: string
    noteTag: string[]
    userId: string
    bookId: string[]
    isPartPublic: number
    notebookId: string
}

//修改笔记
export class UpdateNote {
    _id: string
    noteName: string
    noteContent: string
    noteTag: string[]
    userId: string
    bookId: string[]
    isPartPublic: number
    notebookId: string
    oldnotebookId: string
}


//插入收藏表中的模型
export class InsertCollectNoteManager {
    _id: string;
    userId: string;
    noteId: string;
    collectNumber: number
}

//新增加收藏夹
export class InsertCollectNote {
    userId: string;
    collectName: string;
    collectDescription: string
}

//修改收藏夹
export class UpdateCollectNote {
    _id: string
    userId: string
    collectName: string
    collectDescription: string
}