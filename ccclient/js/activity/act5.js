/*
 限时免费活动公告
 **/

    var curActData, curActId;
    var act5 = cc.Layer.extend({
        jsBind: {
            block: {_layout:[[1,1],[0.5,0.5],[0,0],true]},
            TimeActionPanel:
            {
                actionBackground: {},
                DefaultText: {},
                actionTime: {
                    beganTimeText: {},
                    endTimeText:{},
                },
            },
        },

        ctor: function () {
            this._super();

            curActData = jsclient.actionCfg.currentData.actData;
            curActId = jsclient.actionCfg.currentData["_id"];

            var act5ui = ccs.load(res.Act5);
            ConnectUI2Logic(act5ui.node, this.jsBind);
            this.addChild(act5ui.node);
            jsclient.act5ui = this;
            jsclient.actionCfg.isSelected = curActId;
            return true;
        },
    });



