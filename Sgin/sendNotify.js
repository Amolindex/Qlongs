/**
 * sendNotify 推送通知功能
 * @param text 通知头
 * @param desp 通知体
 * @param params 某些推送通知方式点击弹窗可跳转, 例：{ url: 'https://abc.com' }
 * @param author 作者仓库等信息  例：`本脚本免费使用 By：xxx`
 * @returns {Promise<unknown>}
 */
const querystring = require("querystring");
const fs = require('fs');
const {format} = require("date-fns");
const crypto = require("crypto");
const $ = new Env();
const timeout = 15000;//超时时间(单位毫秒)
// =======================================微信server酱通知设置区域===========================================
//此处填你申请的SCKEY.
//(环境变量名 PUSH_KEY)
let SCKEY = '';
// 自建serverchan 环境变量名 PUSH_KEY_WECOM
let SCKEY_WECOM = '';
// 自建serverchan 环境变量名 PUSH_KEY_WECOM_URL
let SCKEY_WECOM_URL = '';

// =======================================Bark App通知设置区域===========================================
//此处填你BarkAPP的信息(IP/设备码，例如：https://api.day.app/XXXXXXXX)
let BARK_PUSH = '';
//BARK app推送铃声,铃声列表去APP查看复制填写
let BARK_SOUND = '';
//BARK app推送消息的分组，默认为”JDHelloWorld”
let BARK_GROUP = 'JDHelloWorld'

// =======================================telegram机器人通知设置区域===========================================
//此处填你telegram bot 的Token，telegram机器人通知推送必填项.例如：1077xxx4424:AAFjv0FcqxxxxxxgEMGfi22B4yh15R5uw
//(环境变量名 TG_BOT_TOKEN)
let TG_BOT_TOKEN = '';
//此处填你接收通知消息的telegram用户的id，telegram机器人通知推送必填项.例如：129xxx206
//(环境变量名 TG_USER_ID)
let TG_USER_ID = '';
//tg推送HTTP代理设置(不懂可忽略,telegram机器人通知推送功能中非必填)
let TG_PROXY_HOST = '';//例如:127.0.0.1(环境变量名:TG_PROXY_HOST)
let TG_PROXY_PORT = '';//例如:1080(环境变量名:TG_PROXY_PORT)
let TG_PROXY_AUTH = '';//tg代理配置认证参数
//Telegram api自建的反向代理地址(不懂可忽略,telegram机器人通知推送功能中非必填),默认tg官方api(环境变量名:TG_API_HOST)
let TG_API_HOST = 'api.telegram.org'
// =======================================钉钉机器人通知设置区域===========================================
//此处填你钉钉 bot 的webhook，例如：5a544165465465645d0f31dca676e7bd07415asdasd
//(环境变量名 DD_BOT_TOKEN)
let DD_BOT_TOKEN = '';
//密钥，机器人安全设置页面，加签一栏下面显示的SEC开头的字符串
let DD_BOT_SECRET = '';

// =======================================企业微信机器人通知设置区域===========================================
//此处填你企业微信机器人的 webhook(详见文档 https://work.weixin.qq.com/api/doc/90000/90136/91770)，例如：693a91f6-7xxx-4bc4-97a0-0ec2sifa5aaa
//(环境变量名 QYWX_KEY)
let QYWX_KEY = '';

// =======================================企业微信应用消息通知设置区域===========================================
/*
此处填你企业微信应用消息的值(详见文档 https://work.weixin.qq.com/api/doc/90000/90135/90236)
环境变量名 QYWX_AM依次填入 corpid,corpsecret,touser(注:多个成员ID使用|隔开),agentid,消息类型(选填,不填默认文本消息类型)
注意用,号隔开(英文输入法的逗号)，例如：wwcff56746d9adwers,B-791548lnzXBE6_BWfxdf3kSTMJr9vFEPKAbh6WERQ,mingcheng,1000001,2COXgjH2UIfERF2zxrtUOKgQ9XklUqMdGSWLBoW_lSDAdafat
可选推送消息类型(推荐使用图文消息（mpnews）):
- 文本卡片消息: 0 (数字零)
- 文本消息: 1 (数字一)
- 图文消息（mpnews）: 素材库图片id, 可查看此教程(http://note.youdao.com/s/HMiudGkb)或者(https://note.youdao.com/ynoteshare1/index.html?id=1a0c8aff284ad28cbd011b29b3ad0191&type=note)
*/
let QYWX_AM = '';

