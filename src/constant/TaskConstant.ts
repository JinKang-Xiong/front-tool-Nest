export const DELETESUCESS = '删除成功'
export const DELETEERR = '删除失败'

export const ALREADTEXIST = '已存在'

export const UPDATESUCCESS = '修改成功'
export const UPDATEERR = '抱歉，可见范围修改失败'

//发送给反馈者的消息
export const MESSAGEUSER = '您好，您提交给的反馈信息我们已经受理，谢谢您的提交，公共库的美好靠我们每一个人'

//发送给资源者的通过消息
export function RESOURCESUCCESS(name) {
    return `您好，您的公共资源${name},被反馈给我们审核了，审核通过，暂时没有问题，不过建议您还是按照公共资源规范再次检查一下，谢谢您对公共库的贡献`
}

//发送给资源者的封禁消息
export function RESOURCEERR(name) {
    return `您好，您的公共资源${name},被反馈给我们审核了，审核不通过，资源的公共性被封禁，调整为私有性，请您根据公共资源规范修改后，再次发布我们会继续审核，审核通过会解除封禁`
}
