
/*
jsclient.actionCfg  = [{"_id":1,"actType":1,"delStatus":0,"actData":
{"actName":"转盘抽奖","actNote":"装盘活动，每日开启，活动要保证唯一性",
    "warmDay":20160917,"beginDay":20161017,"endDay":20161020,"afterDay":20161025,"weekDay":[0,1,2,3,4,5,6],
    "beginTime":"00:00","endTime":"23:59","actCond":0,"timesFree":100000,"timesPay":0,"payCost":0,
    "rewards":[[1,1,5000],[2,1,0],[1,2,4000],[3,1,0],[1,5,900],[4,1,0],[1,10,90],[5,1,0],[1,20,9],
        [6,1,0],[1,50,1],[7,1,0]],"acTitle":"抽奖活动","actText":"每天登录游戏即可免费抽奖1次，抽中的钻石奖励即时发放到账。" +
"若抽中话费或实物奖励，请联系客服人员领奖。\n领奖时间：每日早8点至晚24点"}},

    {"_id":2,"actType":2,"delStatus":0,"actData":{"actName":"维护补偿","actNote":"可更具维护时间提前通知用户，但奖励只能到期后领取",
        "warmDay":20160908,"beginDay":20161012,"endDay":20161019,"rewards":[1,15]}},


    {"_id":8,"actType":3,"delStatus":0,
    "actData":{"actName":"新手礼包","actNote":"这是新手礼包测试","validTime":24,"rewards":[1,1]}},


    {"_id":9,"actType":4,"delStatus":0,
    "actData":{"actName":"推荐礼包","actNote":"这是推荐礼包测试！","playNum":1,"maxNum":10,
        "rewards":[[1,1,1],[1,2,2],[1,3,3],[1,4,5],[1,5,10]]}},

    {"_id":10,"actType":5,"delStatus":0,"actData":{"actName":"限时免费","actNote":"限时免费时间提前通知用户，但奖励只能到期后领取",
        "warmDay":20160908,"beginDay":20161012,"endDay":20161019,"rewards":[1,15]}},


]


*/



var isRun = false;
function showNotice(noticeText){
    if(!isRun){
        isRun = true;
        alertText.setString(noticeText);
        //alertBox.visible = true;
        var originPos = alertBox.getPosition();
        var Midpoint = cc.p(originPos.x,originPos.y+50);
        var Uppoint = cc.p(originPos.x,originPos.y+50+50);
        //cc.log("x : "+originPos.x+ " y: "+originPos.y);
        var fadein =  cc.FadeIn.create(0.5);
        var fadeout = cc.FadeOut.create(0.5);
        var upAndin = cc.spawn(cc.moveTo(0.5,Midpoint),fadein);
        var upAndout = cc.spawn(cc.moveTo(0.5,Uppoint),fadeout);
        var callback = function(){
            isRun = false;
            alertBox.setPosition(originPos);
        }
        alertBox.runAction(cc.Sequence.create(upAndin,cc.delayTime(0.8),upAndout,cc.callFunc(callback)))
    }
}

var ActionTypeEnum= //活动类型
{
    zhuanPan:1,     //转盘
    weiHuBuChang:2, //补偿
    newPlayer:3,    //新手
    invite:4,       //邀请
    timeFree:5,     //限时免费

};

// todo addActivity
function loadActiveItemTexture(item,actType){
    var textureNormal,texturePress;
    var preStr;
    cc.log("活动列表 actType = "+actType);
    switch(actType)
    {
        case ActionTypeEnum.zhuanPan:
            preStr = "res/Activitys/act1/";
            textureNormal = "btn_dayReward_n.png";
            texturePress = "btn_dayReward_p.png";
            break;
        case ActionTypeEnum.weiHuBuChang:
            preStr = "res/Activitys/act1/";
            textureNormal = "btn_compensate_n.png";
            texturePress = "btn_compensate_p.png";
            break;

        case ActionTypeEnum.invite:
            preStr = "res/Activitys/inviteFriend/";
            textureNormal = "invite_n.png";
            texturePress = "invite_p.png";
            break;

        default:
            preStr = "res/Activitys/act1/";
            textureNormal = "defaltactive.png";
            texturePress = "defaltactive.png";
            cc.log("GY: Alert ::can't find the action actType to set Texture!!!")
            break;
    }
    textureNormal = preStr + textureNormal;
    texturePress = preStr + texturePress;
    //cc.log("textureNormal = "+textureNormal+"  texturePress = "+texturePress);

    item.loadTextures(texturePress,textureNormal,textureNormal);
}


