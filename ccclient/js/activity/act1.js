/*
转盘抽奖活动
**/


//本地存储抽奖记录  获奖时间 获奖内容
    function writeToFile(wardTime, content ,maxNumber) {
        cc.log("need to save -->" + wardTime + "  " + content)
        //jsclient.native.ShowReardsData("time110写数据:");
        var history = [];
        var olddata = sys.localStorage.getItem("treward");
        var obj;

        if (olddata == null || typeof(olddata) == "undefined" || olddata == "") {
            cc.log("---- first push a data --->>")
            obj = {"time": wardTime, "type": content};
            history.push(obj);
            history = JSON.stringify(history);
            sys.localStorage.setItem("treward", history);
            cc.log("save ok");
            return;
        }
        cc.log(" ---repush a history ---")
        obj = {"time": wardTime, "type": content};
        olddata = JSON.parse(olddata);
        olddata.push(obj);

        //默认纪录 50 条
        maxNumber = (maxNumber == "undefined" || maxNumber =="" || maxNumber == null)? 50:maxNumber;
        if(olddata.length > maxNumber){
            cc.log("超过最大纪录数量：删除纪录："+JSON.stringify(olddata[olddata.length-1]))
            olddata.splice(0,1);
        }

        var newdata = JSON.stringify(olddata);
        sys.localStorage.setItem("treward", newdata);
    }


    //加载抽奖记录
    function InitRewardHistory(rewardList) {
        cc.log("InitRewardHistory---rewardList.getTag======" + rewardList.getTag())
        var rewardNumber; //服务端接收记录个数？ 本地保存抽奖记录数据,查找
        //writeToFile("2016.8.9","钻石X100"); //TODO 将抽奖记录本地保存

        var record = sys.localStorage.getItem("treward") //获取本地保存的抽奖记录

        if (record == null || typeof(record) == "undefined")return;
        record = JSON.parse(record);

        rewardNumber = record.length;
        cc.log("InitRewardHistory: rewardHistory Number = " + rewardNumber);

        // for(var k in record){
        //     cc.log("key = "+k+" value :"+record[k]["time"]+" "+record[k]["type"])
        // }
        function initItem(item, time, type) {
            //cc.log("initItem")
            var timeTex = item.getChildByName("time");
            var typeTex = item.getChildByName("rewardType");
            timeTex.setString(time);
            typeTex.setString(type);
        }

        var rwdItem = rewardList.parent.getChildByName("rewardItem");
        if (!rwdItem) {
            console.log("GY:rwdItem get error!!!!");
            return;
        }
        rwdItem.retain();
        rewardList.removeAllChildren();
        //rewardList.removeChildByName("rewardItem");
        //var width = rwdItem.getContentSize().width;
        rewardList.setInnerContainerSize(cc.size(350, 37 * rewardNumber));

        var newHeight = rewardList.getInnerContainerSize().height;
        for (var i = rewardNumber - 1; i >= 0; i--) {
            var newitem = rwdItem.clone();
            newitem.visible = true;
            newitem.setPosition(30, newHeight - i * 32 - 90);
            //cc.log("index = "+(rewardNumber-i-1));
            initItem(newitem, record[rewardNumber - i - 1]["time"], record[rewardNumber - i - 1]["type"]);
            rewardList.addChild(newitem);
        }
    }


