mimc_appId = "2882303761517679871";
mimc_appSecret = "Jqt7fEQ7QM6clY3jlDaIEA==";
mimc_appKey = "5211767969871";
mimc_appAccount = "";

ucurl = 'https://mimc.chat.xiaomi.net/api/uctopic';

function init() {
    
}

function PrefixInteger(num, length) {
    return (Array(length).join('0') + num).slice(-length);
}

/**
 * 返回中文星期几
 * @param day Day of Week (Sunday as 0, Saturday as 6)
 */
function chinaWeek(day) {
    switch (day) {
        case 0:
            day = "星期天";
            break;
        case 1:
            day = "星期一";
            break;
        case 2:
            day = "星期二";
            break;
        case 3:
            day = "星期三";
            break;
        case 4:
            day = "星期四";
            break;
        case 5:
            day = "星期五";
            break;
        case 6:
            day = "星期六";
            break;
    }
    return day;
}

/*@note: fetchToken()访问APP应用方自行实现的AppProxyService服务，该服务实现以下功能：
    存储appId/appKey/appSec（不应当存储在APP客户端/html/js）
    用户在APP系统内的合法鉴权
    调用小米TokenService服务，并将小米TokenService服务返回结果通过fetchToken()原样返回 **/
function fetchMIMCToken() {
    if (!mimc_appAccount || "" === mimc_appAccount) {
        mimc_appAccount = window.sessionStorage.getItem("mimc_appAccount");
    }
    console.log("当前账号为" + mimc_appAccount);
    var result = window.sessionStorage.getItem('user');
    console.log(typeof result);
    if (!result || result === "{}" || JSON.stringify(result) === "{}") {
        let sendData = {appId: mimc_appId, appKey: mimc_appKey, appSecret: mimc_appSecret, appAccount: mimc_appAccount};
        result = httpRequest('https://mimc.chat.xiaomi.net/api/account/token', sendData);
        //Cookies.set('user', result);
        //Cookies.set("mimc_appAccount", mimc_appAccount);
        window.sessionStorage.setItem("user", JSON.stringify(result));
        window.sessionStorage.setItem("mimc_appAccount", mimc_appAccount);
    } else {
        console.log("使用cookie中缓存的账号信息登录");
        if (typeof result === "string") {
            // 判断是否是当前登录的用户
            result = JSON.parse(result);
            if (mimc_appAccount !== result.data.appAccount) {
                let sendData = {appId: mimc_appId, appKey: mimc_appKey, appSecret: mimc_appSecret, appAccount: mimc_appAccount};
                result = httpRequest('https://mimc.chat.xiaomi.net/api/account/token', sendData);
                //Cookies.set('user', result);
                //Cookies.set("mimc_appAccount", mimc_appAccount);
                window.sessionStorage.setItem("user", JSON.stringify(result));
                window.sessionStorage.setItem("mimc_appAccount", mimc_appAccount);
            }
        }
    }
    console.log(result);
    return result;
}


function httpRequest(url, data) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, false);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.send(JSON.stringify(data));

    return JSON.parse(xhr.response);
}

function login(username) {
    mimc_appAccount = username;
    user = new MIMCUser(mimc_appId, mimc_appAccount);
    user.registerP2PMsgHandler(receiveP2PMsg);
    user.registerGroupMsgHandler(receiveP2TMsg);
    user.registerFetchToken(fetchMIMCToken);
    user.registerStatusChange(statusChange);
    user.registerServerAckHandler(serverAck);
    user.registerDisconnHandler(disconnect);
    user.registerUCDismissHandler(ucDismiss);
    user.registerUCJoinRespHandler(ucJoinResp);
    user.registerUCMsgHandler(ucMessage);
    user.registerUCQuitRespHandler(ucQuitResp);
    user.login();
}

function ucDismiss(topicId) {
    writeToScreens("uc dismiss:" + topicId, 0);
}

function ucJoinResp(topicId, code, msg, context) {
    writeToScreens("uc join:" + topicId + ",code=" + code + ",msg=" + msg + ",context=" + context, 0);
}