// =======================================iGot聚合推送通知设置区域===========================================
//此处填您iGot的信息(推送key，例如：https://push.hellyw.com/XXXXXXXX)
let IGOT_PUSH_KEY = '';

// =======================================push+设置区域=======================================
//官方文档：http://www.pushplus.plus/
//PUSH_PLUS_TOKEN：微信扫码登录后一对一推送或一对多推送下面的token(您的Token)，不提供PUSH_PLUS_USER则默认为一对一推送
//PUSH_PLUS_USER： 一对多推送的“群组编码”（一对多推送下面->您的群组(如无则新建)->群组编码，如果您是创建群组人。也需点击“查看二维码”扫描绑定，否则不能接受群组消息推送）
let PUSH_PLUS_TOKEN = '';
let PUSH_PLUS_USER = '';

// =======================================cq-gohttp设置区域=======================================
// Doc https://docs.go-cqhttp.org/api/
let go_cqhttp_url = '' // 127.0.0.1:5702
let go_cqhttp_qq = '' // 接收消息QQ或群
let go_cqhttp_method = '' // send_private_msg or send_group_msg

process.env.go_cqhttp_url ? go_cqhttp_url = process.env.go_cqhttp_url : ''
process.env.go_cqhttp_qq ? go_cqhttp_qq = process.env.go_cqhttp_qq : ''
process.env.go_cqhttp_method ? go_cqhttp_method = process.env.go_cqhttp_method : ''

// =======================================wxpusher设置区域=======================================
// Doc https://wxpusher.zjiecode.com/admin/
let appToken = '';  // https://wxpusher.zjiecode.com/admin/main/app/appToken

//==========================云端环境变量的判断与接收=========================
if (process.env.PUSH_KEY) {
    SCKEY = process.env.PUSH_KEY;
}

if (process.env.PUSH_KEY_WECOM) {
    SCKEY_WECOM = process.env.PUSH_KEY_WECOM;
}

if (process.env.PUSH_KEY_WECOM_URL) {
    SCKEY_WECOM_URL = process.env.PUSH_KEY_WECOM_URL;
}

if (process.env.QQ_SKEY) {
    QQ_SKEY = process.env.QQ_SKEY;
}

if (process.env.QQ_MODE) {
    QQ_MODE = process.env.QQ_MODE;
}


if (process.env.BARK_PUSH) {
    if (process.env.BARK_PUSH.indexOf('https') > -1 || process.env.BARK_PUSH.indexOf('http') > -1) {
        //兼容BARK自建用户
        BARK_PUSH = process.env.BARK_PUSH
    } else {
        BARK_PUSH = `https://api.day.app/${process.env.BARK_PUSH}`
    }
    if (process.env.BARK_SOUND) {
        BARK_SOUND = process.env.BARK_SOUND
    }
    if (process.env.BARK_GROUP) {
        BARK_GROUP = process.env.BARK_GROUP
    }

} else {
    if (BARK_PUSH && BARK_PUSH.indexOf('https') === -1 && BARK_PUSH.indexOf('http') === -1) {
        //兼容BARK本地用户只填写设备码的情况
        BARK_PUSH = `https://api.day.app/${BARK_PUSH}`
    }
}
if (process.env.TG_BOT_TOKEN) {
    TG_BOT_TOKEN = process.env.TG_BOT_TOKEN;
}
if (process.env.TG_USER_ID) {
    TG_USER_ID = process.env.TG_USER_ID;
}
if (process.env.TG_PROXY_AUTH) TG_PROXY_AUTH = process.env.TG_PROXY_AUTH;
if (process.env.TG_PROXY_HOST) TG_PROXY_HOST = process.env.TG_PROXY_HOST;
if (process.env.TG_PROXY_PORT) TG_PROXY_PORT = process.env.TG_PROXY_PORT;
if (process.env.TG_API_HOST) TG_API_HOST = process.env.TG_API_HOST;

if (process.env.DD_BOT_TOKEN) {
    DD_BOT_TOKEN = process.env.DD_BOT_TOKEN;
    if (process.env.DD_BOT_SECRET) {
        DD_BOT_SECRET = process.env.DD_BOT_SECRET;
    }
}

