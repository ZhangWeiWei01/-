var BlockLayer = cc.Layer.extend({
    sprite:null,
	jsBind:{
		loading:{
			_layout:[[0.2,0.2],[0.5,0.5],[0,0]]	,
			_run:function() {
				this.runAction(cc.repeatForever(cc.rotateBy(2,-360)));
			}
		},
		block:{
			_layout:[[1,1],[0.5,0.5],[0,0],true]
		}
	},
    ctor:function () {
        this._super();
        var blockui = ccs.load(res.Block_json);
		ConnectUI2Logic(blockui.node,this.jsBind);
        this.addChild(blockui.node);
		jsclient.blockui=this;
        return true;
    }
	,onEnter:function ()
	{
        this._super();
		jsclient.block=function()
		{
			jsclient.blockui.zIndex=1000;
		}
		jsclient.unblock=function()
		{
			jsclient.blockui.zIndex=-1000;
		}
		jsclient.unblock();
	}
});

jsclient.loadWxHead=function(uid,url)
{
	if(!url) url="res/png/default_headpic.png";
	if(uid&&url) cc.loader.loadImg(url, {isCrossOrigin : true}, function(err, texture)
    {
        if(!err&&texture)
		{
			sendEvent( "QueueNetMsg",["loadWxHead",{uid:uid,img:texture}]);
		}
	});

}

var deepShareID = "569f065e87c5822";
jsclient.getWXDeepShareUrl = function(obj,cb,err) {
	var xhr = cc.loader.getXMLHttpRequest();
	xhr.open("POST","https://fds.so/v2/url/" + deepShareID);
	xhr.onreadystatechange = function () {
		if(xhr.readyState == 4 && xhr.status == 200) {
			var obj = JSON.parse(xhr.responseText);
			cb(obj.url);
		}
	};
	xhr.onerror = function () {
		err();
	};
	xhr.send(JSON.stringify({
		inapp_data:obj
	}));
}

jsclient.showShareExplainedByUrl = function (url) {
	var tData = jsclient.data.sData.tData;
	if (tData.playType==PlayType.sxMethod) {
		jsclient.native.wxShareUrl(url, "招脚打麻将",
			"房间号:" + tData.tableid + ",推倒胡," + tData.roundNum + "局,"
			+ (tData.canEatHu ? "点炮胡," : "自摸胡,")
			+ (tData.withZhong?"红中赖子,":"")
			+ (tData.canHu7?"带七对,":"")
			+ (tData.canHuWith258?"二五八做将,":"")
			+ "速度加入【优游宁夏麻将】"
		);
	}
	else if(tData.playType==PlayType.xaMethod) {
		jsclient.native.wxShareUrl(url, "招脚打麻将",
			"房间号:" + tData.tableid + ",西安麻将," + tData.roundNum + "局,"
			+ (tData.withPao ? "带下炮," : "不带下炮,")
			+ "速度加入【优游宁夏麻将】"
		);
	}else if(tData.playType==PlayType.bjMethod) {
		jsclient.native.wxShareUrl(url, "招脚打麻将",
			"房间号:" + tData.tableid + ",宝鸡麻将," + tData.roundNum + "局,"
			+ (tData.withPao ? "带下炮," : "不带下炮,")
			+ "大胡," + "速度加入【优游宁夏麻将】"
		);
	} else if (tData.playType==PlayType.ylMethod) {
		jsclient.native.wxShareUrl(url, "招脚打麻将",
			"房间号:" + tData.tableid + ",榆林麻将," + tData.roundNum + "局,"
			+ "按点算分," + "速度加入【优游宁夏麻将】"
		);
	} else if (tData.playType==PlayType.hsMethod) {
		if(tData.fishNum ==2 || tData.fishNum == 5 ||tData.fishNum ==8){

		}else{
			tData.fishNum = false;
		}
		jsclient.native.wxShareUrl(url, "招脚打麻将",
			"房间号:" + tData.tableid + ",滑水麻将," + tData.roundNum + "局,"
			+ (tData.canHu7?"带七对,":"")
			+ (tData.withZhong?"红中赖子,":"")
			+ (tData.withWind?"带风牌,":"")
			+ (tData.withSixCards?"甩六张,":"")
			+ (tData.fishNum?"下"+tData.fishNum+"鱼，":"")
			+ "速度加入【优游宁夏麻将】"
		);
	}
}

function stopEffect(id)
{
	cc.audioEngine.stopEffect(id);
}

function playEffect(sd)
{
	mylog(sd);
	return cc.audioEngine.playEffect("res/sound/"+sd+".mp3",false);
}
function playMusic(sd)
{
	cc.audioEngine.stopMusic();
	cc.audioEngine.playMusic("res/sound/"+sd+".mp3",true);
}

jsclient.showPlayerInfo=function(info)
{
	jsclient.uiPara=info;
	jsclient.Scene.addChild(new UserInfoLayer());
}
jsclient.restartGame=function()
{
	if(jsclient.gamenet)jsclient.gamenet.disconnect();
	sendEvent("restartGame");
}
jsclient.leaveGame=function(cb) {
	jsclient.block();
  	jsclient.gamenet.request("pkplayer.handler.LeaveGame",{},function(rtn){
		if(rtn.result==0) {
			jsclient.data.vipTable = 0;
			delete jsclient.data.sData;
			mylog("+++leave game2?+++");
			sendEvent("LeaveGame");
		}
		jsclient.unblock();
		if(cb){
			cb(rtn.result);
		}
	});
}

