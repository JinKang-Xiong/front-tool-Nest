import { NoteService } from './note.service';
import { NoteController } from './note.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NoteSchema } from '../schemas/note.schema';
import { NoteBookSchema } from '../schemas/noteBook.schema';
import { TipOffSchema } from 'src/tipoff/schemas/tipoff.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'note_manager', schema: NoteSchema },
        { name: 'notebook_manager', schema: NoteBookSchema },
        { name: 'user_tipoff', schema: TipOffSchema }])],
    controllers: [
        NoteController,],
    providers: [
        NoteService,],
})
export class NoteModule { }
