(function(){
	function setProgressPercent(p) {
		var barbk = jsclient.updateui.jsBind.barbk;
		var bar = barbk.bar._node;
		bar.setPercent(p);
		if( "undefined" == typeof(jsclient.remoteIP) )
		{
			//if ( p >= 80 )
			//{
			//  bar.setPercent(80);
			//}
		}
		else
		{
			//bar.setPercent(p);
			var isUpdate = sys.localStorage.getItem("isUpdate");
			if(!isUpdate || isUpdate != "1")
				sys.localStorage.setItem("isUpdate", "1");

		}
	}
	
	function dotLoadAction(node)
{
	var update_dian_ac_number = 1;
	var callback = function()
	{
		
		node.loadTexture("res/loading/dian"+update_dian_ac_number+".png");
		if(update_dian_ac_number  ==7)
		{
			update_dian_ac_number =1;
		}
		update_dian_ac_number++;
	};
	node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callback),cc.DelayTime(0.3))));
}
         function CfgGetFail(){sendEvent("disconnect",5);}
         function LoadConfig(remoteCfgName)
		{
			// jsclient.remoteCfg = {"servers":"nxmj.coolgameb1ox.com:15010:15011:15012:15013:15014:15015:15016:15017:15018:15019","wxShareUrl":"http://a.app.qq.com/o/simple.jsp?pkgname=com.happyplay.nxmj","voiceUrl":"http://118.178.124.163:9130/nxmj/","guestLogin":false,"hideWechat":false,"coinRoom":false,"canEatHu":false,"hideMoney":false,"deepShare":false,"noticeShow":true,"voiceBtnShow":true,"shareBtn":true,"scrollViewShow":true,"moneybackShow":true,"asApp":true,"weixinBuy":"rongkf7624","announcementShow":true,"activityOpen":true,"jiankang":true,"announcementContent":"公告内容：\n亲爱的玩家，四方宁夏麻将于11月30日6：00进行更新升级。\n更新内容：\n1、新增斗地主玩法（免费）\n2、修改滑水麻将为默认玩法\n3、牌池麻将UI放大\n4、打牌UI界面调整\n5、打牌界面增加时间显示\n6、优化出牌速度\n版本更新发现异常及建议反馈，请及时联系客服QQ：2733039836\n四方宁夏麻将祝您游戏愉快！","noticeUrl":"http://sources1.happyplaygame.net/nxmj/notice.html","legalUrl":"http://sources1.happyplaygame.net/nxmj/legal.html","playUrl":"http://sources1.happyplaygame.net/nxmj/play.html","play2Url":"http://sources1.happyplaygame.net/nxmj/play2.html","play3Url":"http://sources1.happyplaygame.net/nxmj/play3.html","play4Url":"http://sources1.happyplaygame.net/nxmj/play4.html","play5Url":"http://sources1.happyplaygame.net/nxmj/play5.html","play6Url":"http://sources1.happyplaygame.net/nxmj/play6.html","play7Url":"http://sources1.happyplaygame.net/nxmj/play7.html","homeScroll":"四方宁夏麻将代理招募，请联系微信rongkf7624，文明娱乐，严禁赌博！"}
			// sendEvent("updateFinish");


			//先注释掉，用上面写死的方式。
			var xhr = cc.loader.getXMLHttpRequest();
			xhr.open("GET","http://nxmj.coolgamebox.com:800/nxmj/"+remoteCfgName);
			xhr.onreadystatechange = function ()
			{
				if (xhr.readyState == 4 && xhr.status == 200)
				{
					  jsclient.remoteCfg = JSON.parse(xhr.responseText);
					// jsclient.remoteCfg = {"servers":"nxmj.coolgamebox.com:15010:15011:15012:15013:15014:15015:15016:15017:15018:15019","wxShareUrl":"http://a.app.qq.com/o/simple.jsp?pkgname=com.happyplay.nxmj","voiceUrl":"http://118.178.124.163:9130/nxmj/","guestLogin":false,"hideWechat":false,"coinRoom":false,"canEatHu":false,"hideMoney":false,"deepShare":false,"noticeShow":true,"voiceBtnShow":true,"shareBtn":true,"scrollViewShow":true,"moneybackShow":true,"asApp":true,"weixinBuy":"rongkf7624","announcementShow":true,"activityOpen":true,"jiankang":true,"announcementContent":"公告内容：\n亲爱的玩家，四方宁夏麻将于11月30日6：00进行更新升级。\n更新内容：\n1、新增斗地主玩法（免费）\n2、修改滑水麻将为默认玩法\n3、牌池麻将UI放大\n4、打牌UI界面调整\n5、打牌界面增加时间显示\n6、优化出牌速度\n版本更新发现异常及建议反馈，请及时联系客服QQ：2733039836\n四方宁夏麻将祝您游戏愉快！","noticeUrl":"http://sources1.happyplaygame.net/nxmj/notice.html","legalUrl":"http://sources1.happyplaygame.net/nxmj/legal.html","playUrl":"http://sources1.happyplaygame.net/nxmj/play.html","play2Url":"http://sources1.happyplaygame.net/nxmj/play2.html","play3Url":"http://sources1.happyplaygame.net/nxmj/play3.html","play4Url":"http://sources1.happyplaygame.net/nxmj/play4.html","play5Url":"http://sources1.happyplaygame.net/nxmj/play5.html","play6Url":"http://sources1.happyplaygame.net/nxmj/play6.html","play7Url":"http://sources1.happyplaygame.net/nxmj/play7.html","homeScroll":"四方宁夏麻将代理招募，请联系微信rongkf7624，文明娱乐，严禁赌博！"}
					console.log("JSON.stringify(playInfo)); = "+JSON.stringify(xhr.responseText));
					console.log("JSON.stringify(playInfo)); = "+JSON.stringify(jsclient.remoteCfg));

					if(  cc.sys.OS_IOS == cc.sys.os )
					{
						console.log("0000000000000000000001");//这里没有走
						jsclient.coinarry=	jsclient.remoteCfg.coinmount.split(',');
						jsclient.moneyarray=	jsclient.remoteCfg.moneymount.split(',');
						jsclient.iaparray=	jsclient.remoteCfg.iaparry.split(',');
					}
					console.log("updateFinish - sendEvent");
				sendEvent("updateFinish");
				}
				else CfgGetFail();
			}
			xhr.onerror = function(event) {CfgGetFail();}
			xhr.send();
		}


	//TODO 加载活动数据  ===========================================
	function LoadActivityConfig(remoteCfgName)
	{
		// cc.log("加载活动数据。。。")
		var remoteCfgName = "action.json"
		var xhr = cc.loader.getXMLHttpRequest();
		xhr.open("GET","http://nxmj.coolgamebox.com:800/nxmj/"+remoteCfgName);
		xhr.onreadystatechange = function ()
		{
			if (xhr.readyState == 4 && xhr.status == 200)
			{
				console.log("▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉");
				cc.log(xhr.responseText)
				console.log("▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉▉");
				jsclient.actionCfg = JSON.parse(xhr.responseText);
				jsclient.setActionCfgType();
				console.log("jsclient.actionCfg ----->" + JSON.stringify(jsclient.actionCfg));
			}
			else CfgGetFail();
		}
		xhr.onerror = function(event) {CfgGetFail();}
		xhr.send();

	}

         function GetRemoteCfgNet()
          {
              var remoteCfgName="android.json";
			  //var remoteCfgName="android_hotUpdate.json";
              if(  cc.sys.OS_IOS == cc.sys.os )
              {
				  console.log("cc.sys.OS_IOS == cc.sys.os");

                  if(jsb.fileUtils.isFileExist(jsb.fileUtils.getWritablePath()+"majiangios.txt"))
                  {
                      cc.loader.loadTxt(jsb.fileUtils.getWritablePath()+"majiangios.txt",function(er,txt){
                           if(txt&&txt.length>0){
                               remoteCfgName=txt+".json";
                               LoadConfig(remoteCfgName);

							   LoadActivityConfig("action.json"); //TODO 加载活动数据  IOS
                           }
                           else CfgGetFail();
                      });
                      return;
                  }
                  else remoteCfgName="appstore.json";
              }
			  console.log("remoteCfgName ---= "+remoteCfgName);
              LoadConfig(remoteCfgName);

			  LoadActivityConfig("action.json"); //TODO 加载活动数据 Android
          }

		function GetRemoteCfg()
		{
			cc.loader.loadTxt("res/test.cfg",function(er,txt){
				if(er||txt.length==0)
				{
					console.log("GetRemoteCfgNet()");
					console.log("sendEvent--------updateFinish======1");
					GetRemoteCfgNet();
				}
				else 
				{
					LoadActivityConfig("action.json"); ///////TODO 加载活动数据 win32
				    jsclient.remoteCfg = JSON.parse(txt);
					console.log("sendEvent--------updateFinish=======2");
					sendEvent("updateFinish");	
				}	
			}); 
		}
		
		function GetRemoteIP()
		{
			cc.log("cc.sys.isMobile = " + cc.sys.isMobile);
			jsclient.remoteIP="127.0.0.1";
			GetRemoteCfg();
			console.log("jsclient.remoteIP == "+jsclient.remoteIP);
			// var xhr = cc.loader.getXMLHttpRequest();
			// if(!cc.sys.isMobile){
			// 	jsclient.remoteIP="127.0.0.1";
			// 	GetRemoteCfg();
			// 	return;
			// }
			// xhr.open("GET","http://ip.taobao.com/service/getIpInfo2.php?ip=myip");
			// xhr.onreadystatechange = function ()
			// {
			// 	if (xhr.readyState == 4 && xhr.status == 200)
			// 	{
			//
			// 		var js= JSON.parse(xhr.responseText);
			// 		jsclient.remoteIP=js.data.ip;
			// 	}
			// 	GetRemoteCfg();
			//
			// }
			// xhr.onerror = function(event) {GetRemoteCfg();}
			// xhr.send();

		}