//转盘角度数据
    var ALLROATE = 360;
    var num = 12;
    var zhuanpanData = [
        {start: (num - 12) * ALLROATE / num + 1, ended: (num - 11) * ALLROATE / num},
        {start: (num - 11) * ALLROATE / num + 1, ended: (num - 10) * ALLROATE / num},
        {start: (num - 10) * ALLROATE / num + 1, ended: (num - 9) * ALLROATE / num},
        {start: (num - 9) * ALLROATE / num + 1, ended: (num - 8) * ALLROATE / num},
        {start: (num - 8) * ALLROATE / num + 1, ended: (num - 7) * ALLROATE / num},
        {start: (num - 7) * ALLROATE / num + 1, ended: (num - 6) * ALLROATE / num},
        {start: (num - 6) * ALLROATE / num + 1, ended: (num - 5) * ALLROATE / num},
        {start: (num - 5) * ALLROATE / num + 1, ended: (num - 4) * ALLROATE / num},
        {start: (num - 4) * ALLROATE / num + 1, ended: (num - 3) * ALLROATE / num},
        {start: (num - 3) * ALLROATE / num + 1, ended: (num - 2) * ALLROATE / num},
        {start: (num - 2) * ALLROATE / num + 1, ended: (num - 1) * ALLROATE / num},
        {start: (num - 1) * ALLROATE / num + 1, ended: (num - 0) * ALLROATE / num}
    ];

//reward:[type,num,[weight]]  1:钻石,2：苹果6s,3:ipadmini,4:红米手机,5:10元话费,6:50元话费,7:100元话费

    function getMyReward(rewardId) {
        var myRewardName, myRewardPicName;
        var myRewardNumber = jsclient.rewardData[rewardId][1];
        var rewardType = jsclient.rewardData[rewardId][0];
        switch (rewardType) {
            case 1:
                myRewardName = "钻石";
                myRewardPicName = "diamond.png";
                break;
            case 2:
                myRewardName = "iphone6s";
                myRewardPicName = "iphone6s.png";
                break;
            case 3:
                myRewardName = "ipadMini";
                myRewardPicName = "ipadMini.png";
                break;
            case 4:
                myRewardName = "红米手机";
                myRewardPicName = "xiaomi.png";
                break;
            case 5:
                myRewardName = "话费10元";
                myRewardPicName = "10Rmb_v.png";
                break;
            case 6:
                myRewardName = "话费50元";
                myRewardPicName = "50Rmb_v.png";
                break;
            case 7:
                myRewardName = "话费100元";
                myRewardPicName = "100Rmb_v.png";
                break;
            default:
                cc.log("GY: error--->can't find the reward type!!!")
                break;
        }
        //cc.log("getReward ==> "+myRewardName+" "+myRewardPicName+" "+myRewardNumber);
        return [myRewardName, myRewardPicName, myRewardNumber];
    }

//初始化转盘奖品  1:钻石,2：苹果6s,3:ipadmini,4:红米手机,5:10元话费,6:50元话费,7:100元话费
    function initTableData() {
        var turnTable = jsclient.act1ui.jsBind.activity1.turnTable._node
        cc.log("initRewards-->table.length = " + turnTable.getChildren().length)
        var preName = "name";
        var preImage = "Image_";
        var preNumber = "Num_";
        var rewardName, picName, rewardNumber;

        for (var i = 0; i < jsclient.rewardData.length; i++) {
            var type = jsclient.rewardData[i][0];
            //cc.log("rewardtype = "+type)
            //myRewardNumber = jsclient.rewardData[i][1];
            rewardName = getMyReward(i)[0]
            picName = getMyReward(i)[1]
            rewardNumber = getMyReward(i)[2]

            var namestr = preName + i;
            var pstr = preImage + i;
            var nstr = preNumber + i;
            var itemName = turnTable.getChildByName(namestr);
            var itemImag = turnTable.getChildByName(pstr);
            var itemNum = turnTable.getChildByName(nstr);
            if (rewardNumber > 1 || rewardName == "钻石") {
                itemNum.visible = true;
                rewardNumber = "x" + rewardNumber
            } else {
                itemNum.visible = false;
            }
            //cc.log("myRewardName = "+myRewardName+ "itemName -->type = "+typeof(itemName)+" tag = "+itemName.getTag())
            itemName.setString(rewardName);
            itemNum.setString(rewardNumber);
            //cc.log("转盘中第 "+i+" 个位置的图片名字为："+picName);
            // cc.log("转盘中初始化图片 = "+"res/act1/"+picName);
            itemImag.loadTexture("res/Activitys/act1/" + picName)//,ccui.Widget.LOCAL_TEXTURE);
        }
    }


    function rotateSprite(sprite, time, rotateAngle_) {
        sprite.stopAllActions();
        var action = cc.RotateBy(time, rotateAngle_)
        var easeAction = cc.EaseCubicActionInOut(action)

        function callBack(spriteSpr) {
            cc.log(" rotate ended!!")
            var resultNode = jsclient.act1ui.jsBind.resultBack._node;
            var resultBlock = jsclient.act1ui.jsBind.resultBlock._node;
            jsclient.act1ui.jsBind.activity1.arrowBtn._node.touchEnabled = true;
            jsclient.act1ui.jsBind.activity1.arrowBtn._node.bright = true;
            resultNode.visible = true;
            resultBlock.visible = true;
            canLookHistory = true; //回复可以查看中奖记录的状态
            jsclient.actionCfg.isRuning = false;  //转盘未在旋转状态
            initMyRewardLayer();//初始化中奖界面数据

        }
        sprite.runAction(cc.Sequence(easeAction, cc.CallFunc(callBack, sprite)))
    }

