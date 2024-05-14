import { NotebookService } from './notebook.service';
import { NotebookController } from './notebook.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { NoteBookSchema } from '../schemas/noteBook.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'notebook_manager', schema: NoteBookSchema }])],
    controllers: [
        NotebookController,],
    providers: [
        NotebookService,],
})
export class NotebookModule { }
