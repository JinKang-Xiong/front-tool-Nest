import { CollectnoteService } from './collectnote.service';
import { CollectnoteController } from './collectnote.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CollectNoteSchema } from '../schemas/collectnote.schema';
import { NoteSchema } from '../schemas/note.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'collectnote_relation', schema: CollectNoteSchema },
        { name: 'note_manager', schema: NoteSchema }])],
    controllers: [
        CollectnoteController,],
    providers: [
        CollectnoteService,],
})
export class CollectnoteModule { }
