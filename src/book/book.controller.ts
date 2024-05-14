import { async } from 'rxjs';
import { FindAll } from './../memo/dto/memo.dto';
/*
https://docs.nestjs.com/controllers#controllers
*/

import { Body, Controller, Get, Put, Post, Query, UploadedFile, UploadedFiles, UseInterceptors, Param, Delete } from '@nestjs/common';
import { BookService } from './book.service';
import { AddBookByCollect, AddBookDto, UpdateBookDto } from './dto/book.dto';
import { BusinessException } from 'src/exception/BusinessException';
import * as qiniu from 'qiniu'
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { BaseRespone } from 'src/common/InterfaceBase';
import { Readable } from 'stream';
import { ResultUtils } from 'src/common/ResultUtils';
import { ErrorCode } from 'src/common/ErrorCode';
@Controller('book')
export class BookController {
    constructor(private readonly bookService: BookService) { }

    /**
     * 增加书籍
     * @param dataCon 
     */
    @Post('add')
    @UseInterceptors(
        FilesInterceptor('file'),
    )
    async uploadFile(@UploadedFiles() files: Express.Multer.File[],
        @Body('bookName') bookName: string,
        @Body('bookDescription') bookDescription: string,
        @Body('bookTag') bookTag: string,
        @Body('userId') userId: string,
        @Body('isPrivate') isPrivate: number,
        @Body('shareViewPoint') shareViewPoint: string): Promise<BaseRespone<any>> {

        //TODO:jink-sercet
        const accessKey = 'xxxxxx'; // 替换为你的七牛云 Access Key
        const secretKey = 'xxxxxxxxx'; // 替换为你的七牛云 Secret Key
        const bucketName = 'fronttool1'; // 替换为你的七牛云存储空间名称

        const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        const options = {
            scope: bucketName,
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);

        var config = new qiniu.conf.Config();
        // var config = new qiniu.conf.Config();
        // config.zone = qiniu.zone.Zone_z0
        // config.zone = qiniu.zone.Zone_z0;
        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();
        var index1 = 0
        const uploadPromises = (file, index) => {
            const stream = new Readable();
            stream.push(file.buffer);
            stream.push(null);
            return new Promise<string>((resolve, reject) => {
                let key;
                if (file.mimetype == 'application/pdf') {
                    key = `book/document${index + 1}_${Date.now()}.pdf`; // 替换为七牛云中存储的文件名
                    putExtra.mimeType = 'application/pdf'
                } else if (file.mimetype == 'image/png') {
                    key = `book/images${index + 1}_${Date.now()}.png`; // 替换为七牛云中存储的文件名
                    putExtra.mimeType = 'image/png'
                } else if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg') {
                    key = `book/images${index + 1}_${Date.now()}.jpg`; // 替换为七牛云中存储的文件名
                    putExtra.mimeType = 'image/jpeg'
                } else {
                    // Handle unsupported file types
                    console.error('Unsupported file type:', file.mimetype);
                    return Promise.reject(new Error('Unsupported file type'));
                }
                formUploader.putStream(uploadToken, key, stream, putExtra, (respErr, respBody, respInfo) => {
                    if (respErr) {
                        console.error('Error uploading file to Qiniu:', respErr);
                        reject(new Error('Failed to upload file'));
                    }
                    if (respInfo.statusCode === 200 && respInfo) {
                        // http://ry8tu2b8b.hd-bkt.clouddn.com/uploads/image1_1690203356894.jpg
                        const fileUrl = `http://rzowp5k9n.hd-bkt.clouddn.com/${key}`;
                        console.log(fileUrl)
                        // 在此处可以将文件信息（如文件名、URL等）保存到数据库或返回给前端
                        index1 = index1 + 1
                        resolve(fileUrl);
                    } else {
                        console.error('Error uploading file to Qiniu:', respInfo);
                        reject(new Error('Failed to upload file'));
                    }
                });
            });
        };

