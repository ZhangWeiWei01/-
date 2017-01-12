

function SetEndOnePlayerUI(node,off)
{
	var sData=jsclient.data.sData;
	var tData=sData.tData;
	var pl=getUIPlayer(off);
	node=node.getChildByName("head");
	var uibind={
		head:{
		name:{ _text:function(){return unescape(pl.info.nickname||pl.info.name)+""; } },
		winType:{
			// _text:function(){return pl.baseWin>0?("X"+pl.baseWin):"";} ,
			_run:function () {
				this.visible = false;
			}
		},up:{ 
			_visible:false
			,_run:function(){


				var arry = [];
		
			for (var i = 0; i < pl.mjgang0.length; i++) {
			
			for (var j = 0; j <4; j++) {
				if (j==3) 
				{
					arry.push(AddNewCard(node,"up","gang0",pl.mjgang0[i],0,"isgang4"))
				}else
				{
					arry.push(AddNewCard(node,"up","gang0",pl.mjgang0[i],0));
				}
				
			}
		}
		//添加暗杠
		for (var i = 0; i < pl.mjgang1.length; i++) {
			
			for (var j = 0; j < 4; j++) {
				
					if (j==3) 
					{
						var card = AddNewCard(node,"down","gang1",0,0,"isgang4");
						card.tag = pl.mjgang1[i];
						arry.push(card);

					}else
					{
						arry.push(AddNewCard(node,"up","gang1",pl.mjgang1[i],0));
					}
			}
			
		}

					//添加补杠
					for (var i = 0; i < pl.mjgang2.length; i++)
					{

						for (var j = 0; j < 4; j++) {

							if (j==3)
							{
								var card = AddNewCard(node,"up","gang1",pl.mjgang2[i],0,"isgang4");
								card.tag = pl.mjgang2[i];
								arry.push(card);

							}else
							{
								arry.push(AddNewCard(node,"up","gang1",pl.mjgang2[i],0));
							}

						}

					}
							//添加碰
		for (var i = 0; i < pl.mjpeng.length; i++) {
			//AddNewCard(node,copy,name,tag,off)
			for (var j = 0; j < 3; j++) {
				arry.push(AddNewCard(node,"up","peng",pl.mjpeng[i],0));
			}
		}

		//添加吃
		for (var i = 0; i < pl.mjchi.length; i++) {
			
				arry.push(AddNewCard(node,"up","chi",pl.mjchi[i],0));
			}

		//添加手牌
			
				for (var i = 0; i < pl.mjhand.length; i++) 
				{
					
					arry.push(AddNewCard(node,"up","mjhand",pl.mjhand[i],0));
				}
			
		
				for (var i = 0; i < arry.length; i++) {
					arry[i].visible =true;
					arry[i].enabled = false;
				}
				
				cc.log("node.children.length"+node.children.length)
				RestoreCardLayout(node,0,pl);
			 },
		},down:{
			_visible:false
		},stand:{
			_visible:false
		},cardType:{
			
			_text:function(){return pl.mjdesc+"" } ,}
		
		}
		,winNum:{
			_text:function(){ var  pre="";  if(pl.winone>0) pre="+"; return  pre+pl.winone; } 
			,hu:{
			_run:function()
			{

					this.visible=(pl.winType > 0);
			}
		}
		}
	}
	ConnectUI2Logic(node.parent,uibind);
	addWxHeadToEndUI(uibind.head._node,off);
	uibind.winNum._node.y=uibind.head._node.y;
	

}