function ucMessage(groupMsg) {
    console.log("recv uc msg:");
    console.log("biztype=" + groupMsg.getBizType());
    var date = new Date(parseInt(groupMsg.getTimeStamp()));
    writeTimeToScreens(date);
    writeToScreens("packetid=" + groupMsg.getPacketId(), 0);
    writeToScreens(groupMsg.getTopicId() + " " + groupMsg.getFromAccount() + ":" + groupMsg.getPayload(), 0);
}

function ucQuitResp(topicId, code, msg, context) {
    writeToScreens("uc quit:" + topicId + ",code=" + code + ",msg=" + msg + ",context=" + context, 0);
}

function createUCGroup() {
    var groupName = document.getElementById("topicName").value;
    var context = "testtest";
    user.createUnlimitedGroup(groupName, createUCGroupCB, context);
}

function createUCGroupCB(topicId, topicName, isSuccess, errMsg, context) {
    if (isSuccess) {
        console.log("group " + topicName + " created success. topicId = " + topicId + ",context=" + context);
    } else {
        console.log("group " + topicName + " created failed, err=" + errMsg + ",context=" + context);
    }
}

function joinUCGroup() {
    var topicID = document.getElementById("ucTopicId").value;
    var context = "testtest";
    user.joinUnlimitedGroup(topicID, context);
}

function quitUCGroup() {
    var topicID = document.getElementById("ucTopicId3").value;
    var context = "testtest";
    user.quitUnlimitedGroup(topicID, context);
}

function dismissUCGroup() {
    var topicID = document.getElementById("ucTopicId4").value;
    var context = "testtest";
    user.dismissUnlimitedGroup(topicID, dismissUCGroupCB, context);
}

function dismissUCGroupCB(isSuccess, topicId, context) {
    if (isSuccess) {
        writeToScreens("dismiss group:" + topicId + ",context=" + context, 0);
    } else {
        writeToScreens("dismiss group " + topicId + " failed" + ",context=" + context, 0);
    }
}

function queryGroupList() {
    var tokenInfo = fetchMIMCToken();
    var userToken;
    if (tokenInfo.code === 200) {
        userToken = tokenInfo.data.token;
    } else {
        console.log("query toeken failed.");
        userToken = "";
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', ucurl + '/topics', true);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('token', userToken);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            var result = JSON.parse(xhr.response);
            if (result.code === 200 && result.message === "success") {
                queryGroupListCB(true, result.data);
            } else {
                console.log("query uc group list failed,code=" + result.code + ",message=" + result.message);
                queryGroupListCB(false, "");
            }
        } else if (xhr.status !== 200) {
            console.log("query uc group list failed,readyState=" + xhr.readyState + ",status=" + xhr.status);
            queryGroupListCB(false, "");
        }
    };
    xhr.send();
}

function queryGroupListCB(isSuccess, data) {
    if (isSuccess) {
        writeToScreens("group lists=" + data, 0);
    }
}

function queryGroupMember() {
    var topicId = document.getElementById("ucTopicId5").value;
    var tokenInfo = fetchMIMCToken();
    var userToken;
    if (tokenInfo.code === 200) {
        userToken = tokenInfo.data.token;
    } else {
        console.log("query toeken failed.");
        userToken = "";
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', ucurl + '/userlist', true);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('token', userToken);
    xhr.setRequestHeader('topicId', topicId);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.response);
            var result = JSON.parse(xhr.response);
            if (result.code === 200 && result.message === "success") {
                queryGroupMemberCB(true, topicId, result.data.members);
            } else {
                console.log("query uc group member failed,code=" + result.code + ",message=" + result.message);
                queryGroupMemberCB(false, topicId, "");
            }
        } else if (xhr.status !== 200) {
            console.log("query uc group member failed,readyState=" + xhr.readyState + ",status=" + xhr.status);
            queryGroupMemberCB(false, topicId, "");
        }
    };
    xhr.send();
}

function queryGroupMemberCB(isSuccess, topicId, data) {
    if (isSuccess) {
        writeToScreens("group=" + topicId, 0);
        for (var i = 0; i < data.length; i++) {
            writeToScreens("user:" + data[i].appAccout + ",app id=" + data[i].appId, 0);
        }
    }
}

