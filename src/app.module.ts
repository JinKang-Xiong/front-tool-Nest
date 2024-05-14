import { MessageModule } from './message/message.module';
import { FastopenstoreModule } from './fastopenstore/fastopenstore.module';
import { CollectnoteModule } from './noteList/collectnote/collectnote.module';
import { NotebookModule } from './noteList/notebook/notebook.module';
import { NoteModule } from './noteList/note/note.module';

import { BookModule } from './book/book.module';
import { LikeModule } from './codeList/like/like.module';
import { TipoffModule } from './tipoff/tipoff.module';
import { CollectModule } from './codeList/collect/collect.module';


import { PictureModule } from './picture/picture.module';
import { CodeModule } from './codeList/code/code.module';
import { GroupModule } from './codeList/group/group.module';
import { TaskModule } from './task/task.module';

import { MemoModule } from './memo/memo.module';

import { Module } from '@nestjs/common';

import { MongooseModule } from '@nestjs/mongoose';
import { GlobalExceptionFilter } from './exception/GlobalExceptionFilter ';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ErrorLoggingInterceptor } from './utils/ErrorLoggingInterceptor ';

@Module({
  controllers: [
  ],
  providers: [{
    provide: APP_FILTER,
    useClass: GlobalExceptionFilter,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ErrorLoggingInterceptor,
  },
  ],
  imports: [
    MessageModule,
    FastopenstoreModule,
    CollectnoteModule,
    NotebookModule,
    NoteModule,
    BookModule,
    LikeModule,
    TipoffModule,
    CollectModule,
    PictureModule,
    CodeModule,
    GroupModule,
    TaskModule,
    MemoModule,
    MongooseModule.forRoot('mongodb://localhost:27017/front_tool')
  ],

})
export class AppModule { }