var manager,listener;

UpdateLayer = cc.Layer.extend({
	jsBind:{
		back:
		{
			_layout:[[1,1],[0.5,0.5],[0,0],true],
			
			_event:{
				connect:function()
				{
					jsclient.updateui.removeFromParent(true);
				}
				,AssetsManagerEvent:function(event)
				{
					
				   function updateFinish(upOK,code)
				   { 
				         cc.eventManager.removeListener(listener); 
						 if(upOK==1)
						 {
						    jsclient.resVersion=manager.getLocalManifest().getVersion();
							GetRemoteIP(); 
						 } 
						 else if(upOK==2)
						 {					
						   jsclient.restartGame();
						 }
                         else  sendEvent("disconnect",10+code);					 
				         manager.release(); 
				   }
				  
				   

					code = ["ERROR_NO_LOCAL_MANIFEST,", "ERROR_DOWNLOAD_MANIFEST", "ERROR_PARSE_MANIFEST", "NEW_VERSION_FOUND", "ALREADY_UP_TO_DATE",
							"UPDATE_PROGRESSION", "ASSET_UPDATED", "ERROR_UPDATING", "UPDATE_FINISHED", "UPDATE_FAILED", "ERROR_DECOMPRESS"];

					//var error=code[event.getEventCode()] + "|" + event.getMessage() + "|" + event.getAssetId() + "|" + event.getPercent();
					//cc.log(error);

					switch (event.getEventCode()) {

						case jsb.EventAssetsManager.ERROR_NO_LOCAL_MANIFEST:
						case jsb.EventAssetsManager.ERROR_DOWNLOAD_MANIFEST:
						case jsb.EventAssetsManager.ERROR_PARSE_MANIFEST:
						case jsb.EventAssetsManager.ERROR_UPDATING:
						case jsb.EventAssetsManager.ERROR_DECOMPRESS:
						case jsb.EventAssetsManager.UPDATE_FAILED:

							updateFinish(0,event.getEventCode());

							break;

						case jsb.EventAssetsManager.NEW_VERSION_FOUND:
							break;
						case jsb.EventAssetsManager.UPDATE_PROGRESSION:
							//barNode.setPercent(event.getPercent());
							setProgressPercent(event.getPercent());
							break;
						case jsb.EventAssetsManager.ASSET_UPDATED:
							break;
						case jsb.EventAssetsManager.ALREADY_UP_TO_DATE:
						
							updateFinish(1);
	
							
							break;
						case jsb.EventAssetsManager.UPDATE_FINISHED:
						    updateFinish(2);
						   break;
						default:
							break;
					}
				
					
					
				}
			}
			
		},load:
		{
			_layout:[[0.05,0.05],[0.5,0.2],[0,0],true]
			,dian:
			{
				_run:function()
				{
					dotLoadAction(this);
				}
			}
		
		},barbk:{
			_layout:[[0.48,0.13],[0.5,0.3],[0,0]],
			bar:{}
		}
	},
    ctor:function () {
        this._super();
        var updateui = ccs.load(res.Updae_json);
		ConnectUI2Logic(updateui.node,this.jsBind);
        this.addChild(updateui.node);
		jsclient.updateui=this;
        return true;
    },
	onEnter:function () 
	{
		
        this._super();
		//cc.spriteFrameCache.addSpriteFrames("res/Pic/Game/poker.plist");
        //var barNode=this.jsBind.barbk.bar._node;
		//barNode.setPercent(0);
		

	
	    function UpdateResource()
		{
			console.log("----------------UpdateResource--------------");
			manager = new jsb.AssetsManager("res/project.manifest", jsb.fileUtils.getWritablePath()+"update");
			manager.update();
			// As the process is asynchronised, you need to retain the assets manager to make sure it won't be released before the process is ended.
			manager.retain();
			if (!manager.getLocalManifest().isLoaded()) 
			{
				console.log("----------------UpdateResource--------------1");

				manager.release();
				GetRemoteIP();
			}
			else 
			{
				console.log("----------------UpdateResource--------------2");

				listener = new jsb.EventListenerAssetsManager(manager, function (event) {
					console.log("sendEvent(AssetsManagerEvent,event)");

					sendEvent("AssetsManagerEvent",event);
				});
				cc.eventManager.addListener(listener, 1);
			}
		}
		
		//if(  cc.sys.OS_WINDOWS == cc.sys.os )  GetRemoteCfg();	else 
		UpdateResource();
		console.log("----------------UpdateResource---------11-----");
	
	
	}
});

	
	
})();