var EndOneLayer = cc.Layer.extend({
	jsBind:{
		back:{
			_layout:[[0,1],[0.5,0.5],[0,0]]}
		,wintitle:
		{
			_layout:[[0.2,0.15],[0.5,1],[0,-0.8]]
			,_visible:function(){
				  var pl=getUIPlayer(0);
				  if(pl) return pl.winone >=1;
				  return false;
			}
		},losetitle:
		{
			_layout:[[0.2,0.15],[0.5,1],[0,-0.8]]
			,_visible:function(){
				  var pl=getUIPlayer(0);
				  if(pl) return pl.winone <0;
				  return false;
			}
		},pingju:
		{
			_layout:[[0.1,0.1],[0.5,1],[0,-0.8]]
			,_visible:function(){

				  var pl=getUIPlayer(0);
				  
				  if(pl) return pl.winone==0;
				  return false;
			},_run:function()
			{
				if(jsclient.data.sData.tData.winners.length==0)
				{
					this.loadTexture("res/png/huangzhuang.png");
				}
			}
		}
        ,
		share:{
			_layout:[[0.2,0],[0.5,0],[-1,0.5]]
			,_click:function(){
				sendEvent("capture_screen");
			}
			,_event:{
				captureScreen_OK:function(){jsclient.native.wxShareImage();}
			}
			,_run:function () {
				if(jsclient.remoteCfg.hideWechat)
				this.visible=false;
			}
		},
		ready:{
			// _layout:[[0.2,0],[0.5,0],[1,0.5]],
			_click:function(btn,eT)
			{
				sendEvent("clearCardUI");
				// if (jsclient.data.sData.tData.playType == PlayType.ylMethod) {
				// 	cc.log(" == resetTingLogo == ");
				// 	sendEvent("resetTingLogo");
				// }
				// cc.log("==== jsclient.data.sData.playType " + jsclient.data.sData.playType);
				jsclient.endoneui.removeFromParent(true);
				jsclient.MJPass2Net();
			}
			,_run:function () {
				if(jsclient.remoteCfg.hideWechat)
				{
					doLayout(this,[0.2,0],[0.5,0],[0,0.5]);
				}else
				{
					doLayout(this,[0.2,0],[0.5,0],[1,0.5]);
				}
			}
		}
		,head0:{
			head:{   _layout:[[0.13,0.13],[0,0.5],[1,2.25]],zhuang:{_visible:false}    },
		    winNum:{ _layout:[[0.08,0.08],[1,0.5],[-2.5,2.25]]  },
		   _run:function(){ SetEndOnePlayerUI(this,0); },
		   
		}
		,head1:{ 
		   head:{_layout:[[0.13,0.13],[0,0.5],[1,0.75]],zhuang:{_visible:false}	 },
	       winNum:{ _layout:[[0.08,0.08],[1,0.5],[-2.5,0.75]]  },
		  _run:function(){ SetEndOnePlayerUI(this,1); }
		}
		
		,head2:{ 
		   head:{_layout:[[0.13,0.13],[0,0.5],[1,-0.75]],	zhuang:{_visible:false} },
	       winNum:{ _layout:[[0.08,0.08],[1,0.5],[-2.5,-0.75]]  },
		   _run:function(){ SetEndOnePlayerUI(this,2); }
		}
		,head3:{ 
		 
			 head:
			 {
				 _layout:[[0.13,0.13],[0,0.5],[1,-2.25]],	 
				zhuang:{_visible:false}
			 },
			 winNum:{ _layout:[[0.08,0.08],[1,0.5],[-2.5,-2.25]]  },
			_run:function(){ SetEndOnePlayerUI(this,3); }
		
		}
		
		
	},
    ctor:function () {
        this._super();
        var endoneui = ccs.load(res.EndOne_json);
		ConnectUI2Logic(endoneui.node,this.jsBind);
        this.addChild(endoneui.node);
		jsclient.endoneui=this;
		
		 var sData=jsclient.data.sData;
      	 var tData=sData.tData;

	     var selfUid=SelfUid();
		 var zoff= (tData.zhuang+4-tData.uids.indexOf(selfUid))%4;
		 var zhuang=this.jsBind["head"+zoff].head.zhuang._node;
		 zhuang.visible=true; zhuang.zIndex=10;
        
 		return true;
    }
});

function GetDelPlayer(off)
{
	var sData=jsclient.data.sData;
	var tData=sData.tData;
	if(tData.firstDel<0) return null;
	var idx=(tData.uids.indexOf(tData.firstDel)+off)%4;
	return sData.players[tData.uids[idx]+""];
}

function DelRoomAgree(node,off)
{
	var pl=GetDelPlayer(off);
	if(!pl) return;
	var sData=jsclient.data.sData;
	var tData=sData.tData;
	if(off==0)
	{
		node.setString("玩家["+unescape(pl.info.nickname||pl.info.name)+"]申请解散房间");
	}
	else
	{
		if(pl.delRoom>0)
		{
			node.setString("玩家["+unescape(pl.info.nickname||pl.info.name)+"]同意");
		}
		else if(pl.delRoom==0)
		{
			node.setString("玩家["+unescape(pl.info.nickname||pl.info.name)+"]等待选择");
		}
		else if(pl.delRoom<0)
		{
			node.setString("玩家["+unescape(pl.info.nickname||pl.info.name)+"]拒绝");
		}
	}
}
function DelRoomVisible(node)
{
	var pl=getUIPlayer(0);
	node.visible=pl.delRoom==0;
}

