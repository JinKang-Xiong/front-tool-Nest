/*
https://docs.nestjs.com/controllers#controllers
*/
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
// import { formUploader, uploadToken, putExtra } from '../utils/qiniu/qiniuConfig';
import * as qiniu from 'qiniu'
import { Readable } from 'stream';
import { Controller, Post, Body, Get, Query, Put, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { PictureService } from './picture.service';
import { AddStoreDto } from './dto/picture.dto';
import { BaseRespone } from 'src/common/InterfaceBase';
import { BusinessException } from 'src/exception/BusinessException';
import { ErrorCode } from 'src/common/ErrorCode';
import { ResultUtils } from 'src/common/ResultUtils';
import { Picture } from './schemase/picture.schema';

@Controller('picture')
export class PictureController {
    constructor(private readonly pictureService: PictureService) { }

    /**
     * 新增加代码库
     * @param addStore 
     */
    @Post('addstore')
    async AddStoreCon(@Body() addStore: AddStoreDto): Promise<BaseRespone<StoreResponeOne>> {
        let storeName = addStore.storeName;
        let storeDescription = addStore.storeDescription;
        let userId = addStore.userId;
        if (storeName == null || storeName == '' || storeDescription == null || storeDescription == '' || userId == '' || userId == null) {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const AddStoreCon = await this.pictureService.AddStore(storeName, storeDescription, userId);
        if (!AddStoreCon) {
            new BusinessException(ErrorCode.PARAM_ERROR, "数据库新增加失败")
        }
        return ResultUtils.success(AddStoreCon)
    }

    /**
     * 查询用户的全部代码库
     * @param userId 
     */
    @Get('findallstore')
    async FindAllStoreCon(@Query("userId") userId: string): Promise<BaseRespone<Picture[]>> {
        if (userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const FindAllConData = await this.pictureService.FindAllStore(userId)
        if (!FindAllConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库的查询失败")
        }
        return ResultUtils.success(FindAllConData)
    }

    /**
     * 修改用户的代码库的信息
     * @param _id 
     * @param storeName 
     * @param storeDescription 
     * @returns 
     */
    @Put('updatestore')
    async UpdateStoreCon(@Query("_id") _id: string,
        @Query("storeName") storeName: string,
        @Query("storeDescription") storeDescription: string):
        Promise<BaseRespone<StoreResponeOne>> {
        if (_id == null || _id == '' || storeName == null || storeName == '' || storeDescription == null || storeDescription == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const UpdateStoreConData = await this.pictureService.UpdateStore(_id, storeName, storeDescription);
        if (!UpdateStoreConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库修改失败")
        }
        return ResultUtils.success(UpdateStoreConData)
    }

    /**
     * 删除代码库
     * @param _id 
     * @returns 
     */
    @Put('deletestore')
    async DeleteStore(@Query('_id') _id: string): Promise<BaseRespone<StoreResponeOne>> {
        if (_id == null || _id == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL);
        }
        const DeleteStoreData = await this.pictureService.DeleteStore(_id)
        if (!DeleteStoreData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR);
        }

        return ResultUtils.success(DeleteStoreData)
    }


    /**
     * 查询图片库的全部信息
     * @param _id 
     * @param userId 
     */
    @Get('findall')
    async FindAllPictureCon(@Query('_id') _id: string, @Query('userId') userId: string, @Query('limtDataIndex') limtDataIndex: string, @Query('countData') countData: string): Promise<BaseRespone<Picture>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        let limtDataIndex1 = Number(limtDataIndex)
        let countData1 = Number(countData)
        const FindAllConData = await this.pictureService.FindAllPicture(_id, userId, limtDataIndex1, countData1)
        if (!FindAllConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库查询失败")
        }

        return ResultUtils.success(FindAllConData)
    }


    /**
     * 删除图片库中的图片
     * @param _id 
     * @param pictureuuid 
     */
    @Put('delete')
    async DeletePictureCon(@Query('_id') _id: string, @Query('pictureuuid') pictureuuid: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || pictureuuid == null || pictureuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const DeletePictureData = await this.pictureService.DeletePicture(_id, pictureuuid)
        if (!DeletePictureData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR)
        }
        return ResultUtils.success(DeletePictureData)
    }

    /**
     * 上传图片
     * @param files 
     * @param _id 
     * @returns 
     */
    @Post('add')
    @UseInterceptors(
        FilesInterceptor('file'),
    )
    async uploadFile(@UploadedFiles() files: Express.Multer.File[], @Body('_id') _id: string): Promise<BaseRespone<any>> {
        console.log("传进来啦")
        console.log(files)
        console.log(_id)
        //TODO:jink-sercet
        const accessKey = 'xxxxxx'; // 替换为你的七牛云 Access Key
        const secretKey = 'xxxxxx'; // 替换为你的七牛云 Secret Key
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
                const key = `uploads/image${index + 1}_${Date.now()}.jpg`; // 替换为七牛云中存储的文件名

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
                        const UploadData = this.pictureService.AddPicture(_id, fileUrl, key.slice(8))

                        resolve(UploadData);
                    } else {
                        console.error('Error uploading file to Qiniu:', respInfo);
                        reject(new Error('Failed to upload file'));
                    }
                });
            });
        });

        try {
            const fileUrls = await Promise.all(uploadPromises);
            return ResultUtils.success({ length: fileUrls.length })
        } catch (err) {
            console.error('Error uploading files to Qiniu:', err);
            throw err;
        }
    }


    /**
     * 移动图片
     * @param oldid 
     * @param newid 
     * @param pictureuuid 
     * @returns 
     */
    @Put('movepicture')
    async MovePictureCon(@Query("oldid") oldid: string,
        @Query("newid") newid: string,
        @Query("pictureuuid") pictureuuid: string):
        Promise<BaseRespone<any>> {
        if (oldid == null || oldid == '' || newid == null || newid == '' || pictureuuid == null || pictureuuid == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const MovePictureConData = await this.pictureService.MoverPicture(oldid, newid, pictureuuid);
        if (!MovePictureConData) {
            throw new BusinessException(ErrorCode.PARAM_ERROR, "数据库执行失败")
        }
        return ResultUtils.success(MovePictureConData)
    }

    /**
     * 查询数据的总数
     * @param _id 
     * @param userId 
     */
    @Get('findpicturecount')
    async FindPictureCountCon(@Query('_id') _id: string, @Query('userId') userId: string): Promise<BaseRespone<any>> {
        if (_id == null || _id == '' || userId == null || userId == '') {
            throw new BusinessException(ErrorCode.PARAM_NULL)
        }
        const Count = await this.pictureService.FindPictureCount(_id, userId)
        return ResultUtils.success(Count)
    }



}