(function(){
	var methodChosenTexArray=[], methodUnChosenTexArray=[], methodArray=["sx","xa","bj","yl","hs"];
	methodChosenTexArray[0]="res/help/yeqian_tuidaohu.png";
	methodChosenTexArray[1]="res/help/yeqian_xian.png";
	methodChosenTexArray[2]="res/help/yeqian_baoji.png";
	methodChosenTexArray[3]="res/help/yeqian_yulin.png";
	methodChosenTexArray[4]="res/help/yeqian_huashui2.png";

	methodUnChosenTexArray[0]="res/help/yeqian_tuidaohu_weixuan.png"
	methodUnChosenTexArray[1]="res/help/yeqian_xian_weixuan.png";
	methodUnChosenTexArray[2]="res/help/yeqian_baoji_weixuan.png"
	methodUnChosenTexArray[3]="res/help/yeqian_yulin_weixuan.png";
	methodUnChosenTexArray[4]="res/help/yeqian_huashui2_weixuan.png";

	function resetMethodBtnTexture(node,methodType) {
		for(var i=0;i<methodArray.length;i++){
			if (methodType == i)
			{
				node.loadTextureNormal(methodChosenTexArray[methodType]);
			}else {
				node.getParent().getChildByName(methodArray[i]).loadTextureNormal(methodUnChosenTexArray[i]);
			}
		}
	}
	var webViewLayer,uiPara,webView,cIndex;
	function changeWebviewContent(index, node) {
		if (index == cIndex) return;
		if (node.getParent().getChildByName("webView"))
		{
			node.getParent().getChildByName("webView").removeFromParent(true);
			// 移除对应的webView之后，开始添加新的view
			if(ccui.WebView)
			{
				var bkNode = node.getParent().getChildByName("back_method");
				var cSize=bkNode.getCustomSize();
				var screen=jsclient.size;
				var url
				if (index == methodArray.indexOf("sx")) {
					url = jsclient.remoteCfg.playUrl;
					cIndex = methodArray.indexOf("sx");
				} else if (index == methodArray.indexOf("xa")) {
					url = jsclient.remoteCfg.play2Url;
					cIndex = methodArray.indexOf("xa");
				} else if(index == methodArray.indexOf("bj")) {
					url = jsclient.remoteCfg.play3Url;
					cIndex = methodArray.indexOf("bj");
				} else if (index == methodArray.indexOf("yl")) {
					url = jsclient.remoteCfg.play4Url;
					cIndex = methodArray.indexOf("yl");
				} else if (index == methodArray.indexOf("hs")) {
					url = jsclient.remoteCfg.play5Url;
					cIndex = methodArray.indexOf("hs");
				}
				
				webView = new ccui.WebView(url);
				webView.name="webView";
				webView.setContentSize(cSize.width*0.95*bkNode.scaleX,cSize.height*0.95*bkNode.scaleY);
				webView.setPosition(bkNode.x,bkNode.y);

				webView.color=cc.color(254,231,197);
				webView.setScalesPageToFit(true);
				node.getParent().addChild(webView);
				webView.setEventListener(ccui.WebView.EventType.LOADED,function(){
					webView.visible=true;
				});
				webView.visible=false;
			}
		}
		else
		{
			cc.log("== 不应该走这个，走这个说明没有获取到对应的webView =="+JSON.stringify(node.getParent().getChildren()));
		}
	}

	WebViewLayer=cc.Layer.extend({
	jsBind:{
		_event:{
			deepshareJoinGame:function(){
				webViewLayer.removeFromParent(true);
			}
		},
		block:
		{
			_layout:[[1,1],[0.5,0.5],[0,0],true],
		},
		back:{
			_layout:[[0.9,0.8],[0.5,0.45],[0,0],2],

		},
		back_method:{
			_layout:[[0.715, 0.8],[0.592, 0.45],[0,0],2],
			_run:function () {
				this.visible = false;
			}
		}
		   
			
			,yes:
			{	
			    _layout:[[0,0.1],[0,1],[1,-0.6]],
			    _click:function()
				{
					webViewLayer.removeFromParent(true);
				}
			},
			info:{
				_visible:function(){
					return false;
					//return uiPara.help;
				}
			    ,_layout:[[0,0.1],[1,1],[-0.8,-0.5]]
				
				 , _click:function(node){
					 if(webView) webView.loadURL(jsclient.remoteCfg.infoUrl);
					  node.getParent().getChildByName("play").loadTexture("res/setting/playMeth1.png");
					  node.loadTexture("res/setting/callbtn2.png");
				  }	
				
			},
			play:{
				_visible:function(){
					return false;
					//return uiPara.help;
				}
				,_layout:[[0,0.1],[1,1],[-2,-0.5]]
				 , _click:function(node){
					 if(webView) webView.loadURL(jsclient.remoteCfg.helpUrl);
					 node.loadTexture("res/setting/playMeth2.png");
					 node.getParent().getChildByName("info").loadTexture("res/setting/callbtn.png");
				  }	
				
			},
			splite:{
				_layout:[[0.003, 0.797],[0.235, 0.442],[0,0]]
				,_run:function () {
					this.visible = uiPara.help;
				}
			},
			sx:{
				_layout:[[0.162,0.092],[0.153,0.758],[0,0]]
				,_run:function () {
					this.loadTextureNormal(methodChosenTexArray[methodArray.indexOf("sx")]);
					this.visible = uiPara.help;
				}
				,_click:function (node, type) {
					resetMethodBtnTexture(node, methodArray.indexOf("sx"));
					changeWebviewContent(methodArray.indexOf("sx"),node);
				}
			},
			xa:{
				_layout:[[0.162,0.092],[0.153,0.658],[0,0]]
				,_run:function () {
					this.visible = uiPara.help;
					this.loadTextureNormal(methodUnChosenTexArray[methodArray.indexOf("xa")]);
					this.visible=false;
				}
				,_click:function (node,type) {
					resetMethodBtnTexture(node, methodArray.indexOf("xa"));
					changeWebviewContent(methodArray.indexOf("xa"),node);
				}
			},
			bj:{
				_layout:[[0.162,0.092],[0.153,0.558],[0,0]]
				,_run:function () {
					this.visible = uiPara.help;
					this.loadTextureNormal(methodUnChosenTexArray[methodArray.indexOf("bj")]);
					this.visible=false;
				}
				,_click:function (node,type) {
					resetMethodBtnTexture(node, methodArray.indexOf("bj"));
					changeWebviewContent(methodArray.indexOf("bj"),node);
				}
			},
			yl:{
				_layout:[[0.162,0.092],[0.153,0.458],[0,0]]
				,_run:function () {
					this.visible = uiPara.help;
					this.loadTextureNormal(methodUnChosenTexArray[methodArray.indexOf("yl")]);
					this.visible=false;
				}
				,_click:function (node,type) {
					resetMethodBtnTexture(node, methodArray.indexOf("yl"));
					changeWebviewContent(methodArray.indexOf("yl"),node);
				}
			},
			hs:{
				_layout:[[0.162,0.092],[0.153,0.658],[0,0]]
				,_run:function () {
					this.visible = uiPara.help;
					this.loadTextureNormal(methodUnChosenTexArray[methodArray.indexOf("hs")]);
				}
				,_click:function (node,type) {
					resetMethodBtnTexture(node, methodArray.indexOf("hs"));
					changeWebviewContent(methodArray.indexOf("hs"),node);
				}
			}
	},
    ctor:function () {
        this._super();
		  var web = ccs.load("res/WebView.json");
		  uiPara=jsclient.uiPara;
		  ConnectUI2Logic(web.node,this.jsBind);
		 cc.log("== ctor == update ");
		  if(ccui.WebView)
		  {
			  cc.log("== ccui.webview ==")
			  var bkNode;
			  if (!uiPara.help)
			  {
				  bkNode=this.jsBind.back._node;
			  }else
			  {
				  bkNode=this.jsBind.back_method._node;
			  }
			  var cSize=bkNode.getCustomSize();
			  var screen=jsclient.size;
			  webView = new ccui.WebView(uiPara.url);
			  webView.name="webView";
			  webView.setContentSize(cSize.width*0.95*bkNode.scaleX,cSize.height*0.95*bkNode.scaleY);
			  webView.setPosition(bkNode.x,bkNode.y);

			  webView.color=cc.color(254,231,197);
			  webView.setScalesPageToFit(true);
			  web.node.addChild(webView);
			  cc.log("web.node ");
			  webView.setEventListener(ccui.WebView.EventType.LOADED,function(){
				  webView.visible=true;
			  });
			  webView.visible=false;
    	  }else
		  {
			  cc.log("== aooooo ==");
		  }
		  this.addChild(web.node);
		  webViewLayer=this;
	}	
		
		
	 });
	
})();