function sendUCMsg() {
    var topicID = document.getElementById("ucTopicId1").value;
    var msg = document.getElementById("msgId").value;
    var type = "txt";
    var packetid = user.sendUnlimitedGroupMessage(topicID, msg, type);
}

function statusChange(bindResult, errType, errReason, errDesc) {
    if (bindResult) {
        //writeToScreens("login succeed");
        console.log(mimc_appAccount + '登录成功');
    } else {
        //writeToScreens("login failed.errReason=" + errReason + ",errDesc=" + errDesc + ",errType=" + errType);
        console.error(mimc_appAccount + " login failed.errReason=" + errReason + ",errDesc=" + errDesc + ",errType=" + errType);
    }
}

function receiveP2PMsg(message) {
    console.log(JSON.stringify(message));
    let date = new Date(parseInt(message.getTimeStamp()));
    let disMsg = new Base64();
    console.log("biztype=" + message.getBizType());
    for(let i = 0, len = friendData.length; i < len; i++) {
        if (message.getFromAccount() === friendData[i].name) {
            writeTimeToScreens(date, 1,friendData[i], loginedUser);
            writeToScreens(disMsg.decode(JSON.parse(message.getPayload()).payload), 1, friendData[i], loginedUser);
            break;
        }
    }
}

function receiveP2TMsg(message) {
    var date = new Date(parseInt(message.getTimeStamp()));
    writeTimeToScreens(date);
    var disMsg = new Base64();
    console.log("biztype=" + message.getBizType());
    writeToScreens(message.getTopicId() + " " + message.getFromAccount() + ":" + disMsg.decode(JSON.parse(message.getPayload()).payload), 1);
}

function sendMsg(toUser, message) {
    /*var toUser = document.getElementById("username").value;
    var message = document.getElementById("sendmessage").value;*/
    var a = new Base64();
    var message_ = a.encode(message);
    jsonMsg = String(JSON.stringify({
        version: 0,
        msgId: "TEXT_1234",
        timestamp: String((new Date()).valueOf()),
        payload: message_
    }));
    console.log(jsonMsg);
    try {
        var packetId = user.sendMessage(toUser.name, jsonMsg);
    } catch (err) {
        console.log("sendMessage fail, err=" + err);
    }
    writeTimeToScreens(new Date(), 0, loginedUser, toUser);
    writeToScreens(message, 0, loginedUser, toUser);
}

function pushMsg() {
    var toUser = document.getElementById("username").value;
    var message = document.getElementById("sendmessage").value;
    var a = new Base64();
    var message_ = a.encode(message);
    jsonMsg = String(JSON.stringify({
        version: 0,
        msgId: "TEXT_1234",
        timestamp: String((new Date()).valueOf()),
        payload: message_
    }));

    var pushData = {
        appId: mimc_appId,
        appKey: mimc_appKey,
        appSecret: mimc_appSecret,
        fromAccount: mimc_appAccount,
        fromResource: "resWeb",
        toAccount: toUser,
        msg: jsonMsg
    };
    var result = httpRequest('https://mimc.chat.xiaomi.net/api/push/p2p/', pushData);
    writeToScreens(mimc_appAccount + " to " + toUser + ":" + message, 0);
    if (200 !== result.code) {
        writeToScreens("result code:" + result.code + ",message=" + result.message, 0);
    }

    var packetId = result.data.packetId;
}

function serverAck(packetId, sequence, timeStamp, errMsg) {
    //writeToScreens("receive msg ack:" + packetId + ",sequence=" + sequence + ",ts=" + timeStamp);
}

function disconnect() {
    writeToScreens("disconnect", 0, "", mimc_appAccount);
    alert(mimc_appAccount + "退出登录成功");
}

function logout() {
    user.logout();
    Cookies.remove("mimc_appAccount");
    Cookies.remove("user");
    window.localStorage.removeItem("mimc_appAccount");
    window.localStorage.removeItem("user");
}