//活动列表按钮的禁用
var actButtonArray = [];
function setButtoFalse(tag){ //
    if(actButtonArray.length == 0){
        cc.log("Gy-->Error: not find false button!");
        return;
    }
    for(var i = 0;i<actButtonArray.length;i++){
        if(actButtonArray[i].getTag() == tag){
            jsclient.actionCfg.isSelected = tag; //当前选中的活动
            actButtonArray[i].touchEnabled = false;
            actButtonArray[i].bright = false;
        }else{
            actButtonArray[i].touchEnabled = true;
            actButtonArray[i].bright = true;
        }
    }
}


//监听事件
function touchCallBack(targetNode){
    targetNode.addTouchEventListener(function(btn,tp)
    {
        if(tp==2){
            cc.log("GY:  I find you touch me !!actId = "+jsclient.actionCfg.isSelected +
                " target = "+btn.getTag()+ "name = "+btn.name+" isSelected= "+jsclient.actionCfg.isSelected);

            //if(jsclient.actionCfg.isSelected == 1){ //转盘活动
            if(idForActionType(jsclient.actionCfg.isSelected) == 1){ //转盘活动
                myRewardBtn.touchEnabled = true;
                myRewardBtn.bright = true;
                changeToDescript();

                if(rewardImageRotate){
                    jsclient.act1ui.jsBind.resultBack._node.getChildByName("wardImage").setRotation(0);
                }

                if(btn.name == "resultBlock"){
                    jsclient.act1ui.jsBind.resultBlock._node.visible = false;
                    jsclient.act1ui.jsBind.resultBack._node.visible = false;
                }else{
                    cc.log("you not find me ! type btn.name = "+btn.name+"  type:"+typeof(btn.name))
                }
            }
        }
    })

}

//活动界面的显示状态 todo  addActivity
function changeActiveLayer(targetItem,scroll){

    var actRoom = scroll.parent.getChildByName("activeRoom");
    var activeID = targetItem.getTag();         //活动id
    var activeType = idForActionType(activeID); //活动type

    actRoom.removeAllChildren();
    if(activeType == ActionTypeEnum.zhuanPan){          //转盘
        var act1Layer = new act1();
        actRoom.addChild(act1Layer);

    }else if(activeType == ActionTypeEnum.weiHuBuChang) {   //补偿
        var act2Layer = new act2();
        actRoom.addChild(act2Layer);

    }else if(activeType == ActionTypeEnum.invite) {
        var act3Layer = new act3();
        actRoom.addChild(act3Layer);

    }else if(activeType == ActionTypeEnum.timeFree){
        var act5Layer = new act5();
        actRoom.addChild(act5Layer);

    } else {
        showNotice("敬请期待！")
    };

}

