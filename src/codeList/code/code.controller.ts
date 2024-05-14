import { async } from 'rxjs';


import { FindAll } from './../../memo/dto/memo.dto';
import { Put, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';

/*
https://docs.nestjs.com/controllers#controllers
*/

import { Controller, Post, Get, Query, Body } from '@nestjs/common';
import { CodeService } from './code.service';
import { AddSnippetDto, AddStoreDto, UpdateSnippetDto } from '../dto/code.dto';
import { BaseRespone } from 'src/common/InterfaceBase';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';
import { Code, CodeListOne } from '../schemase/code.schema';
import { FilesInterceptor } from '@nestjs/platform-express';
import * as qiniu from 'qiniu'
import { Readable } from 'stream';

@Controller('code')
export class CodeController {
    constructor(private readonly codeService: CodeService) { }

    /**
     * 新增代码库
     * @param addstore 
     * @returns 
     */
    @Post('addstore')
    async AddStoreCon(@Body() addstore: AddStoreDto): Promise<BaseRespone<AddStoreRespone>> {
        let storeName = addstore.storeName;
        let storeDescription = addstore.storeDescription;
        let groupId = addstore.groupId;
        let userId = addstore.userId;
        if (storeName == null || storeName == '' || storeDescription == null || storeDescription == '' || groupId == null || groupId == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const addStoreConData = await this.codeService.AddCodeStore(storeName, storeDescription, groupId, userId);
        if (!addStoreConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库查询失败")
        }
        return ResultUtils.success(addStoreConData)
    }

    /**
     * 查询用户的全部代码库
     * @param userId 
     * @returns 
     */
    @Get('findallstore')
    async FindAllStoreCon(@Query('userId') userId: string): Promise<BaseRespone<Code[]>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindAllStoreData = await this.codeService.FindAllStore(userId)
        if (!FindAllStoreData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库查询失败")
        }

        return ResultUtils.success(FindAllStoreData)
    }

    /**
     * 修改用户的代码库名字和简介
     ** @param _id 
     * @param storeName 
     * @param storeDescription 
     * @returns 
     */
    @Put('updatestore')
    async UpdateStoreCon(
        @Query('_id') _id: string, @Query('storeName') storeName: string,
        @Query('storeDescription') storeDescription: string): Promise<BaseRespone<AddStoreRespone>> {

        if (_id == null || _id == '' || storeDescription == null || storeDescription == '' || storeName == null || storeName == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const UpdateStoreData = await this.codeService.UpdateStore(_id, storeName, storeDescription)
        if (!UpdateStoreData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库修改失败")
        }
        return ResultUtils.success(UpdateStoreData)

    }

    /**
     * 删除代码库
     * @param _id 
     * @returns 
     */
    @Put('deletestore')
    async DeleteStoreCon(@Query('_id') _id): Promise<BaseRespone<AddStoreRespone>> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const DeleteStoreConData = await this.codeService.DeleteStore(_id)
        if (!DeleteStoreConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }

        return ResultUtils.success(DeleteStoreConData)
    }

    /**
     * 查询代码库中的全部代码片段
     * @param _id 
     * @param userId 
     * @returns 
     */
    @Get('findallsnippet')
    async FindAllSnippetCon(@Query("_id") _id: string, @Query("userId") userId: string, @Query('codeIsPrivate') codeIsPrivate: number): Promise<BaseRespone<Code[]>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL_SER)
        }
        let codeIsPrivate1 = Number(codeIsPrivate)
        const FindAllSnippetConData = await this.codeService.FindAllSnippet(_id, userId, codeIsPrivate1)
        if (!FindAllSnippetConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库查询失败")
        }
        return ResultUtils.success(FindAllSnippetConData)
    }


    /**
     * 根据id查询单个代码片段
     * @param _id 
     * @param codeuuid 
     * @returns 
     */
    @Get('findsnippetById')
    async FindSnippetByIdCon(@Query("_id") _id: string, @Query("codeuuid") codeuuid: string): Promise<BaseRespone<Code>> {
        if (_id == null || _id == '' || codeuuid == null || codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindSnippetByIdConData = await this.codeService.FindSnippetById(_id, codeuuid)
        if (!FindSnippetByIdConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据更新失败")
        }
        return ResultUtils.success(FindSnippetByIdConData)
    }

    /**
     * 新增加代码运行结果图
     * @param code 
     */
    @Post('addpicture')
    @UseInterceptors(
        FilesInterceptor('file'),
    )
    async CodeRunResultCon(@UploadedFiles() files: Express.Multer.File[],
        @Body('_id') _id: string,
        @Body('codeuuid') codeuuid: string,
    ): Promise<BaseRespone<any>> {

        //TODO:jink-sercet
        const accessKey = 'xxxxxxx'; // 替换为你的七牛云 Access Key
        const secretKey = 'xxxxxxx'; // 替换为你的七牛云 Secret Key
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
        const uploadPromises = files.map((file, index) => {
            const stream = new Readable();
            stream.push(file.buffer);
            stream.push(null);
            return new Promise<string>((resolve, reject) => {
                const key = `code/image${index + 1}_${Date.now()}.jpg`; // 替换为七牛云中存储的文件名

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
                        const CodeRunResultConData = this.codeService.CodeRunResultUpload(_id, codeuuid, fileUrl)
                        resolve(CodeRunResultConData);
                    } else {
                        console.error('Error uploading file to Qiniu:', respInfo);
                        reject(new Error('Failed to upload file'));
                    }
                });
            });
        });

        try {
            const fileUrls = await Promise.all(uploadPromises);
            console.log('fileUrls=' + fileUrls)
            return ResultUtils.success({ length: fileUrls.length })
        } catch (err) {
            console.error('Error uploading files to Qiniu:', err);
            throw err;
        }
    }

    /**
     * 删除代码运行结果图
     * @param _id 
     * @param codeuuid 
     * @param codeRunResult 
     */
    @Put('deletepicture')
    async DeleteCodeRunResultCon(@Query('_id') _id: string, @Query('codeuuid') codeuuid: string, @Query('codeRunResult') codeRunResult: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || codeuuid == null || codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const DeleteCodeRunResultConData = await this.codeService.CodeRunResultDelete(_id, codeuuid, codeRunResult)
        if (!DeleteCodeRunResultConData) {
            throw new BusinessException(ErrorCode.PARAM_NULL, "数据库修改失败")
        }
        return ResultUtils.success(DeleteCodeRunResultConData)
    }

    /**
     * 增加代码片段
     * @param add 
     * @returns 
     */
    @Post('addsnippet')
    async AddSnippetCon(@Body() add: AddSnippetDto): Promise<BaseRespone<any>> {
        if (add._id == null || add._id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const AddDataCon = await this.codeService.AddSnippet1(
            add._id,
            add.codeList.codeTitle,
            add.codeList.codeSnippet,
            add.codeList.codeDescription,
            add.codeList.codeTag,
            add.codeList.codeLanguage)
        if (!AddDataCon) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库插入失败")
        }
        return ResultUtils.success(AddDataCon)
    }

    /**
     * 根据标题和标签去查询代码片段
     * @param _id 
     * @param userId 
     * @param inputValue 
     * @returns 
     */
    @Get('findsnippetByTitle')
    async FindSnippetByTitleCon(@Query('_id') _id: string, @Query('userId') userId: string, @Query('inputValue') inputValue: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindSnippetByTitleConData = await this.codeService.FindSnippetByTitle(_id, userId, inputValue)
        return ResultUtils.success(FindSnippetByTitleConData)
    }


    /**
     * 修改代码片段
     * @param updatecode 
     */
    @Post('updatesnippet')
    async UpdateSnippetCon(@Body() updatecode: UpdateSnippetDto): Promise<BaseRespone<any>> {
        let _id = updatecode._id;
        let codeuuid = updatecode.codeuuid;
        let codeTitle = updatecode.codeTitle;
        let codeTag = updatecode.codeTag;
        let codeSnippet = updatecode.codeSnippet;
        let codeLanguage = updatecode.codeLanguage;
        let codeDescription = updatecode.codeDescription;
        if (_id == null || _id == '' || codeuuid == null || codeuuid == '' || codeTitle == null || codeTitle == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const UpdateSnippetData = await this.codeService.UpdateSnippet(_id, codeuuid, codeTitle, codeDescription, codeTag, codeSnippet, codeLanguage)
        if (!UpdateSnippetData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(UpdateSnippetData)
    }

    /**
     * 删除代码片段
     * @param _id 
     * @param codeuuid 
     */
    @Put('deletesnippet')
    async DeleteSnippet(@Query('_id') _id: string, @Query('codeuuid') codeuuid: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || codeuuid == '' || codeuuid == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const DeleteSnipppetData = await this.codeService.DeleteSnippet(_id, codeuuid)
        if (!DeleteSnipppetData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(DeleteSnipppetData)
    }


    /**
     * 修改代码片段的公用
     * @param _id 
     * @param userId 
     * @param codeuuid 
     * @param isPrivate 
     * @returns 
     */
    @Put('updateIsPrivate')
    async UpdateIsPrivateCon(@Query('_id') _id: string, @Query('userId') userId: string, @Query('codeuuid') codeuuid: string, @Query('isPrivate') isPrivate: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || userId == '' || userId == null || codeuuid == '' || codeuuid == null || isPrivate == null || isPrivate == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        let isPrivate1 = Number(isPrivate)
        const UpdateIsPrivateConData = await this.codeService.UpdateIsPriVate(_id, codeuuid, userId, isPrivate1)
        if (!UpdateIsPrivateConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库修改失败")
        }
        return ResultUtils.success(UpdateIsPrivateConData)
    }


    /**
     * 搜索功能
     * @param searchByCodeValue 
     * @returns 
     */
    @Get('search')
    async SearchByCodeCon(@Query('searchByCodeValue') searchByCodeValue: string): Promise<BaseRespone<any>> {
        if (searchByCodeValue == undefined) {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }

        const SearchByCodeDataCon = await this.codeService.SearchByCode(searchByCodeValue)
        return ResultUtils.success(SearchByCodeDataCon)
    }


    /**
     * 查询单个代码片段
     * @param _id 
     * @param codeuuid 
     * @returns 
     */
    @Get('findBycodeuuid')
    async FindByCodeuuidCon(@Query('_id') _id: string, @Query('codeuuid') codeuuid: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || codeuuid == null || codeuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const CodeSnippetConData = await this.codeService.FindByCodeuuid(_id, codeuuid)
        if (!CodeSnippetConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(CodeSnippetConData)
    }

    @Get('findhotpublic')
    async FindHotPublicCode(): Promise<BaseRespone<any>> {
        const dataCon = await this.codeService.FindHotPublicCode()
        return ResultUtils.success(dataCon)
    }


}
