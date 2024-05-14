import { MessageService } from './message.service';
import { MessageController } from './message.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MessageSchema } from './schemase/message.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'message_manager', schema: MessageSchema }])],
    controllers: [
        MessageController,],
    providers: [
        MessageService,],
})
export class MessageModule { }