function getStateOfAct1(actdata,nowTime){
    var warm_day = actdata.warmDay.toString();  //天
    var begin_day = actdata.beginDay.toString();
    var end_day = actdata.endDay.toString();
    var after_day = actdata.afterDay.toString();

    var begantime = actdata.beginTime.toString(); //时分
    var endtime = actdata.endTime.toString();
    var nowHourMinute = getCurentHourAndMinute(true);  //当前“时”“分”


    //cc.log("type----> "+typeof(warm_day)+" "+typeof(begin_day)+"  "+typeof(end_day)+"  "+typeof(after_day))
    //cc.log("actionId: 1 "+" warmTime:"+warm_day+" beginTime"+begin_day+" endTime"+end_day+" afterTime"+after_day);

    var inWarmDay = daysDiffBetween(nowTime,warm_day);
    var inBeginDay = daysDiffBetween(nowTime,begin_day);
    var inEndDay = daysDiffBetween(nowTime,end_day);
    var inAfterDay = daysDiffBetween(nowTime,after_day);
    var delayDays = daysDiffBetween(begin_day,end_day);// 活动的持续时间 以天为单位

    var inBeginAndEnd = hourMinuteInRectTime(nowHourMinute,begantime,endtime); //判断是否在开始  时分段中

    if(inWarmDay>=0 && inBeginDay<0){         //预热期间
        //cc.log("ActionTimeState = warm")
        return "warm"
    }else if(inBeginDay>=0 && inEndDay<=0){   //在活动天数期间内
        //cc.log("ActionTimeState = runing")

        /*if(inBeginDay == 0){     //开始当天,判断是否在 时分内

            if(delayDays == 0){ //持续时间为1天
                if(inBeginAndEnd[0] && inBeginAndEnd[1]){
                    return "runing";
                }else if(!inBeginAndEnd[0] && inBeginAndEnd[1]){
                    return "warm";
                }else if(inBeginAndEnd[0] && !inBeginAndEnd[1]){
                    return "endStart";
                }
            }else{ //持续时间 > 1天

                if(inBeginAndEnd[0]){
                    return "runing";
                }else if(!inBeginAndEnd[0]){
                    return "warm";
                }
            }

        }else if(inEndDay == 0){   //结束当天 判断是否在 时分内
            if(delayDays == 0){ //持续时间为1天
                if(inBeginAndEnd[0] && inBeginAndEnd[1]){
                    return "runing";
                }else if(!inBeginAndEnd[0] && inBeginAndEnd[1]){
                    return "warm";
                }else if(inBeginAndEnd[0] && !inBeginAndEnd[1]){
                    return "endStart";
                }
            }else{ //持续时间 > 1天
                if(inBeginAndEnd[1]){
                    return "runing";
                }else if(!inBeginAndEnd[1]){
                    return "endStart";
                }
            }
        }
         return "runing";
        */
        if(inBeginAndEnd[0] && inBeginAndEnd[1]){        //今日正在进行
            return "runing";
        }else if(!inBeginAndEnd[0] && inBeginAndEnd[1]){ //今日开启时间未到
            return "warm_today";
        }else if(inBeginAndEnd[0] && !inBeginAndEnd[1]){ //今日结束
            return "endStart_today";
        }


    }else if(inEndDay>0 && inAfterDay<=0){  //余热期
        //cc.log("ActionTimeState = endStart")
        return "endStart"
    }else if(inAfterDay>=0){                  //活动结束
        //cc.log("ActionTimeState = endFinish")
        return "endFinish"
    }else{
        //cc.log("not find the time rect!")
    }
}

function getStateOfAct2(actdata,nowTime) {
    var warm_day = actdata.warmDay.toString();  //天
    var begin_day = actdata.beginDay.toString();
    var end_day = actdata.endDay.toString();

    //cc.log("actionId: 2 "+" warmTime:"+warm_day+" beginTime"+begin_day+" endTime"+end_day);

    var inWarmDay = daysDiffBetween(nowTime,warm_day);
    var inBeginDay = daysDiffBetween(nowTime,begin_day);
    var inEndDay = daysDiffBetween(nowTime,end_day);


    if(inWarmDay>=0 && inBeginDay<0){         //预热期间
        //cc.log("Action 2 TimeState = warm")
        return "warm"
    }else if(inBeginDay>=0 && inEndDay<=0){   //在补偿期间 活动开始
        //cc.log("ActionTimeState = runing")
        return "runing";

    }else if(inEndDay>0){                     //余热期  活动结束
        //cc.log("Action 2 State = endStart")
        return "endStart"
    }else{
        //cc.log("Action 2 not find the time rect!")
    }
}



