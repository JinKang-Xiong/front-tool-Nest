//插入分组数据模型
export class AddGroupDto {
    groupName: string
    userId: string
    isDelete: number
    firstGroup: number
}

//删除分组的数据模型
export class DeleteGroupDto {
    _id: string;
    userId: string;
    deleteStatus: number;
    isDelete: number;
    firstGroup: number;
}