if (process.env.QYWX_KEY) {
    QYWX_KEY = process.env.QYWX_KEY;
}

if (process.env.QYWX_AM) {
    QYWX_AM = process.env.QYWX_AM;
}

if (process.env.IGOT_PUSH_KEY) {
    IGOT_PUSH_KEY = process.env.IGOT_PUSH_KEY
}

if (process.env.PUSH_PLUS_TOKEN) {
    PUSH_PLUS_TOKEN = process.env.PUSH_PLUS_TOKEN;
}
if (process.env.PUSH_PLUS_USER) {
    PUSH_PLUS_USER = process.env.PUSH_PLUS_USER;
}
if (process.env.appToken) {
    appToken = process.env.appToken;
}

//==========================云端环境变量的判断与接收=========================

/**
 * sendNotify 推送通知功能
 * @param text 通知头
 * @param desp 通知体
 * @param params 某些推送通知方式点击弹窗可跳转, 例：{ url: 'https://abc.com' }
 * @param author 作者仓库等信息  例：`本脚本免费使用 By：xxxx`
 * @returns {Promise<unknown>}
 */
async function sendNotify(text, desp, params = {}, author = '') {
    //提供6种通知
    let remarks = '';
    try {
        fs.accessSync('./utils/account.json')
        remarks = JSON.parse(fs.readFileSync('./utils/account.json').toString() || '[]')
    } catch (e) {
    }
    if (remarks) {
        for (let account of remarks) {
            let pt_pin = decodeURIComponent(account['pt_pin']).split(';')[0]
            for (let subDesp of desp.split('\n\n')) {
                if (subDesp.indexOf(pt_pin) > -1 && account['wxpusher_uid']) {
                    await wxpusher(text, subDesp, account['wxpusher_uid'])
                }
            }
            if (pt_pin && account['remarks']) {
                text = text.replace(new RegExp(pt_pin, 'gm'), account['remarks'])
                desp = desp.replace(new RegExp(pt_pin, 'gm'), account['remarks'])
            }
        }
    }
    desp += author;
    await Promise.all([
        serverNotify(text, desp),//微信server酱
        serverWecomNotify(text, desp), // 自建server酱推送
        pushPlusNotify(text, desp)//pushplus(推送加)
    ])
    //由于上述两种微信通知需点击进去才能查看到详情，故text(标题内容)携带了账号序号以及昵称信息，方便不点击也可知道是哪个京东哪个活动
    text = text.match(/.*?(?=\s?-)/g) ? text.match(/.*?(?=\s?-)/g)[0] : text;
    await Promise.all([
        BarkNotify(text, desp, params),//iOS Bark APP
        tgBotNotify(text, desp),//telegram 机器人
        ddBotNotify(text, desp),//钉钉机器人
        qywxBotNotify(text, desp), //企业微信机器人
        qywxamNotify(text, desp), //企业微信应用消息推送
        iGotNotify(text, desp, params),//iGot
        goCQhttp(text, desp)  // go-cqhttp
    ])
}

function goCQhttp(text, desp) {
    if (go_cqhttp_url && go_cqhttp_qq && go_cqhttp_method) {
        let msg = (text + '\n' + desp).replace("\n\n仅供用于学习", '');

        let recv_id = ''
        if (go_cqhttp_method === 'send_private_msg') {
            recv_id = 'user_id'
        } else if (go_cqhttp_method === 'send_group_msg') {
            recv_id = 'group_id'
        }

        return new Promise(resolve => {
            $.get({
                url: `http://${go_cqhttp_url}/${go_cqhttp_method}?${recv_id}=${go_cqhttp_qq}&message=${escape(msg)}`
            }, (err, resp, data) => {
                if (!err) {
                    try {
                        // console.log(data);
                        data = JSON.parse(data);
                        if (data.retcode === 0 && data.status === 'ok') {
                            console.log('go-cqhttp发送通知消息成功🎉\n')
                        } else {
                            console.log(`go-cqhttp发送通知消息异常\n${JSON.stringify(data)}`)
                        }
                    } catch (e) {
                        $.logErr(e, resp)
                    } finally {
                        resolve(200)
                    }
                }
            })
        })
    }
}