//活动的时间状态
function getActionTimeState(actionId){
    //cc.log("====================>>>> "+actionId);
    cc.log("getActionTimeState() start")
    //var actionIndex = idForActionIndex(actionId);
    var actdata = jsclient.actionCfg.currentData["actData"];
    var nowTime = CurentTime(true,true,true);   //noFormat,noSecond,endToDay   当前时间 20121223
    var type = idForActionType(actionId);   //活动的类型
    if(actdata){
       if(type == 1){
           return ( getStateOfAct1(actdata,nowTime) );
       }else if(type == 2){
          return( getStateOfAct2(actdata,nowTime) );
       }

    }else(
        cc.log("GY：error: actionTimeState-->timeData get error!")
    )
    cc.log("Error: getActionTimeState() Null")
    return null;
}


/*判断活动是否周开启*/
function weekPermite(actId){
    //var weekArray = jsclient.actionCfg[idForActionIndex(1)].actData.weekDay; //服务端获取开放的星期数
    var weekArray = jsclient.actionCfg.currentData.actData.weekDay; //服务端获取开放的星期数

    var weekNow = getWeek()[0];
    var weekStr = getWeek()[1];

    var type = idForActionType(actId);

    if(type == 1){
        if(typeof(weekArray)!="undefined" && weekArray!="" && weekArray!=null){ //&& Array.isArray()
            for(var i = 0;i<weekArray.length;i++) {
                if (weekArray[i] == weekNow) {
                    return true;
                }
            }
            showNotice(weekStr+"活动未开放！");
        }else{
            cc.log("Error: not find weekDay!")
        }

    }else if(type == 2){
        //cc.log("action 2 have no week permite!")
        return true;
    }else{
        //cc.log("call weekPermite but not leagl actId!")
        return false;
    }

    return false;
}



/*根据活动时间 判断界面按钮是否可以点击*/
function ifTimePermite(actId){

    var curData = jsclient.actionCfg.currentData;
    var actType = curData.actType;
    var beginTime,endTime;
    if(actType == ActionTypeEnum.zhuanPan){ //转盘
        beginTime = curData.actData.beginTime;
        endTime = curData.actData.endTime;
        cc.log("beginTime = "+beginTime+" endTime = "+endTime);
    }


    //判断是否在活动期
    var timeState = getActionTimeState(actId);
    cc.log("timeState = "+timeState)
    if(timeState == "warm"){
        showNotice("活动预热期!");
        return false;
    }else if(timeState == "runing") {   //活动正在进行
        if (weekPermite(actId)) {
            return true;
        }
        return false;

    }else if(timeState == "warm_today"){
        showNotice("活动日期间为: "+beginTime+" 到 "+endTime+" 还未开始！");
    }else if(timeState == "endStart_today"){
        showNotice("活动日期间为: "+beginTime+" 到 "+endTime+" 今日已结束！");
    } else if(timeState == "endStart"){
        showNotice("活动余热期间!");
        return false;
    }else if(timeState == "endFinish"){
        showNotice("活动应该被移除！");
        return false;
    }

}


/*根据活动时间选择显示在列表中的活动 todo addActivity*/
var actListArray = [];

