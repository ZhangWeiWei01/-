/*
 好友邀请活动
 **/

//绑定邀请list的item
function BindItem(node,name,url, isUiDefault)
{
    var bind={
        name:{
            _text:function(){
                return name;
            },
        },
        nobody: {
            _run:function(){
                //if(!url){ url = "res/playing/other/Z_nobody.png"; }
                //jsclient.loadWxHeadNew(url,this,47,47,0.2,1);

                if(isUiDefault){
                    url = "res/Activitys/inviteFriend/Z_nobody.png";
                    return;
                }
                if(!url){ url = "res/png/default_headpic.png"; }
                var node = this;
                if (url)
                {
                    cc.loader.loadImg(
                        url,
                        {isCrossOrigin: true},
                        function (err, texture)
                        {
                            if(!err&&texture)
                            {
                                var sp=new cc.Sprite(texture);
                                node.addChild(sp);
                                doLayout(sp,[0.9,0.9],[0.5,0.5],[0,0],false,true);
                            }
                        }
                    );
                }
            }
        },
    }
    ConnectUI2Logic(node,bind);
};

//点击领取钻石
function onClickAwardButton(index)
{
    if(!jsclient.getInviteData())
    {
        //jsclient.showMsg("邀请好友数量达到"+20+"人,即可领取"+ 50 +"个钻石的奖励，快去多多邀请好友");
        cc.log("Safe--not got invite date!")
        jsclient.showMsg("邀请数量未达到要求，快去多多邀请好友");
        return;
    }
    var maxNum = jsclient.getInviteData().actData.maxNum;
    var length = jsclient.getInviteData().actData.rewards.length;
    var maxDiamond = 50;
    if(jsclient.getInviteData().actData.rewards[length-1].length == 3)
    {
        maxDiamond = jsclient.getInviteData().actData.rewards[length-1][1];
    }

    if(! jsclient.data.pinfo.recommendData){
        //jsclient.showMsg("邀请好友数量达到"+maxNum+"人,即可领取"+ maxDiamond +"个钻石的奖励，快去多多邀请好友");
        jsclient.showMsg("邀请数量未达到要求，快去多多邀请好友");
        return;
    }

    //提示 钻石领取过，无法重复领取
    var isGained = false;
    for(var i=0; i<jsclient.data.pinfo.recommendData.rewards.length; i++)
    {
        var temp = jsclient.data.pinfo.recommendData.rewards[i];
        if(temp == index)
        {
            isGained = true;
            break;
        }
    }
    if(isGained)
    {
        jsclient.showMsg("已经领取过，不能重复领取");
        return;
    }

    //提示 邀请好友数量未达到要求
    var rewardDataCfg;
    rewardDataCfg = jsclient.getInviteData().actData.rewards[index];
    if(rewardDataCfg)
    {
        var needInviteNum = rewardDataCfg[2];
        if(needInviteNum > invitedCount)
        {
            //jsclient.showMsg("邀请好友数量达到"+maxNum+"人,即可领取"+ maxDiamond +"个钻石的奖励，快去多多邀请好友");
            jsclient.showMsg("邀请数量未达到要求，快去多多邀请好友");
            return;
        }
    }
    else{
        //jsclient.showMsg("temp 服务器配置数据不足！！！");
        return;
    }

    //成功领取钻石
    jsclient.gainInviteReward(index);
};

//初始化领钻的按钮状态
function initAwardButtonState()
{
    for (var i = 0; i < 5; i++)
    {
        refreshAwardBtnState(i);
    }
};

//刷新领钻的按钮状态
function refreshAwardBtnState(index)
{
    //先初始化
    var awardBtn = processNode.getChildByName("Button_" + (index));
    cc.log("awardBtn = "+typeof(awardBtn))
    var pngIndex;
    switch(index)
    {
        case 0:
            pngIndex = "02";
            break;
        case 1:
            pngIndex = "03";
            break;
        case 2:
            pngIndex = "05";
            break;
        case 3:
            pngIndex = "010";
            break;
        case 4:
            pngIndex = "020";
            break;
    }
    var pngFile_noraml = "res/Activitys/inviteFriend/" + "demo_n.png";    //可以领取
    var pngFile_press = "res/Activitys/inviteFriend/" + "demo_p.png";      //领取过
    var pngFile_disable = "res/Activitys/inviteFriend/" + "demo_d.png";       //不能领取
    awardBtn.loadTextures(pngFile_disable, pngFile_disable);


    var data;
    if(jsclient.getInviteData())
        data = jsclient.getInviteData().actData.rewards[index];
    var needNum = 99;
    if(data) {
        needNum = data[2];
    }

    var isNumEnough = false;
    if (invitedCount >= needNum) isNumEnough = true;
    if(!isNumEnough)
    {
        return;
    }

    var plData = [];
    if(jsclient.data.pinfo.recommendData)
        if(jsclient.data.pinfo.recommendData.rewards)
            plData = jsclient.data.pinfo.recommendData.rewards

    var isGained = false;
    for (var i = 0; i < plData.length; i++)
    {
        if(index == plData[i])
        {
            isGained = true;
            break;
        }
    }

    if(isGained)
    {
        awardBtn.loadTextures(pngFile_press,pngFile_press);
    }
    else{
        awardBtn.loadTextures(pngFile_noraml,pngFile_press);
    }

};

