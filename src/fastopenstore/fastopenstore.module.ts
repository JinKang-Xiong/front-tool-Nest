import { FastopenstoreService } from './fastopenstore.service';
import { FastopenstoreController } from './fastopenstore.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule, Schema } from '@nestjs/mongoose';
import { FastOpenStoreSchema } from './schemase/fastopenstore.schema';
import { CodeSchema } from 'src/codeList/schemase/code.schema';
import { NoteBookSchema } from 'src/noteList/schemas/noteBook.schema';
import { BookSchema } from 'src/book/schemas/book.schema';
import { NoteSchema } from 'src/noteList/schemas/note.schema';
import { MemoSchema } from 'src/memo/schemase/memo.schema';
import { PictureSchema } from 'src/picture/schemase/picture.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'fastopen_manager', schema: FastOpenStoreSchema },
        { name: 'code_snippets', schema: CodeSchema },
        { name: 'notebook_manager', schema: NoteBookSchema },
        { name: 'books_manager', schema: BookSchema },
        { name: 'note_manager', schema: NoteSchema },
        { name: 'memo_manager', schema: MemoSchema },
        { name: 'picture_manager', schema: PictureSchema }])],
    controllers: [
        FastopenstoreController,],
    providers: [
        FastopenstoreService,],
})
export class FastopenstoreModule { }
