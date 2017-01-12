
function GetSelfHead()
{
	var pinfo=jsclient.data.pinfo;
	return {uid:pinfo.uid,url:pinfo.headimgurl};
}

function changeLabelAtals(node,count) {
	console.log("-------------------------------function changeLabelAtals(node,count) {");
	node.setString(count);
	return ;
	var changeLabelAtals_size = node.getVirtualRendererSize();
	var stringnum = node.getString();
	var oneNumwith ;
	if (stringnum>999) {
		oneNumwith = changeLabelAtals_size.width /4;
	}else if(stringnum>99) {
		oneNumwith = changeLabelAtals_size.width /3;
	}else if(stringnum>9) {
		oneNumwith = changeLabelAtals_size.width /2;
	}else {
		oneNumwith = changeLabelAtals_size.width ;
	}
	var size=node.getVirtualRendererSize();
	if(count>999) {
		size.width= oneNumwith*4;
	}else if (count > 99) {
		size.width=  oneNumwith*3;
	}else if(count>9) {
		size.width=  oneNumwith*2;
	}else {
		size.width=  oneNumwith;
	}
	 node.setSize(size);
	 node.setString(count);
}



function homeRunText(node) {
	var  length = node.stringLength * node.fontSize + node.getParent().getCustomSize().width/2;
	node.width = length;
	node.anchorX = 0;
	node.x += node.getParent().getCustomSize().width/2;
	var startPosX = node.x;

	var callback = function() {
		cc.log("callback");
		node.x = startPosX;
	}
	node.runAction(cc.repeatForever(cc.sequence(cc.moveBy(length/150.0,cc.p(-length,0)),cc.callFunc(callback))));
}

function initMJTexture(node)
{
	var ID_arry = jsclient.majiang.randomCards(); 
	var used_arry=[];
	for (var i = 0; i < ID_arry.length; i++) {
		var isused =false;
		for (var j = 0; j < used_arry.length; j++) {
			if(used_arry[j]==ID_arry[i])
			{
				isused =true;
			}	
		}
		used_arry.push(ID_arry[i]);
		if (!isused) 
		{
			for (var j = 0; j < 5; j++) {
			var  img = new ccui.ImageView();
			setCardPic(img,ID_arry[i],j);
			doLayout(img,[0.01,0.01],[0,2],[0,0],false,false);
			node.addChild(img);
			}
		}
	
		
	}
}
function onClickBuyMoney() {
	cc.log("== 点击购买钻石 ==");
	/*jsclient.uiPara={lessMoney:false};
	if(jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath()+"mjiap.txt"))
	{

		//ios
		jsclient.Scene.addChild(new ShopLayer());
	}else {
		//android

		jsclient.Scene.addChild(new PayLayer());


	}*/
}
function getTouchListener1()
{
	return {
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		swallowTouches: false,
		status: null,
		onTouchBegan: function (touch, event)
		{
			var target = event.getCurrentTarget();
			var pos = target.getParent().convertTouchToNodeSpace(touch);   // 世界坐标转换 (子节点相对于父节点的位置)
			// 如果触碰起始地点在本区域中
			if (!cc.rectContainsPoint(target.getBoundingBox(), pos))
			{
				return false;
			}
			return true;
		}, onTouchMoved: function (touch, event)
		{
			return true;
		},
		onTouchEnded: function (touch, event)
		{
			onClickBuyMoney();
			return true;
		}, onTouchCancelled: function (touch, event)
		{
			return true;
		}
	};
}

var btnArray=["notice","history","help","head"];
function btnTouchEvent(node,index,isAble) {
	for(var i=0; i < btnArray.length; i++)
	{
		if(i!=index)
		{
			node.getParent().getChildByName(btnArray[i]).setTouchEnabled(isAble);
		}
	}
}

