interface TaskOne {
    taskuuid?: string;
    taskStatus: number;
    taskName: string;
    taskTime: number;
    taskDirection: string;
    taskBackImg?: string;

}


/**
 * 提前完成计时和完成计时的单个对象接口
 */
interface FinshTaskOne {
    taskuuid: string;
    taskName: string;
    taskStatus: number;
    taskFinshTime: string;
    finshStatus: number;
}