function selectActionFromData(isPush){
    cc.log("selectActionFromData")

    jsclient.actionData.nowActionIds = []; //当前时段正在开启的活动id
    jsclient.actionData.canDoActions = 0; //当前还可以参与的活动

    var myActData = jsclient.actionCfg;
    var canShowAct = false;
    //cc.log("----------------=================---------> myActData.length"+myActData.length)
    //cc.log("----------------=================---------> myActData.length"+myActData.length)

    if(typeof(myActData)!= "undefined" && myActData!="" && myActData!= null){

       for(var actIndex = 0;actIndex< myActData.length;actIndex++){
           var timeNow = CurentTime(true,true,true);
           var actType = myActData[actIndex]["actType"];
           var actId = myActData[actIndex]["_id"];

           if(actType == ActionTypeEnum.zhuanPan){ //转盘
               var warmDate = myActData[actIndex].actData.warmDay;
               var afterDate = myActData[actIndex].actData.afterDay;
               canShowAct = dateInRectDate(timeNow,warmDate,afterDate);

           }else if(actType == ActionTypeEnum.weiHuBuChang) { //补偿
               var warmDate = myActData[actIndex].actData.warmDay;
               var endDate = myActData[actIndex].actData.endDay;
               canShowAct = dateInRectDate(timeNow, warmDate, endDate);

           }else if(actType == ActionTypeEnum.newPlayer) // 新手礼包
           {
               continue;

           }
           else if(actType == ActionTypeEnum.invite){ //邀请有礼
               //canShowAct = true; 邀请有礼 不显示
               canShowAct = false;

           }else if(actType == ActionTypeEnum.timeFree){//限时免费、todo 暂无数据
               cc.log("*******************************dfsafasdf****************************")
               var warmDate = myActData[actIndex].actData.warmDay;
               var endDate = myActData[actIndex].actData.endDay;
               canShowAct = dateInRectDate(timeNow, warmDate, endDate);
           }


           if(canShowAct){
               if(isPush){
                   actListArray.push(myActData[actIndex]);      //可以显示的活动列表
               }
             jsclient.actionData.nowActionIds.push(actId);// todo 2016-10-11
           }
       }
        cc.log("活动列表中选择了"+actListArray.length+"个显示");

    }else{
        cc.log("GY: Error: 读取不到action.json !!!")
    }
}


//活动角标  todo 未完成
function refreshActionCanDoNumber() {

    /*selectActionFromData(false);//获取当前时段开启的活动
    //refreshLeftNumber();
    //initCompensateUi();
    var totalActionNum = jsclient.actionData.canDoActions; //可参与活动总数
    cc.log("可以参与的活动个数 = "+totalActionNum);
    if(totalActionNum>0){
        jsclient.homeui.jsBind.btn_activity.noticeImage._node.visible = true;
    }else{
        jsclient.homeui.jsBind.btn_activity.noticeImage._node.visible = false;
    }
*/
}



//初始化活动列表
function InitActivityListUI(actlist){
    var firstItem;                                  //活动列表第一个，默认显示
    actListArray.splice(0,actListArray.length+1);  //清空
    selectActionFromData(true);                        //选择要显示的活动
    var actNum = actListArray.length;


    var actItem = actlist.getChildByName("item");
    actlist.removeAllChildren();
    var itemSize = actItem.getContentSize()
    var scrollViewSize = cc.size(itemSize.width+50,itemSize.height*actNum+100)
    actlist.setInnerContainerSize(scrollViewSize)

    var isMove = false;
    var itemCall = function(target,type){
        if(type == 0)
        {
            isMove = false;
        }else if(type == 1)
        {
            isMove = true;
            return;
        }
        if(type == 2){
            cc.log("actlist btnCall 活动 id ="+target.getTag());
            if(jsclient.actionCfg.isRuning){
                showNotice("抽奖中,请稍等...")
            }else{
                var index = idForActionIndex(target.getTag())
                jsclient.actionCfg.currentData =  jsclient.actionCfg[index];  // TODO 更新到当前活动数据
                changeActiveLayer(target,actlist)   // 切换到对应的活动界面
                setButtoFalse(target.getTag());
            }
        }
    }
    var newHeight = actlist.getInnerContainerSize().height;


    for(var i= 0 ;i< actNum;i++){           //TODO 根据活动的优先级进行活动列表的排序
       var newitem = actItem.clone();
       newitem.setPosition(90,newHeight-65*i);
        var actId = actListArray[i]["_id"];
       newitem.setTag(actId);
       loadActiveItemTexture(newitem,idForActionType(actId));
       newitem.addTouchEventListener(itemCall)
       newitem.retain();
       actlist.addChild(newitem);
       actButtonArray.push(newitem);
       if(i == 0){
           firstItem = newitem;
       }
    }

    if(actListArray.length!=0){
        DefaultFont.visible = false;
        var defaultActId = actListArray[0]["_id"];      // TODO ------活动默认选中的，数据切换

        var index = idForActionIndex(defaultActId)
        jsclient.actionCfg.currentData =  jsclient.actionCfg[index];

        actlist.getChildByTag(defaultActId).tochEnabled = false;  // TODO 初始化活动列表  默认选中
        actlist.getChildByTag(defaultActId).bright = false;
        changeActiveLayer(firstItem,actlist);  //默认的界面
    }else{
        DefaultFont.visible = true;
        cc.log("====  当前时间无活动显示 =====")
    }
}


