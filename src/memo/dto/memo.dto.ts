
//插入数据的模型
export class InsertMemoDto {

    memoList: memoOne[];

    memoConfirm: number;

    memoListStatus: number;

    memoListTag: string[];

    isTop: boolean;

    userId: string;
}

//查询结果返回模型
export class FindAll {
    _id: string;

    memoList: memoOne[];

    memoListStatus: number;

    memoListTag: string[];

    isTop: boolean;

    createTime: Date;

    updateTime: Date;

}

//插入方法的数据模型
export class EditMemo {
    _id: string;

    memoList: memoOne[];

    memoListTag: string[];

}