function createGroup() {
    var topicName = document.getElementById("groupName").value;
    var groupMem = document.getElementById("groupMem").value;
    var data = {topicName: topicName, accounts: groupMem};
    var url = 'https://mimc.chat.xiaomi.net/api/topic/' + mimc_appId;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', url, false);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('appKey', mimc_appKey);
    xhr.setRequestHeader('appSecret', mimc_appSecret);
    xhr.setRequestHeader('appAccount', mimc_appAccount);
    xhr.send(JSON.stringify(data));

    var result = JSON.parse(xhr.response);
    if (200 !== result.code) {
        writeToScreens("create group failed,msg=" + result.message, 0);
        return;
    }

    writeToScreens("group name=" + result.data.topicInfo.topicName + ",topicId=" + result.data.topicInfo.topicId, 0);
}

function queryGroupInfo() {
    var url = 'https://mimc.chat.xiaomi.net/api/topic/' + mimc_appId + '/account';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.setRequestHeader('appKey', mimc_appKey);
    xhr.setRequestHeader('appSecret', mimc_appSecret);
    xhr.setRequestHeader('appAccount', mimc_appAccount);
    xhr.send();

    var result = JSON.parse(xhr.response);
    if (200 !== result.code) {
        writeToScreens("create group failed,msg=" + result.message, 0);
        return;
    }

    for (var i = 0; i < result.data.length; i++) {
        writeToScreens("group name=" + result.data[i].topicName + ",topic id=" + result.data[i].topicId, 0);
    }
}

function sendGroupMsg() {
    var topicId = document.getElementById("topicId").value;
    var groupMsg = document.getElementById("groupMessage").value;
    var a = new Base64();
    var groupMsg_ = a.encode(groupMsg);
    jsonMsg = String(JSON.stringify({
        version: 0,
        msgId: "TEXT_1234",
        timestamp: String((new Date()).valueOf()),
        content: groupMsg_
    }));
    try {
        var packetId = user.sendGroupMessage(topicId, jsonMsg, "json");
    } catch (err) {
        console.log("sendGroupMessage fail, err=" + err);
    }
    writeToScreens(mimc_appAccount + " to " + topicId + ":" + groupMsg, 0);
}

/**
 * 功能：把时间显示在页面上
 * 规则：微信聊天消息时间显示说明
 * 1、当天的消息，以每5分钟为一个跨度的显示时间；
 * 2、消息超过1天、小于1周，显示星期+收发消息的时间；
 * 3、消息大于1周，显示手机收发时间的日期。
 * @param datetime 时间，Date类型
 * @param msgSource 消息来源，0是自己，1是对方
 * @param fromUser 消息发送者，结构{name: "", profilePic: ""}
 * @param toUser 消息接收者，结构{name: "", profilePic: ""}
 */
function writeTimeToScreens(datetime, msgSource, fromUser, toUser) {
    datetime = dayjs(datetime);

    let pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.style.textAlign = "center";
    pre.innerHTML = datetime.format("HH:mm");

    let outputs;
    if (0 === msgSource) {
        // 消息来源是自己，说明是自己发送的消息
        outputs = document.getElementById("user-" + toUser.name);
        console.log("user-" + toUser.name);
    } else {
        // 消息来源是对方，说明是自己接收的消息
        outputs = document.getElementById("user-" + fromUser.name);
        console.log("user-" + fromUser.name);
    }
    if (outputs) {

    } else {
        console.error("not found outputs");
    }

    let lastTime;
    let lastTimePrefix = "lastTime-";
    if (0 === msgSource) {
        // 消息来源是自己，说明是自己发送的消息
        lastTime = window.sessionStorage.getItem(lastTimePrefix + toUser.name);
        window.sessionStorage.setItem(lastTimePrefix + toUser.name, datetime.unix().toString());
    } else {
        // 消息来源是对方，说明是自己接收的消息
        lastTime = window.sessionStorage.getItem(lastTimePrefix + fromUser.name);
        window.sessionStorage.setItem(lastTimePrefix + fromUser.name, datetime.unix().toString());
    }

    // 判断是否需要加日期前缀
    let currentTime = dayjs(new Date());
    if (currentTime.format("YYYYMMDD") === datetime.format("YYYYMMDD")) {
        // 如果是今天
        pre.innerHTML = datetime.format("HH:mm");
    } else if (currentTime.subtract(1, "day").format("YYYYMMDD") === datetime.format("YYYYMMDD")) {
        // 如果是昨天
        pre.innerHTML = "昨天 " + datetime.format("HH:mm");
    } else if (currentTime.subtract(7, "day").format("YYYYMMDD") < datetime.format("YYYYMMDD")) {
        // 如果消息超过1天、小于1周
        pre.innerHTML = chinaWeek(datetime.day()) + " " + datetime.format("HH:mm");
    } else {
        pre.innerHTML = datetime.format("YYYY年MM月DD日 HH:mm");
    }

    if (lastTime) {
        if (typeof lastTime === "string") {
            lastTime = parseInt(lastTime);
        }
        lastTime = dayjs.unix(lastTime);
        console.log("date=" + datetime.format("YYYY-MM-DD HH:mm:ss"));
        console.log("lastTime=" + lastTime.format("YYYY-MM-DD HH:mm:ss"));
        // 豪秒差
        let milliseconds = datetime.diff(lastTime);
        console.log("milliseconds = " + milliseconds);
        if (milliseconds >= 300000) {
            outputs.appendChild(pre);
        }
        //outputs.appendChild(pre);
    } else {
        outputs.appendChild(pre);
    }
}