function serverNotify(text, desp, time = 2100) {
    return new Promise(resolve => {
        if (SCKEY) {
            //微信server酱推送通知一个\n不会换行，需要两个\n才能换行，故做此替换
            desp = desp.replace(/[\n\r]/g, '\n\n');
            const options = {
                url: SCKEY.includes('SCT') ? `https://sctapi.ftqq.com/${SCKEY}.send` : `https://sc.ftqq.com/${SCKEY}.send`,
                body: `text=${text}&desp=${desp}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout
            }
            setTimeout(() => {
                $.post(options, (err, resp, data) => {
                    try {
                        if (err) {
                            console.log('发送通知调用API失败！！\n')
                            console.log(err);
                        } else {
                            data = JSON.parse(data);
                            //server酱和Server酱·Turbo版的返回json格式不太一样
                            if (data.errno === 0 || data.data.errno === 0) {
                                console.log('server酱发送通知消息成功🎉\n')
                            } else if (data.errno === 1024) {
                                // 一分钟内发送相同的内容会触发
                                console.log(`server酱发送通知消息异常: ${data.errmsg}\n`)
                            } else {
                                console.log(`server酱发送通知消息异常\n${JSON.stringify(data)}`)
                            }
                        }
                    } catch (e) {
                        $.logErr(e, resp);
                    } finally {
                        resolve(data);
                    }
                })
            }, time)
        } else {
            // console.log('\n\n您未提供server酱的SCKEY，取消微信推送消息通知🚫\n');
            resolve()
        }
    })
}

function serverWecomNotify(text, desp, time = 2100) {
    return new Promise(resolve => {
        if (SCKEY_WECOM && SCKEY_WECOM_URL) {
            //微信server酱推送通知一个\n不会换行，需要两个\n才能换行，故做此替换
            desp = desp.replace(/[\n\r]/g, '\n\n');
            const options = {
                url: SCKEY_WECOM_URL,
                body: `sendkey=` + SCKEY_WECOM + `&text=${text}&desp=${desp}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout
            }
            setTimeout(() => {
                $.post(options, (err, resp, data) => {
                    try {
                        if (err) {
                            console.log('发送通知调用API失败！！\n')
                            console.log(err);
                        } else {
                            data = JSON.parse(data);
                            //server酱和Server酱·Turbo版的返回json格式不太一样
                            if (data.errno === 0 || data.data.errno === 0) {
                                console.log('server酱发送通知消息成功🎉\n')
                            } else if (data.errno === 1024) {
                                // 一分钟内发送相同的内容会触发
                                console.log(`server酱发送通知消息异常: ${data.errmsg}\n`)
                            } else {
                                console.log(`server酱发送通知消息异常\n${JSON.stringify(data)}`)
                            }
                        }
                    } catch (e) {
                        $.logErr(e, resp);
                    } finally {
                        resolve(data);
                    }
                })
            }, time)
        } else {
            // console.log('\n\n您未提供自建server酱的SCKEY，取消推送自建server酱消息通知🚫\n');
            resolve()
        }
    })
}

function BarkNotify(text, desp, params = {}) {
    return new Promise(resolve => {
        if (BARK_PUSH) {
            const options = {
                url: `${BARK_PUSH}/${encodeURIComponent(text)}/${encodeURIComponent(desp)}?sound=${BARK_SOUND}&group=${BARK_GROUP}&${querystring.stringify(params)}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout
            }
            $.get(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('Bark APP发送通知调用API失败！！\n')
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.code === 200) {
                            console.log('Bark APP发送通知消息成功🎉\n')
                        } else {
                            console.log(`${data.message}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve();
                }
            })
        } else {
            // console.log('您未提供Bark的APP推送BARK_PUSH，取消Bark推送消息通知🚫\n');
            resolve()
        }
    })
}

