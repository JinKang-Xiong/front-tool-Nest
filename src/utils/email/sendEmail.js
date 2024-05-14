const nodemailer = require("nodemailer");

// 发送邮件函数

var sendMail = function (to,subject,text) {

  // 创建一个smtp客户端配置

  const config = {

    service: 'qq',
    auth: {

    // 发件人邮箱账号

    user: '2385472291@qq.com',

    //发件人邮箱的授权码 这里可以通过qq邮箱获取 并且不唯一

    //TODO:jink-sercet
    pass: 'xxxxxxx' //授权码生成之后，要等一会才能使用，否则验证的时候会报错

    }

  }

  const transporter = nodemailer.createTransport(config)

  //创建一个收件人对象

  const mail = {

    // 发件人 邮箱 '昵称<发件人邮箱>'

    from: `"前端工具箱"<2385472291@qq.com>`,

    // 主题

    subject: subject,

    // 收件人 的邮箱

    to: to,

    text:text


  }

  transporter.sendMail(mail, function(error, info) {

    if (error) {

      return console.log(error);

    }

    transporter.close()

    console.log('mail sent:', info.response)

  })

}

module.exports = {

  sendMail

};