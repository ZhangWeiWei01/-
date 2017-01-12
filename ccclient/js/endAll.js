
function SetEndAllPlayerUI(node,off)
{
	
	var sData=jsclient.data.sData;
	var tData=sData.tData;
	var pl=getUIPlayer(off);
	var uidSelf = SelfUid();
	var MaxWinAll=0;
	for (var i = 0; i < 4; i++) {
		var pi=getUIPlayer(i);
        MaxWinAll = MaxWinAll>pi.winall?MaxWinAll:pi.winall;
    }
	var uibind={
		name:{ _text:function(){return unescape(pl.info.nickname||pl.info.name)+"\n(ID:" + pl.uid + ")"; } },
		winNum:{
			_text:function(){return pl.winall + ""; }
		}
	}
	addWxHeadToEndUI(node,off);
	ConnectUI2Logic(node,uibind);
	jsclient.loadWxHead(pl.info.uid,pl.info.headimgurl);
	if (MaxWinAll ==pl.winall ) 
	{
		
		var win = node.getParent().getChildByName("win"+off);
		win.visible =true;
		win.y = node.y; 
	}
	var winTitleImg = node.getParent().getChildByName("wintitle");
	var loseTitleImg = node.getParent().getChildByName("losetitle");

	if ( off==0) {
		
		winTitleImg.visible = pl.winall >=1;
		loseTitleImg.visible = pl.winall <0;
		
	}
	if (tData.uids[0] == pl.info.uid) 
	{
		node.getChildByName("fangzhu").visible =true;
	}
	
}
var EndAllLayer = cc.Layer.extend({
    sprite:null,
	jsBind:{
		back:{_layout:[[0,1],[0.5,0.5],[0,0]]}
		,wintitle:
		{
			_layout:[[0.2,0.15],[0.5,1],[0,-0.8]]
		}
		,losetitle:{
			_layout:[[0.2,0.15],[0.5,1],[0,-0.8]]}
		,win0:{
			_run:function(){this.visible =false},
			_layout:[[0.2,0.2],[1,1],[-0.6,-2]]}
		,win1:{
			_run:function(){this.visible =false},
			_layout:[[0.2,0.2],[1,1],[-0.6,-2]]}
		,win2:{
			_run:function(){this.visible =false},
			_layout:[[0.2,0.2],[1,1],[-0.6,-2]]}
		,win3:{
			_run:function(){this.visible =false},
			_layout:[[0.2,0.2],[1,1],[-0.6,-2]]}
		,share:{_layout:[[0.2,0],[0.5,0],[0,0.6]]
			,_click:function(){
				sendEvent("capture_screen");
			}
			,_event:{
				captureScreen_OK:function(){jsclient.native.wxShareImage();}
			}
			,_run:function () {
				if(jsclient.remoteCfg.hideWechat) this.visible=false;
			}
		},
		tohome:
		{   _layout:[[0.085,0.085],[0,1],[0.5,-0.5]]
			,_click:function(){
				jsclient.leaveGame();
				jsclient.endallui.removeFromParent(true);
			}
		},
		close:{
			_layout:[[0.08,0.08],[1,1],[-0.5,-0.5]],
			_click:function(){
				jsclient.leaveGame();
				jsclient.endallui.removeFromParent(true);
			}
		}
		,head0:{
		_layout:[[0.13,0.13],[0,0.5],[1,2.25]],	
		fangzhu:{_run:function(){this.visible =false;this.zIndex =100;} },	
		_run:function(){ SetEndAllPlayerUI(this,0); }}
		,head1:{ 
		_layout:[[0.13,0.13],[0,0.5],[1,0.75]],	
		fangzhu:{_run:function(){this.visible =false;this.zIndex =100;} },		
		_run:function(){ SetEndAllPlayerUI(this,1); }}
		,head2:{ 
		_layout:[[0.13,0.13],[0,0.5],[1,-0.75]],
		fangzhu:{_run:function(){this.visible =false;this.zIndex =100;} },	
		_run:function(){ SetEndAllPlayerUI(this,2); }}
		,head3:{ 
		_layout:[[0.13,0.13],[0,0.5],[1,-2.25]],
		fangzhu:{_run:function(){this.visible =false;this.zIndex =100;} },	
		_run:function(){ SetEndAllPlayerUI(this,3); }}
	},
    ctor:function () {
        this._super();
        var endallui = ccs.load(res.EndAll_json);
		ConnectUI2Logic(endallui.node,this.jsBind);
        this.addChild(endallui.node);
		jsclient.endallui=this;

        return true;
    }
});