//根据活动id获取在活动数据中的索引
function idForActionIndex(actId){
    var actIndex = -1;
    var data = jsclient.actionCfg;
    for(var i = 0;i<data.length;i++){
        if(data[i]._id == actId){
            actIndex = i;
        }
    };
    if(actIndex!=-1){
        cc.log("action index = "+actIndex);
        return actIndex;
    }else{
        cc.log("GY: Error: can't find the action index!")
    }
}


//根据活动的id获取活动的类型
function idForActionType(actId){
    var type = -1;
    var data = jsclient.actionCfg;
    for(var i = 0;i<data.length;i++){
        if(data[i]._id == actId){
            type = data[i]["actType"];
        }
    };
    if(type!=-1){
        cc.log("action type = "+type);
        return type;
    }else{
        cc.log("GY: Error: type can't find !")
    }
}

//+---------------------------------------------------
//| 字符串转成日期类型
//| 格式 MM/dd/YYYY MM-dd-YYYY YYYY/MM/dd YYYY-MM-dd
//+---------------------------------------------------
function StringToDate(DateStr)
{

    var converted = Date.parse(DateStr);
    var myDate = new Date(converted);
    if (isNaN(myDate))
    {
        //var delimCahar = DateStr.indexOf('/')!=-1?'/':'-';
        var arys= DateStr.split('-');
        myDate = new Date(arys[0],--arys[1],arys[2]);
    }
    return myDate;
}

//| 比较日期差 TODO 暂时未用到
function DateDiff(dtStart, dtEnd) {
    // var date1=new Date(dtStart);  //开始时间
    // alert("aa");
    // var date2=new Date(dtEnd);    //结束时间

    var date1 = new Date(2012, 4, 7, 11, 27);  //开始时间
    var date2 = new Date(2012, 5, 7, 12, 28);     //结束时间


    var date3=date2.getTime()-date1.getTime()  //时间差的毫秒数


//计算出相差天数
    var days=Math.floor(date3/(24*3600*1000))

//计算出小时数

    var leave1=date3%(24*3600*1000)    //计算天数后剩余的毫秒数
    var hours=Math.floor(leave1/(3600*1000))
//计算相差分钟数
    var leave2=leave1%(3600*1000)        //计算小时数后剩余的毫秒数
    var minutes=Math.floor(leave2/(60*1000))


//计算相差秒数
    var leave3=leave2%(60*1000)      //计算分钟数后剩余的毫秒数
    var seconds=Math.round(leave3/1000)


    cc.log(" 相差 "+days+"天 "+hours+"小时 "+minutes+" 分钟"+seconds+" 秒");
}


//获取星期几
function getWeek(time){
    var a = new Array("日", "一", "二", "三", "四", "五", "六");
    var week;
    if(time){
        week = new Date(time).getDay();
    }else{
        week = new Date().getDay();
    }
    var str = "星期"+ a[week];
    cc.log(str);
    return [week,str];
    //var str = "今天是星期" + "日一二三四五六".charAt(new Date().getDay());alert(str);
}