///////////////////////////////////////////////----------------------zhangyisong  注释 ---


//jsclient.getPlayLogOne=function(now,logid)
//{
//	jsclient.block();
//	console.log("发送：pkcon.handler.getSymjLog-------------------------------------");
//	jsclient.gamenet.request("pkcon.handler.getSymjLog",{now:now,logid:logid},function(rtn){
//		jsclient.unblock();
//		if(rtn.result==0) {
//			console.log("抛出 ：playLogOne event------------------------------ ");
//			sendEvent("playLogOne",rtn.data);
//		}
//	});
//}


jsclient.getPlayLogOne=function(item)
{
	if(item.ip)
	{

		// zhangying 这里不需要gametype的判断，gametype是枚举类型，表示：HANG_ZHOU，NING_BO 等
		//jsclient.rePlayVideo = item.gametype;
		//console.log("item.gametype-------------------------------------",item.gametype);
		//switch (item.gametype)
		//{
		//	case 0:
		//		jsclient.rePlayVideo = jsclient.GAME_TYPE.HANG_ZHOU;
		//		break;
		//	case 1:
		//		jsclient.rePlayVideo = jsclient.GAME_TYPE.NING_BO;
		//		break;
		//	case 2:
		//		jsclient.rePlayVideo = jsclient.GAME_TYPE.WEN_ZHOU;
		//		break;
		//	case 3:
		//		jsclient.rePlayVideo = jsclient.GAME_TYPE.TAI_ZHOU;
		//		break;
		//	default:
		//		jsclient.rePlayVideo = jsclient.GAME_TYPE.HANG_ZHOU;
		//		break;
		//}

		console.log("http 请求log 数据---------------------------------------");
		jsclient.block();
		var xhr = cc.loader.getXMLHttpRequest();
		var playUrl="http://"+item.ip+":800/playlog/"+item.now.substr(0,10)+"/"+item.owner+"_"+item.tableid+".json";
		xhr.open("GET", playUrl);
		xhr.onreadystatechange = function () {
			jsclient.unblock();
			if (xhr.readyState == 4 && xhr.status == 200) {
				sendEvent("playLogOne",JSON.parse(xhr.responseText));
			}
		};
		xhr.onerror = function (event) {jsclient.unblock(); };
		xhr.send();
	}
	else
	{
		var now=item.now; var logid=item.logid;
		jsclient.block();
		jsclient.gamenet.request("pkplayer.handler.getSymjLog",{now:now,logid:logid},function(rtn){
			jsclient.unblock();
			if(rtn.result==0)
			{
				sendEvent("playLogOne",rtn.data["mjlog"]);
			}
		});
	}

}


///////////////////////////////////////////////////////////////////////////////////////////////////