function tgBotNotify(text, desp) {
    return new Promise(resolve => {
        if (TG_BOT_TOKEN && TG_USER_ID) {
            const options = {
                url: `https://${TG_API_HOST}/bot${TG_BOT_TOKEN}/sendMessage`,
                json: {
                    chat_id: `${TG_USER_ID}`,
                    text: `${text}\n\n${desp}`,
                    disable_web_page_preview: true,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout
            }
            if (TG_PROXY_HOST && TG_PROXY_PORT) {
                const tunnel = require("tunnel");
                const agent = {
                    https: tunnel.httpsOverHttp({
                        proxy: {
                            host: TG_PROXY_HOST,
                            port: TG_PROXY_PORT * 1,
                            proxyAuth: TG_PROXY_AUTH
                        }
                    })
                }
                Object.assign(options, {agent})
            }
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('telegram发送通知消息失败！！\n')
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.ok) {
                            console.log('Telegram发送通知消息成功🎉。\n')
                        } else if (data.error_code === 400) {
                            console.log('请主动给bot发送一条消息并检查接收用户ID是否正确。\n')
                        } else if (data.error_code === 401) {
                            console.log('Telegram bot token 填写错误。\n')
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            })
        } else {
            // console.log('您未提供telegram机器人推送所需的TG_BOT_TOKEN和TG_USER_ID，取消telegram推送消息通知🚫\n');
            resolve()
        }
    })
}

function ddBotNotify(text, desp) {
    return new Promise(resolve => {
        const options = {
            url: `https://oapi.dingtalk.com/robot/send?access_token=${DD_BOT_TOKEN}`,
            json: {
                "msgtype": "text",
                "text": {
                    "content": ` ${text}\n\n${desp}`
                }
            },
            headers: {
                'Content-Type': 'application/json'
            },
            timeout
        }
        if (DD_BOT_TOKEN && DD_BOT_SECRET) {
            const crypto = require('crypto');
            const dateNow = Date.now();
            const hmac = crypto.createHmac('sha256', DD_BOT_SECRET);
            hmac.update(`${dateNow}\n${DD_BOT_SECRET}`);
            const result = encodeURIComponent(hmac.digest('base64'));
            options.url = `${options.url}&timestamp=${dateNow}&sign=${result}`;
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('钉钉发送通知消息失败！！\n')
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.errcode === 0) {
                            console.log('钉钉发送通知消息成功🎉。\n')
                        } else {
                            console.log(`${data.errmsg}\n`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            })
        } else if (DD_BOT_TOKEN) {
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('钉钉发送通知消息失败！！\n')
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.errcode === 0) {
                            console.log('钉钉发送通知消息完成。\n')
                        } else {
                            console.log(`${data.errmsg}\n`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            })
        } else {
            // console.log('您未提供钉钉机器人推送所需的DD_BOT_TOKEN或者DD_BOT_SECRET，取消钉钉推送消息通知🚫\n');
            resolve()
        }
    })
}

function qywxBotNotify(text, desp) {
    return new Promise(resolve => {
        const options = {
            url: `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${QYWX_KEY}`,
            json: {
                msgtype: 'text',
                text: {
                    content: ` ${text}\n\n${desp}`,
                },
            },
            headers: {
                'Content-Type': 'application/json',
            },
            timeout
        };
        if (QYWX_KEY) {
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('企业微信发送通知消息失败！！\n');
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.errcode === 0) {
                            console.log('企业微信发送通知消息成功🎉。\n');
                        } else {
                            console.log(`${data.errmsg}\n`);
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            });
        } else {
            // console.log('您未提供企业微信机器人推送所需的QYWX_KEY，取消企业微信推送消息通知🚫\n');
            resolve();
        }
    });
}

function ChangeUserId(desp) {
    const QYWX_AM_AY = QYWX_AM.split(',');
    if (QYWX_AM_AY[2]) {
        const userIdTmp = QYWX_AM_AY[2].split("|");
        let userId = "";
        for (let i = 0; i < userIdTmp.length; i++) {
            const count = "账号" + (i + 1);
            const count2 = "签到号 " + (i + 1);
            if (desp.match(count2)) {
                userId = userIdTmp[i];
            }
        }
        if (!userId) userId = QYWX_AM_AY[2];
        return userId;
    } else {
        return "@all";
    }
}