//转盘旋转
    var panbg, rewardScro; //转盘背景，奖励列表
    var lastAngle = 0 //剩余的角度
    var targetIdx;//获取奖品ID
    function rotateStart() {
        cc.log("rotateStart")
        var duration = 5 //转动持续时间 5
        var rotateNum = 5 //转动圈数 5

        var offsetAngle = 11;
        cc.log("rotateStart ------- --- > targetIdx :" + targetIdx);
        var targetData = zhuanpanData[targetIdx]
        log("targetData.start----------:" + targetData.start);
        log("targetData.ended----------:" + targetData.ended);

        // Math.floor( Math.random() *  rtn.length )
        //var rotateAngle = - targetData.start+ Math.random()*targetData.ended - 360 * rotateNum;
        // var rotateAngle = -(targetData.start+offsetAngle)- Math.random()*(ALLROATE/num-offsetAngle) - 360 * rotateNum;
        var subAngle = Math.random() * ALLROATE / num;  // 0-30
        if (subAngle <= 5) {
            subAngle += offsetAngle;
        }
        if (subAngle >= 25) {
            subAngle -= offsetAngle;
        }

        var rotateAngle = -targetData.start - ALLROATE / (num*2)- 360 * rotateNum;     //-subAngle - 360 * rotateNum;

        rotateAngle = Math.floor(rotateAngle)
        log("随机角度是：" + rotateAngle)

        //第二次需要重置坐标点
        if (!(lastAngle == 0)) {
            rotateSprite(panbg, duration, rotateAngle - lastAngle)
        } else {
            rotateSprite(panbg, duration, rotateAngle)
        }
        //cc.log("原始值："+lastAngle+"======================> 刷新了 lastAngle")
        lastAngle = rotateAngle % 360;//-
        //cc.log("刷新后：======================>"+lastAngle)

        //lastAngle = -360 - rotateAngle - 360 * rotateNum;
        //cc.log("lastAngle = "+lastAngle)
    }


    var myRewardBtn, activeDec; //获取奖励记录的按钮   活动介绍   开始摇奖按钮
    function changeToDescript() { //切换到活动说明
        var scroInfo = jsclient.act1ui.jsBind.activity1.rewardInfo._node;
        scroInfo.removeAllChildren();
        activeDec.visible = true;
        activeDec.setPosition(160, 165);
        scroInfo.addChild(activeDec)
        //var newHeight = rewardList.getInnerContainerSize().height;
        var textWidth = activeDec.getContentSize().width;
        var textHeight = activeDec.getContentSize().height;
        //cc.log("widht = "+textWidth+"  height = "+textHeight);

        var sSize = scroInfo.getContentSize();
        //cc.log("scroWith = "+sSize.width +"  scroHeight = "+sSize.height);
        scroInfo.setInnerContainerSize(cc.size(textWidth + 60, textHeight));
        jsclient.act1ui.jsBind.Image_title._node.loadTextures("res/Activitys/act1/bt_mrjlsm.png","res/Activitys/act1/bt_mrjlsm.png","res/Activitys/act1/bt_mrjlsm.png");
    }


