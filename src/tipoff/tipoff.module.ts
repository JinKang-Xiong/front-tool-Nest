import { TipoffService } from './tipoff.service';
import { TipoffController } from './tipoff.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TipOffSchema } from './schemas/tipoff.schema';
import { MessageSchema } from 'src/message/schemase/message.schema';
import { CodeSchema } from 'src/codeList/schemase/code.schema';
import { NoteSchema } from 'src/noteList/schemas/note.schema';
import { BookSchema } from 'src/book/schemas/book.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'user_tipoff', schema: TipOffSchema },
        { name: 'message_manager', schema: MessageSchema },
        { name: 'code_snippet', schema: CodeSchema },
        { name: 'note_manager', schema: NoteSchema },
        { name: 'books_manager', schema: BookSchema }])],
    controllers: [
        TipoffController,],
    providers: [
        TipoffService,],
})
export class TipoffModule { }
