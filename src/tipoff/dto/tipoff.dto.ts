//新增加用户反馈
export class AddTipOff {
    userId: string
    username: string
    userAvatarUrl: string
    moduleType: string
    type: string
    content: string
    codeId: string
    codeuuid: string
}

//新增书籍的用户反馈
export class AddTipBookOff {
    userId: string
    username: string
    userAvatarUrl: string
    moduleType: string
    type: string
    content: string
    bookId: string
}

//新增书籍的用户反馈
export class AddTipNoteOff {
    userId: string
    username: string
    userAvatarUrl: string
    moduleType: string
    type: string
    content: string
    noteId: string
}

//待审核的通过和封禁操作
export class TipOffUpdate {
    _id: string
    moduleType: string
    typeId: string
    disPostStatus: number
    monitorNumber1: number
    bigManagerId: string
    bigManagerAccount: string
    bigManagerMessage: string
    userList: string[]
    resourceId: string
    resourcename: string
    messageFirst: number
    codeuuid?: string
}