/**
 * 把消息显示到屏幕上
 * @param message 消息内容
 * @param msgSource 消息来源，0是自己，1是对方
 * @param fromUser 消息发送者
 * @param toUser 消息接收者
 */
function writeToScreens(message, msgSource, fromUser, toUser) {
    console.log("message=" + message + ", msgSource=" + msgSource + ", fromUser=" + fromUser + ", toUser=" + toUser);
    var li = document.createElement("li");
    var main = document.createElement("div");
    if (0 === msgSource) {
        // 消息来源是自己，说明是自己发送的消息
        main.className = "main self";
    } else {
        // 消息来源是对方，说明是自己接收的消息
        main.className = "main";
    }
    var avatar = document.createElement("img");
    avatar.style.width = "30px";
    avatar.style.height = "30px";
    avatar.className = "avatar";
    avatar.src = fromUser.profilePic;
    main.appendChild(avatar);

    var text = document.createElement("div");
    text.className = "text";
    text.innerHTML = message;
    main.appendChild(text);
    li.appendChild(main);

    var outputs;
    if (0 === msgSource) {
        // 消息来源是自己，说明是自己发送的消息
        outputs = document.getElementById("user-" + toUser.name);
    } else {
        // 消息来源是对方，说明是自己接收的消息
        outputs = document.getElementById("user-" + fromUser.name);
    }
    if (outputs) {
        outputs.appendChild(li);
        // 保证聊天窗口滚动条在最底部
        let messageBox = document.getElementById("messageBox");
        messageBox.scrollTop = messageBox.scrollHeight;
    } else {
        console.error("not found outputs");
    }
}

function Base64() {

    _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";


    this.encode = function (input) {
        var output = "";
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = _utf8_encode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);
            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;
            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output +
                _keyStr.charAt(enc1) + _keyStr.charAt(enc2) +
                _keyStr.charAt(enc3) + _keyStr.charAt(enc4);
        }
        return output;
    };


    this.decode = function (input) {
        var output = "";
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        while (i < input.length) {
            enc1 = _keyStr.indexOf(input.charAt(i++));
            enc2 = _keyStr.indexOf(input.charAt(i++));
            enc3 = _keyStr.indexOf(input.charAt(i++));
            enc4 = _keyStr.indexOf(input.charAt(i++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            output = output + String.fromCharCode(chr1);
            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = _utf8_decode(output);
        return output;
    };

    _utf8_encode = function (string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";
        for (var n = 0; n < string.length; n++) {
            var c = string.charCodeAt(n);
            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }
        return utftext;
    };

    _utf8_decode = function (utftext) {
        var string = "";
        var i = 0;
        var c = c1 = c2 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }
}

window.addEventListener("load", init, false);