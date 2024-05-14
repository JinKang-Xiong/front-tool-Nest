import { MongooseModule } from '@nestjs/mongoose';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { TaskSchema } from './schemase/task.schemase';

@Module({
    // imports: [MongooseModule.forFeature([{ name: 'memo_manager', schema: MemoSchema }])],
    imports: [MongooseModule.forFeature([{ name: 'task_manager', schema: TaskSchema }])],
    controllers: [
        TaskController,],
    providers: [
        TaskService,],
})
export class TaskModule { }