var uilist, listItem, processNode;
var listindexpercent  = 0;
var invitedCount = 0;
var processCount01, processCount02, processCount03, processCount04, processCount05;

var act3 = cc.Layer.extend({
    jsBind: {
        inviteview:
        {
            listItem:{
                _visible:false,
                _run:function(){
                    listItem = this;
                },
                nobody:{},
                name:{},
            },
            ruleDesTxt:{
                _run:function () {
                    var data = jsclient.getInviteData();
                    if(data){
                        var str = data.actData.actNote;
                        this.setString(str);
                    }else{
                        this.setString("");
                    }
                }
            },
            inviteplayerlist:
            {
                _run:function()
                {
                    uilist=this;
                    var count = 20;
                    var num = 0;
                    if(jsclient.data.pinfo.recommendData)
                    {
                        cc.log("==="+ JSON.stringify(jsclient.data.pinfo.recommendData.players));
                        for( var key in jsclient.data.pinfo.recommendData.players)
                        {
                            var value = jsclient.data.pinfo.recommendData.players[key];

                            var item = listItem.clone();
                            item.visible = true;

                            this.insertCustomItem(item, num);

                            var url = value.headimgurl;
                            var name = value.nickname ? value.nickname : key;
                            BindItem(item, unescape(name), url, false);
                            num++;
                        }
                    }

                    invitedCount = num;
                    for(var i=num; i<count; i++)
                    {
                        var item = listItem.clone();
                        item.visible = true;
                        this.insertCustomItem(item,i);

                        var url = null;
                        var name = "???" ;
                        BindItem(item,name,url, true);
                    }

                }
            },
            arrowleft:
            {
                _click:function(btn,evt)
                {
                    mylog("!!!! arrowleft");
                    if(uilist)
                    {
                        if(listindexpercent > 0)
                        {
                            listindexpercent -= 5;
                            uilist.jumpToPercentHorizontal(listindexpercent);
                        }

                    }
                }
            },
            arrowright:
            {
                _click:function(btn,evt)
                {
                    mylog("!!!! arrowright");
                    if(uilist)
                    {
                        if(listindexpercent <100)
                        {
                            listindexpercent += 5;
                            uilist.jumpToPercentHorizontal(listindexpercent);
                        }
                    }
                }
            },
            invitenumtext:{
                _text: function () {
                    var maxNum = 2;
                    if(jsclient.getInviteData())
                    {
                        maxNum = jsclient.getInviteData().actData.maxNum;
                        cc.log("maxNum ======================= "+maxNum+"  invitedCount = "+invitedCount)
                    }
                    return "邀请的好友(" + invitedCount + "/" + maxNum + ")";
                }
            },
            process:{
                _run:function(){

                    processNode = this;
                },
                text1:{
                    _text:function(){
                        var str = "2人";
                        processCount01 = 2;
                        if(jsclient.getInviteData())
                        {
                            var rewards = jsclient.getInviteData().actData.rewards;
                            if(rewards.length >=1 )
                            {
                                var reward = rewards[0];
                                if(reward.length == 3)
                                {
                                    processCount01 = reward[2];
                                    str = reward[2]+"人";
                                }
                            }
                        }
                        return str;
                    }
                },
                text2:{
                    _text:function(){
                        var str = "4人";
                        processCount02 = 4;
                        if(jsclient.getInviteData())
                        {
                            var rewards = jsclient.getInviteData().actData.rewards;
                            if(rewards.length >= 2 )
                            {
                                var reward = rewards[1];
                                if(reward.length == 3)
                                {
                                    processCount02 = reward[2];
                                    str = reward[2]+"人";
                                }
                            }
                        }
                        return str;
                    }
                },
                text3:{
                    _text:function(){
                        var str = "8人";
                        processCount03 = 8;
                        if(jsclient.getInviteData())
                        {
                            var rewards = jsclient.getInviteData().actData.rewards;
                            if(rewards.length >=3 )
                            {
                                var reward = rewards[2];
                                if(reward.length == 3)
                                {
                                    processCount03 = reward[2];
                                    str = reward[2]+"人";
                                }
                            }
                        }
                        return str;
                    }
                },
                text4:{
                    _text:function(){
                        var str = "13人";
                        processCount04 = 13;
                        if(jsclient.getInviteData())
                        {
                            var rewards = jsclient.getInviteData().actData.rewards;
                            if(rewards.length >=4 )
                            {
                                var reward = rewards[3];
                                if(reward.length == 3)
                                {
                                    processCount04 = reward[2];
                                    str = reward[2]+"人";
                                }
                            }
                        }
                        return str;
                    }
                },
                text5:{
                    _text:function(){
                        var str = "20人";
                        processCount05 = 20;
                        if(jsclient.getInviteData())
                        {
                            var rewards = jsclient.getInviteData().actData.rewards;
                            if(rewards.length >= 5 )
                            {
                                var reward = rewards[4];
                                if(reward.length == 3)
                                {
                                    processCount05 = reward[2];
                                    str = reward[2]+"人";
                                }
                            }
                        }
                        return str;
                    }
                },
                Button_0:{
                    _click:function()
                    {
                        onClickAwardButton(0);
                    }
                },
                Button_1:{
                    _click:function()
                    {
                        onClickAwardButton(1);
                    }
                },
                Button_2:{
                    _click:function()
                    {
                        onClickAwardButton(2);
                    }
                },
                Button_3:{
                    _click:function()
                    {
                        onClickAwardButton(3);
                    }
                },
                Button_4:{
                    _click:function()
                    {
                        onClickAwardButton(4);
                    }
                },
                processbar:{
                    _run:function(){
                        cc.log("sdfjklasdjfklasdjfklasjdfklasjdflkjaskldfjlkasdjflksd")
                        //var maxNum = 2;
                        //maxNum = jsclient.getInviteData().actData.maxNum;
                        //var preNum = invitedCount / maxNum * 100;
                        var preNum = 0;

                        var commonOff = 7;
                        var rateDif = 0;
                        var personDif = 0;
                        //invitedCount = 6;//test 1,3,6,12,20
                        if(invitedCount <= processCount01)
                        {
                            //cc.log("====01");
                            var rate01 = 0;
                            var rate02 = 11;    //ui量出来的
                            preNum = rate02;
                            var person01 = 0;
                            var person02 = processCount01;

                            rateDif = rate02-rate01-commonOff;
                            personDif = person02-person01;
                            var truePersonDif = invitedCount-person01;
                            preNum = rateDif/personDif * truePersonDif + rate01;

                            if(invitedCount == processCount01) preNum = rate02;
                        }
                        if(invitedCount > processCount01 && invitedCount <= processCount02)
                        {
                            var rate01 = 11;
                            var rate02 = 34;
                            preNum = rate02;
                            var person01 = processCount01;
                            var person02 = processCount02;

                            rateDif = rate02-rate01-commonOff;
                            personDif = person02-person01;
                            var truePersonDif = invitedCount-person01;
                            preNum = rateDif/personDif * truePersonDif + rate01;

                            if(invitedCount == processCount02) preNum = rate02;
                        }
                        if(invitedCount > processCount02 && invitedCount <= processCount03)
                        {
                            var rate01 = 34;
                            var rate02 = 57;
                            preNum = rate02;
                            var person01 = processCount02;
                            var person02 = processCount03;

                            rateDif = rate02-rate01-commonOff;
                            personDif = person02-person01;
                            var truePersonDif = invitedCount-person01;
                            preNum = rateDif/personDif * truePersonDif + rate01;

                            if(invitedCount == processCount03) preNum = rate02;
                        }
                        if(invitedCount > processCount03 && invitedCount <= processCount04)
                        {
                            var rate01 = 57;
                            var rate02 = 79;
                            preNum = rate02;
                            var person01 = processCount03;
                            var person02 = processCount04;

                            rateDif = rate02-rate01-commonOff;
                            personDif = person02-person01;
                            var truePersonDif = invitedCount-person01;
                            preNum = rateDif/personDif * truePersonDif + rate01;

                            if(invitedCount == processCount04) preNum = rate02;
                        }
                        if(invitedCount > processCount04 && invitedCount < processCount05)
                        {
                            var rate01 = 79;
                            var rate02 = 100;
                            preNum = rate02;
                            var person01 = processCount04;
                            var person02 = processCount05;

                            rateDif = rate02-rate01-commonOff;
                            personDif = person02-person01;
                            var truePersonDif = invitedCount-person01;
                            preNum = rateDif/personDif * truePersonDif + rate01;

                            //if(invitedCount == processCount05) preNum = rate02;
                        }
                        if(invitedCount >= processCount05)
                        {
                            preNum = 100;
                        }

                        cc.log(" preNumber = = = = "+preNum)
                        this.setPercent(preNum);
                    }
                },
            },
            invitebutton:{
                _click:function(){

                    var pinfo = jsclient.data.pinfo;
                    var name = unescape(pinfo.nickname || pinfo.name);

                    var str  = "玩家" + name + "邀请您加入星悦江苏麻将，邀请码为" + SelfPlId()  //Todo
                        + "。在新手礼包界面输入邀请码，即可获得钻石奖励";
                    jsclient.native.wxShareUrl(jsclient.remoteCfg.wxShareUrl, "星悦江苏",str);
                }
            },
            _event:{
                actData:function(data)
                {
                    //通过数据更新界面
                    cc.log("==== refresh Index=" + data.index);
                    refreshAwardBtnState(data.index);
                }
            }
        },
    },

    ctor:function () {
        this._super();
        var act3ui = ccs.load(res.Act3);

        ConnectUI2Logic(act3ui.node,this.jsBind);

        this.addChild(act3ui.node);

        jsclient.act3ui=this;
        //jsclient.actionCfg.isSelected = 2;  //当前选中的活动

        jsclient.actionCfg.isSelected = curActId;

        initAwardButtonState();

        return true;

    },

});