var playLogIfoArry = [];
var playLogInfoItem = {};
var logMsg = [];
(function () {

    var playLogView, uiItem, uiList, msgCount, delay, update_tData;

    function BindLogItem(ui, item, num) {

        var bind = {
			time:{
				_text:function(){  return item.now }
			},
			tableid:{
				_text:function(){  return "房间ID:"+item.tableid }
			},
			player0:{
				_text:function(){  return unescape(item.players[0].nickname)+":"+item.players[0].winall; }
			},
			player1:{
				_text:function(){  return unescape(item.players[1].nickname)+":"+item.players[1].winall; }
			},
			player2:{
				_text:function(){  return unescape(item.players[2].nickname)+":"+item.players[2].winall; }
			},
			player3:{
				_text:function(){
					if(item.players.length > 3)
						return unescape(item.players[3].nickname)+":"+item.players[3].winall;
					else
						return unescape("");
				}
			}
            , num: {
                _text: function () {
                    // return num + "";
					return xIndex +"";
                }
            },

			_click:function()
			{
				console.log("点击item---------------------------");

				///zys -- 屏蔽点击回放item -- 当需要的时候，解除
				jsclient.getPlayLogOne(item);
				playLogInfoItem =item;
			}
        }
        ConnectUI2Logic(ui, bind);
    }

    function isUndefined(obj) {
        return obj === void 0;
    }

	///战斗回放索引，
	//
	// 为了解决，重复log的问题
	var xIndex = 0;
    PlayLogLayer = cc.Layer.extend({
        jsBind: {
            block: {
                _layout: [[1, 1], [0.5, 0.5], [0, 0], true],
            }
            , yes: {
                _layout: [[0, 0.1], [0, 1], [1, -0.6]]
                , _click: function () {
                    playLogView.removeFromParent(true);
                    if(jsclient.data.sData){
                        delete jsclient.data.sData;
                    }
                }
            },
            play: {_layout: [[0, 0.06], [0.5, 1], [0, -0.8]]},
            item: {
                _layout: [ [0.7,0],[0.5,0.5],[0,0] ]//[[0.7, 0], [0.5, 0.5], [0, 0]]
                , _visible: false
                , _run: function () {
                    uiItem = this;
                    uiItem.opacity = 0;
                }, _event: {
                    playLogOne: function (msg) {
						console.log("接收playLogOne----------------------事件");
						playLogIfoArry = [];
                        var arry = [];
                        arry[0] = [];
                        var j = 0;

                        for (var i = 0; i < msg.length; i++) {

                            arry[j].push(msg[i]);
                            if (msg[i] == "roundEnd") {

                                arry[j].push(msg[i + 1]);
                                playLogIfoArry.push(arry[j]);
                                i++;
                                j++;
                                arry[j] = [];
                                arry[j].push(msg[0]);
                                arry[j].push(msg[1]);
                            } else if (i == msg.length - 1) {
                                playLogIfoArry.push(arry[j]);
                            }
                        }
                        if (msg) {
                            jsclient.Scene.addChild(new playLogInfoLayer());
                        }
                    }
					
				}
			},
		back:{
			_layout:[[0.95,0.80],[0.5,0.45],[0,0],2],
			

                list: {
                    _run: function () {
                        uiList = this;
                    }
                },
                _event: {
                    playLog: function () {

						var log = jsclient.data.playLog;
						console.log("----------------接受 【playLog】 事件------------------- " + JSON.stringify(log));

                        uiList.removeAllItems();
						xIndex = 0;
                        var num = log.logs.length;
                        for (var i = 0; i < log.logs.length; i++) {
                            var item = uiItem.clone();
                            item.visible = true;
                            item.scale = uiList.width / item.width * 0.75;
							if(i%2==0){
								xIndex++;
								uiList.insertCustomItem(item, 0);
							}


                            BindLogItem(item, log.logs[i], num - i);

                        }
                    }
                }
            }
        },
        ctor: function () {
            this._super();
            var web = ccs.load("res/PlayLog.json");
            ConnectUI2Logic(web.node, this.jsBind);

			///zys-add 获取对战信息 time 2016.11.1
			jsclient.getPlayLog();//每次获取新数据

            //var playLog = jsclient.data.playLog;
            //if (!playLog) jsclient.getPlayLog();
            //else {
            //    this.jsBind.back._event.playLog();
            //}
            this.addChild(web.node);
            playLogView = this;
        }
    });
})();