//获取当前时间
function CurentTime(noFormat,noSecond,endToDay)
{
    var now = new Date();

    var year = now.getFullYear();       //年
    var month = now.getMonth() + 1;     //月
    var day = now.getDate();            //日

    var hh = now.getHours();            //时
    var mm = now.getMinutes();          //分
    var ss = now.getSeconds();          //秒

    //cc.log("yerar = "+year+" moth = "+month+" day = "+day+"hh = "+hh+" mm = "+mm+" ss = "+ss)


    var clock = year + "-";
    var clock2 = year;

    if(month < 10){
        clock += "0";
        clock2 += "0";
    }
    clock += month + "-";
    clock2 += month+""; //clock2 += month;如果month>=10，则当int相加了，导致出bug

    if(day < 10){
        clock += "0";
        clock2  += "0";
    }
    clock += day ;
    clock2 += day ;
    if(!endToDay){
        clock += " ";
        clock2 += " ";

        if(hh < 10){
            clock += "0";
            clock2 += "0";
        }
        clock += hh + ":";
        clock2+= hh + ":";

        if (mm < 10){
            clock += '0';
            clock2 += '0';
        }else{
            clock += mm;
            clock2 += mm;
        }
        if(!noSecond){
            clock  += ":";
            if (ss < 10){
                clock += '0';
                clock2 += '0';
            }
            clock += ss;
            clock2 += ss;

        }
    }
    if(noFormat){
        //cc.log("2CurentTime = "+clock2)
        return clock2;
    }
    //cc.log("1CurentTime = "+clock)
    return(clock);
}

//获取当前时间的 时：分  23:30
function getCurentHourAndMinute(isFormat){
    var date = new Date();
    var hour = date.getHours().toString();
    var minute = date.getMinutes().toString();
    if(hour < 10){
        hour = "0"+hour;
    }
    if(minute < 10){
        minute = "0" + minute;
    }
    if(isFormat){

        return hour+":"+minute;
    }else{
        return [hour,minute];
    }
}


//返回 DateOne - DateTwo相差的“天”数
function daysDiffBetween(DateOne,DateTwo)  //TODO  20161108
{
    //cc.log("DateOne-->"+DateOne+"DateTwo-->"+DateTwo);
    //2016-11-08 格式的
    // var OneMonth = DateOne.substring(5,DateOne.lastIndexOf ('-'));
    // var OneDay = DateOne.substring(DateOne.length,DateOne.lastIndexOf ('-')+1);
    // var OneYear = DateOne.substring(0,DateOne.indexOf ('-'));
    //
    // var TwoMonth = DateTwo.substring(5,DateTwo.lastIndexOf ('-'));
    // var TwoDay = DateTwo.substring(DateTwo.length,DateTwo.lastIndexOf ('-')+1);
    // var TwoYear = DateTwo.substring(0,DateTwo.indexOf ('-'));
    //DateOne = JSON.stringify(DateOne);
    //DateTwo = JSON.stringify(DateTwo);

    //cc.log("DateOne = "+DateOne   + typeof(DateOne)+" DateTwo="+DateTwo+ typeof(DateTwo));

    DateOne = DateOne.toString();
    DateTwo = DateTwo.toString();

    var OneMonth = DateOne.substring(4,6);
    var OneDay = DateOne.substring(6,8);
    var OneYear = DateOne.substring(0,4);

    var TwoMonth = DateTwo.substring(4,6);
    var TwoDay = DateTwo.substring(6,8);
    var TwoYear = DateTwo.substring(0,4);

    var cha=((Date.parse(OneMonth+'/'+OneDay+'/'+OneYear)- Date.parse(TwoMonth+'/'+TwoDay+'/'+TwoYear))/86400000);
    //return Math.abs(cha);
    //cc.log("cha = "+cha);
    return cha; //parseInt()
}

// 返回 time1 - time2 相差的“时分”数    "beginTime" : "12:30", "endTime" : "13:00"
function hourAndMinuteDiffBetween(time1,time2){
   var hourDiff = time1.substring(0,2) - time2.substring(0,2);
   var minuteDiff = time1.substring(3,5) - time2.substring(3,5);
   return [hourDiff,minuteDiff];
}


//20120607--->2012-06-07
function formatDate(DateStr)
{
    DateStr = JSON.stringify(DateStr);
    var Month = DateStr.substring(4,6);
    var Day = DateStr.substring(6,8);
    var Year = DateStr.substring(0,4);
    return (Year+"-"+Month+"-"+Day);
}