        try {
            const fileUrls0 = await uploadPromises(files[0], index1);
            const fileUrls1 = await uploadPromises(files[1], index1)
            const arrtag = bookTag.split(',')
            const AddDataCon = await this.bookService.AddBook({ bookUrl: fileUrls0, bookImg: fileUrls1, bookName, bookDescription, bookTag: arrtag, userId, isPrivate, shareViewPoint })
            return ResultUtils.success('上传成功')
        } catch (err) {
            console.error('Error uploading files to Qiniu:', err);
            throw err;
        }
    }


    /**
     * 修改书库
     * @param data 
     * @returns 
     */
    @Post('update')
    async UpdateBookCon(@Body() data: UpdateBookDto): Promise<BaseRespone<any>> {
        if (data._id == null || data._id == '' || data.userId == null || data.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const UpdateBookConData = await this.bookService.UpdateBook(data._id, data.userId, data.bookName, data.bookDescription, data.isPrivate, data.shareViewPoint, data.bookTag)
        if (!UpdateBookConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(UpdateBookConData)
    }

    /**
     * 查询用户的全部书籍
     * @param userId 
     * @returns 
     */
    @Get('find')
    async FindAllCon(@Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const FindAllData = await this.bookService.FindAll(userId)
        return ResultUtils.success(FindAllData)
    }

    /**
     * 根据id和userId来查询单个书籍
     * @param _id 
     * @param userId 
     */
    @Get('findbyid')
    async FindByIdCon(@Query('_id') _id: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindByIdConData = await this.bookService.FindById(_id)
        if (!FindByIdConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库查询失败')
        }
        return ResultUtils.success(FindByIdConData)
    }

    /**
     * 删除用户的书籍
     * @param _id 
     * @param userId 
     * @returns 
     */
    @Put('delete')
    async DeleteBookCon(@Query('_id') _id: string, @Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '' || _id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const DeleteBookConData = await this.bookService.DeleteBook(_id, userId)
        if (!DeleteBookConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库修改失败')
        }
        return ResultUtils.success(DeleteBookConData)
    }

    /**
     * 修改封面
     * @param file 
     * @param _id 
     * @param userId 
     * @returns 
     */
    @Post('updateimg')
    @UseInterceptors(
        FileInterceptor('avatar'),
    )
    async UpdateImg(@UploadedFile() file: Express.Multer.File, @Body('_id') _id: string, @Body('userId') userId: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        //TODO:jink-sercet
        const accessKey = 'xxxxxx'; // 替换为你的七牛云 Access Key
        const secretKey = 'xxxxx'; // 替换为你的七牛云 Secret Key
        const bucketName = 'fronttool1'; // 替换为你的七牛云存储空间名称

        const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        const options = {
            scope: bucketName,
        };
        const putPolicy = new qiniu.rs.PutPolicy(options);
        const uploadToken = putPolicy.uploadToken(mac);

        var config = new qiniu.conf.Config();
        // var config = new qiniu.conf.Config();
        // config.zone = qiniu.zone.Zone_z0
        // config.zone = qiniu.zone.Zone_z0;
        const formUploader = new qiniu.form_up.FormUploader(config);
        const putExtra = new qiniu.form_up.PutExtra();
        const uploadPromises = async () => {
            console.log('----file----')
            console.log(file)
            const stream = new Readable();
            stream.push(file.buffer);
            stream.push(null);
            return new Promise<string>((resolve, reject) => {
                let key;
                if (file.mimetype == 'image/png') {
                    key = `book/document${1}_${Date.now()}.png`; // 替换为七牛云中存储的文件名
                } else {
                    key = `book/document${1}_${Date.now()}.jpeg`; // 替换为七牛云中存储的文件名
                }

                formUploader.putStream(uploadToken, key, stream, putExtra, (respErr, respBody, respInfo) => {
                    if (respErr) {
                        console.error('Error uploading file to Qiniu:', respErr);
                        reject(new Error('Failed to upload file'));
                    }
                    if (respInfo.statusCode === 200 && respInfo) {
                        // http://ry8tu2b8b.hd-bkt.clouddn.com/uploads/image1_1690203356894.jpg
                        const fileUrl = `http://rzowp5k9n.hd-bkt.clouddn.com/${key}`;
                        console.log(fileUrl)
                        // 在此处可以将文件信息（如文件名、URL等）保存到数据库或返回给前端
                        resolve(fileUrl);
                    } else {
                        console.error('Error uploading file to Qiniu:', respInfo);
                        reject(new Error('Failed to upload file'));
                    }
                });
            });
        };

        try {
            const fileUrl = await uploadPromises()
            const UpdateConData = await this.bookService.UpdateBookImg(_id, userId, fileUrl)
            if (!UpdateConData) {
                throw new BusinessException(ErrorCode.PARAM_ERROR)
            }
            return ResultUtils.success({ length: fileUrl.length })
        } catch (err) {
            console.error('Error uploading files to Qiniu:', err);
            throw err;
        }

    }


    /**
     * 根据标签去搜索书籍
     * @param userId 
     * @param bookTag 
     */
    @Get('searchbytag')
    async FindByTagCon(@Query('userId') userId: string, @Query('bookTag') bookTag: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindByTagData = await this.bookService.FindByTag(userId, bookTag)
        return ResultUtils.success(FindByTagData)
    }


    /**
     *根据标签和书名查询 
     * @param userId 
     * @param bookName 
     * @param bookTag 
     */
    @Get('searchbytn')
    async FindByTagAndName(@Query('userId') userId: string, @Query('inputValue') inputValue: string): Promise<BaseRespone<any>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindByTagAndNameData = await this.bookService.FindByTagAndName(userId, inputValue)
        return ResultUtils.success(FindByTagAndNameData)
    }

    /**
     * 修改阅读次数
     * @param _id 
     * @param userId 
     * @param readNumber 
     * @returns 
     */
    @Put('updateread')
    async UpdateReadCon(@Query('_id') _id: string, @Query('userId') userId: string, @Query('readNumber') readNumber: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const readNumber1 = Number(readNumber)
        const UpdateReadConData = await this.bookService.UpdateReadNumber(_id, userId, readNumber1)
        if (!UpdateReadConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库修改失败')
        }
        return ResultUtils.success(UpdateReadConData)
    }

    /**
     * 搜索公共资源书籍
     * @param inputValue 
     */
    @Get('searchpublic')
    async SearchPublicCon(@Query('inputValue') inputValue: string): Promise<BaseRespone<any>> {
        if (inputValue == null || inputValue == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const data = await this.bookService.SearchPublicBook(inputValue)
        return ResultUtils.success(data)
    }


    /**
     * 收藏公共区域的资源
     * @param book 
     */
    @Post('collect')
    async CollectBookByUserCon(@Body() book: AddBookByCollect): Promise<BaseRespone<any>> {
        if (book._id == null || book._id == '' || book.userId == null || book.userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const data = await this.bookService.CollectBookByUser(
            book.bookName,
            book.bookTag,
            book.bookDescription,
            book.bookImg,
            book.bookUrl,
            book.shareViewPoint,
            book._id,
            book.userId,
            book.collectNumber
        )
        if (!data) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, '数据库插入失败')
        }
        return ResultUtils.success(data)
    }


    @Get('hotpublic')
    async FindHotPublicBookCon(): Promise<BaseRespone<any>> {
        const datacon = await this.bookService.FindHotPublicBook()
        return ResultUtils.success(datacon)
    }



}
