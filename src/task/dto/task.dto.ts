
//插入任务集的数据模型
export class InsertTaskListDto {
    taskList: TaskOne
    userId: string
}

//插入任务的数据模型
export class InserTaskDto {
    _id: string
    taskList: TaskOne;

}
//提前完成计时和完成计时的数据模型
export class FinshTask {
    _id: string
    taskList: FinshTaskOne
}

//归档功能数据模型
export class FileTaskList {
    _id: string
    finshStatusArray: number[]
    taskTimeArray: number[]
}