jsclient.getPlayLog=function() {
	//console.log("getPlayLog 2222")
	jsclient.gamenet.request("pkplayer.handler.getSymjLog",{uid:SelfUid()},function(rtn){
	//	console.log(rtn.result);
		if(rtn.result==0) {
			//console.log(rtn.result);
			console.log("对战信息 --------------------= ",rtn.playLog);
			jsclient.data.playLog=rtn.playLog;
			sendEvent("playLog");
		}
	});
}
jsclient.logout=function()
{
	jsclient.block();
  	jsclient.gamenet.request("pkcon.handler.logout",{},function(){
		sys.localStorage.removeItem("WX_USER_LOGIN");
		sys.localStorage.removeItem("loginData");

		sendEvent("logout");
		jsclient.unblock();
	});
}
jsclient.joinGame=function(tableid)
{
	jsclient.block();


	var joinPara={roomid:"symj1"};
	if(tableid) joinPara.tableid=tableid;
	else  joinPara.roomid="symj2";

	jsclient.gamenet.request("pkplayer.handler.JoinGame",joinPara,
	function(rtn)
	{
		mylog("joinGame "+rtn.result);

		if(rtn.result!=0)
		{
			jsclient.unblock();
			if(rtn.result==ZJHCode.roomFull) jsclient.showMsg("房间已经满");
			if(rtn.result==ZJHCode.roomNotFound) jsclient.showMsg("房间不存在");
		}
		if(rtn.result == 0){
			cc.log("join Game result tableid : " + tableid);
			jsclient.data.vipTable = tableid;
		}
	});
}
jsclient.createRoom=function(round, canEatHu,
							 withWind,withSixCards, canEat,
							 noBigWin, canHu7,
							 canHuWith258, withZhong,
							 nPlayType, withPao,fishNum)
{
	jsclient.block();
	console.log("---wei---fishNum = "+fishNum);
	if(noBigWin)
	{
		//withWind=false;
		canEat=false;
	}
	else
	{
		canEatHu=false;
		canHu7 = true;
		canHuWith258 = false;
		withZhong = false;
	}
	// cc.log("=== 创建房间 nPlayType: " + nPlayType);
	var createPara={round:round,canEatHu:canEatHu,withWind:withWind,withSixCards:withSixCards,canEat:canEat,noBigWin:noBigWin,canHu7:canHu7,canHuWith258:canHuWith258,withZhong:withZhong, nPlayType:nPlayType, withPao:withPao,fishNum:fishNum};
	//是否金币场
	console.log("...JJ... createPara:" + JSON.stringify(createPara));
	createPara.coinRoomCreate=jsclient.coinRoomCreate;
	// if(jsclient.remoteCfg.httpLogin)
	// {
	// 	jsclient.postJson(createPara,"CreateVipTable",function(rtn)
	// 	{
	// 		if(rtn&&rtn.result==0)
	// 		{
	// 		   jsclient.data.vipTable=rtn.vipTable;
	// 		   jsclient.joinGame(rtn.vipTable);
	// 		}
	// 		else jsclient.unblock();
	// 	},null,true);
	// }
	// else
	// {
		jsclient.gamenet.request("pkplayer.handler.CreateVipTable",createPara,
		function(rtn)
		{
		   jsclient.unblock();
		   if(rtn.result==0)
		   {
			   jsclient.data.vipTable=rtn.vipTable;
			   jsclient.joinGame(rtn.vipTable);
		   }
		});
	//}
}
jsclient.tickGame=function(tickType){
	return ;
	if(jsclient.lastMJTick>0)
	{
		if(jsclient.lastMJTick<Date.now()-15000)
		{
		   jsclient.lastMJTick=-1;
		   jsclient.showMsg("网络连接断开("+20+")，请检查网络设置，重新连接",function(){ jsclient.restartGame(); })
		}
		else
		{
	       jsclient.gamenet.request("pkroom.handler.tableMsg",{cmd:"MJTick",tickType:tickType});
		}
	}
}
jsclient.tickServer=function()
{
	if(jsclient.gamenet)
		jsclient.gamenet.request("pkcon.handler.tickServer",{},function(rtn){
			mylog("tick");
		});
}
jsclient.deepshareJoinGame = function () {
	if(!jsclient.deepshare){
		return ;
	}
	var sData = jsclient.data.sData;
	var obj = jsclient.deepshare;
	if(parseInt(jsclient.data.vipTable) == parseInt(obj.vipTable)){
		return ;
	}
	if(!sData || Object.keys(sData.players).length < 4){
		if(IsRoomOwner()){
			jsclient.showMsg("你已经创建了房间，需解散当前房间才可以加入新房间");
			return ;
		}
		jsclient.showMsg("你将加入房间：" + obj.vipTable + " 开始游戏",function () {
			//del layer
			sendEvent("deepshareJoinGame");
			//join game
			if(sData){
				jsclient.leaveGame(function (result) {
					if(result == 0){
						jsclient.joinGame(obj.vipTable);
						if(jsclient.deepshare){
							delete jsclient.deepshare;
						}
					}
				});
			}
			else {
				jsclient.joinGame(obj.vipTable);
				if(jsclient.deepshare){
					delete jsclient.deepshare;
				}
			}
		},function () {
			if(jsclient.deepshare){
				delete jsclient.deepshare;
			}
		},"2");
	}
}
jsclient.changeIdLayer = function () {
	if(!ChangeIDLayer){return ;}
	if(!jsclient.changeidui){
		jsclient.Scene.addChild(new ChangeIDLayer());
	}
}
jsclient.exportDataLayer = function () {
	if(!ExportDataLayer) { return ;}
	if(!jsclient.exportdataui){
		jsclient.Scene.addChild(new ExportDataLayer());
	}
};
jsclient.openWeb=function(para){ sendEvent("openWeb",para); }
jsclient.showMsg=function(msg,yesfunc,nofunc,style){sendEvent("popUpMsg",{msg:msg,yes:yesfunc,no:nofunc,style:style || ""});}
function IsRoomOwner()
{
	var sData=jsclient.data.sData;
	if(sData)
	{
		return sData.tData.uids[0]==SelfUid();
	}
	return false;
}
jsclient.delRoom=function(yes)
{
	var sData=jsclient.data.sData;
	if(sData.tData.tState==TableState.waitJoin&&sData.tData.uids[0]!=SelfUid())
	  jsclient.leaveGame();
	else jsclient.gamenet.request("pkroom.handler.tableMsg",{cmd:"DelRoom",yes:yes});
}
jsclient.netCallBack={

	   loadWxHead:[0.01,function(d){}]
	   ,MJChat:[0,function(d){}]
   	   ,downAndPlayVoice:[0,function(d){}]
	   ,initSceneData:[0,function(d)
	   {
		   mylog("initSceneData");
		   jsclient.data.sData=d;
		   d.serverNow-=Date.now();
		   if(!jsclient.playui)  jsclient.Scene.addChild(new PlayLayer());
		   sendEvent("clearCardUI");
	   }]

		///zys add ,reinitSceneData
	   ,reinitSceneData: [0, function (d) {

			console.log("callback------reinitSceneData--------------------------------",jsclient.replayui);
			jsclient.data.sData = d;
			jsclient.majiang.init(jsclient.data.sData);
			d.serverNow -= Date.now();
			if (!jsclient.replayui)  jsclient.Scene.addChild(newReplayLayer());
			sendEvent("clearCardUI");
		}]

	  ,removePlayer:[0,function(d){
		  var sData=jsclient.data.sData;
		  delete sData.players[d.uid];
		  sData.tData=d.tData;
		  mylog(JSON.stringify(Object.keys(sData.players)));
	   }]
	  ,addPlayer:[0,function(d){
		  var sData=jsclient.data.sData;
		  sData.players[d.player.info.uid]=d.player;
		  sData.tData=d.tData;
	  }]
	  ,updateInfo:[0,function(info)
	  {
		  var pinfo=jsclient.data.pinfo;
		  for(var pty in info) pinfo[pty]=info[pty];
	  }]
	  ,moveHead:[1,function(){}]
	  ,mjhand:[0,function(d)
	  {
		  sendEvent("clearCardUI");
		  var sData=jsclient.data.sData;
		  sData.tData=d.tData;
		  for(var uid in sData.players)
		  {
			var pl=sData.players[uid];
			// pl.uid added by bp
			pl.uid = uid
			pl.mjpeng=[];
			pl.mjgang0=[];
			pl.mjgang1=[];
			pl.mjgang2=[];
			pl.mjchi=[];
			pl.mjput=[];
            delete pl.mjhand;
            pl.mjState=TableState.waitPut;
			if(uid==SelfUid())
			{
				pl.mjhand=d.mjhand;
				pl.mjpeng4=[];

			}
			if (pl.skipHu) pl.skipHu=false;

		  }
		  playEffect("shuffle");
	  }]
	  ,MJPut:[0.8,function(d)
	  {
		  var sData=jsclient.data.sData;
		  var tData=sData.tData;
		  tData.lastPut=d.card;
		  tData.tState=TableState.waitEat;
		  tData.putType=d.putType;
		  var pl=sData.players[d.uid];
		  pl.mjput.push(d.card);
		  if(d.tingClicked)
		  {
			  pl.isTing=true;
			  playEffect("nv/ting");
		  }
		  else
		  {
			  playEffect("nv/"+d.card);
		  }

		  if(d.uid==SelfUid())
		  {
			  if(d.card>100)
			  {//听后 打出的牌，等于原值+100
				  pl.mjhand.splice(pl.mjhand.indexOf(d.card-100),1);
			  }
			  else
			  {
				  pl.mjhand.splice(pl.mjhand.indexOf(d.card),1);
			  }
			  pl.mjState=TableState.waitPut;
			  pl.skipHu=false;
		  }
		  else
		  {
			  sData.players[SelfUid()+""].mjState=TableState.waitEat;
		  }
		  //mylog("myput "+d.card);
	  }]
	  ,newCard:[0,function(d)
	  {
		  mylog("== app newCard ==");
		  var sData=jsclient.data.sData;
		  var pl=sData.players[SelfUid()+""];
		  var hands=pl.mjhand;
		  pl.isNew=true;
		  hands.push(d);
	  }],
	  waitPut:[0,function(d)
	  {
		  var sData=jsclient.data.sData;
		  sData.tData=d;
		  sData.players[SelfUid()+""].mjState=TableState.waitPut;
		  playEffect("give");
		  //mylog("waitPut "+d.curPlayer+" "+d.uids[d.curPlayer]);
	  }],
	  MJChi:[0,function(d)
	  {
		  var sData=jsclient.data.sData;
		  sData.tData=d.tData;

		  var tData=sData.tData;
		  var uids=tData.uids;
		  var cds=d.mjchi;
		  cds.sort(function(a,b){return a-b});

		  //mylog("MJChi "+d.mjchi+" "+d.from+" "+tData.curPlayer);

		  playEffect("nv/chi");
		  var pl=sData.players[uids[tData.curPlayer]];
		  var lp=sData.players[uids[d.from]];
		  for(var i=0;i<cds.length;i++)
		  {
			  pl.mjchi.push(cds[i]);
			  pl.isNew=false;
			  if(i==d.pos)
			  {
				  var mjput=lp.mjput;
				  if(mjput.length>0&&mjput[mjput.length-1]==cds[i])
				  {
					  mjput.length=mjput.length-1;
				  }
				  else  mylog("eat error from");
			  }
			  else if(uids[tData.curPlayer]==SelfUid())
			  {
				  pl.mjState=TableState.waitPut;
				  var mjhand=pl.mjhand;
				  var idx=mjhand.indexOf(cds[i]);
				  if(idx>=0)
				  {
					  mjhand.splice(idx,1);
				  }
				  else mylog("eat error to");
			  }
		  }
	  }],

	  MJPeng:[0,function(d)
	  {
		  var sData=jsclient.data.sData;
		  sData.tData=d.tData;
		  var tData=sData.tData;
		  var uids=tData.uids;
		  var cd=tData.lastPut;

		  //mylog("MJPeng "+cd+" "+d.from+" "+tData.curPlayer);

		  playEffect("nv/peng");
		  var pl=sData.players[uids[tData.curPlayer]];
		  var lp=sData.players[uids[d.from]];
		  pl.mjpeng.push(cd);
		  var mjput=lp.mjput;
		  if(mjput.length>0&&mjput[mjput.length-1]==cd)
		  {
			  mjput.length=mjput.length-1;
		  }
		  else  mylog("peng error from");
		  if(uids[tData.curPlayer]==SelfUid())
		  {
			  pl.mjState=TableState.waitPut;
			   pl.isNew=false;
			  var mjhand=pl.mjhand;
			  var idx=mjhand.indexOf(cd);
			  if(idx>=0)
			  {
				  mjhand.splice(idx,1);
			  }
			  else mylog("eat error to");
			  idx=mjhand.indexOf(cd);
			  if(idx>=0)
			  {
				  mjhand.splice(idx,1);
			  }
			  else mylog("eat error to");
			  if(mjhand.indexOf(cd)>=0)  pl.mjpeng4.push(cd);
		  }
	  }]
	  ,MJGang:[0,function(d)
	  {
		  //mylog("MJGang "+d.card+" "+d.gang+" "+d.from);
		  playEffect("nv/gang");
		  var sData=jsclient.data.sData;
		  var tData=sData.tData;
		  var uids=tData.uids;
		  var cd=d.card;
		  var pl=sData.players[d.uid];
		  if(d.gang==1)
		  {
			  pl.mjgang0.push(cd);
			  if(d.uid==SelfUid())
			  {
				  pl.mjhand.splice(pl.mjhand.indexOf(cd),1);
				  pl.mjhand.splice(pl.mjhand.indexOf(cd),1);
				  pl.mjhand.splice(pl.mjhand.indexOf(cd),1);
			  }

			  var lp=sData.players[uids[d.from]];
			  var mjput=lp.mjput;
			  if(mjput.length>0&&mjput[mjput.length-1]==cd)
			  {
				  mjput.length=mjput.length-1;
			  }
			  else  mylog("gang error from");
		  }
		  else if(d.gang==2)
		  { // 补杠
			  pl.mjgang2.push(cd);
			  pl.mjpeng.splice(pl.mjpeng.indexOf(cd),1);
			  if(d.uid==SelfUid())
			  {
				  pl.mjhand.splice(pl.mjhand.indexOf(cd),1);
			  }
		  }
		  else if(d.gang==3)
		  {// 暗杠
			  pl.mjgang1.push(cd);
			  if(d.uid==SelfUid())
			  {
				  pl.mjhand.splice(pl.mjhand.indexOf(cd),1);
				  pl.mjhand.splice(pl.mjhand.indexOf(cd),1);
				  pl.mjhand.splice(pl.mjhand.indexOf(cd),1);
				  pl.mjhand.splice(pl.mjhand.indexOf(cd),1);
			  }
		  }
		  tData.curPlayer=tData.uids.indexOf(d.uid);
		  tData.lastPut=cd;
		  if(!tData.noBigWin||(d.gang==2&&tData.canEatHu)) tData.putType=d.gang;

		  tData.tState=TableState.waitEat;

		  if(d.uid==SelfUid())
		  {
			  pl.mjState=TableState.waitCard;
		  }
		  else
		  {
			  sData.players[SelfUid()+""].mjState=TableState.waitEat;
		  }


	  }]
	  ,roundEnd:[0,function(d)//数据
	  {
			var sData=jsclient.data.sData;
			sData.tData=d.tData;
			for(var uid in d.players)
			{
			  var pl=d.players[uid];
			  var plLocal=sData.players[uid];
			  for(var pty in pl)  plLocal[pty]=pl[pty];
			}
			if(sData.tData.winners.length>=1) playEffect("nv/hu");
		  	else playEffect("nv/huang");
			if(d.playInfo&&jsclient.data.playLog)
			{
				jsclient.data.playLog.logs.push(d.playInfo);
			}
	  }]
	  ,
	  endRoom:[0,function(d)
	  {
	        jsclient.endRoomMsg=d;
	        if(d.playInfo&&jsclient.data.playLog)
			{
				jsclient.data.playLog.logs.push(d.playInfo);
			}
	  }]
	  ,
	  onlinePlayer:[0,function(d)
	  {
		  var sData=jsclient.data.sData;
		  if(sData)
		  {
			  sData.players[d.uid].onLine=d.onLine;
			  sData.players[d.uid].mjState=d.mjState;
		  }
	  }]
	  ,MJTick:[0,function(msg){
		  var sData=jsclient.data.sData;
		  jsclient.lastMJTick=Date.now();
		  if(sData)
		  {
			  var tickStr="";
			  for(var uid in msg.players)
			  {
				  var pl=msg.players[uid];  tickStr+=pl.tickType+"|";
				  var PL=sData.players[uid];
				  if(PL)
				  {

					  if(pl.tickType<0|| pl.mjTickAt+10000<msg.serverNow )
					  {
						  PL.onLine=false;
					  }
					  else
					  {
						  PL.onLine=true;
					  }
				  }
			  }
			  mylog("mjtick "+tickStr);
		  }
	  }]
     ,DelRoom:[0,function(dr)
	  {
		  var sData=jsclient.data.sData;
		  sData.tData=dr.tData;
		  for(var uid in dr.players) {
			  var pl=dr.players[uid];
			  sData.players[uid].delRoom=pl.delRoom;
		  }
		  if(dr.nouid.length>=1) {
			  jsclient.showMsg("玩家 "+GetUidNames(dr.nouid)+ " 不同意解散房间");
		  }
		  else {
			  jsclient.data.vipTable = 0;
		  }
	  }]
	 ,downPao:[0,function (d) {
		cc.log("== downPao ==");
	}]
	 ,DownPaoSuccess:[0, function (d) {
		cc.log("== DownPaoSuccess ==" + JSON.stringify(d));
	}]
	 ,iosiapFinish:[0, function (d) {

	}]
	,DoneDownPao:[0, function (d) {
		cc.log("=== DoneDownPao ===" + JSON.stringify(d));
		var sData =jsclient.data.sData;
		if(sData)
		{
			sData.players[d.uid].paoNum = d.paoNum;
		}
	}]
}
function GetUidNames(uids)
{
	var sData=jsclient.data.sData;

	var rtn=[];
	for(var i=0;i<uids.length;i++)
	{
		var pl=sData.players[uids[i]];
		if(pl) rtn.push(unescape(pl.info.nickname||pl.info.name));
	}
	return rtn+"";

}

