
//增加代码库的模型数据
export class AddStoreDto {
    storeName: string
    storeDescription: string
    groupId: string
    userId: string
}

//增加代码片段的模型数据
export class AddSnippetDto {
    _id: string
    codeList: CodeSnippetOne
}


//修改代码片段的数据模型
export class UpdateSnippetDto {
    _id: string;
    codeuuid: string;
    codeTitle: string;
    codeDescription: string;
    codeTag: string;
    codeSnippet: string
    codeLanguage: string
}