//刷新剩余抽奖次数
    var leftNumberText;  //剩余次数的文本
    var leftNumber = -1;//剩余的抽奖次数

//leftNumber = 20  //TODO 从服务器获取剩余次数 test


//初始化中奖界面数据
    var rewardImageRotate = false;

    function initMyRewardLayer() {

        //cc.log("---targetIdx = = = = = = = = "+targetIdx);
        //targetIdx  var myRewardName,myRewardPicName,myRewardNumber;
        var my_reward_name, my_reward_picName, my_reward_number;
        var resultLayer = jsclient.act1ui.jsBind.resultBack._node;
        var rewardImage = resultLayer.getChildByName("wardImage");
        var number = resultLayer.getChildByName("rewardNumber");
        var name = resultLayer.getChildByName("rewardName");
        var weiXinNum = resultLayer.getChildByName("bigRewardDes").getChildByName("weixinNumber");


        my_reward_name = getMyReward(targetIdx)[0];
        my_reward_picName = getMyReward(targetIdx)[1];
        my_reward_number = getMyReward(targetIdx)[2];
        //cc.log("===> myRewardName = "+my_reward_name);
        if (my_reward_name == "话费10元" || my_reward_name == "话费50元" || my_reward_name == "话费100元") {
            rewardImage.setRotation(270);
            rewardImageRotate = true;
        }
        rewardImage.loadTexture("res/Activitys/act1/" + my_reward_picName);
        number.setString(my_reward_number);
        name.setString(my_reward_name);
        //weiXinNum.setString(jsclient.updateCfg.weixinBuy);
    }

//根据活动id获取在活动数据中的索引
   /* function idForActionIndex(actId) {
        var actIndex = -1;
        var data = jsclient.actionCfg;
        for (var i = 0; i < data.length; i++) {
            if (data[i]._id == actId) {
                actIndex = i;
            }
        }
        ;
        if (actIndex != -1) {
            cc.log("action index = " + actIndex);
            return actIndex;
        } else {
            cc.log("GY: Error: can't find the action index!")
        }
    }*/

    function refreshLeftNumber() {
        //var actIndex = idForActionIndex(1).toString();
        var timesFreeAndPay = jsclient.actionCfg.currentData["actData"];
        var freetime = parseInt(timesFreeAndPay["timesFree"]);
        var paytime = parseInt(timesFreeAndPay["timesPay"]);
        var countNumber = freetime + paytime;
        cc.log("refreshLeftNumber-->" + countNumber + "  freetime=" + freetime + "  paytime=" + paytime)

        var pinfoActData = jsclient.data.pinfo.actData;
        var currentId = jsclient.actionCfg.currentData["_id"];

        if (typeof(pinfoActData) != "undefined" && pinfoActData != "" && pinfoActData != null) {

            if (typeof(pinfoActData[currentId]) != "undefined" && pinfoActData[currentId] != "" && pinfoActData[currentId] != null) {
                //获取上次抽奖 服务器的时间（首次ya延时）
                var lastNetTime = millisecondToDate(pinfoActData[currentId].lastTime, false);
                var localTime = CurentTime(true, true, true);
                cc.log("上次抽奖时间->" + lastNetTime + "  当前本地时间-->" + localTime);
                var durationTime = daysDiffBetween(localTime, lastNetTime);
                cc.log("距离上次的抽奖时间差为 " + durationTime + "天");
                if (durationTime >= 1) {
                    leftNumber = countNumber;  //超过一天，重置抽奖次数
                    cc.log("相差超过1天 leftNumber 重置为 " + leftNumber);
                } else {
                    var free = parseInt(pinfoActData[currentId].freeTimes);
                    var pay = parseInt(pinfoActData[currentId].payTimes);
                    //jsclient.showMsg("free:"+free+" pay:"+pay+ " count:"+countNumber);
                    leftNumber = countNumber - (free + pay);
                    cc.log("free = " + free + "  pay = " + pay + " leftNum = " + leftNumber);
                }
            } else {    //新用户尚未抽奖，次数为总次数
                leftNumber = countNumber
                console.log("GY:refreshLeftNumber:: pinfo no actdata! newPlayer set leftNumber " + leftNumber);
            }

        } else {    //新用户尚未抽奖，次数为总次数
            leftNumber = countNumber
            console.log("GY:refreshLeftNumber:: pinfo no actdata! newPlayer set leftNumber " + leftNumber);
        }
        if(leftNumber<=0)leftNumber=0;
        leftNumberText.setString(leftNumber);


        //角标显示判断
        if( leftNumber>0  && jsclient.actionData.nowActionIds.indexOf(currentId)!= -1){  //todo 2016-10-11
            cc.log("--- 转盘活动在正在进行 ----")
            jsclient.actionData.canDoActions++;
        }
    }