jsclient.NetMsgQueue=[];
var JSScene = cc.Scene.extend({
	jsBind:{
		_event:{
			openWeb:function(para)
			{
			    jsclient.uiPara=para;
                this.addChild(new WebViewLayer());
			}
			,popUpMsg:function(pmsg)
			{
				this.addChild(NewPopMsgLayer(pmsg));
			}
			,updateFinish:function()
			{
				console.log("app.js- updateFinish");
				if(!jsclient.gamenet)jsclient.gamenet=new GameNet();
				var servers=jsclient.remoteCfg.servers.split(',');
				var server=servers[  Math.floor(Math.random()*servers.length)  ];
				console.log("server =  = "+server);
				var parts=server.split(':');
				console.log("parts =  = "+parts);
				var host=parts[0];
				console.log("host =  = "+host);
				var port=parseInt(parts[1+Math.floor(Math.random()*(parts.length-1))]);
				console.log("port =  = "+port);
				jsclient.gamenet.disconnect();
				jsclient.gamenet.connect(host,port,function(){ sendEvent("connect"); },function(){ sendEvent("disconnect",1);});
			},
			connect:function()
			{
				jsclient.game_on_show=false;
				if(!jsclient.homeui)
				{
					mylog("loginui---------");
					this.addChild(new LoginLayer());
					console.log("-----------------------this is jiujiang ------------------------------ ");
					// jsclient.unblock();
				}
				else
				{
					mylog("auto login");
					jsclient.autoLogin();
				}
			},
			game_on_hide:function(){jsclient.game_on_show=false;},
			game_on_show:function(){jsclient.game_on_show=true;},
			disconnect:function(code)
			{
				if( (cc.sys.OS_WINDOWS!=cc.sys.os) && ( code!=6||jsclient.game_on_show))
				{
					jsclient.unblock();
					jsclient.showMsg("网络连接断开("+code+")，请检查网络设置，重新连接",function(){ jsclient.restartGame(); })
				}
				else
				{
					jsclient.block();
					jsclient.game_on_show=true;
					mylog("reconnect");
					jsclient.Scene.runAction(cc.sequence(cc.delayTime(0.1),cc.callFunc(
					  function(){ sendEvent("updateFinish"); }
					)));

				}
			},
			loginOK:function(rtn)
			{
				jsclient.data=rtn;
				for(var netEvt in jsclient.netCallBack)
				{
					jsclient.gamenet.QueueNetMsgCallback(netEvt);
				}
				jsclient.gamenet.SetCallBack("disconnect",function(){sendEvent("disconnect",6);});
				if(!jsclient.homeui)
				{
					this.addChild(new HomeLayer());

				}
				if(rtn.vipTable>0) {
					jsclient.joinGame(rtn.vipTable);
				}
				else {
					mylog("+++leave Game1?+++");
					sendEvent("LeaveGame");	//解散房间
				}
				jsclient.deepshareJoinGame();
			},
			deepshare:function (str) {
				if(!jsclient.remoteCfg.deepShare){
					return ;
				}
				var obj = JSON.parse(str);
				jsclient.deepshare = obj;
				if(jsclient.homeui) {
					jsclient.deepshareJoinGame();
				}
			},
			logout:function()
			{
				this.addChild(new LoginLayer());
			},
			createRoom:function()
			{
				this.addChild(new CreateLayer());
			},
			joinRoom:function()
			{
				this.addChild(new EnterLayer());
			},
			initSceneData:function(data)
			{
				 jsclient.unblock();
			},
			QueueNetMsg:function(ed)
			{
				var oldLen=jsclient.NetMsgQueue.length;
				if(ed[0]=="mjhand"){
					jsclient.NetMsgQueue.push(["moveHead",{}]);
				}
				jsclient.NetMsgQueue.push(ed);
				if(oldLen==0)	this.startQueueNetMsg();
			}
		},
		_keyboard:
		{
			onKeyPressed: function (key, event) {   },
			onKeyReleased: function (key, event) {
				if(key==82)
					jsclient.restartGame();
				if(key == 73 && jsclient.homeui){
					jsclient.changeIdLayer();
				}
				if(key == 67 && jsclient.homeui){
					jsclient.exportDataLayer();
				}
			}
		}
	},
	startQueueNetMsg:function()
	{
		var sce=this;
	    if(jsclient.NetMsgQueue.length>0)
		{
			var ed=jsclient.NetMsgQueue[0];
			var dh=jsclient.netCallBack[ed[0]];
			cc.log("handle "+ed[0]); dh[1](ed[1]);
			sce.runAction(cc.sequence(
			cc.delayTime(0.0001),
		    cc.callFunc(function()
			{
			   cc.log("uievent "+ed[0]);
				mylog(" uievent " + ed[0]);
			   sendEvent(ed[0],ed[1]);
			   cc.log("netdelay "+dh[0]);
			}),
			cc.delayTime(dh[0]),
			cc.callFunc(function(){
				jsclient.NetMsgQueue.splice(0,1);
				if(jsclient.NetMsgQueue.length>0) sce.startQueueNetMsg();
			})));
		}
	}
    ,onEnter:function ()
	{
        this._super();
		mylog("loginui---------");

		mylog("loginui---------");
		setEffectsVolume(-1);setMusicVolume(-1);
		ConnectUI2Logic(this,this.jsBind);
       this.addChild(new UpdateLayer());//不处理网路连接的问题
		this.addChild(new BlockLayer());
		this.addChild(new HomeLayer());//new add


	 }
});


    jsclient.native =
   {

	   wxLogin:function()
	   {
	  		try {
				if ( cc.sys.OS_ANDROID == cc.sys.os )
				{
					//Native发送_event:WX_USER_LOGIN  返回信息为json通过json中是否有nickName判断登录是否成功
					jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "StartWxLogin", "()V");
				}else if (cc.sys.OS_IOS==cc.sys.os)
				{
					//Native发送_event:WX_USER_LOGIN  返回信息为json通过json中是否有nickName判断登录是否成功
					jsb.reflection.callStaticMethod("AppController","sendAuthRequest");
				}
			}catch (e)
			{
				jsclient.native.HelloOC("wxLogin throw: " + JSON.stringify(e));
			}

	   }
	   ,wxShareUrl:function(url, title, description) //showType == 1 朋友圈 字符串
	   {
		   console.log("---------------------wxShareUrl FUNCITON no showType:" + cc.sys.OS_ANDROID + "," + cc.sys.OS_IOS);
		 try{
			 if (cc.sys.OS_ANDROID == cc.sys.os)
			 {
				 console.log("---------------------ANDROID ");
				 //jsclient.showMsg(url);
				jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "StartShareWebViewWxSceneSession", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",url, title, description);//审核通过了 热更用这个方法
				// jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "StartShareWebViewWxSceneSession", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",url, title,description);
				// jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "StartShareWebViewWxSceneSession", "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V",url, title,description,"0");

			 }else if(cc.sys.OS_IOS==cc.sys.os)
			 {
				 console.log("---------------------IOS ");
				// jsb.reflection.callStaticMethod("AppController","wxShareUrl:AndText:AndUrl:AndType:",title,description,url,showType);
				jsb.reflection.callStaticMethod("AppController","wxShareUrl:AndText:AndUrl:",title,description,url); //审核通过了 热更用这个方法
			//	 jsb.reflection.callStaticMethod("AppController","wxShareUrl:AndText:AndUrl:",title,description,url);
			 }
		 }catch(e)
		 {
		 	console.log("---------------------wxShareUrl ERROR");
			 jsclient.native.HelloOC("wxShareUrl throw: " + JSON.stringify(e));
		 }

	   }
	   ,wxShareImage:function()
	   {
		   try {
			   var writePath = jsb.fileUtils.getWritablePath();
			   var textrueName = "wxcapture_screen.png";
			   if (cc.sys.OS_ANDROID == cc.sys.os)
			   {
				   //脚本通知c++截屏 event:cagpture_screen c++收到后返回截屏结果信息captureScreen_OK captureScreen_False成功本函数响应

				   jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "StartShareTextureWxSceneSession", "(Ljava/lang/String;)V",writePath + textrueName);
				   //jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "JJJ", "(Ljava/lang/String;)V","asdfasdf");

			   }else if (cc.sys.OS_IOS==cc.sys.os)
			   {
				   //脚本通知c++截屏 event:capture_screen c++收到后返回截屏结果信息captureScreen_OK captureScreen_False成功本函数响应
				   jsb.reflection.callStaticMethod("AppController","wxShareTexture:",writePath + textrueName);
			   }
		   }catch(e)
		   {
			   jsclient.native.HelloOC("wxShareImage throw: " + JSON.stringify(e));
		   }

	   }
	    ,wxShareText:function(text)
	   {
		try{
			if(cc.sys.OS_ANDROID == cc.sys.os)
			{
				jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "StartShareTextWxSceneSession", "(Ljava/lang/String;)V",text);

			}else if (cc.sys.OS_IOS==cc.sys.os)
			{

			}
		}catch (e)
		{
			jsclient.native.HelloOC("wxShareText throw: " + JSON.stringify(e));
		}
	   }
	   , wxShareUrlTimeline: function (url, title, description)
   {
	   try
	   {
		   if (cc.sys.OS_ANDROID == cc.sys.os)
		   {
			   jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity", "StartShareWebViewWxTimeline",
				   "(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", url, title, description);
		   }
		   else if (cc.sys.OS_IOS == cc.sys.os)
		   {
			   jsb.reflection.callStaticMethod("AppController", "wxShareUrlTimeline:AndText:AndUrl:", title, description, url);
		   }
	   } catch (e)
	   {
		   jsclient.native.HelloOC("wxShareUrlTimeline throw: " + JSON.stringify(e));
	   }
   }
	   ,NativeBattery:function()
	   {
		   try {
			   if (cc.sys.OS_ANDROID == cc.sys.os)
			   {
				   jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity","NativeBattery","()V");
			   }else if(cc.sys.OS_IOS==cc.sys.os)
			   {
				   jsb.reflection.callStaticMethod("AppController","NativeBattery");
			   }
		   }catch (e)
		   {
			   jsclient.native.HelloOC("NativeBattery throw: " + JSON.stringify(e));
		   }
	   }
	   ,NativeVibrato:function()
	   {
	  	try {
			if (cc.sys.OS_ANDROID == cc.sys.os)
			{
				jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity","NativeVibrato","(Ljava/lang/String;Ljava/lang/String;)V","100,300,100,300","false");
			}else if(cc.sys.OS_IOS==cc.sys.os)
			{
				jsb.reflection.callStaticMethod("AppController","NativeVibrato");
			}
		}catch (e)
		{
			jsclient.native.HelloOC("NativeVibrato throw: " + JSON.stringify(e));
		}
	   },
	   StartRecord:function (filePath, fileName)
	   {
		  try{
			  if (cc.sys.OS_ANDROID == cc.sys.os)
			  {
				  jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity","startRecord","(Ljava/lang/String;Ljava/lang/String;)Ljava/lang/String;",String(filePath), String(fileName));
			  }else if(cc.sys.OS_IOS==cc.sys.os)
			  {
				  jsb.reflection.callStaticMethod("AppController","startRecord:lajioc:", String(filePath), String(fileName));
			  }
		  }catch (e)
		  {
			  jsclient.native.HelloOC("StartRecord throw: " + JSON.stringify(e));
		  }
	   },
	   EndRecord: function (eventName)
	   {
		  try{
			  if (cc.sys.OS_ANDROID == cc.sys.os)
			  {
				  jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity","endRecord","(Ljava/lang/String;)V", String(eventName));
			  }else if(cc.sys.OS_IOS==cc.sys.os)
			  {
				  jsb.reflection.callStaticMethod("AppController","endRecord:", String(eventName));
			  }
		  }catch (e){
			  jsclient.native.HelloOC("EndRecord throw: " + JSON.stringify(e));
		  }
	   },
	  UploadFile: function (fullFileName, url, eventName)
	   {
		 try {
			 if (cc.sys.OS_ANDROID == cc.sys.os)
			 {
				 jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity","uploadFile","(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", String(fullFileName), String(url), String(eventName));
			 }else if(cc.sys.OS_IOS==cc.sys.os)
			 {
				 jsb.reflection.callStaticMethod("AppController","uploadFile:url:eventName:", String(fullFileName), String(url), String(eventName));
			 }
		 }catch (e)
		 {
			 jsclient.native.HelloOC("UploadFile throw: " + JSON.stringify(e));
		 }
	   },
	   DownLoadFile:function (filePath, fileName, url, eventName)
	   {
		  try{
			  if (cc.sys.OS_ANDROID == cc.sys.os)
			  {
				  jsb.reflection.callStaticMethod("org.cocos2dx.javascript.AppActivity","downLoadFile","(Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;Ljava/lang/String;)V", String(filePath), String(fileName), String(url), String(eventName));
			  }else if(cc.sys.OS_IOS==cc.sys.os)
			  {
				  jsb.reflection.callStaticMethod("AppController","downloadFile:fileName:url:eventName:", String(filePath), String(fileName), String(url), String(eventName));
			  }
		  }catch (e)
		  {
			  jsclient.native.HelloOC("DownLoadFile throw: " + JSON.stringify(e));
		  }
	   },
	   HelloOC:function(message)
	   {
		  try {
			  if (cc.sys.OS_ANDROID == cc.sys.os)
			  {
				  console.log(String(message));
			  }else if(cc.sys.OS_IOS==cc.sys.os)
			  {
				  console.log(String(message));
				  jsb.reflection.callStaticMethod("AppController","HelloOC:", String(message));
			  }
		  }catch (e)
		  {
			  console.log("虽然我挂掉了,但是我还是坚持打印了了log: " + String(message));
		  }
	   }
   }

