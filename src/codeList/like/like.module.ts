import { LikeService } from './like.service';
import { LikeController } from './like.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LikeSchema } from '../schemase/like.schema';
import { CodeSchema } from '../schemase/code.schema';
import { NoteSchema } from 'src/noteList/schemas/note.schema';

@Module({
    imports: [MongooseModule.forFeature([
        { name: 'user_like', schema: LikeSchema },
        { name: 'code_snippet', schema: CodeSchema },
        { name: 'note_manager', schema: NoteSchema }])],
    controllers: [
        LikeController,],
    providers: [
        LikeService,],
})
export class LikeModule { }