//2012-06-07 --->20120607
function unFormatDate(DateStr){
    var Month = DateStr.substring(5,DateStr.lastIndexOf ('-'));
    var Day = DateStr.substring(DateStr.length,DateStr.lastIndexOf ('-')+1);
    var Year = DateStr.substring(0,DateStr.indexOf ('-'));
    return (Year+Month+Day);
}


//日期是否在一个范围  20161108    //TODO 精度为天
function dateInRectDate(tarDate,rectDateSmall,rectDateBig){
  var left = daysDiffBetween(tarDate,rectDateSmall);
  var right = daysDiffBetween(tarDate,rectDateBig);
    //cc.log("left-->"+left+" right-->"+right);
  if(left>=0 && right<=0){
      return true;
  }
  return false;
}

//分秒 是否在一个范围 13:00 12:30 13:30
function hourMinuteInRectTime(tarTime,timeSall,timeBig){

    //cc.log("-------------------------------------->>>>"+tarTime+"   "+timeSall+"   "+timeBig)
    var left = hourAndMinuteDiffBetween(tarTime,timeSall);
    var right = hourAndMinuteDiffBetween(tarTime,timeBig);
    var leftOk = false;
    var rightOk = false;
    //cc.log("left： "+left[0]+"  "+left[1]+"  right: "+right[0]+"  "+right[1])

    if((left[0] == 0 && left[1]>=0) || left[0] > 0){ //开始不到一小时，判断分是否到开始时间  //开始超过一小时，不用判断分
        leftOk = true;
    }else{
        //cc.log("gy: Left not ok！")
    }


    if((right[0] == 0 && right[1]<0) || right[0]<0){ //距离结束不到一小时,时分小于结束时分
       rightOk = true;
    }else{
        //cc.log("gy: Right not ok！")
    }

    // if(rightOk && leftOk){
    //     return true;
    // }
    // return false;
    return [leftOk,rightOk];
}

//毫秒转成格式化日期  231654651 --> 2012-11-08
function millisecondToDate(millsecondTime,isFormat){
    var date = new Date(millsecondTime);
    //var result = date.toLocaleDateString(date);
    var year = date.getFullYear();
    var month = date.getMonth()+1;
    var day = date.getDate();
    day =(day<10 ? "0"+day:day);
    month =(month<10 ? "0"+month:month)
    if(isFormat){
        return year.toString()+"-"+month.toString()+"-"+day.toString();
    };
    return year.toString()+month.toString()+day.toString();

}


var alertText,alertBox,canLookHistory = true; //提示框；是否可以查看获奖记录
var DefaultFont;
ActivitysLayer = cc.Layer.extend({
        jsBind: {

            block:{
                _layout:[[1,1],[0.5,0.5],[0,0],2]
            },
            back:{
                _layout:[[1,1],[0.5,0.5],[0,0],2],
                close: {
                    _click: function () {
                        jsclient.actionCfg.isRuning = false; //重置状态
                        jsclient.actUI.removeFromParent(true);
                        jsclient.actUI = null;
                        refreshActionCanDoNumber();//初始化活动角标
                    },
                },
                _run:function(){
                    touchCallBack(this)   //TODO 添加触摸监听
                },
            },
            panel:{
                _layout:[[1,1],[0.5,0.5],[0,0],false],
                DefaultFont:{
                    _visible:function(){
                        return false;
                    },
                    _run:function(){
                        DefaultFont = this;
                    }
                },
                activeList:{
                    _run:function(){
                        InitActivityListUI(this);
                        touchCallBack(this);
                    },
                },
                alerBackground:{
                    _run:function(){alertBox = this;},
                    alerText:{
                        _run:function(){
                            alertText = this;
                            var size1 = alertText.getContentSize();
                            this.setContentSize(cc.size(size1.width,size1.height*1.7));
                        }
                    }
                },

            },
        },
        ctor:function () {
            this._super();
            var actUI = ccs.load(res.Activity_json);
            ConnectUI2Logic(actUI.node,this.jsBind);
            this.addChild(actUI.node);
            jsclient.actUI=this;
            return true;
        },
        onEnter:function ()
        {
            this._super();
        }
 });