//TODO 初始化活动1数据
    function initAction1() {

        //初始化活动说明
        //var descText = jsclient.act1ui.jsBind.panel.activity1.activeDescrip;
        //var actIndex = idForActionIndex(1);
        var dataText = jsclient.actionCfg.currentData["actData"]["actText"];
        activeDec.setString("  " + dataText);     //TODO !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        //初始化转盘数据
        initTableData();

        //默认显示活动介绍
        changeToDescript();

        //显示剩余次数
        refreshLeftNumber();

        canLookHistory = true;

        panbg.setRotation(15);

        lastAngle = 0; //重置旋转角
        //cc.log("++++++++++++++++  init  +++++++++++++++ m >>> "+panbg.getRotation())

    }


//TODO 统计测试结果
var zuanshi1 = 0,zuanshi2 = 0,zuanshi20 = 0,zuanshi5 = 0,zuanshi50 = 0,zuanshi10 = 0,iphone6s = 0,ipadMini = 0,hongmi = 0,rmb10 = 0,rmb50 = 0,rmb100 = 0;
function COUNT_REWARD(name,number) {
    switch (name) {
        case "钻石":
            if(number == 1) {
                zuanshi1++;
            }else if(number == 2){
                zuanshi2++;
            }else if(number == 50){
                zuanshi50++;
            }else if(number == 10){
                zuanshi10++;
            }else if(number == 5){
                zuanshi5++;
            }else if(number == 20){
                zuanshi20++;
            }
            break;
        case "iphone6s":
            iphone6s++;
            break;
        case "ipadMini":
            ipadMini++;
            break;
        case "红米手机":
            hongmi++;
            break;
        case "话费10元":
            rmb10++;
            break;
        case "话费50元":
            rmb50++;
            break;
        case "话费100元":
            rmb100++;
            break;
        default:
            break;
    }

    var str = "钻石1="+zuanshi1+"钻石5="+zuanshi5+"钻石10="+zuanshi10+"钻石20="+zuanshi20+"钻石50="+zuanshi50+"钻石2="+zuanshi2+" iphone6s="+iphone6s+" ipadMini="+ipadMini+" 红米手机="+hongmi+" 话费10元="+rmb10+" 话费50元="+rmb50+" 话费100元="+rmb100;
    return str;
}


    var canLookHistory = true;    //是否可以查看获奖记录
    var clickArrowBtnReturnData; //活动返回数据
    var act1 = cc.Layer.extend({
        jsBind: {
            activity1: {
                arrowBtn: {
                    _event: {
                        updateArrowRotate: function () {

                            var currentActId = jsclient.actionCfg.currentData["_id"];//当前活动的iD
                            var currentActType = idForActionType(currentActId);
                            console.log("Activity---currentActId = " + currentActId + "currentActType = " + currentActType);

                            var backData = jsclient.data.pinfo.actData;
                            if(!clickArrowBtnReturnData){
                                return;
                            }
                            var rtn = clickArrowBtnReturnData;
                            //clickArrowBtnReturnData = null;

                            console.log(" backData = " + JSON.stringify(backData));
                            if(typeof(backData) != "undefined" && backData != "" && backData != null) {

                                if (typeof(backData[currentActId]) != "undefined" && backData[currentActId] != "" && backData[currentActId] != null) {

                                    rotateStart();
                                    this.touchEnabled = false;
                                    this.bright = false;
                                    canLookHistory = false;
                                    jsclient.actionCfg.isRuning = true; //此转盘停止后，方可点击其他
                                    refreshLeftNumber();//刷新剩余次数

                                    var getWardTime = millisecondToDate(backData[currentActId]["lastTime"], true);
                                    console.log("getWardTime = " + getWardTime);

                                    var myrewardName = getMyReward(rtn["index"])[0];
                                    var myrewaradNumber = getMyReward(rtn["index"])[2];
                                    var reward;
                                    if (myrewaradNumber > 1 || myrewardName == "钻石") {
                                        reward = myrewardName.toString() + "x" + myrewaradNumber.toString();
                                    } else {
                                        reward = myrewardName.toString();
                                    }

                                    //写入获奖数据
                                    writeToFile(getWardTime, reward);

                                    //测试数据
                                    // var str = COUNT_REWARD(myrewardName,myrewaradNumber);
                                    // activeDec.setString(str);

                                    clickArrowBtnReturnData = null;
                                }
                            }
                        }
                    },

                    _click: function (self) {

                        clickArrowBtnReturnData = null;
                        var currentActId = jsclient.actionCfg.currentData["_id"]; //当前活动的iD
                        var currentActType = idForActionType(currentActId);

                        console.log("currentActId = " + currentActId + "currentActType = " + currentActType);
                        if (ifTimePermite(currentActId)) { //>=0
                            if (leftNumber >= 0) {

                                jsclient.gamenet.request("pkplayer.handler.doActivity", {
                                    actId: currentActId,
                                    actType: currentActType
                                }, function (rtn) {

                                    console.log("rtn------------------- > " + JSON.stringify(rtn))

                                    if (rtn.result == 0) {
                                        console.log("arrowBtn rtn== > " + JSON.stringify(rtn))

                                        targetIdx = rtn["index"]; //获取的奖品索引
                                        clickArrowBtnReturnData = rtn;
                                        sendEvent("updateArrowRotate");

                                        /*var backData = jsclient.data.pinfo.actData;
                                        cc.log(" backData = " + JSON.stringify(backData));
                                        if (typeof(backData) != "undefined" && backData != "" && backData != null) {

                                            if (typeof(backData[currentActId]) != "undefined" && backData[currentActId] != "" && backData[currentActId] != null) {

                                                rotateStart();
                                                self.touchEnabled = false;
                                                self.bright = false;
                                                canLookHistory = false;
                                                jsclient.actionCfg.isRuning = true; //此转盘停止后，方可点击其他
                                                refreshLeftNumber();//刷新剩余次数

                                                var getWardTime = millisecondToDate(backData[currentActId]["lastTime"], true);
                                                cc.log("getWardTime = " + getWardTime)

                                                var myrewardName = getMyReward(rtn["index"])[0];
                                                var myrewaradNumber = getMyReward(rtn["index"])[2];
                                                var reward;
                                                if (myrewaradNumber > 1 || myrewardName == "钻石") {
                                                    reward = myrewardName.toString() + "x" + myrewaradNumber.toString();
                                                } else {
                                                    reward = myrewardName.toString();
                                                }
                                                //jsclient.showMsg("time:"+getWardTime+" type:"+reward);
                                                //写入获奖数据
                                                writeToFile(getWardTime, reward); //TODO 暂时屏蔽写入文件


                                                //测试数据
                                                // var str = COUNT_REWARD(myrewardName,myrewaradNumber);
                                                // activeDec.setString(str);
                                            }
                                        }*/
                                    } else if (rtn.result == 31) {
                                        showNotice("钻石不够,转不动了哦！");
                                    } else if (rtn["er"]["code"] == "ECONNREFUSED") {
                                        showNotice("网络不稳请稍后再试！");
                                    } else if (rtn["er"] == 1) {
                                        showNotice("未知错误发生了请稍后重试！");
                                    } else {
                                        if (rtn["er"] == 4){
                                            showNotice("抽奖机会用完了,明天再来吧！");
                                            leftNumberText.setString(0);
                                        }

                                    }
                                });
                            } else {
                                mylog("次数用完了！") //TODO 次数用完提示
                            }
                        }
                    },
                },
                turnTable: {
                    _run: function () {
                        panbg = this;
                        this.setRotation(0);

                        cc.log("++++++++++++++++  run  +++++++++++++ m >>> " + panbg.getRotation())

                    }
                },
                rewardInfo: { //奖励展示列表
                    _run: function () {
                        rewardScro = this;
                    }
                },
                rewardItem: {
                    _run: function () {
                        this.visible = false;
                    }
                },//获奖item
                activeDescrip: {                             //活动介绍
                    _run: function () {
                        this.visible = false;
                        activeDec = this.clone();
                        activeDec.retain();
                    }
                },

                rpanel: {
                    myReward: {   //查看我的奖励按钮
                        _click: function (self) {
                            if (canLookHistory) {
                                var historyList = jsclient.act1ui.jsBind.activity1.rewardInfo._node;
                                //var t = sys.localStorage.getItem("treward");
                                InitRewardHistory(historyList);
                                self.touchEnabled = false;
                                self.bright = false;
                                activeDec.visible = false;
                                jsclient.act1ui.jsBind.Image_title._node.loadTextures("res/Activitys/act1/bt_wdjl.png","res/Activitys/act1/bt_wdjl.png","res/Activitys/act1/bt_wdjl.png");
                            }
                        },
                        _run: function () {
                            myRewardBtn = this;
                        }
                    },
                },
                leftNumBg: {   //TODO 获取剩余抽奖次数
                    leftNumText: {
                        _text: function () {
                            if (leftNumber == -1) {
                                cc.log("GY：Error-> leftNumber init fail!!")
                                return 0;
                            } else {
                                return leftNumber;
                            }
                        },
                        _run: function () {
                            leftNumberText = this;
                        }
                    }
                },
                actionTime: { //活动时间
                    beganTimeText: {
                        _text: function () {
                            //var actIndex = idForActionIndex(1);
                            var date = jsclient.actionCfg.currentData["actData"]["beginDay"];
                            return formatDate(date)
                        },
                    },
                    endTimeText: {
                        _text: function () {
                            //var actIndex = idForActionIndex(1);
                            var date = jsclient.actionCfg.currentData["actData"]["endDay"]
                            return formatDate(date);
                        },
                    }
                },

            },
            resultBlock: { //抽奖结果展示界面
                _layout: [[3, 3], [0.5, 0.5], [0, 0], 2], //2 铺满
                _visible: function () {
                    return false
                },
                _run: function () {
                    touchCallBack(this);
                },
            },
            Image_title:{
                _run:function (){
                    cc.log("-----------wei--------");
                    this.visible = true;
                }
            },
            resultBack: {
                //_layout:[[0.6,0.6],[0.5,0.5],[0,0]] ,
                _run: function () {
                    this.visible = false
                }
            },
        },


        ctor: function () {
            this._super();
            var act1ui = ccs.load(res.Act1);
            ConnectUI2Logic(act1ui.node, this.jsBind);
            this.addChild(act1ui.node);
            jsclient.act1ui = this;
            //jsclient.rewardData = jsclient.actionCfg[0]["actData"]["rewards"] //转盘奖品数据
            jsclient.rewardData = jsclient.actionCfg.currentData["actData"]["rewards"] //转盘奖品数据

            initAction1();
            //jsclient.actionCfg.isSelected = 1;  //当前选中的活动
            jsclient.actionCfg.isSelected = jsclient.actionCfg.currentData["_id"];  //当前选中的活动

            jsclient.actionCfg.isRuning = false; //是否有必须活动正在进行，不可点击其他切换
            return true;
        },

    });

