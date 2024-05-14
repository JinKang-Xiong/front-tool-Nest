import { MongooseModule, Schema } from '@nestjs/mongoose';
import { MemoController } from './memo.controller';
import { MemoService } from './memo.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MemoSchema } from './schemase/memo.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'memo_manager', schema: MemoSchema }])],
    controllers: [
        MemoController,],
    providers: [
        MemoService,],
})
export class MemoModule { }
