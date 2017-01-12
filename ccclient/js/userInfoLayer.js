function ShowSameIP(msg)
{
	var sameIPUI;
	var SameIPInfo = cc.Layer.extend({
		jsBind:{
			block:{
				_layout:[[1,1],[0.5,0.5],[0,0],true]
			},
			back:
			{	_layout:[[0.5,0.5],[0.5,0.5],[0,0]],
				msg:{
					_text:function(){      return msg;  }
				},

				close:
				{
					_click:function()
					{
						sameIPUI.removeFromParent(true);
					}
				}
				,
				yes:
				{
					_click:function()
					{
						sameIPUI.removeFromParent(true);
					}
				},
				del:
				{
					_click:function()
					{
						sameIPUI.removeFromParent(true);
						jsclient.delRoom(true);
					}
				}


			}


		},
		ctor:function () {
			this._super();
			sameIPUI=this;
			var jsonui = ccs.load("res/SameIP.json");
			ConnectUI2Logic(jsonui.node,this.jsBind);
			this.addChild(jsonui.node);
			return true;
		}
	});

	jsclient.Scene.addChild(new SameIPInfo());

}


(function(){

var pinfo;
UserInfoLayer = cc.Layer.extend({
	jsBind:{
		block:{
			_layout:[[1,1],[0.5,0.5],[0,0],true]
		},
		back:
		{	_layout:[[0.5,0.5],[0.5,0.5],[0,0]],
		    name:{
					_text:function(){  return unescape(pinfo.nickname||pinfo.name);  }
			},
			
			close:
			{
				_click:function()
				{
					jsclient.userInfoLayerUi.removeFromParent(true);
				}
			},
			headImg:
			{
				_event:{
				loadWxHead:function(d)
				{
					if(d.uid==pinfo.uid)
					{
						var sp=new cc.Sprite(d.img);
						this.addChild(sp);
						doLayout(sp,[0.9,0.9],[0.5,0.5],[0,0],false,true);
					}
				}
			   },
			   _run:function(){
				   jsclient.loadWxHead(pinfo.uid,pinfo.headimgurl);
			   }
			},ID:
			{
				_text:function(){ return "ID:"+pinfo.uid; }
			},
			IP:
			{
				_text:function(){  if(pinfo.remoteIP)  return "IP:"+pinfo.remoteIP; else return "";}
			},
			coin:
			{
				_visible:function(){ return jsclient.remoteCfg.coinRoom }
				,num:{
                    _text:function(){ return pinfo.coin; }				   
				}
				
			},
			money:
			{
				_visible:function(){ return !jsclient.remoteCfg.hideMoney; }
				,num:{ _text:function(){ return pinfo.money; }	}
			}
		}
		

    },
    ctor:function () {
        this._super();
		pinfo=jsclient.uiPara;
        var userInfoLayerUi = ccs.load("res/UserInfo.json");
		ConnectUI2Logic(userInfoLayerUi.node,this.jsBind);
        this.addChild(userInfoLayerUi.node);
		jsclient.userInfoLayerUi=this;
        return true;
    }
 

});	
	
})();

