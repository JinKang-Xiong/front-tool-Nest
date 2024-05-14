import { MongooseModule } from '@nestjs/mongoose';
import { CodeController } from './code.controller';
import { CodeService } from './code.service';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { CodeSchema } from '../schemase/code.schema';
import { TipOffSchema } from 'src/tipoff/schemas/tipoff.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'code_snippet', schema: CodeSchema }, { name: 'user_tipoff', schema: TipOffSchema }])],
    controllers: [
        CodeController,],
    providers: [
        CodeService,],
})
export class CodeModule { }
