//增加快捷仓库数组对象对象模型
export class StoreItem {
    mark: number
    storeId: string
}

//增加快捷仓库模型
export class AddFastStore {
    store: StoreItem[]
    userId: string
    _id: string
}