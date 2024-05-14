import { CollectService } from './collect.service';
import { CollectController } from './collect.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Code, CodeSchema } from '../schemase/code.schema';
import { CollectSchema } from '../schemase/collect.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'collect_relation', schema: CollectSchema },
        { name: 'code_snippet', schema: CodeSchema }])],
    controllers: [
        CollectController,],
    providers: [
        CollectService,],
})
export class CollectModule { }