function DelRoomTime(node)
{

	var callback = function(){
	var sData =jsclient.data.sData;
	var tData = sData.tData;
	var  time = sData.serverNow + Date.now();
	var  needtime =tData.delEnd-time;
	var need_s =Math.floor((needtime /1000)%60);
	var need_m = Math.floor((needtime / 1000) /60);
	if (need_s==0 && need_m==0) 
	{
		node.cleanup();
	}
	node.setString("在"+need_m+"分"+need_s+"之后将自动同意");
	};
	node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callback),cc.DelayTime(1.0))));
}

(function(){
	

	
DelRoomLayer = cc.Layer.extend({
	jsBind:{
		block:{_layout:[[1,1],[0.5,0.5],[0,0],true]	},
		back:{
			_layout:[[0.5,0.5],[0.5,0.5],[0,0]],
			player0:
			{
				_run:function(){ DelRoomAgree(this,0);  },
				_event:{DelRoom:function(){ DelRoomAgree(this,0);  }}
			},time:{
				_run:function()
				{
					DelRoomTime(this);
				}
			},
			player1:{
				_run:function(){ DelRoomAgree(this,1);  },
				_event:{DelRoom:function(){ DelRoomAgree(this,1);  }}
			},
			player2:{
				_run:function(){ DelRoomAgree(this,2);  },
				_event:{DelRoom:function(){ DelRoomAgree(this,2);  }}
			},
			player3:{
				_run:function(){ DelRoomAgree(this,3);  },
				_event:{DelRoom:function(){ DelRoomAgree(this,3);  }}
			},
			yes:{
				_click:function(){ jsclient.delRoom(true); }
				,_event:{DelRoom:function(){ DelRoomVisible(this);  }}
				,_run:function(){DelRoomVisible(this); }
			},
			no:{
				_click:function(){ jsclient.delRoom(false); }
				,_event:{DelRoom:function(){ DelRoomVisible(this);  }}
				,_run:function(){DelRoomVisible(this); }
			}
		},
		_event:{
			endRoom:function(){	jsclient.delroomui.removeFromParent(true); delete jsclient.delroomui; }
		}
	},
    ctor:function () {
        this._super();
        var delroomui = ccs.load("res/DelRoom.json");
		ConnectUI2Logic(delroomui.node,this.jsBind);
        this.addChild(delroomui.node);
		jsclient.delroomui=this;
        return true;
    }
});

var endroomui;
EndRoomLayer = cc.Layer.extend({
	jsBind:{
		block:{_layout:[[1,1],[0.5,0.5],[0,0],true]	},
		back:{
			_layout:[[0.5,0.5],[0.5,0.5],[0,0]],
			tohome:{
				_click:function(){
					var msg=jsclient.endRoomMsg;
					if(msg.reason>=0)
					{
					   jsclient.leaveGame();	
					}
					endroomui.removeFromParent(true);
				}
			},
			info:{
				_text:function()
				{
					var msg=jsclient.endRoomMsg;
					if(msg.reason==0)
					{
						if(jsclient.remoteCfg.hideMoney) return "还没有开始打牌";
						var sData=jsclient.data.sData;
						var tData=sData.tData;
						if(tData.uids[0] == SelfUid()) return	"游戏未开始，解散房间将不会扣除钻石";
						return "房间已被"+ GetUidNames([tData.uids[0]])+"解散,请重新加入游戏"
					}
					else if(msg.reason==1)
					{
						return "解散房间申请超时";
					}else if(msg.reason==2)
					{
						return "玩家 "+GetUidNames(msg.yesuid)+" 同意解散房间";
					}
                    					
				}
			}
		}
	},
    ctor:function () {
        this._super();
        endroomui = ccs.load("res/EndRoom.json");
		ConnectUI2Logic(endroomui.node,this.jsBind);
        this.addChild(endroomui.node);
		endroomui=this;
        return true;
    }
});




})();



function addWxHeadToEndUI(node,off)
{
				var spHead;
				if (off == 0) 
				{
					spHead = jsclient.playui.jsBind.down.head._node.getChildByName("WxHead");
					
				}else if(off == 1)
				{
					spHead = jsclient.playui.jsBind.right.head._node.getChildByName("WxHead");
				}else if(off == 2)
				{
					spHead = jsclient.playui.jsBind.top.head._node.getChildByName("WxHead");
				}else
				{
					spHead = jsclient.playui.jsBind.left.head._node.getChildByName("WxHead");
				}
				if(spHead)
				{
					var sp = new cc.Sprite(spHead.texture);
					node.addChild(sp);
					doLayout(sp,[0.7,0.7],[0.5,0.5],[0,0],false,true);
				}
}