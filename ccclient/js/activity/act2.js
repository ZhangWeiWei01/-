/*
维护补偿奖活动
**/

//初始化补偿界面
function initCompensateUi(){

    var pinfoActData = jsclient.data.pinfo.actData; //用户活动数据
    if(typeof(pinfoActData)!="undefined"
        && pinfoActData!=""
        && pinfoActData!=null
        && (jsclient.actionCfg.getCompensate == "undefined"
            || jsclient.actionCfg.getCompensate == ""
            || jsclient.actionCfg.getCompensate == null))

    { //第二次 有活动数据了才会走这里
        var compensateData = pinfoActData[curActId]; //领取补偿的记录(time)
        if(typeof(compensateData)!="undefined" && compensateData!="" && compensateData!=null){ //已经领取过补偿的数据
            //cc.log("--------------------------------->>>Alert: compensate have been geted!")
            jsclient.act2ui.jsBind.panel_2.getRewardBtn._node.touchEnabled = false;
            jsclient.act2ui.jsBind.panel_2.getRewardBtn._node.bright = false;
        }else{
            //cc.log("---------------------------------->>>Alert : compensate get ok!")
            jsclient.act2ui.jsBind.panel_2.getRewardBtn.touchEnabled = true;
            jsclient.act2ui.jsBind.panel_2.getRewardBtn.bright = true;
        }
    }else{               //第一次没有活动数据，或者点击 领取补偿之后切换
        //cc.log("----------------------------------->>>>  not find get reward data!")
        if(jsclient.actionCfg.getCompensate){
            cc.log("jsclient.actionCfg.getCompensate = true")
            jsclient.act2ui.jsBind.panel_2.getRewardBtn._node.touchEnabled = false;
            jsclient.act2ui.jsBind.panel_2.getRewardBtn._node.bright = false;
        }
    }
    
    //角标判定
    var canTouch = jsclient.act2ui.jsBind.panel_2.getRewardBtn._node.touchEnabled;
    var isRun = jsclient.actionData.nowActionIds.indexOf(curActId);
    if(canTouch && isRun){
        jsclient.actionData.canDoActions ++;
    }
}

var curActData,curActId;
var act2 = cc.Layer.extend({
    jsBind: {
        panel_2: {
            newsBackground: {
                NoticeText: { //补偿公告信息
                    _text:function(){
                        var actNode = curActData["actNote"];
                        return actNode;
                    },
                },
                actionTime: { //活动时间
                    beganTimeText: {
                        _text:function(){
                            var date = curActData["beginDay"];
                            return formatDate(date);
                        },
                    },
                    endTimeText: {
                        _text:function(){
                            var date = curActData["endDay"]
                            return formatDate(date);
                        },
                    },
                },
            },
            diamondNumber: {
                _text:function(){
                    var number = curActData["rewards"][1];
                    return number;
                },
            },
            getRewardBtn: { //领取补偿钻石
                _click: function (btn) {
                    if(ifTimePermite(curActId)){
                        jsclient.gamenet.request("pkplayer.handler.doActivity", {actId:curActId, actType:2}, function(rtn){
                            console.log("补偿活动返回数据 = " + JSON.stringify(rtn));
                            if (rtn.result == 0) {
                                showNotice("补偿领取成功!");
                                jsclient.actionCfg.getCompensate = true; //标记已经领取补偿

                                //sys.localStorage.setItem("getCompensate",0);
                                btn.touchEnabled = false;
                                btn.bright = false;
                            }else if(rtn.er == "reward got"){
                                showNotice("补偿已领取!")
                                btn.touchEnabled = false;
                                btn.bright = false;
                            }else{
                                showNotice("网路不稳，请稍后重试！")
                            }
                        })
                    }

                }
            }
        }
    },

    ctor:function () {
        this._super();

        curActData = jsclient.actionCfg.currentData.actData;
        curActId = jsclient.actionCfg.currentData["_id"];

        var act2ui = ccs.load(res.Act2);
        ConnectUI2Logic(act2ui.node,this.jsBind);
        this.addChild(act2ui.node);
        jsclient.act2ui=this;
        //jsclient.actionCfg.isSelected = 2;  //当前选中的活动
        jsclient.actionCfg.isSelected = curActId;
        initCompensateUi();
        return true;
    },

});
