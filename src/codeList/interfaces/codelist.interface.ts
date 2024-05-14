
//增加代码片段 和 修改代码片段 和 删除代码片段 的返回模型
interface AddStoreRespone {
    storeName: string
    storeDescription: string
}


//单个插入数据模型的数据
interface CodeSnippetOne {
    codeTitle: string;
    codeDescription: string;
    codeSnippet: string;
    codeTag: string[];
    codeLanguage: string
}