function qywxamNotify(text, desp) {
    return new Promise(resolve => {
        if (QYWX_AM) {
            const QYWX_AM_AY = QYWX_AM.split(',');
            const options_accesstoken = {
                url: `https://qyapi.weixin.qq.com/cgi-bin/gettoken`,
                json: {
                    corpid: `${QYWX_AM_AY[0]}`,
                    corpsecret: `${QYWX_AM_AY[1]}`,
                },
                headers: {
                    'Content-Type': 'application/json',
                },
                timeout
            };
            $.post(options_accesstoken, (err, resp, data) => {
                html = desp.replace(/\n/g, "<br/>")
                var json = JSON.parse(data);
                accesstoken = json.access_token;
                let options;

                switch (QYWX_AM_AY[4]) {
                    case '0':
                        options = {
                            msgtype: 'textcard',
                            textcard: {
                                title: `${text}`,
                                description: `${desp}`,
                                url: '',
                                btntxt: '更多'
                            }
                        }
                        break;

                    case '1':
                        options = {
                            msgtype: 'text',
                            text: {
                                content: `${text}\n\n${desp}`
                            }
                        }
                        break;

                    default:
                        options = {
                            msgtype: 'mpnews',
                            mpnews: {
                                articles: [
                                    {
                                        title: `${text}`,
                                        thumb_media_id: `${QYWX_AM_AY[4]}`,
                                        author: `智能助手`,
                                        content_source_url: ``,
                                        content: `${html}`,
                                        digest: `${desp}`
                                    }
                                ]
                            }
                        }
                }
                ;
                if (!QYWX_AM_AY[4]) {
                    //如不提供第四个参数,则默认进行文本消息类型推送
                    options = {
                        msgtype: 'text',
                        text: {
                            content: `${text}\n\n${desp}`
                        }
                    }
                }
                options = {
                    url: `https://qyapi.weixin.qq.com/cgi-bin/message/send?access_token=${accesstoken}`,
                    json: {
                        touser: `${ChangeUserId(desp)}`,
                        agentid: `${QYWX_AM_AY[3]}`,
                        safe: '0',
                        ...options
                    },
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }

                $.post(options, (err, resp, data) => {
                    try {
                        if (err) {
                            console.log('成员ID:' + ChangeUserId(desp) + '企业微信应用消息发送通知消息失败！！\n');
                            console.log(err);
                        } else {
                            data = JSON.parse(data);
                            if (data.errcode === 0) {
                                console.log('成员ID:' + ChangeUserId(desp) + '企业微信应用消息发送通知消息成功🎉。\n');
                            } else {
                                console.log(`${data.errmsg}\n`);
                            }
                        }
                    } catch (e) {
                        $.logErr(e, resp);
                    } finally {
                        resolve(data);
                    }
                });
            });
        } else {
            // console.log('您未提供企业微信应用消息推送所需的QYWX_AM，取消企业微信应用消息推送消息通知🚫\n');
            resolve();
        }
    });
}

function iGotNotify(text, desp, params = {}) {
    return new Promise(resolve => {
        if (IGOT_PUSH_KEY) {
            // 校验传入的IGOT_PUSH_KEY是否有效
            const IGOT_PUSH_KEY_REGX = new RegExp("^[a-zA-Z0-9]{24}$")
            if (!IGOT_PUSH_KEY_REGX.test(IGOT_PUSH_KEY)) {
                console.log('您所提供的IGOT_PUSH_KEY无效\n')
                resolve()
                return
            }
            const options = {
                url: `https://push.hellyw.com/${IGOT_PUSH_KEY.toLowerCase()}`,
                body: `title=${text}&content=${desp}&${querystring.stringify(params)}`,
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                timeout
            }
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log('发送通知调用API失败！！\n')
                        console.log(err);
                    } else {
                        if (typeof data === 'string') data = JSON.parse(data);
                        if (data.ret === 0) {
                            console.log('iGot发送通知消息成功🎉\n')
                        } else {
                            console.log(`iGot发送通知消息失败：${data.errMsg}\n`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            })
        } else {
            // console.log('您未提供iGot的推送IGOT_PUSH_KEY，取消iGot推送消息通知🚫\n');
            resolve()
        }
    })
}

