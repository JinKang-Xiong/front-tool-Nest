import { BookService } from './book.service';
import { BookController } from './book.controller';
/*
https://docs.nestjs.com/modules
*/

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BookSchema } from './schemas/book.schema';
import { TipOffSchema } from 'src/tipoff/schemas/tipoff.schema';

@Module({
    imports: [MongooseModule.forFeature([{ name: 'books_manager', schema: BookSchema }, { name: 'user_tipoff', schema: TipOffSchema }])],
    controllers: [
        BookController,],
    providers: [
        BookService,],
})
export class BookModule { }
