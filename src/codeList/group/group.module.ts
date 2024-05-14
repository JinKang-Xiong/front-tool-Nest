import { GroupService } from './group.service';
import { GroupController } from './group.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Group, GroupSchema } from '../schemase/group.schema';
import { CodeSchema } from '../schemase/code.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'group_relation', schema: GroupSchema },
        { name: 'code_snippet', schema: CodeSchema }
    ])],
    controllers: [
        GroupController,],
    providers: [
        GroupService,],
})
export class GroupModule { }