function pushPlusNotify(text, desp) {
    return new Promise(resolve => {
        if (PUSH_PLUS_TOKEN) {
            desp = desp.replace(/[\n\r]/g, '<br>'); // 默认为html, 不支持plaintext
            const body = {
                token: `${PUSH_PLUS_TOKEN}`,
                title: `${text}`,
                content: `${desp}`,
                topic: `${PUSH_PLUS_USER}`
            };
            const options = {
                url: `http://www.pushplus.plus/send`,
                body: JSON.stringify(body),
                headers: {
                    'Content-Type': ' application/json'
                },
                timeout
            }
            $.post(options, (err, resp, data) => {
                try {
                    if (err) {
                        console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败！！\n`)
                        console.log(err);
                    } else {
                        data = JSON.parse(data);
                        if (data.code === 200) {
                            console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息完成。\n`)
                        } else {
                            console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败：${data.msg}\n`)
                        }
                    }
                } catch (e) {
                    $.logErr(e, resp);
                } finally {
                    resolve(data);
                }
            })
        } else {
            // console.log('您未提供push+推送所需的PUSH_PLUS_TOKEN，取消push+推送消息通知🚫\n');
            resolve()
        }
    })
}

function wxpusher(title, content, uid) {
    return new Promise(resolve => {
        $.post({
            url: 'http://wxpusher.zjiecode.com/api/send/message',
            body: JSON.stringify({
                "appToken": appToken,
                "content": `${title}\n\n${content}`,
                "summary": title,//消息摘要，显示在微信聊天页面或者模版消息卡片上，限制长度100，可以不传，不传默认截取content前面的内容。
                "contentType": 1,//内容类型 1表示文字  2表示html(只发送body标签内部的数据即可，不包括body标签) 3表示markdown
                "topicIds": [ //发送目标的topicId，是一个数组！！！，也就是群发，使用uids单发的时候， 可以不传。
                ],
                "uids": [uid],//发送目标的UID，是一个数组。注意uids和topicIds可以同时填写，也可以只填写一个。
                "url": "" //原文链接，可选参数
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }, (err, resp, data) => {
            try {
                if (!err) {
                    data = $.toObj(data)
                    if (data.code === 1000) {
                        console.log(`wxpusher: ${uid} 发送成功`)
                    } else {
                        console.log(`wxpusher: ${uid} 发送失败\n${data}`)
                    }
                } else {
                    console.log('wxpusher Error1:', err)
                }
            } catch (e) {
                console.log('wxpusher Error2:', e)
            } finally {
                resolve()
            }
        })
    })
}

module.exports = {
    sendNotify,
    BARK_PUSH
}

// prettier-ignore
function Env(t, e) {
    "undefined" != typeof process && JSON.stringify(process.env).indexOf("GITHUB") > -1 && process.exit(0);

    class s {
        constructor(t) {
            this.env = t
        }

        send(t, e = "GET") {
            t = "string" == typeof t ? {url: t} : t;
            let s = this.get;
            return "POST" === e && (s = this.post), new Promise((e, i) => {
                s.call(this, t, (t, s, r) => {
                    t ? i(t) : e(s)
                })
            })
        }

        get(t) {
            return this.send.call(this.env, t)
        }

        post(t) {
            return this.send.call(this.env, t, "POST")
        }
    }

    return new class {
        constructor(t, e) {
            this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e)
        }

        isNode() {
            return "undefined" != typeof module && !!module.exports
        }

        isQuanX() {
            return "undefined" != typeof $task
        }

        isSurge() {
            return "undefined" != typeof $httpClient && "undefined" == typeof $loon
        }

        isLoon() {
            return "undefined" != typeof $loon
        }

        toObj(t, e = null) {
            try {
                return JSON.parse(t)
            } catch {
                return e
            }
        }

        toStr(t, e = null) {
            try {
                return JSON.stringify(t)
            } catch {
                return e
            }
        }

        getjson(t, e) {
            let s = e;
            const i = this.getdata(t);
            if (i) try {
                s = JSON.parse(this.getdata(t))
            } catch {
            }
            return s
        }

        setjson(t, e) {
            try {
                return this.setdata(JSON.stringify(t), e)
            } catch {
                return !1
            }
        }

        getScript(t) {
            return new Promise(e => {
                this.get({url: t}, (t, s, i) => e(i))
            })
        }

        runScript(t, e) {
            return new Promise(s => {
                let i = this.getdata("@chavy_boxjs_userCfgs.httpapi");
                i = i ? i.replace(/\n/g, "").trim() : i;
                let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout");
                r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r;
                const [o, h] = i.split("@"), n = {
                    url: `http://${h}/v1/scripting/evaluate`,
                    body: {script_text: t, mock_type: "cron", timeout: r},
                    headers: {"X-Key": o, Accept: "*/*"}
                };
                this.post(n, (t, e, i) => s(i))
            }).catch(t => this.logErr(t))
        }

        loaddata() {
            if (!this.isNode()) return {};
            {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e);
                if (!s && !i) return {};
                {
                    const i = s ? t : e;
                    try {
                        return JSON.parse(this.fs.readFileSync(i))
                    } catch (t) {
                        return {}
                    }
                }
            }
        }

        writedata() {
            if (this.isNode()) {
                this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path");
                const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile),
                    s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data);
                s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r)
            }
        }

        lodash_get(t, e, s) {
            const i = e.replace(/\[(\d+)\]/g, ".$1").split(".");
            let r = t;
            for (const t of i) if (r = Object(r)[t], void 0 === r) return s;
            return r
        }

        lodash_set(t, e, s) {
            return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t)
        }

        getdata(t) {
            let e = this.getval(t);
            if (/^@/.test(t)) {
                const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : "";
                if (r) try {
                    const t = JSON.parse(r);
                    e = t ? this.lodash_get(t, i, "") : e
                } catch (t) {
                    e = ""
                }
            }
            return e
        }

        setdata(t, e) {
            let s = !1;
            if (/^@/.test(e)) {
                const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i),
                    h = i ? "null" === o ? null : o || "{}" : "{}";
                try {
                    const e = JSON.parse(h);
                    this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i)
                } catch (e) {
                    const o = {};
                    this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i)
                }
            } else s = this.setval(t, e);
            return s
        }

        getval(t) {
            return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null
        }

        setval(t, e) {
            return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null
        }

        initGotEnv(t) {
            this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar))
        }

        get(t, e = (() => {
        })) {
            t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.get(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => {
                try {
                    if (t.headers["set-cookie"]) {
                        const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString();
                        s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar
                    }
                } catch (t) {
                    this.logErr(t)
                }
            }).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => {
                const {message: s, response: i} = t;
                e(s, i, i && i.body)
            }))
        }

        post(t, e = (() => {
        })) {
            if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, {"X-Surge-Skip-Scripting": !1})), $httpClient.post(t, (t, s, i) => {
                !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i)
            }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, {hints: !1})), $task.fetch(t).then(t => {
                const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                e(null, {status: s, statusCode: i, headers: r, body: o}, o)
            }, t => e(t)); else if (this.isNode()) {
                this.initGotEnv(t);
                const {url: s, ...i} = t;
                this.got.post(s, i).then(t => {
                    const {statusCode: s, statusCode: i, headers: r, body: o} = t;
                    e(null, {status: s, statusCode: i, headers: r, body: o}, o)
                }, t => {
                    const {message: s, response: i} = t;
                    e(s, i, i && i.body)
                })
            }
        }

        time(t, e = null) {
            const s = e ? new Date(e) : new Date;
            let i = {
                "M+": s.getMonth() + 1,
                "d+": s.getDate(),
                "H+": s.getHours(),
                "m+": s.getMinutes(),
                "s+": s.getSeconds(),
                "q+": Math.floor((s.getMonth() + 3) / 3),
                S: s.getMilliseconds()
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length)));
            for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length)));
            return t
        }

        msg(e = t, s = "", i = "", r) {
            const o = t => {
                if (!t) return t;
                if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? {"open-url": t} : this.isSurge() ? {url: t} : void 0;
                if ("object" == typeof t) {
                    if (this.isLoon()) {
                        let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"];
                        return {openUrl: e, mediaUrl: s}
                    }
                    if (this.isQuanX()) {
                        let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl;
                        return {"open-url": e, "media-url": s}
                    }
                    if (this.isSurge()) {
                        let e = t.url || t.openUrl || t["open-url"];
                        return {url: e}
                    }
                }
            };
            if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) {
                let t = ["", "==============📣系统通知📣=============="];
                t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t)
            }
        }

        log(...t) {
            t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator))
        }

        logErr(t, e) {
            const s = !this.isSurge() && !this.isQuanX() && !this.isLoon();
            s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t)
        }

        wait(t) {
            return new Promise(e => setTimeout(e, t))
        }

        done(t = {}) {
            const e = (new Date).getTime(), s = (e - this.startTime) / 1e3;
            this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t)
        }
    }(t, e)
}
