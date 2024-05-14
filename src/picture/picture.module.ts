import { PictureService } from './picture.service';
import { PictureController } from './picture.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PictureSchema } from './schemase/picture.schema';

@Module({
    // imports: [MongooseModule.forFeature([{ name: 'memo_manager', schema: MemoSchema }])],
    imports: [MongooseModule.forFeature([{ name: 'picture_manager', schema: PictureSchema }])],
    controllers: [
        PictureController,],
    providers: [
        PictureService,],
})
export class PictureModule { }
