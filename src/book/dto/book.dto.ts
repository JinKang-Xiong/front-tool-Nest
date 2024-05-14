import { callbackify } from "util"

//插入书籍的模型
export class AddBookDto {
    bookUrl: string
    bookImg: string
    bookName: string
    bookDescription: string
    bookTag: string[]
    userId: string
    isPrivate: number
    shareViewPoint: string
}

//修好书籍信息
export class UpdateBookDto {
    _id: string
    userId: string
    bookName: string
    bookDescription: string
    isPrivate: number
    shareViewPoint: string
    bookTag: string[]
}

//收藏公共资源的书籍
export class AddBookByCollect {
    bookName: string
    bookTag: string[]
    bookDescription: string
    bookImg: string
    bookUrl: string
    shareViewPoint: string
    _id: string
    userId: string
    collectNumber: number
}