var HomeLayer=cc.Layer.extend({
	jsBind:{
		_event:{
			logout:function(){
				jsclient.homeui.removeFromParent(true);
				delete jsclient.homeui;
			}
			
		},
        back:{
			_layout:[[1,1],[0.5,0.5],[0,0],true]

		},
		setting:{
			// _layout:[[0.1,0.14],[1,1],[-0.7,-0.6]],
			_layout:[[0.1,0.14],[0,0],[4.5,0.5]],
			_click:function(){ 
				var settringLayer = new  SettingLayer();
				settringLayer.setName("HomeClick");
				jsclient.Scene.addChild(settringLayer); 
			}
		},
		help:{
			// _layout:[[0.1,0.14],[1,1],[-1.9,-0.6]],
			_layout:[[0.1,0.14],[0,0],[3.4,0.5]]
			,
			_click:function(node,type){
				btnTouchEvent(node,1,false);
				 jsclient.openWeb({url:jsclient.remoteCfg.playUrl, help:true});
				btnTouchEvent(node,1,true);
			}
		},
		history:{
			// _layout:[[0.1,0.14],[1,1],[-2.9,-0.6]]
			_layout:[[0.1,0.14],[0,0],[2.1,0.5]]
			,_click:function(){
				if (!jsclient.data.sData) {
					jsclient.Scene.addChild(new PlayLogLayer());
				}
				else  jsclient.showMsg("正在游戏中，不能查看战绩");
			}
		},
		notice:
		{
			_run:function () {
				if(jsclient.remoteCfg.noticeShow)
				{
					this.visible = true;
				}else{
					this.visible = false;
				}
			},
			// _layout:[[0.1,0.14],[1,1],[-4.1,-0.6]]
			_layout:[[0.1,0.14],[0,0],[1,0.5]]
			,_click:function(node,type){
				btnTouchEvent(node,0,false);
				jsclient.data.noticeSwitch = 1;
				jsclient.openWeb({url:jsclient.remoteCfg.noticeUrl, help:false});
				btnTouchEvent(node,0,true);
			}
		},
		shop:{
			_layout:[[0.1,0.14],[1,1],[-5.5,-0.62]]
			// _layout:[[0.1,0.14],[0,0],[6.2,0.5]]
			// _layout:[[0.1,0.14],[0,0],[0,0]]
			,_run:function () {
				jsclient.uiPara={lessMoney:false};
				if(jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath()+"mjiap.txt"))
				{
					//ios
					this.visible = true;
				}else {
					//android
					this.visible = false;
				}
			}
			,_click:function () {
				onClickBuyMoney();
			}
		},
		fenxiang:{
			_run:function(){
					this.visible=jsclient.remoteCfg.shareBtn;
			},
			// _layout:[[0.1,0.14],[1,1],[-5.5,-0.62]],
			_layout:[[0.1,0.14],[0,0],[7.1,0.51]],
			_click: function() {
				var shareLayer = new ShareLayer();
				shareLayer.setName("PlayLayerClick");
				jsclient.Scene.addChild(shareLayer);
			},
			//_visible:jsclient.remoteCfg.shareBtn
		},
		title:{
			_run:function () {
				 /*if (jsclient.remoteCfg.coinRoom)
				{
					this.visible = false;
				 }*/
			},
			_layout:[[0.25,0.15],[0.5,1],[0,-0.5]],
			scroll:{
				// 需求：不显示公告
				_run:function(){
					this.visible = jsclient.remoteCfg.scrollViewShow;
				},
				msg:{
					_text:function(){
						return jsclient.remoteCfg.homeScroll;	
					},
					_run:function() {
						 homeRunText(this);
					}
				}
			},
			laba:{
				_run:function(){

						this.visible = jsclient.remoteCfg.scrollViewShow;

				}
			}
		},
		msg:{
			_layout:[[0.8,0.1],[0.5,0.5],[0,3]]
		}
		,head:{
			_layout:[[0.12,0.12],[0,1],[0.7,-0.7]],
			_event:{
				loadWxHead:function(d)
				{
					if(d.uid==SelfUid())
					{
						var sp=new cc.Sprite(d.img);
						this.addChild(sp);
						doLayout(sp,[0.85,0.85],[0.5,0.5],[0,0],false,true);
					}
				}
			},
			_run:function()
			{
				var selfHead=GetSelfHead();
				jsclient.loadWxHead(selfHead.uid,selfHead.url);
			}
			,_click:function(node,type){
				btnTouchEvent(node,3,false);
			    jsclient.showPlayerInfo(jsclient.data.pinfo);
				btnTouchEvent(node,3,true);
			}
			
			,name:{
				_run:function () {
					if (jsclient.remoteCfg.coinRoom) this.y = 65;
				},
				_text:function(){ var pinfo=jsclient.data.pinfo; return unescape(pinfo.nickname||pinfo.name);  }
             },uid:
             { 
               _text:function(){return "ID:"+SelfUid();},
               _run:function(){
                 // if(jsclient.remoteCfg.hideMoney)
                 //   {
				   if(jsclient.remoteCfg.coinRoom) this.x=360;
                   // }
                   
               }
             }
	
			,coinback:{
				//未开放  -  金币不显示！
				_visible:function(){ return jsclient.remoteCfg.coinRoom },
				coin:{
					_run:function(){changeLabelAtals(this,jsclient.data.pinfo.coin); }
					,_event:{
						updateInfo:function()
						{
							changeLabelAtals(this,jsclient.data.pinfo.coin);
						}
					}
				},
				buyCoin:
				{
                    _run:function(){
						if (jsclient.remoteCfg.hideMoney)
                        this.visible = false;
                    },
					_click:function(){mylog("buycoin");}
				}
			},
			moneyback:{
				_visible:function(){return jsclient.remoteCfg.moneybackShow;}
					,money:{
					_run:function(){
						changeLabelAtals(this,jsclient.data.pinfo.money);
						console.log("--*----------");
						cc.eventManager.addListener(getTouchListener1(), this);
					 }
					
					,_event:{
						updateInfo:function()
						{
							changeLabelAtals(this,jsclient.data.pinfo.money);
						}
						,loginOK:function()
						{
							changeLabelAtals(this,jsclient.data.pinfo.money);
						}
					}
				}
				,buyMoney:
				{
                    _run:function(){
						if (jsclient.remoteCfg.hideMoney)
                        this.visible = false;
                    },
					_click:function()
					{

						jsclient.uiPara={lessMoney:false};

						if(jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath()+"mjiap.txt"))
						{

							//ios
							jsclient.Scene.addChild(new ShopLayer());
						}else {
							//android

							jsclient.Scene.addChild(new PayLayer());


						}



					}
				}
			}
		},
		joinRoom:{
             _run:function()
             {
                  if(jsclient.remoteCfg.hideMoney)
                 {
                    doLayout(this,[0.3,0.4],[0.5,0.5],[-0.7,0] );
                 }
                 else
                  {
                     doLayout(this,[0.3,0.4],[0,0.5],[0.9,-0.2] );
                 }
				 if (!jsclient.data.sData)
				 {
					 this.loadTextures("res/home/joinGame.png","res/home/joingame1.png");
				 }else
				 {
					 this.loadTextures("res/home/returnGame.png","res/home/returnGame1.png");
				 }
             },_touch:function(btn,eT)
			{
				if(eT==2)
				{
					if (!jsclient.data.sData) 
					{
						sendEvent("joinRoom");
					}else
					{
						sendEvent("returnPlayerLayer");
					}
					
				}
			},_event:{
				returnHome:function()
				{
					this.loadTextures("res/home/returnGame.png","res/home/returnGame1.png");
				}
				,LeaveGame:function()
				{
					this.loadTextures("res/home/joinGame.png","res/home/joingame1.png");
				}
			}
		},
		createRoom:{
             _run:function()
             {
                  if(jsclient.remoteCfg.hideMoney)
                  {
                      doLayout(this,[0.3,0.4],[0.5,0.5],[0.7,0] );
                  }
                  else
                  {
                      doLayout(this,[0.3,0.4],[0.5,0.5],[0,-0.2] );
                  }
             },

			_click:function(btn,eT)
			{
				if (!jsclient.data.sData) 
				{
					jsclient.coinRoomCreate = false;
					sendEvent("createRoom");
				}
				else
				{
					jsclient.showMsg("房间已经创建,请点击返回游戏");
				}
				
			}
		},
		coinRoom:{
             _run:function()
              {
                   if(jsclient.remoteCfg.hideMoney)
                   {
                      this.visible=false;
                   }
                   else
                   {
                        doLayout(this,[0.3,0.4],[1,0.5],[-0.9,-0.2] );
                   }
              },

			_click:function(btn,eT)
			{
				jsclient.showMsg("暂未开放,敬请期待");
				 /*if(jsclient.remoteCfg.coinRoom)
				 {
					if (!jsclient.data.sData) 
					{
                        if(jsclient.data.pinfo.coin > 0)
                        {
                            jsclient.coinRoomCreate = true;
                            jsclient.createRoom("round4",
                                true,
                                false,
                                false,
								false,
								false,
								false,
								true,
								false,
								false
                            );
                        }
                        else
                        {
                            jsclient.showMsg("您的金币不足！");
                        }
						//sendEvent("createRoom");
						//jsclient.Scene.addChild(new CoinLayer());
					}
					else
					{
						jsclient.showMsg("房间已经创建,请点击返回游戏");
					}
				 } //jsclient.joinGame(null);
				 else jsclient.showMsg("暂未开放,敬请期待");*/
			}
		},
		jiankang:{
			_layout:[[0.3,0.3],[1,0],[-0.5,0.5]],
			wx:{
				_text:function(){
					return jsclient.remoteCfg.weixinBuy;
				}
			}
		},
		btn_activity:{
			// _layout:[[0.1,0.1],[0.58,0.09],[0,-0.30]], //[0.1,0.14],[1,1],[-1.9,-0.6]
			_layout:[[0.1,0.14],[0,0],[5.2,0.54]],
			_visible:function(){return jsclient.remoteCfg.activityOpen},
			_click:function(){
				var activitysLayer = new ActivitysLayer();
				jsclient.Scene.addChild(activitysLayer);
			},
			noticeImage:{
				_visible:function(){return true;}    //todo 活动数量
			}
		},

	},
	ctor:function () {
	    this._super();
        var homeui = ccs.load(res.Home_json);
		ConnectUI2Logic(homeui.node,this.jsBind);
		this.addChild(homeui.node);
		jsclient.homeui=this;
		playMusic("bgMain");
		initMJTexture(this);
		if(jsclient.remoteCfg.announcementShow){
			var announcement = new announcementLayer();
			announcement.setName("PlayLayerClick");
			this.addChild(announcement);
		}

		return true;
	}
});