var plmjhand1 = [];
var plmjhand2 = [];
var plmjhand3 = [];
var arrPushReplayMessage = [];
var hasHuPlayers = {};
var updatelayer_itme_node;
var delayOffset = 1;
/**************************/
//回放 replay con
(function () {
    var playLogInfoView, uiItem, uiList, msgCount, delay, update_tData, players;
    function BindLogItem(ui, item, num) {
        for (var i = 0; i < playLogIfoArry[num - 1].length; i++) {
            if (playLogIfoArry[num - 1][i] == "players") {
                for (var id in playLogIfoArry[num - 1][i + 1]) {
                    for (var j = 0; j < 4; j++) {
                        if (item.players[j].nickname
                            == playLogIfoArry[num - 1][i + 1][id]["info"]["nickname"]) {
                            item.players[j].uid = id;
                        }
                    }
                }
            } else if (playLogIfoArry[num - 1][i] == "roundEnd") {
                for (var j = 0; j < 4; j++) {
                    var _uid = item.players[j].uid;
                    item.players[j].winone
                        = playLogIfoArry[num - 1][i + 1]["players"][_uid].winone;
                }
            }
        }

        var bind = {
            time: {
                _text: function () {
                    return item.now
                }
            },
            tableid: {
                _text: function () {
                    return "房间ID:" + item.tableid
                }
            },
            player0: {
                _text: function () {
                    return unescape(item.players[0].nickname) +"(ID:"+item.players[0].uid +")"+":" + item.players[0].winone;
                }
            },
            player1: {
                _text: function () {
                    return unescape(item.players[1].nickname) + "(ID:"+item.players[1].uid +")"+":" + item.players[1].winone;
                }
            },
            player2: {
                _text: function () {
                    return unescape(item.players[2].nickname) +"(ID:"+item.players[2].uid +")"+ ":" + item.players[2].winone;
                }
            },
            player3: {
                _text: function () {
                    return unescape(item.players[3].nickname) +"(ID:"+item.players[3].uid +")"+ ":" + item.players[3].winone;
                }
            }
            , num: {
                _text: function () {
                    return num + "";
					// return xIndex +"";
                }
            },
            replay: {
                _click: function () {
                    //initReplayLayer();
					cc.log("-------------------点击回放item---------------------");
                    createReplayLayer(playLogIfoArry[num - 1]);
                }
            }
        }
        ConnectUI2Logic(ui, bind);
    }

    function initReplayLayer() {
        if(jsclient.data.sData){
            delete jsclient.data.sData;
        }
    }

    // var count = 0;
    function createReplayLayer(msg) {

		//zys 注释
        //logMsg = JSON.parse(JSON.stringify(msg));
        //// jsb.fileUtils.writeStringToFile(JSON.stringify(msg), jsb.fileUtils.getWritablePath() + "test" + count + ".json");
        //for (var i = 0; i < logMsg.length; i++) {
        //    if (logMsg[i] == "players") {
        //        var array = [];
        //        var object = {};
        //        object[logMsg[i]] = logMsg[i + 1];
        //        object["tData"] = logMsg[i + 4];
        //        array[0] = "reinitSceneData";
        //        array[1] = object;
        //        sendEvent("QueueNetMsg", array);
        //    }
        //}

        // count++;

		///zys add
		logMsg = JSON.parse(JSON.stringify(msg));

		var arry = [];
		var object = {};
		for (var i = 0; i < logMsg.length; i++) {
			if (logMsg[i] == "players") {
				object[logMsg[i]] = logMsg[i+1];
				arry[0] = "reinitSceneData";
			}
			if(logMsg[i] == "mjhand"){
				object["tData"] = logMsg[i+2];
				hand = logMsg[i+1];
				arry[1] = object;
				sendEvent("QueueNetMsg",arry);
			}
		}
    }

    //TODO:pop replay message

    function popReplayMJChangeHand(msgCount)
    {
        var array = [];
        array[0] = "re"+logMsg[msgCount];
        array[1] = logMsg[msgCount+1];
        sendEvent("QueueNetMsg", array);
    } 
    function popReplaymjhand(msgCount) {
        plmjhand1 = [];
        plmjhand2 = [];
        plmjhand3 = [];
        var array = [];
        var object = {};
        object["tData"] = logMsg[msgCount + 2];
        var mjhand = [];
        var tData = logMsg[msgCount + 2];
        var selfIndex = tData.uids.indexOf(SelfUid());
        var zhuangIndex = tData.zhuang;
        for (var j = 0; j < 4; j++) {
            var cardOff = (selfIndex + j + 4 - zhuangIndex) % 4;
            if (j == 0) {
                for (var z = 0; z < 13; z++) {
                    mjhand.push(logMsg[msgCount + 1][z + cardOff * 13]);
                }
                array[0] = "mjhand";
                array[1] = object;
                array[2] = true;
                object[logMsg[msgCount]] = mjhand;
                sendEvent("QueueNetMsg", array);
            } else if (j == 1) {
                for (var z = 0; z < 13; z++) {
                    plmjhand1.push(logMsg[msgCount + 1][z + cardOff * 13]);
                }
            } else if (j == 2) {
                for (var z = 0; z < 13; z++) {
                    plmjhand2.push(logMsg[msgCount + 1][z + cardOff * 13]);
                }
            } else if (j == 3) {
                for (var z = 0; z < 13; z++) {
                    plmjhand3.push(logMsg[msgCount + 1][z + cardOff * 13]);
                }
            }
        }
    }
    //TODO:pop replay new Card
    function popReplaynewCard(msgCount) {
        var array = [];
        array[0] = logMsg[msgCount];
        array[1] = logMsg[3][logMsg[msgCount + 1].cardNext - 1];
        jsclient.data.sData.tData = logMsg[msgCount + 1];
        sendEvent("QueueNetMsg", array);
    }

    //TODO:pop replay MJMiss
    function popReplayMJMiss(msgCount) {
        var array = [];
        array[0] = logMsg[msgCount];
        array[1] = logMsg[msgCount + 1];
        sendEvent("QueueNetMsg", array);
    }
    
    //TODO:pop replay MJPut
    function popReplayMJPut(msgCount) {
        var array = [];
        var object = logMsg[msgCount + 1];
        array[0] = logMsg[msgCount];
        array[1] = object;
        update_tData = object;

        if (logMsg[msgCount + 1]["uid"] == SelfUid()) {
            var putcardParent = jsclient.replayui.jsBind.down._node;
            HandleMJPut(putcardParent, {uid: SelfUid(), card: logMsg[msgCount + 1]["card"]}, 0);
            sendEvent("QueueNetMsg", array);
        } else {
            sendEvent("QueueNetMsg", array);
        }
    }

    //TODO:pop replay waitPut
    function popReplaywaitPut(msgCount) {
        var array = [];
        var object = jsclient.data.sData.tData;
        array[0] = "waitPut";
        array[1] = object;
        sendEvent("QueueNetMsg", array);
    }

    //TODO:pop replay MJPeng
    function popReplayMJPeng(msgCount) {
        var array = [];
        var object = logMsg[msgCount + 1];
        array[0] = logMsg[msgCount];
        array[1] = object;
        sendEvent("QueueNetMsg", array);

        var tData = logMsg[msgCount + 1].tData;
        var curuid = tData.uids[tData.curPlayer];
        var ed = {};
        for (var i = 0; i < 4; i++) {
            var pl = getUIPlayer(i);
            if (curuid == pl.info.uid) {
                ed.off = i;
                ed.eatWhat = "peng";
                ed.lastCard = logMsg[msgCount + 1].tData.lastPut;
                sendEvent("showcaneat",ed);
            }
        }
    }

    //TODO:pop replay MJGang
    function popReplayMJGang(msgCount) {
        var array = [];
        var object = logMsg[msgCount + 1];
        array[0] = logMsg[msgCount];
        array[1] = object;
        sendEvent("QueueNetMsg", array);

        var ed = {};
        for (var i = 0; i < 4; i++) {
            var pl = getUIPlayer(i);
            if (logMsg[msgCount + 1].uid == pl.info.uid) {
                ed.off = i;
                ed.eatWhat = "gang0";
                ed.lastCard = logMsg[msgCount + 1].card;
                sendEvent("showcaneat",ed);
            }
        }
    }

    //TODO:pop replay MJChi
    function popReplayMJChi(msgCount) {
        var array = [];
        var object = logMsg[msgCount + 1];
        array[0] = logMsg[msgCount];
        array[1] = object;
        sendEvent("QueueNetMsg", array);

        var tData = logMsg[msgCount + 1].tData;
        var curuid = tData.uids[tData.curPlayer];
        var ed = {};
        for (var i = 0; i < 4; i++) {
            var pl = getUIPlayer(i);
            if (curuid == pl.info.uid) {
                ed.off = i;
                ed.eatWhat = "chi0";
                ed.lastCard = logMsg[msgCount + 1].tData.lastPut;
                sendEvent("showcaneat",ed);
            }
        }
    }
    //TODO:pop replay MJHu
    function popReplayMJHu(msgCount) {
        var array = [];
        var object = logMsg[msgCount + 1];
        array[0] = logMsg[msgCount];
        array[1] = object;
        sendEvent("QueueNetMsg", array);

        var winId = Object.keys(logMsg[msgCount + 1].wins)[0];
        var ed = {};
        for (var i = 0; i < 4; i++) {
            var pl = getUIPlayer(i);
            if (winId == pl.info.uid) {
                ed.off = i;
                ed.eatWhat = "hu" + i;
                ed.lastCard = logMsg[msgCount + 1].wins[winId].lastCard;
                sendEvent("showcaneat",ed);
            }
        }
    }

    //TODO:pop replay roundEnd
    function popReplayroundEnd(msgCount) {
        return ;
        // var players = logMsg[msgCount + 1].players;
        // var ed = {};
        // var uid = -1;
        // for (var i in players) {
        //     if (players[i].winType > 0
        //         && _.isUndefined(hasHuPlayers[i])) {
        //         uid = i;
        //     }
        // }
        // for (var i = 0; i < 4; i++) {
        //     var pl = getUIPlayer(i);
        //     if (uid == pl.info.uid) {
        //         ed.off = i;
        //         ed.eatWhat = "hu" + i;
        //         hasHuPlayers[uid] = i;
        //         sendEvent("showcaneat",ed);
        //     }
        //     cc.log("replay end player " + (i + 1) + ":" + JSON.stringify(pl));
        // }
    }

    //TODO:init replay all message
    function initReplayerMessageData() {
        arrPushReplayMessage = [];
        hasHuPlayers = {};
        for(var i = 0;i < logMsg.length;i++){
            if ( cc.isString(logMsg[i])) {
                if (logMsg[i] == "MJPut" || logMsg[i] == "roundEnd") {
                    arrPushReplayMessage.push({index: -1, msg: "waitPut"});
                }
                arrPushReplayMessage.push({index: i, msg: logMsg[i]});
            }
        }
        arrPushReplayMessage = arrPushReplayMessage.reverse();
    }

    function replayController(node) {
        initReplayerMessageData();
        var delay = 0.5;
        var callback = function (dt) {
            var obj = arrPushReplayMessage.pop();
            var index = obj.index;
            var msg = obj.msg;
            if(msg == "players"){
                return ;
            }
            var func = eval("popReplay" + msg);
            if(func){
                func(index);
            }
            //empty
            if(arrPushReplayMessage.length == 0){
                updatelayer_itme_node.unscheduleAllCallbacks();
            }
            cc.log("replay controller : " + arrPushReplayMessage.length);
        }.bind(node);

	  node.schedule(callback,delay);
	  // node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(delay),cc.callFunc(callback))));
  }

    playLogInfoLayer = cc.Layer.extend({
        //jsBind: {
        //    block: {
        //        _layout: [[1, 1], [0.5, 0.5], [0, 0], true],
        //    }
        //    , yes: {
        //        _layout: [[0, 0.1], [0, 1], [1, -0.6]]
        //        , _click: function () {
			//		console.log("close----------------------");
			//		playLogInfoView.removeFromParent(true);
        //            playLogIfoArry = [];
        //        }
        //    },
        //    play: {_layout: [[0, 0.06], [0.5, 1], [0, -0.8]]},
        //    item: {
        //        _layout: [[0.7, 0], [0.5, 0.5], [0, 0]]
        //        , _visible: false
        //        , _run: function () {
        //            uiItem = this;
        //            uiItem.opacity = 0;
        //        }, _event: {
        //            reinitSceneData: function () {
        //                updatelayer_itme_node = this;
        //                replayController(this);
        //            }
        //        }
        //    },
        //    back: {
        //        _layout: [[0.95, 0.80], [0.5, 0.45], [0, 0], 2],
        //        list: {
        //            _run: function () {
        //                uiList = this;
        //            }
        //        },
        //        _event: {
        //            playLog: function () {
        //                uiList.removeAllItems();
        //                for (var i = 0; i < playLogIfoArry.length; i++) {
        //                    var item = uiItem.clone();
        //                    item.visible = true;
        //                    item.scale = uiList.width / item.width * 0.9;
        //                    uiList.insertCustomItem(item, 0);
        //                    BindLogItem(item, playLogInfoItem, i + 1);
        //
        //                }
        //            }
        //        }
        //    }
        //},

		jsBind:{
			block:
			{
				_layout:[[1,1],[0.5,0.5],[0,0],true],
			},
			item:{
				// _layout:[ [0.7,0],[0.5,0.5],[0,0] ]
				_visible:false
				,_run:function()
				{
					uiItem=this;
					uiItem.opacity=0;
				},_event:{
					reinitSceneData:function()
					{
						updatelayer_itme_node = this;
						replayController(this);
					},MJPut:function()
					{
						var arry = [];
						var object = {};
						arry[0] = "waitPut";
						object =jsclient.data.sData.tData ;
						arry[1] =object;
						var btnReplay=this.getChildByName("replay");
						var callback =function(){sendEvent("QueueNetMsg",arry);};
						btnReplay.runAction(cc.sequence(cc.delayTime(0.5),cc.callFunc(callback)));


					}
				}

			},
			back:{
				_layout:[[1,0.95],[0.5,0.5],[0,0],2],


				list:{
					_run:function(){uiList=this;

					}
				},
				yes: {
					// _layout:[[0,0.1],[0,1],[1,-0.6]]
					_click:function()
					{

						console.log("playLogInfoView---close----------------------");
						playLogInfoView.removeFromParent(true);
						playLogIfoArry = [];
					}
				},
				play:{
					// _layout:[[0,0.06],[0.5,1],[0,-0.8]]
				},
				_event:
				{
					playLog:function()
					{

						uiList.removeAllItems();

						for(var i=0;i<playLogIfoArry.length;i++)
						{
							var item=uiItem.clone();
							item.visible=true;
							item.scale=uiList.width/item.width*0.9;
							uiList.insertCustomItem(item,0);
							BindLogItem(item,playLogInfoItem,i+1);

						}
					}
				}
			}
		},
        ctor: function () {
            this._super();
            var web = ccs.load("res/PlayLogInfo.json");
            ConnectUI2Logic(web.node, this.jsBind);
            var playLog = jsclient.data.playLog;
            if (!playLog) jsclient.getPlayLog();
            else {
                this.jsBind.back._event.playLog();
            }
            this.addChild(web.node);
            playLogInfoView = this;
        }
    });
})();