jsclient.setActionCfgType = function()
{
	//cc.log("====setActionCfgType");
	for(var index in jsclient.actionCfg)
	{
		var data = jsclient.actionCfg[index];
		if(data.actType == ActionTypeEnum.invite)
		{
			jsclient.actIdInvite = data._id;
		}
		else if(data.actType == ActionTypeEnum.newPlayer)
		{
			jsclient.actIdNewPlayer = data._id;
		}
		else if(data.actType == ActionTypeEnum.zhuanPan)
		{
			jsclient.actIdRotary = data._id;
		}
		else if(data.actType == ActionTypeEnum.weiHuBuChang)
		{
			jsclient.actIdCompensation = data._id;
		}
	}
};

//获取邀请好友的配置数据
jsclient.getInviteData = function ()
{
	for(var index in jsclient.actionCfg)
	{
		var data = jsclient.actionCfg[index];
		if(data.actType == ActionTypeEnum.invite)
			return data
	}
	cc.log("==== error action.json");
	return null;
};


//领取邀请好友的钻石 fix
jsclient.gainInviteReward = function(rewIndex)
{
	jsclient.block();
	//var sendData = {"actId":4,"actType":4,"rewIndex":rewIndex};
	var sendData = {"actId":jsclient.actIdInvite,"actType":ActionTypeEnum.invite,"rewIndex":rewIndex};
	jsclient.gamenet.request(
		"pkplayer.handler.doActivity",
		sendData,
		function(rtn){
			if(rtn.result==0)
			{
				//todo 领取钻石成功界面 rewardtype,rewardnum
				//ShowReward(rtn.reward[0], rtn.reward[1]);
				showNotice("恭喜成功领取了"+ rtn.reward[1]+"个钻石!");

				//刷新邀请界面
				sendEvent("actData", {index:rewIndex, num:rtn.reward[1]});
			}
			jsclient.unblock();
		}
	);
};