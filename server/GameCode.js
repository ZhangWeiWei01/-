module.exports = function(app,server,gameid,Player,Table,TableGroup,TableManager,Game)
{
	//console.error(app.serverId+" reload game code "+gameid);

	var gameLog=[];function GLog(log,level){ app.FileWork(gameLog,__dirname+"/log.txt",log)}

	var logid=Date.now();  
	var existCheck={};
	var fs=require('fs');
	delete require.cache[require.resolve("./majiang.js")];
	var majiang=require("./majiang.js");
	var util=require('util');
	var TableState={
		waitJoin:1,
		waitReady:2,
		waitPut:3,
		waitEat:4,
		waitCard:5,
		roundFinish:6,
		isReady:7,
		downPao:8,
		doneDownPao:9
	}

////战绩日志函数，自动添加index
	var lastLogDay = 0;

	function doGameLog(para) {
		var day = new Date();
		day = (day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate()) + "";
		app.mdb.insert('gameLog' + day, para, function(){
			if(lastLogDay != day) {
				lastLogDay = day;
				app.mdb.db.collection('gameLog' + day).createIndex({"uid1":1},{"background":1});
				app.mdb.db.collection('gameLog' + day).createIndex({"uid2":1},{"background":1});
				app.mdb.db.collection('gameLog' + day).createIndex({"uid3":1},{"background":1});
				app.mdb.db.collection('gameLog' + day).createIndex({"uid4":1},{"background":1});
			}
		});
	}
	//


	
	
	var WinType=
	{
	  eatPut:1,     //普通出牌点炮
	  eatGangPut:2, //开杠打牌点炮
	  eatGang:3,    //抢杠
      pickNormal:4, //普通自摸
	  pickGang1:5,  //吃牌开明杠后补牌自摸(点杠者包3家)
	  pickGang23:6  //摸牌开杠补牌自摸
	}
	var PlayType={
		sxMethod:1,		// 陕西麻将
		xaMethod:2,		// 西安麻将
		bjMethod:3,		// 宝鸡麻将
		ylMethod:4,		// 榆林麻将
		hsMethod:5, 	// 划水麻将
	}
	var ylCanNotEatWinList=[1,2,3,4,5,11,12,13,14,15,21,22,23,24,25]
	function GetHuType(td,pl,cd)
	{
		GLog("-----------------00");
		var huType=majiang.canHu(!td.canHu7,pl.mjhand,cd,td.canHuWith258,td.withZhong);
		GLog("-----------------11");

		pl.huType=huType;
		GLog("-----------------22");
		return huType;
	}
	function GetYLEatFlag(pl,tData) {
		var cd = tData.lastPut;
		var leftCard=(tData.withWind?136:108)-tData.cardNext;
		var eatFlag=0;
		if(!pl.skipHu&&tData.canEatHu&&GetHuType(tData,pl,cd)>0&&ylCanNotEatWinList.indexOf(tData.lastPut)<0&&pl.isTing) eatFlag+=8;
		if(!pl.isTing&&majiang.canGang0(pl.mjhand,cd))        eatFlag+=4;
		else if (pl.isTing&&majiang.canTingGang0(pl.mjhand,cd))
		{
			// 判断胡牌列表是否跟之前一致
			var cds = pl.mjhand.slice();
			cds.splice(cds.indexOf(cd),1);
			cds.splice(cds.indexOf(cd),1);
			cds.splice(cds.indexOf(cd),1);
			var winList = majiang.tingWinList(true,cds,false);
			if(winList.length==pl.winList.length)
			{
				if(winList.sort().toString()==pl.winList.sort().toString())
				{
					eatFlag+=4;
				}
			}
		}
		if((leftCard>4||tData.noBigWin)&&majiang.canPeng(pl.mjhand,cd)&&!pl.isTing)         eatFlag+=2;
		return eatFlag;
	}
	function GetEatFlag(pl,tData)
	{
		var cd=tData.lastPut;

		var leftCard=(tData.withWind?136:108)-tData.cardNext;

		var eatFlag=0;
		if(!pl.skipHu && (tData.canEatHu/*||tData.putType==4*/)&& GetHuType(tData,pl,cd)>0)  eatFlag+=8;
		if(majiang.canGang0(pl.mjhand,cd))        eatFlag+=4;
		if((leftCard>4||tData.noBigWin)&&majiang.canPeng(pl.mjhand,cd))         eatFlag+=2;
		if((leftCard>4||tData.noBigWin)&&tData.canEat&&
		    tData.uids[(tData.curPlayer+1)%4]==pl.uid && //下家限制
		    majiang.canChi(pl.mjhand,cd).length>0
		 ) eatFlag+=1;

		return eatFlag;
	}

	Table.prototype.initTable=function()
	{
		// GLog("initTable");
		var table=this;
		var rcfg=this.roomCfg();
		table.uid2did={};
		//服务器私有
		table.cards=[];
		//回放记录
		table.mjlog=[];
		//公开
		table.tData={
			tState:TableState.waitJoin,
			playType:0,      // 玩法
			initCoin:1000,   //积分显示
			roundNum:-1,
			roundAll:0,
			uids:[],
			owner:-1,         //uid
			cardNext:0,
			winners:[],
			curPlayer:-1,     //0-3
			zhuang:-1,        //0-3
			uiend:true,
			firstFourMJPut:0, //前四张,有几张普通出牌
			hasPeng:false,
			isLastHuang:false,
			isLastFollowBanker:false,
			lastPutPlayer:-1, //0-3上次出牌玩家
			putType:0,        //0 普通出牌  1 2 3开杠的牌  4开杠后打出的牌 5碰的牌
			lastPut:-1,       //上次出的牌
			tableid:this.tableid,
			canEatHu:false,
			delEnd:0,       //
			firstDel:0,       //
		};
	}
	//断线重连
	Table.prototype.Disconnect=function(pl,msg)
	{
		pl.onLine=false;
		this.channel.leave(pl.uid,pl.fid);	pl.fid=null;
		this.NotifyAll('onlinePlayer',{uid:pl.uid,onLine:false,mjState:pl.mjState});
	}
	Table.prototype.Reconnect=function(pl,plData,msg,sinfo)
	{
		pl.onLine=true;

		this.channel.leave(pl.uid,pl.fid);
		pl.sid=sinfo.sid; pl.fid=sinfo.fid; pl.did=sinfo.did;
		if(pl.mjState==TableState.roundFinish) pl.mjState=TableState.isReady;
		this.NotifyAll('onlinePlayer',{uid:pl.uid,onLine:true,mjState:pl.mjState});
		this.channel.add(pl.uid,pl.fid);
		pl.notify("initSceneData",this.initSceneData(pl));

		this.startGame();
	}
	Table.prototype.CanAddPlayer=function(pl)
	{
		var uids=this.tData.uids;
		if(this.tData.roundNum>-2)
		{
		   if(uids.indexOf(pl.uid)<0)
		   {
			   if (uids.length <= 3) return true;
			   else
			   {
				   var ilen=0;
				   for(var i=0;i<uids.length;i++)
				   {
					   if(uids[i] !=0)
					   {
						   ilen +=1;
					   }
				   }
				   if (ilen >= 4) return false;
				   else return true;
			   }
		   }
           else return true;
		}
		return false;
	}
	Table.prototype.CanLeaveGame=function(pl)
	{
		var tData=this.tData;
		if( (tData.tState==TableState.waitJoin&&pl.uid!=tData.owner)||tData.roundNum==-2)
		{
			return true;
		}
		return false;
	}
	function initRule(tData, createPara) {
		GLog("...JJ... initRule:" + JSON.stringify(createPara));
		GLog("...JJ... initRule:" + createPara.round);
		GLog("..-----------------.JJ... initRule:withSixCards" + createPara.withSixCards);
//createPara
		tData.roundAll=createPara.round;    //总
		tData.roundNum=createPara.round;    //剩余
		// tData.canEatHu=createPara.canEatHu; //是否可以点炮
		// tData.withWind=createPara.withWind; //是否可以点炮
		// tData.canEat=createPara.canEat;     //是否可以点炮
		tData.noBigWin=createPara.noBigWin; //是否邵阳玩法
		// tData.canHu7=createPara.canHu7;     //是否可以七对
		// tData.canHuWith258=createPara.canHuWith258; //只能258做将
		// tData.withZhong=createPara.withZhong; //红中赖子
		tData.playType=createPara.nPlayType; // 玩法
		// tData.withPao=createPara.withPao; // 西安玩法中带不带炮
		tData.coinRoomCreate = createPara.coinRoomCreate;//是否金币场

		GLog("------------------------------wei tData.noBigWin = "+tData.noBigWin);

		//邵阳麻将
		if(tData.noBigWin) {
			tData.withWind=false;
			tData.canEat=false;
		}
		else {
			tData.canEatHu=false;
			tData.canHu7 = false;
			tData.canHuWith258 = false;
			tData.withZhong = false;
		}

			GLog("2222222222222222222222222tData.playType = "+tData.playType);
		if (tData.playType == PlayType.sxMethod)
		{
			tData.withPao = false;
			tData.withZhong=createPara.withZhong;
			tData.canHu7=createPara.canHu7;
			tData.canEatHu=createPara.canEatHu;
			tData.canHuWith258=createPara.canHuWith258;
			tData.withSixCards = false;
		}
		else if (tData.playType == PlayType.xaMethod)
		{
			tData.withZhong=false;
			tData.canHuWith258=false;
			tData.canHu7=false;
			tData.canEatHu=true;
			tData.withPao=createPara.withPao;
		}
		else if (tData.playType == PlayType.bjMethod)
		{
			tData.withZhong=false;
			tData.canHuWith258=false;
			tData.canHu7=true;
			tData.canEatHu=true;
			tData.withPao=false;
			tData.withPao=createPara.withPao;
		}
		else if (tData.playType == PlayType.ylMethod)
		{
			tData.withPao=false;
			tData.withWind=true;
			tData.canEatHu=true;
			tData.canHu7=false;
			tData.withZhong=false;
			tData.canHuWith258=false;
		}
		else if (tData.playType == PlayType.hsMethod)
		{
			GLog("+++++++++++++++++++++++++++++++ 划水麻将------=================");
			tData.canEatHu=true;
			//tData.canHu7=true;
			//tData.withWind=true;
			tData.withZhong=createPara.withZhong;
			tData.withPao=false;
			tData.canHuWith258=false;
			tData.fishNum = createPara.fishNum;
			tData.withWind =createPara.withWind;
			tData.withSixCards = createPara.withSixCards;
			tData.canHu7=createPara.canHu7;
			//GLog("+++++++++++++++++++++++++++++++++++++++++++------tData.withWind = "+tData.withWind);
			//GLog("+++++++++++++++++++++++++++++++++++++++++++------tData.canHu7 = "+tData.canHu7);
			GLog("+++++++++++++++++++++++++++++++++++++++++++------createPara.withZhong = "+createPara.withZhong);

		}

		if(createPara.coinRoomCreate)
		{
			tData.withZhong=true;
			tData.canEatHu=true;
			tData.playType=PlayType.sxMethod;
		}

		// GLog("canEatHu: " + tData.canEatHu
		// 	+ " withWind: " + tData.withWind
		// 	+ " canEat: " + tData.canEat
		// 	+ " noBigWin: " + tData.noBigWin
		// 	+ " canHu7: " + tData.canHu7
		// 	+ " canHuWith258: " + tData.canHuWith258
		// 	+ " withZhong: " + tData.withZhong
		// 	+ " roundAll: " + tData.roundAll
		// 	+ " roundNum: " + tData.roundNum
		// 	+ " nPlayType: " + tData.playType
		// 	+ " withPao: " + tData.withPao
		// );
	}
	Table.prototype.initAddPlayer=function(pl,msg)
	{
		//公开
		pl.winall=0;   //累计赢
		pl.mjState=TableState.isReady;
		pl.mjpeng=[];  //碰
		pl.mjgang0=[]; //明杠
		pl.mjgang1=[]; //暗杠
		pl.mjgang2=[]; //补杠
		pl.mjpeng4=[]; //补杠
		pl.mjchi=[];   //吃
		//私有
		pl.mjhand=[];  //手牌
		pl.eatFlag=0;  //胡8 杠4 碰2 吃1
		pl.delRoom=0;
		pl.onLine=true;
		pl.paoNum=-1;  // 下炮数量
		pl.isTing=false;
		pl.canNotPutList=[];
		pl.winList=[];
		this.uid2did[pl.uid]=pl.did;//记录数据服务器id

		var tData=this.tData;

		if(tData.roundNum==-1)
		{
			initRule(tData, this.createPara);
	    }
		if(tData.owner==-1)	tData.owner=pl.uid;
		var uids=tData.uids;
		var bfind=0;
		if(uids.indexOf(pl.uid)<0)
		{
			for(var i=0;i<uids.length;i++)
			 {
				if(uids[i]==0)
				 {
				   uids[i]=pl.uid;
				   bfind=1;
			       break;
				 }
			 }
			 if(bfind ==0)
			 {
			   uids.push(pl.uid);
			 }

		}
		tData.maxPlayers =  4;
		tData.startTime = new Date();
		this.NotifyAll('addPlayer',{player:{info:pl.info,onLine:true,mjState:pl.mjState,winall:pl.winall},tData:tData});

	}
	//客户端收到initSceneData  session中的pkroom还没有设定好
	Table.prototype.initSceneData=function(pl)
	{
		var msg= {   players:this.collectPlayer( 'info','mjState','mjpeng','mjgang0','mjgang1','mjgang2','mjchi','mjput','onLine','delRoom','isNew','winall','skipHu', 'paoNum', 'isTing', 'canNotPutList', 'winList')
				    ,tData:this.tData
					,serverNow:Date.now()
			   };
		msg.players[pl.uid].mjpeng4=pl.mjpeng4;
	    msg.players[pl.uid].mjhand=pl.mjhand;

		return msg;
	}

    function DestroyTable(tb)
    {
		if(tb.PlayerCount()==0 && tb.tData.roundNum==-2 )
		{
			tb.tData.roundNum=-3;
			tb.Destroy();
		}
    }

	Table.prototype.cleanRemovePlayer=function(pl)
	{
		var tData=this.tData;
		if(tData.tState==TableState.waitJoin)
		{
			var idx=tData.uids.indexOf(pl.uid);
			if(idx>=0)
			{
			    tData.uids[idx] = 0;
				this.NotifyAll("removePlayer",{uid:pl.uid,tData:tData});
			}
		}
		DestroyTable(this);
	}
	function initBanker(tData) {
		if (tData.zhuang == -1)//第一局
		{
			tData.zhuang = tData.curPlayer = 0;
		}
		else if (tData.winners.length == 0)//荒庄
		{
			if (tData.playType==PlayType.ylMethod)
			{
				tData.curPlayer=tData.zhuang;
				return;
			}
			tData.zhuang = tData.curPlayer;
		}
		else if (tData.winners.length >= 2) {
			if (tData.playType==PlayType.ylMethod)
			{
				for(var i=0;i<tData.winners.length;i++)
				{
					if (tData.winners[i]==tData.zhuang)
					{
						tData.curPlayer=tData.zhuang;
						return;
					}
				}
				tData.curPlayer=tData.zhuang=(tData.zhuang+1)%4;
			}
			else
			{
				tData.zhuang = tData.curPlayer;
			}
		}
		else if (tData.winners.length == 1)
		{
			if (tData.playType==PlayType.ylMethod)
			{
				if (tData.zhuang==tData.winners[0])
				{
					tData.curPlayer=tData.zhuang;
					return;
				}
				else
				{
					tData.curPlayer=tData.zhuang=(tData.zhuang+1)%4;
				}
			}
			else
			{
				tData.zhuang = tData.curPlayer = tData.winners[0];
			}
		}
	}
	Table.prototype.startGame=function() {
		// 西安,宝鸡 下炮
		if (this.tData.roundNum > 0 && this.PlayerCount() == 4 && this.tData.withPao
			&& this.AllPlayerCheck(function (pl) {
				return pl.mjState == TableState.isReady
			})) {
			this.AllPlayerRun(function (p) {
				p.mjState = TableState.downPao;
				p.paoNum = -1;
			});
			this.NotifyAll("downPao", {uid: 10000})
			return;
		}

		// 不带炮，并且四个玩家准备好了
		var bStartGame01 = !this.tData.withPao&&this.tData.roundNum>0&&this.PlayerCount()==4
		&&this.AllPlayerCheck(function(pl){ return pl.mjState==TableState.isReady })

		//带炮，并且下炮已经完成了
		var bStartGame02 = this.tData.withPao&&this.tData.roundNum>0&&this.PlayerCount()==4
			&&this.AllPlayerCheck(function(pl){ return pl.mjState==TableState.doneDownPao })

		if (bStartGame01 || bStartGame02) {
			// GLog("== 开启游戏 ==");
			var tData = this.tData;
			if (app.testCards && app.testCards[tData.owner]) {
				this.cards = app.testCards[tData.owner];
			}
			else this.cards = majiang.randomCards(this.tData.withWind, this.tData.withZhong);

			initBanker(tData);
			if(tData.playType==PlayType.hsMethod)
			{
				tData.firstFourMJPut=0;
				tData.hasPeng=false;
			}
			tData.cardNext = 0;
			tData.tState = TableState.waitCard;
			tData.winners.splice(0, tData.winners.length);

			var cards = this.cards;
			for (var i = 0; i < 4; i++) {
				var pl = this.players[tData.uids[(i + tData.zhuang) % 4]];
				pl.mjState = TableState.waitCard;
				pl.eatFlag = 0;
				pl.winone = 0;   //当前局赢多少
				pl.baseWin = 0;  //番数
				pl.mjpeng = [];  //碰
				pl.mjgang0 = []; //明杠
				pl.mjgang1 = []; //暗杠
				pl.mjgang2 = []; //补杠
				pl.gang0uid = {};
				pl.gangWin = {}; //记录杠钱,用来反还
				pl.mjgang1 = []; //暗杠
				pl.mjchi = [];   //吃
				pl.mjput = [];   //打出的牌
				pl.winType = 0;  //胡牌类型
				pl.mjpeng4 = []; //碰的时候还有一张牌
				pl.isNew = false; //是否通过发牌获取的,不是碰 吃
				//私有
				pl.mjhand = [];  //手牌
				pl.mjdesc = [];
				for (var j = 0; j < 13; j++) {
					pl.mjhand.push(cards[tData.cardNext++]);
				}

				if (pl.onLine)pl.notify("mjhand", {mjhand: pl.mjhand, tData: tData});

				if (pl.skipHu) pl.skipHu = false;
			}
			var mjlog = this.mjlog;
			if (mjlog.length == 0) {
				mjlog.push("players", this.PlayerPtys(function (p) {
					return {
						info: {uid: p.info.uid, nickname: p.info.nickname, headimgurl: p.info.headimgurl}
					}

				}));//玩家
			}
			tData.putType = 0;
			tData.curPlayer = (tData.curPlayer + 3) % 4;
			mjlog.push("mjhand", this.cards, app.CopyPtys(tData));//开始
			SendNewCard(this);//开始后第一张发牌
		}
	}

	/*
	* 西安玩法结算
	* 胡牌才结算，结算包括三部分：
	* 1. 杠结算
	* 2. 胡牌（自摸/点炮）结算
	* 3. 下炮结算
	* */
	function CalculationXA(tData,pls) {
		if (tData.winners.length > 0)
		{
			var descTime = 0;
			for(var i=0; i<pls.length;i++)
			{

				var pi = pls[i];
				if ( pi.winType > 0 )
				{// 赢牌才结算
					if ( pi.paoNum > 0 && tData.withPao )
					{
						pi.mjdesc.push("下炮"+pi.paoNum);
					}
					if ( (pi.mjgang0.length+pi.mjgang2.length) > 0 )
						pi.mjdesc.push("明杠"+(pi.mjgang0.length+pi.mjgang2.length));
					if ( pi.mjgang1.length > 0 )
						pi.mjdesc.push("暗杠"+pi.mjgang1.length);
					if (pi.winType<=WinType.eatGang)
					{// 点炮赢
						// 算杠
						pi.winone+=pi.mjgang0.length+pi.mjgang1.length+pi.mjgang2.length;
						// 算胡牌, 胡牌算1分
						pi.winone+=1;
						// 算炮
						if (tData.withPao&&pi.paoNum>=0)
							pi.winone+=pi.paoNum;

						// 累加输牌玩家下炮，及输牌玩家结算
						for(var j=0; j<pls.length; j++)
						{
							var pj = pls[j];
							if (pj.winType>0) continue;
							if (pj.uid!=tData.uids[tData.curPlayer]) continue;
							if (tData.withPao && pj.paoNum>=0)
								pi.winone+=pj.paoNum;
							pj.winone-=pi.winone;
							if ((tData.winners.length > 1 && descTime==0)||tData.winners.length==1 )
							{
								if ( pj.paoNum > 0 && tData.withPao ) pj.mjdesc.push("下炮"+pj.paoNum);
								pj.mjdesc.push("点炮");
								descTime = descTime + 1;
							}
						}
					}
					else
					{// 自摸赢
						// 算杠
						pi.winone+=(pi.mjgang0.length+pi.mjgang1.length+pi.mjgang2.length)*3
						// 算胡牌
						pi.mjdesc.push("摸炸弹");
						pi.winone+=(2*3);
						// 算炮
						if (tData.withPao&&pi.paoNum>=0)
							pi.winone+=pi.paoNum*3;
						// 累加其他玩家的炮，及其他玩家结算
						for(var j=0; j<pls.length; j++)
						{
							var  pj = pls[j];
							if (pj.winType>0) continue;
							if (pj.paoNum > 0)
								pj.mjdesc.push("下炮"+pj.paoNum);
							if (tData.withPao&&pj.paoNum>=0)
							{
								pi.winone+=pj.paoNum;
								pj.winone-=(pj.paoNum+pi.paoNum+pi.mjgang0.length+pi.mjgang1.length+pi.mjgang2.length+2);
							}else{
								pj.winone-=(pi.mjgang0.length+pi.mjgang1.length+pi.mjgang2.length+2);
							}
						}
					}
				}
			}
		}

	}

	/**
	* 陕西麻将推倒胡结算包括两部分
	 * 1. 杠结算
	 * 2. 胡牌类型结算
	 * abandoned for now
	 * DO NOT DELETE THE CODE BELOW, ONE DAY MAY USE IT !!!!
	* */
	/*function CalculationSX(tData, pls, pl) {

		if(tData.winners.length>0)
		{// 结算杠
			for(var i=0;i<pls.length;i++)//房间的人
			{
				var pi=pls[i];
				if (tData.playType == PlayType.sxMethod)
				{
					pi.winone+=(pi.mjgang1.length*2+pi.mjgang2.length)*3+pi.mjgang0.length;
				} else if (tData.playType == PlayType.bjMethod)
				{
					pi.winone+=(pi.mjgang1.length*2+pi.mjgang2.length+pi.mjgang0.length)*3;
				} else
				{
					GLog("== error ==");
				}

				if(pi.mjgang0.length>0) pi.mjdesc.push("明杠(点)"+pi.mjgang0.length);
				for(var g=0;g<pi.mjgang0.length;g++)//点杠
				{
					var ganguid=pi.gang0uid[pi.mjgang0[g]];
					for(var j=0;j<pls.length;j++)//其他玩家
					{
						if(j!=i)//不是自己
						{
							var pj=pls[j];
							//if(ganguid>=0&&pj.uid!=tData.uids[ganguid]) continue;
							if(ganguid>=0&&pj.uid==tData.uids[ganguid])
							{
								if (tData.playType == PlayType.sxMethod)
								{
									pj.winone-=1;
								}else if (tData.playType == PlayType.bjMethod)
								{
									pj.winone-=3;
								}
								pj.mjdesc.push("点杠");
								break;
							}
							//else
							//pj.winone-=1;
						}
					}
				}
				if(pi.mjgang1.length>0) pi.mjdesc.push("暗杠"+pi.mjgang1.length);
				var gangWin=pi.mjgang1.length*2;
				for(var j=0;j<pls.length;j++)
				{
					if(j!=i)
					{
						var pj=pls[j];
						pj.winone-=gangWin;
					}
				}
				//补杠
				if(pi.mjgang2.length>0) pi.mjdesc.push("明杠(摸)"+pi.mjgang2.length);
				var gangWin2=pi.mjgang2.length;
				for(var j=0;j<pls.length;j++)
				{
					if(j!=i)
					{
						var pj=pls[j];
						pj.winone-=gangWin2;
					}
				}
			}
		}

		if(pl)
		{//算胡
			for(var i=0;i<pls.length;i++)
			{
				var pi=pls[i];
				if(pi.winType>0)
				{
					var is13=pi.huType==13;
					var allHand=pi.winType>=WinType.eatGangPut&&majiang.OnlyHand(pi);
					var num2=pi.huType==7?1:0;	if(num2==1&&majiang.canGang1([],pi.mjhand).length>0) num2=2;
					var num3=(num2>0||is13)?0:majiang.All3(pi);
					var sameColor=is13?false:majiang.SameColor(pi);
					var baseWin=1;

					if(!tData.noBigWin)
					{
						if(allHand) //门清
						{
							baseWin*=4;	pi.mjdesc.push("门清");
						}
						if(sameColor)//清一色
						{
							baseWin*=8;  pi.mjdesc.push("清一色");
						}
						if(is13)
						{
							baseWin*=24; pi.mjdesc.push("十三幺");
						}
						if(num2>0)
						{
							baseWin*=num2>1?16:8;  pi.mjdesc.push(num2>1?"龙七对":"七巧对");
						}
						if(num3>0)
						{
							baseWin*=num3>1?24:8;  pi.mjdesc.push(num3>1?"风一色":"大对碰");
						}
					}
					//if(baseWin==1) pi.mjdesc.push("平胡");

					if(!tData.noBigWin)
					{
						if(allHand)//门清
						{
							if(sameColor)//清一色
							{
								//if(is13)       else         //不存在
								if(num2>1)      baseWin=16;
								else if(num2>0) baseWin=8;   //7对
								else if(num3>0)	baseWin=8;   //大对碰
								else            baseWin=8;   //门清清一色
							}
							else
							{
								if(is13)         baseWin=24;  //门清13幺
								else if(num2>1)  baseWin=16;  //
								else if(num2>0)  baseWin=8;  //
								else if(num3>1)	 baseWin=24;  //门清风一色
								else if(num3>0)  baseWin=8;
							}
						}
						else
						{
							if(sameColor)
							{
								//if(is13)               else (不存在)
								if(num2>1)  baseWin=16;
								else if(num2>0)  baseWin=8;
								else if(num3>0)	baseWin=8;  //
							}
							else
							{
								//if(is13)       else    不需要处理
								//if(num2>0)     else    不需要处理
								//if(num3>0)	         不需要处理
							}
						}
					}

					switch(pi.winType)
					{//描述添加
						case WinType.eatPut:     pi.mjdesc.push("吃胡"); break;
						case WinType.eatGangPut: pi.mjdesc.push(tData.noBigWin?"吃胡":"吃杠"); break;
						case WinType.eatGang:    pi.mjdesc.push("抢杠"); break;
						case WinType.pickNormal: pi.mjdesc.push("自摸"); break;
						case WinType.pickGang1:
						case WinType.pickGang23: pi.mjdesc.push(tData.noBigWin?"自摸":"杠开"); break;
					}

					//自摸
					if(baseWin==1)
					{
						if(tData.noBigWin)//转转
						{
							if(pi.winType==WinType.pickNormal) baseWin*=2;
							else if (pi.winType>WinType.pickNormal&&tData.playType==PlayType.sxMethod) baseWin*=2;
							else if (pi.winType>WinType.pickNormal&&tData.playType==PlayType.bjMethod) baseWin*=3;
						}
						else//邵阳
						{
							if(pi.winType>=WinType.eatGangPut) baseWin*=2;
						}
					}

					pi.baseWin=baseWin;

					for(var j=0;j<pls.length;j++)
					{
						var pj=pls[j];
						if(pj.winType>0) continue;

						var roundWin=1;
						//点炮一家输
						if(pi.winType<=WinType.eatGangPut)
						{
							if(pj.uid!=tData.uids[tData.curPlayer]) continue;
							roundWin*=(!tData.noBigWin&&pi.winType==WinType.eatGangPut)?3:1;

							pj.mjdesc.push( (tData.noBigWin||pi.winType<WinType.eatGangPut)?"点炮":"杠炮");
						}
						//抢杠   邵阳包三家  转转不包
						if(pi.winType==WinType.eatGang)
						{
							if(pj.uid!=tData.uids[tData.curPlayer]) continue;
							roundWin*=tData.noBigWin?1:3;
							//pj.mjdesc.push("杠炮");
							pj.mjdesc.push("点炮");
						}

						//点杠者包3家  if(pi.winType==WinType.pickGang1){if(pj.uid!=tData.uids[tData.lastPutPlayer])	continue;roundWin*=3;}
						pi.winone+=roundWin*baseWin;
						pj.winone-=roundWin*baseWin;
					}
				}
			}
		}
	} */
	/*
	* 推倒胡结算
	* 当前包括了陕西推倒胡结算
	* */
	function CalculationTDH(tData, pls, pl) {
		if (tData.winners.length>0)
		{//结算杠
			for(var i=0;i<pls.length;i++)
			{
				var pi=pls[i];
				pi.winone+=(pi.mjgang1.length*2+pi.mjgang2.length)*3+pi.mjgang0.length;

				if(pi.mjgang0.length>0)
				{
					pi.mjdesc.push(pi.mjgang0.length+"明杠");
					for(var g=0;g<pi.mjgang0.length;g++)
					{
						var ganguid=pi.gang0uid[pi.mjgang0[g]];
						for(var j=0;j<pls.length;j++)
						{
							if(j!=i)
							{
								var pj=pls[j];
								//if(ganguid>=0&&pj.uid!=tData.uids[ganguid]) continue;
								if(ganguid>=0&&pj.uid==tData.uids[ganguid])
								{
									pj.winone-=1;
									pj.mjdesc.push("点杠");
								}
							}
						}
					}
				}

				if(pi.mjgang1.length>0)
				{
					pi.mjdesc.push(pi.mjgang1.length+"暗杠");
					var gangWin=pi.mjgang1.length*2;
					for(var j=0;j<pls.length;j++)
					{
						if(j!=i)
						{
							var pj=pls[j];
							pj.winone-=gangWin;
						}
					}
				}

				if(pi.mjgang2.length>0)
				{
					pi.mjdesc.push(pi.mjgang2.length+"明杠(摸)");
					var gangWin=pi.mjgang2.length;
					for(var j=0;j<pls.length;j++)
					{
						if(j!=i)
						{
							var pj=pls[j];
							pj.winone-=gangWin;
						}
					}
				}
			}
		}
		// 以上算杠结束，接下来就是算胡，算胡是分为两部分的，
		if (pl)
		{
			// 算基础分 baseWin
			var descTime = 0;
			for(var i=0;i<pls.length;i++)
			{
				var baseWin=0;
				var pi = pls[i];
				if (pi.winType>0)
				{
					if (pi.winType <= WinType.eatGang)
					{//点炮
						baseWin+=1;
					}
					else
					{// 自摸
						baseWin+=2;
					}
					// 算番, 算番来说，也是分为两部分的，一部分是牌型，一部分是特殊的胡牌方式
					// 特殊胡牌
					switch(pi.winType)
					{//描述添加
						case WinType.eatPut:     pi.mjdesc.push("吃胡"); break;
						case WinType.eatGangPut: pi.mjdesc.push(tData.noBigWin?"吃胡":"吃杠"); break;
						case WinType.eatGang:    pi.mjdesc.push("抢杠"); break;
						case WinType.pickNormal:
						case WinType.pickGang1:
						case WinType.pickGang23: pi.mjdesc.push("自摸"); break;
					}
					// 牌型
					if (pi.winType > WinType.eatGang)
					{
						baseWin*=3;
					}
					pi.winone+=baseWin;

					//接下来计算其他玩家对应的要扣除的分数
					for(var j=0;j<pls.length;j++)
					{
						var pj = pls[j];
						if(pj.winType>0) continue;

						//点炮一家输
						if(pi.winType<=WinType.eatGang)
						{//吃胡
							if(pj.uid!=tData.uids[tData.curPlayer]) continue;
							pj.winone-=baseWin;

							if (descTime == 0)
							{
								pj.mjdesc.push("点炮");
								descTime+=1;
							}
						}else
						{//自摸胡
							pj.winone-=(baseWin/3);
						}
					}
				}
			}
		}
	}
	/*
	* 宝鸡推倒胡的胜负分数的结算
	* */
	function CalculationBJ(tData, pls, pl) {

		if (tData.winners.length>0)
		{
			for(var i=0;i<pls.length;i++)
			{
				var pi=pls[i];
				pi.winone+=(pi.mjgang1.length*2+pi.mjgang2.length+pi.mjgang0.length)*3;

				if(pi.mjgang0.length>0)
				{
					pi.mjdesc.push(pi.mjgang0.length+"明杠");
					for(var g=0;g<pi.mjgang0.length;g++)
					{
						var ganguid=pi.gang0uid[pi.mjgang0[g]];
						for(var j=0;j<pls.length;j++)
						{
							if(j!=i)
							{
								var pj=pls[j];
								//if(ganguid>=0&&pj.uid!=tData.uids[ganguid]) continue;
								if(ganguid>=0&&pj.uid==tData.uids[ganguid])
								{
									pj.winone-=3;
									pj.mjdesc.push("点杠");
								}
							}
						}
					}
				}

				if(pi.mjgang1.length>0)
				{
					pi.mjdesc.push(pi.mjgang1.length+"暗杠");
					var gangWin=pi.mjgang1.length*2;
					for(var j=0;j<pls.length;j++)
					{
						if(j!=i)
						{
							var pj=pls[j];
							pj.winone-=gangWin;
						}
					}
				}

				if(pi.mjgang2.length>0)
				{
					pi.mjdesc.push(pi.mjgang2.length+"明杠(摸)");
					var gangWin=pi.mjgang2.length;
					for(var j=0;j<pls.length;j++)
					{
						if(j!=i)
						{
							var pj=pls[j];
							pj.winone-=gangWin;
						}
					}
				}
			}
		}

		// 以上算杠结束，接下来就是算胡，算胡是分为两部分的，
		if (pl)
		{
			// 算基础分 baseWin
			var descTime = 0;
			var descTime2 = 0;
			var fan = 1;
			for(var i=0;i<pls.length;i++)
			{
				var baseWin=0;
				var pi = pls[i];
				if (pi.winType>0)
				{
					if (pi.winType <= WinType.eatGang)
					{//点炮
						baseWin+=3;
						if(tData.withPao)
						{
							pi.mjdesc.push("下炮"+(pi.paoNum));
							for(var j=0;j<pls.length;j++)
							{
								var pj = pls[j];
								//找到点炮的那个人
								if (pj.winType>0) continue;
								if (pj.uid!=tData.uids[tData.curPlayer]) continue;

								if (descTime2 == 0)
								{
									pj.mjdesc.push("下炮"+(pj.paoNum));
									descTime2++;
								}
								baseWin += (pi.paoNum + pj.paoNum);
							}
							// var pj = pls.indexOf(tData.uids[tData.curPlayer]);
							// baseWin+=(pi.paoNum+pj.paoNum);
						}
					}else
					{
						baseWin+=(2 * 3);
						//
						if(tData.withPao)
						{
							pi.mjdesc.push("下炮"+(pi.paoNum));
							for(var j=0;j<pls.length;j++)
							{
								if(i==j) continue;
								var pj = pls[j];
								pj.mjdesc.push("下炮"+(pj.paoNum));
								baseWin += (pi.paoNum + pj.paoNum);
							}
						}
					}

					// 算番, 算番来说，也是分为两部分的，一部分是牌型，一部分是特殊的胡牌方式
					// 特殊胡牌
					if (pi.winType == WinType.eatPut || pi.winType == WinType.eatGangPut ||pi.winType == WinType.pickNormal)
					{
						baseWin*=1;
						fan*=1;
					}else
					{
						baseWin*=3;
						fan*=3;
					}
					switch(pi.winType)
					{//描述添加
						case WinType.eatPut:     pi.mjdesc.push("吃胡"); break;
						case WinType.eatGangPut: pi.mjdesc.push(tData.noBigWin?"吃胡":"吃杠"); break;
						case WinType.eatGang:    pi.mjdesc.push("抢杠"); break;
						case WinType.pickNormal: pi.mjdesc.push("自摸"); break;
						case WinType.pickGang1:
						case WinType.pickGang23: pi.mjdesc.push("杠开"); break;
					}
					// 牌型
					var is13=pi.huType==13;
					var num2=pi.huType==7?1:0;	if(num2==1&&majiang.canGang1([],pi.mjhand).length>0) num2=2;
					var num3=(num2>0||is13)?0:majiang.All3(pi);
					if (num2>0||num3>0)
					{
						baseWin*=3;
						fan*=3;
						if (num2>0) pi.mjdesc.push("小七对");
						if (num3>0) pi.mjdesc.push("大对子");
					}
					pi.winone+=baseWin;

					//接下来计算其他玩家对应的要扣除的分数
					for(var j=0;j<pls.length;j++)
					{
						var pj = pls[j];
						if(pj.winType>0) continue;

						//点炮一家输
						if(pi.winType<=WinType.eatGang)
						{//吃胡
							if(pj.uid!=tData.uids[tData.curPlayer]) continue;
							//点炮的那个人
							pj.winone-=baseWin;
							if (descTime == 0)
							{
								pj.mjdesc.push("点炮");
								descTime+=1;
							}
						}else
						{//自摸胡

							if(!tData.withPao)
							{
								pj.winone-=(baseWin/3);
							}
							else
							{
								pj.winone -= ((2 + pi.paoNum + pj.paoNum) * fan);
							}

						}
					}
				}
			}
		}
	}
	/*
	* 榆林结算
	* */
	function gangDesc(pi)
	{
		if(pi.mjgang0.length+pi.mjgang2.length>0)
		{
			pi.mjdesc.push("明杠"+(pi.mjgang0.length+pi.mjgang2.length));
		}

		if(pi.mjgang1.length>0)
		{
			pi.mjdesc.push("暗杠"+pi.mjgang1.length);
		}
	}
	function ylGang2Point(num) {
		if (num > 30) {
			return 10;
		} else {
			return num%10;
		}
	}
	function ylGangCalculate(pl) {
		if (pl.mjgang0.length > 0 ) {
			for(var i=0; i < pl.mjgang0.length; i++) {
				pl.winone+=ylGang2Point(pl.mjgang0[i]);
			}
		}
		if (pl.mjgang1.length > 0) {
			for(var i=0; i < pl.mjgang1.length; i++) {
				pl.winone+=2*ylGang2Point(pl.mjgang1[i]);
			}
		}
		if (pl.mjgang2.length > 0) {
			for(var i=0; i < pl.mjgang2.length; i++) {
				pl.winone+=ylGang2Point(pl.mjgang2[i]);
			}
		}
	}
	function CalculationYL(tData, pls) {
		if (tData.winners.length > 0) {
			var descTime = 0;
			for(var i=0; i<pls.length;i++) {
				var pi = pls[i];
				if (pi.winType > 0)
				{//杠随胡
					if (pi.winType <= WinType.eatGang)
					{// 点炮胡
						// GLog("=== 点炮胡 ===");
						if (tData.uids.indexOf(pi.uid) == tData.zhuang) {
							// 给庄家点炮了
							// GLog("=== 给庄家点炮 ===");
							// 1. 杠结算
							ylGangCalculate(pi);
							// 2. 其他结算
							pi.winone+=ylGang2Point(tData.lastPut);
							// 3. 庄家*2
							pi.winone*=2;
							// desc
							gangDesc(pi);
							// 结算其他玩家
							for(var j=0; j < pls.length; j++) {
								var pj = pls[j];
								if (pj.winType>0) continue;
								if (pj.uid != tData.uids[tData.curPlayer]) continue;
								// 筛选出点炮的人
								pj.winone-=pi.winone;
								pj.mjdesc.push("点炮");
								for(var k=0; k < pls.length; k++) {
									var pk = pls[k];
									if (pk.winType > 0) continue;
									if (pk.uid == tData.uids[tData.curPlayer]) continue;
									if (pj.isTing) {
										pk.winone-=pi.winone;
									} else {
										pj.winone-=pi.winone;
									}
								}
							}
							if (tData.winners.length == 1) {
								// 庄家收3家
								pi.winone*=3;
							} else if (tData.winners.length == 2) {
								// 两家获胜，庄家收2家
								pi.winone*=2;
							}
						}
						else {// 非庄家
							// GLog("=== 给闲家点炮 ===");
							// 1. 杠结算
							ylGangCalculate(pi);
							// GLog("===== 杠结算完成 =====");
							// 2. 其他结算
							pi.winone+=ylGang2Point(tData.lastPut);
							// GLog("=== 给闲家点炮其他结算完成 ===");
							// gang desc
							// gangDesc(pi);
							// 其他玩家结算
							for(var j=0; j < pls.length; j++) {
								// GLog("== 给闲家点炮 其他玩家结算 ==");
								var pj = pls[j];
								if (pj.winType>0) continue;
								if (pj.uid != tData.uids[tData.curPlayer]) continue;
								// 找到点炮的人
								pj.mjdesc.push("点炮");
								if (tData.uids.indexOf(pj.uid) == tData.zhuang) {
									// 庄家点炮 *2
									pj.winone-=2*pi.winone;
									// 庄家听牌
									for(var k=0; k < pls.length; k++) {
										var pk = pls[k];
										if (pk.winType > 0) continue;
										if (pk.uid == tData.uids[tData.curPlayer]) continue;
										if (pj.isTing) {
											pk.winone-=pi.winone;
										} else {
											pj.winone-=pi.winone;
										}
									}
								}
								else {
									// 闲家点炮
									// GLog("== 闲家点炮 ==");
									pj.winone-=pi.winone;
										// 如果听牌了,其他玩家自己陪
									for(var k=0; k < pls.length; k++) {
										var pk = pls[k];
										if (pk.winType>0) continue;
										if (pk.uid == tData.uids[tData.curPlayer]) continue;
										// GLog("== 其他玩家结算 ==");
										if (pj.isTing) {
											if(tData.uids.indexOf(pk.uid) == tData.zhuang) {
												pk.winone-=pi.winone*2;
											} else {
												pk.winone-=pi.winone;
											}
										} else {
											if (tData.uids.indexOf(pk.uid) == tData.zhuang)
											{
												pj.winone-=pi.winone*2;
											} else {
												pj.winone-=pi.winone;
											}
										}
									}
								}
							}
							if (tData.winners.length == 1) {
								// 庄2倍
								pi.winone*=4;
							} else if (tData.winners.length == 2) {
								// 判断获胜有没有庄家
								var withZhuangWin = false;
								for(var l=0; l < tData.winners.length; l++) {
									if (tData.zhuang == tData.winners[l]) {
										withZhuangWin = true;
									}
								}
								if (withZhuangWin) {
									pi.winone*=2;
								} else {
									pi.winone*=3;
								}
							}
						}
					}
					else {// 自摸胡
						// 先处理自摸胡，这个应该相对会简单些
						if (tData.uids.indexOf(pi.uid)==tData.zhuang) {
							// 庄家自摸
							// 1. 杠结算
							ylGangCalculate(pi);
							// 2. 其他结算
							// GLog("=== 庄家自摸 pi.winone: " + pi.winone);
							pi.winone+=ylGang2Point(pi.mjhand[pi.mjhand.length-1]);
							// 3. 庄家*2
							pi.winone*=2;
							// 自摸 *2
							pi.winone*=2;
							// desc
							pi.mjdesc.push("自摸");
							gangDesc(pi);
							// 其他3家扣分
							for(var j=0; j < pls.length; j++) {
								var pj = pls[j];
								if (pi != pj) {
									pj.winone-=pi.winone;
								}
							}
							// 4. 自摸3家给
							pi.winone*=3;
						} else {// 闲家自摸
							// 1. 杠结算
							ylGangCalculate(pi);
							// 2. 其他结算
							pi.winone+=ylGang2Point(pi.mjhand[pi.mjhand.length-1]);
							// 3. 自摸*2
							pi.winone*=2;
							//desc
							pi.mjdesc.push("自摸");
							gangDesc(pi);
							// 其他玩家扣分
							for(var j=0; j < pls.length; j++) {
								var pj = pls[j];
								if (pj != pi) {
									if (tData.uids.indexOf(pj.uid)==tData.zhuang) {
										pj.winone-=2*pi.winone;
									} else {
										pj.winone-=pi.winone;
									}
								}
							}
							// 庄家2倍，剩余两家一家一倍 一共是4倍
							pi.winone*=4;
						}
					}
				}
			}
		}
	}
	/*
	* 杠不随胡，点杠玩家扣分
	* 点杠者扣1分
	* 详细参考 推倒胡/划水 麻将规则
	* */
	function dotKung(pi,pls,score,i) {
		if(pi.mjgang0.length>0)
		{
			pi.mjdesc.push("明杠(点)"+pi.mjgang0.length);
			for(var g=0;g<pi.mjgang0.length;g++)//点杠
			{
				var ganguid=pi.gang0uid[pi.mjgang0[g]];
				for(var j=0;j<pls.length;j++)//其他玩家
				{
					if(j!=i)//不是自己
					{
						var pj=pls[j];
						if(ganguid>=0&&pj.uid==tData.uids[ganguid])
						{
							pj.winone-=score;
							pj.mjdesc.push("点杠");
							break;
						}
					}
				}
			}
		}
	}
	/*
	* 杠不随胡，暗杠其他玩家反陪
	* 暗杠，3家反陪，一家2分
	* 详细参考 推倒胡/划水 麻将规则
	* */
	function concealedKung(pi,pls) {
		if(pi.mjgang1.length>0)
		{
			pi.mjdesc.push("暗杠"+pi.mjgang1.length);
			var gangWin=pi.mjgang1.length*2;
			for(var j=0;j<pls.length;j++)
			{
				if(j!=i)
				{
					var pj=pls[j];
					pj.winone-=gangWin;
				}
			}
		}
	}
	/*
	* 杠不随胡，自摸明杠其他玩家的反陪
	* 3家反陪，一家1分
	* 详细参考 推倒胡/划水 麻将规则
	* */
	function drawExposedKung(pi,pls) {
		if(pi.mjgang2.length>0)
		{
			pi.mjdesc.push("明杠(摸)"+pi.mjgang2.length);
			var gangWin2=pi.mjgang2.length;
			for(var j=0;j<pls.length;j++)
			{
				if(j!=i)
				{
					var pj=pls[j];
					pj.winone-=gangWin2;
				}
			}
		}
	}
	/*
	* 杠不随胡的时候，杠的结算
	* 目前，推倒胡及划水麻将都可用
	* 详细可参考对应规则
	* */
	function gangCalNoHu(pls)
	{
		for(var i=0; i < pls.length; i++)
		{
			var pi = pls[i];
			// 1.开杠玩家杠结算
			pi.winone+=(pi.mjgang1.length*2+pi.mjgang2.length)*3+pi.mjgang0.length;
			// 2. 其他玩家反陪杠钱
			// 点杠
			dotKung(pi,pls,1,i);
			// 暗杠
			concealedKung(pi,pls);
			// 自摸明杠
			drawExposedKung(pi,pls);
		}
	}
	function CalculationHS(tData, pls, pl,tb)
	{
		GLog("--------wei--------CalculationHS =");
		if(tData.winners.length > 0)
		{	// 有玩家获胜
			for(var i=0;i<pls.length;i++)
			{
				var pi=pls[i];
				pi.winone+=(pi.mjgang1.length*2+pi.mjgang2.length+pi.mjgang0.length)*3;

				if(pi.mjgang0.length>0)
				{
					pi.mjdesc.push(pi.mjgang0.length+"明杠");
					for(var g=0;g<pi.mjgang0.length;g++)
					{
						var ganguid=pi.gang0uid[pi.mjgang0[g]];
						for(var j=0;j<pls.length;j++)
						{
							if(j!=i)
							{
								var pj=pls[j];
								//if(ganguid>=0&&pj.uid!=tData.uids[ganguid]) continue;
								if(ganguid>=0&&pj.uid==tData.uids[ganguid])
								{
									pj.winone-=3;
									pj.mjdesc.push("点杠");
								}
							}
						}
					}
				}

				if(pi.mjgang1.length>0)
				{
					pi.mjdesc.push(pi.mjgang1.length+"暗杠");
					var gangWin=pi.mjgang1.length*2;
					for(var j=0;j<pls.length;j++)
					{
						if(j!=i)
						{
							var pj=pls[j];
							pj.winone-=gangWin;
						}
					}
				}
				
				if(pi.mjgang2.length>0)
				{
					pi.mjdesc.push(pi.mjgang2.length+"明杠(摸)");
					var gangWin=pi.mjgang2.length;
					for(var j=0;j<pls.length;j++)
					{
						if(j!=i)
						{
							var pj=pls[j];
							pj.winone-=gangWin;
						}
					}
				}
			}
		}
		else
		{// 荒庄
			tData.isLastHuang=true;
		}
		// 以上算杠结束，接下来就是算胡，算胡是分为两部分的，
		if (pl)
		{
			if(tData.winners.length<=2) {
				// 算基础分 baseWin
				var descTime = 0;
				for (var i = 0; i < pls.length; i++) {
					var baseWin = 0;
					var pi = pls[i];
					if (pi.winType > 0) {
						// 算番
						// 牌型
						GLog("-----weiwei----pi.huType  = "+pi.huType );
						var num2 = pi.huType == 7 ? 1 : 0;
						GLog("-----weiwei----num2 = "+num2);
						if (num2 == 1 && majiang.canGang1([], pi.mjhand).length > 0) num2 = 2;
						GLog("-----weiwei----majiang.canGang1([], pi.mjhand).length = "+majiang.canGang1([], pi.mjhand).length);

						GLog("-----weiwei----num2 = "+num2);
						if (num2 > 0) {// 七小对，还是豪华七小对
						//	var huCardNum=0;
							var singleCards =0;
							var huCardNum=0;
							var huCardNum_MAX = 0;

							// 这里原来的if-else里的内容完全一样，所以我删掉了else [JJ]
								for(var k=0;k<pi.mjhand.length;k++){
									if(pi.mjhand[k] == 71){continue;} // bug修复 红中被重复计入最大数目 [JJ]

									huCardNum=0;
									for(var j=0;j<pi.mjhand.length;j++){
										if(pi.mjhand[k]==pi.mjhand[j]){
											huCardNum+=1;
										}
									}
									if(huCardNum==1 && pi.mjhand[k] != 71){ // bug修复 红中的单张牌不需要-1 [JJ]
										singleCards-=1;
									}
									if(huCardNum>huCardNum_MAX){
										huCardNum_MAX =huCardNum;
									}
								}
								for(var j=0;j<pi.mjhand.length;j++){
									if(pi.mjhand[j]==71 &&tData.withZhong){
										GLog("红中+1， 红中辣子");
										huCardNum_MAX++;
									}
								}

							huCardNum_MAX = huCardNum_MAX+singleCards;

							/*for(var k=0;k<pi.mjhand.length;k++)//老的  判断自摸最后抓的牌是不是有4张  有才是龙七对  产品问题
							{

								if(pi.mjhand[k]== pi.mjhand[pi.mjhand.length-1])
								{
									huCardNum+=1;
								}
							}*/
							GLog("-----weiwei----huCardNum_MAX = "+huCardNum_MAX);
							if (huCardNum_MAX>3) {// 龙七对
								// 点炮胡1分、自摸胡都是2分
								if (pi.winType < WinType.pickNormal) {
									baseWin += 15;
									pi.mjdesc.push("点胡龙七对");
								}
								else {
									baseWin += 10;
									pi.mjdesc.push("自摸龙七对");
								}
							}
							else {//普通七对
								// 点炮胡1分、自摸胡都是2分
								if (pi.winType < WinType.pickNormal) {
									//baseWin += 10;
									baseWin += 9;
									pi.mjdesc.push("小七对");
								}
								else {
									baseWin += 6;
									pi.mjdesc.push("自摸小七对");
								}
							}
						}
						else {// 非7对

							GLog("-----weiwei----pi.winType = "+pi.winType);
							if (pi.winType < WinType.pickNormal) {
								if(pi.winType == WinType.eatGang){//增加  抢杠胡算分
									baseWin += 9;
									pi.mjdesc.push("抢杠胡");
								}else{
									// baseWin += 5;
									baseWin += 3;
								}

							}
							else {
								if(pi.winType>=WinType.pickGang1)
								{
									//baseWin += 4;
									baseWin += 6;
									pi.mjdesc.push("杠开");
								}
								else
								{
									baseWin += 2;
									pi.mjdesc.push("自摸");
								}
							}
						}



						console.log("-------------------------tb.tData.withSixCards = "+tb.tData.withSixCards);
						try{
						if (pi.winType > WinType.eatGang && tb.tData.withSixCards) {//自摸
							var randCards =[];
							for(var j =0;j<6;j++) {
								if(tData.cardNext<tb.cards.length){
									randCards.push(tb.cards[tData.cardNext++]);
								}


							}

							for(var j =0;j<randCards.length;j++)
							{
								GLog("------------------------------randCards[j] = "+randCards[j]);
								if(judgeInclude(randCards[j])){
									baseWin ++;
									GLog("------------------------------baseWin + 1");
								}

							}
						}
					}catch (e){
						JSON.stringify(e);
					}







						// 赢家总分
						GLog("----wei---pi.winone = "+tData.fishNum);
						if(tData.fishNum == 1)
						{
							tData.fishNum =0;
						}
						baseWin +=tData.fishNum;

						// 自摸3家陪，等于也是3番
						if (pi.winType > WinType.eatGang) {//自摸
							baseWin *= 3;
						}


						pi.winone += baseWin;



						GLog("----wei---pi.winone = "+pi.winone);
						GLog("----wei---tData.fishNum = "+tData.fishNum);

						//接下来计算其他玩家对应的要扣除的分数
						for (var j = 0; j < pls.length; j++) {
							var pj = pls[j];
							if (pj.winType > 0) continue;

							//点炮一家输
							if (pi.winType <= WinType.eatGang) {//吃胡
								if (pj.uid != tData.uids[tData.curPlayer]) continue;
								pj.winone -= baseWin;

								if (descTime == 0) {
									pj.mjdesc.push("点炮");
									descTime += 1;
								}
							}
							else {//自摸胡
								pj.winone -= (baseWin / 3);
							/*	pj.winone  = parseInt(pj.winone);
								GLog("----wei---pj.winone = "+pj.winone);*/
							}
						}
					}
				}
			}
			else{//一炮三响的时候
				for(var i=0;i<pls.length;i++)
				{
					var pi = pls[i];
					if(pi.winType>0)
					{
						// pi.winone-=5;
						pi.winone+=3;
					}
					else
					{
						// pi.winone+=15;
						pi.winone-=9;
						pi.mjdesc.push("一炮三响");
					}
				}
			}
		}
		// 结算完成后，维护上局是否是荒庄，是否跟庄
		// GLog("== pls[0].mjput[0] : " + pls[0].mjput[0]);
		if(tData.winners.length>0)
		{
			tData.isLastHuang=false;
		}

		// 跟庄的判断，如果
		if(tData.firstFourMJPut==4&&pls[0].mjput[0]==pls[1].mjput[0]&&pls[2].mjput[0]==pls[3].mjput[0]&&pls[1].mjput[0]==pls[2].mjput[0]&&pls[0].mjput[0])
		{
			tData.isLastFollowBanker=true;
			for(var i=0; i < pls.length; i++)
			{
				var pi = pls[i];
				if(tData.uids.indexOf(pi.uid) == tData.zhuang)
				{
					pi.mjdesc.push("跟庄");
					if(tData.isLastHuang==true)
					{

					}else{
						pi.winone-=3;
					}
				}
				else
				{
					if(tData.isLastHuang==true)
					{

					}else{
						pi.winone+=1;
					}
				}
			}
		}
		else
		{
			tData.isLastFollowBanker=false;
		}
		// 如果跟庄，庄家给每家一分
		// GLog("=== 上把是不是跟庄 ===" + tData.isLastFollowBanker);
	}

	function judgeInclude(x)
	{
		var winCards=[1,5,9,11,15,19,21,25,29];
		for(var i =0;i<winCards.length;i++){
			if(x == winCards[i]){
				return true;
			}
		}
		return false;
	}

	function EndGame(tb,pl)
	{
		var tData=tb.tData;
		var pls=[];

		tb.AllPlayerRun(function(p)
		{
			p.mjState=TableState.roundFinish;
			pls.push(p);
			if(p.winType>0)
			{
				tData.winners.push(tData.uids.indexOf(p.uid));
			}
		});
		if(tb.tData.playType == PlayType.xaMethod)
		{//西安项目
			CalculationXA(tData, pls);
		} else if (tb.tData.playType == PlayType.sxMethod) {
			CalculationTDH(tData, pls, pl);
		} else if (tb.tData.playType == PlayType.bjMethod) {
			CalculationBJ(tData,pls, pl);
		} else if (tb.tData.playType == PlayType.ylMethod) {
			CalculationYL(tData, pls);
		} else if (tb.tData.playType == PlayType.hsMethod) {
			CalculationHS(tData, pls, pl,tb);
		}

		// GLog("-- round Finish money cal --");
		tData.tState=TableState.roundFinish;
        var owner = tb.players[tData.uids[0]].info;
        if(!tb.tData.coinRoomCreate){//金币场新增代码if判断
            if (!owner.$inc) {
                owner.$inc = {money: -tb.createPara.money};
            }
        }
        tb.AllPlayerRun(function (p) {
            //金币场新增代码
            if(tb.tData.coinRoomCreate)
            {
				p.winone*=10;//金币与分数比率为10:1
                var info=p.info;
                if(!info.$inc){
                    info.$inc={coin:p.winone};
                }else{
                    info.$inc.coin+=p.winone;
                }
            }
			p.winall += p.winone;
	    });

		//新添
		tb.AllPlayerRun(function(p) {
			if(!p.info.$inc) {
				p.info.$inc = {playNum:1}; // +playNum
			} else if (!p.info.$inc.playNum) {
				p.info.$inc.playNum = 1;
			} else {
				p.info.$inc.playNum += 1;
			}
		});

		tData.roundNum--;
		var playInfo=null;
		var roundEnd={players:tb.collectPlayer('mjhand','mjdesc','winone','winall','winType','baseWin','mjgang0','mjpeng','mjgang2'),tData:app.CopyPtys(tData)};
		if(playInfo) {
			roundEnd.playInfo=playInfo;
		}

		GLog("---WEI---1");
		var randomCards=[];
		if(tb.tData.playType == PlayType.hsMethod && tb.tData.withSixCards){
			GLog("---WEI---2");
			try{
				if (pl.winType > WinType.eatGang)//自摸
				{
					console.log("**********----***2");
					tData.cardNext -=6;
					for(var j =0;j<6;j++)
					{
						if(tData.cardNext<tb.cards.length) {
							console.log("**********----***2");
							randomCards.push(tb.cards[tData.cardNext++]);
						}
					}
				}

			}catch (e){
				JSON.stringify(e);
			}
			GLog("---WEI---3");
		}


		try {
			if (pl.winType > WinType.eatGang)//自摸
			{
				GLog("---WEI---x");
				roundEnd.isZiMo = true;
				roundEnd.sixRandomCards = randomCards;
			} else {
				GLog("---WEI---y");
				roundEnd.isZiMo = false;
			}
		}catch (e){
			JSON.stringify(e);
		}

		GLog("---WEI---4");
		tb.NotifyAll("roundEnd",roundEnd);
        tb.mjlog.push("roundEnd",roundEnd);//一局结束
		GLog("---WEI---5");
		tb.AllPlayerRun(function(p)
		{
			p.skipHu=false;//重置过胡
		});
		if(tData.playType==PlayType.ylMethod)
		{
			tb.AllPlayerRun(function(p)
			{
				if(p.isTing) p.isTing=false;
				p.canNotPutList.splice(0,p.canNotPutList.length);
				p.winList.splice(0,p.winList.length);
			});
		}

		if(tData.roundNum==0) playInfo=EndRoom(tb);//结束
	}

	Table.prototype.GamePause=function()
	{
		return  this.PlayerCount()!=4 || this.tData.delEnd!=0 || !this.AllPlayerCheck(function(pl){ return pl.onLine; });
	}
	Table.prototype.MJTick=function(pl,msg,session,next)
	{
		next(null,null);
		var rtn={serverNow:Date.now()};
		pl.mjTickAt=rtn.serverNow;	pl.tickType=msg.tickType;
		rtn.players=this.PlayerPtys( function(p){ return {mjTickAt:p.mjTickAt,tickType:p.tickType}  });
		this.NotifyAll("MJTick",rtn);
	}
	Table.prototype.MJPut=function(pl,msg,session,next)
	{

		next(null,null);  //if(this.GamePause()) return;
		var tData=this.tData;

		///zys add ---
		majiang.init(this);

		if (tData.playType != PlayType.ylMethod)
		{
			if(tData.tState==TableState.waitPut&&pl.uid==tData.uids[tData.curPlayer])
			{
				var cdIdx=pl.mjhand.indexOf(msg.card);

				if(cdIdx>=0)
				{
					pl.mjhand.splice(cdIdx,1);
					pl.mjput.push(msg.card);

					pl.skipHu=false;
					msg.uid=pl.uid;
					tData.lastPut=msg.card;
					tData.lastPutPlayer=tData.curPlayer;
					tData.tState=TableState.waitEat;
					pl.mjState=TableState.waitCard;
					pl.eatFlag=0;//自己不能吃

					if (tData.putType > 0 && tData.putType < 4)
						tData.putType = 4;
					else tData.putType = 0;
					var hunum=0;
					this.AllPlayerRun(function(p)
					{
						if(p!=pl)
						{
							//判断玩家 状态 是不是可以胡
							p.eatFlag=GetEatFlag(p,tData);

							if (p.eatFlag != 0)
								p.mjState = TableState.waitEat;
							else p.mjState=TableState.waitCard;
							if(p.eatFlag>=8){ hunum +=1; } // 一炮多响判断
						}
					});

					if(hunum > 1)
					{
						this.AllPlayerRun(function(p){
							if(p.eatFlag>=8)
							{
								p.mjhand.push(tData.lastPut);
								p.winType = WinType.eatPut;
							}
						});
						EndGame(this,pl);
						return ;
					}

					var cmd=msg.cmd; delete msg.cmd;
					msg.putType=tData.putType;
					//msg.hunum=hunum;
					// 53-56
					if(tData.playType==PlayType.hsMethod&&!tData.hasPeng&&tData.putType==0&&tData.cardNext>=53&&tData.cardNext<=56)
					{
						tData.firstFourMJPut+=1;
						// GLog("=== 是普通出牌吗？" + tData.putType);
					}
					this.NotifyAll(cmd,msg);
					this.mjlog.push(cmd,msg);//打牌
					SendNewCard(this);//打牌后尝试发牌
				}
			}
		}
		else
		{//榆林玩法
			if(tData.tState==TableState.waitPut&&pl.uid==tData.uids[tData.curPlayer])
			{
				if (msg.tingClicked&&!pl.isTing)
				{// yl ting
					pl.canNotPutList = majiang.canTing(true,pl.mjhand,false);
					if (pl.canNotPutList.length < pl.mjhand.length && pl.canNotPutList.indexOf(msg.card) < 0 && pl.mjhand.indexOf(msg.card)>=0) {
						pl.isTing = true;
						msg.tingClicked=true;
						pl.canNotPutList.splice(0,pl.canNotPutList.length);
						pl.canNotPutList = pl.mjhand.slice();
						if (pl.canNotPutList.indexOf(msg.card) >= 0) {
							pl.canNotPutList.splice(pl.canNotPutList.indexOf(msg.card),1);
						}
						pl.winList.splice(0, pl.winList.length);
						var cds = pl.mjhand.slice();
						cds.splice(cds.indexOf(msg.card),1);
						pl.winList=majiang.tingWinList(true, cds,false);
					} else {
						msg.tingClicked=false;
					}
				}

				var cdIdx=pl.mjhand.indexOf(msg.card);

				if(cdIdx>=0)
				{
					pl.mjhand.splice(cdIdx,1);
					if(msg.tingClicked)
					{
						msg.card+=100;
					}
					pl.mjput.push(msg.card);

					pl.skipHu=false;
					msg.uid=pl.uid;
					tData.lastPut=msg.card;
					tData.lastPutPlayer=tData.curPlayer;
					tData.tState=TableState.waitEat;
					pl.mjState=TableState.waitCard;
					pl.eatFlag=0;//自己不能吃

					if (tData.putType > 0 && tData.putType < 4)
						tData.putType = 4;
					else tData.putType = 0;

					if(tData.putType==4&&pl.isTing&&pl.canNotPutList.length<pl.mjhand.length)
					{//gangput maintain canNotPutList
						pl.canNotPutList.splice(0,pl.canNotPutList.length);
						for (var i = 0; i < pl.mjhand.length; i++) {
							pl.canNotPutList.push(pl.mjhand[i]);
						}
					}

					var hunum=0;

					this.AllPlayerRun(function(p)
					{
						if(p!=pl)
						{
							//判断玩家 状态 是不是可以胡
							p.eatFlag=GetYLEatFlag(p,tData);
							if (p.eatFlag != 0)
							{
								p.mjState=TableState.waitEat;
							}
							else p.mjState=TableState.waitCard;

							if(p.eatFlag>=8) hunum +=1;
						}
					});
					// tData.winners.splice(0,tData.winners.length);
					if(hunum > 1)
					{
						this.AllPlayerRun(function(p){
							if(p.eatFlag>=8 )
							{
								p.mjhand.push(tData.lastPut);
								p.winType = WinType.eatPut;
							}
						});
						EndGame(this,pl);
						return ;
					}

					var cmd=msg.cmd; delete msg.cmd;
					msg.putType=tData.putType;

					//msg.hunum=hunum;
					this.NotifyAll(cmd,msg);
					this.mjlog.push(cmd,msg);//打牌
					SendNewCard(this);//打牌后尝试发牌
				}

				var cmd=msg.cmd; delete msg.cmd;
				msg.putType=tData.putType;
				//msg.hunum=hunum;
				// GLog("-------MJPut-11-"+util.inspect(msg,true,4));
				// GLog("-------MJPut-22-"+util.inspect(cmd));
				this.NotifyAll(cmd,msg);
				this.mjlog.push(cmd,msg);//打牌
				SendNewCard(this);//打牌后尝试发牌
			}
		}


	}
	//发牌不要求在线
	function SendNewCard(tb)
	{
			// GLog("SendNewCard");
		var tData=tb.tData;
		var cards=tb.cards;
		if(tData.delEnd==0&&tb.AllPlayerCheck(function(pl){ return pl.mjState==TableState.waitCard}))
		{
			if(tData.cardNext<cards.length)
			{
				console.log("SendNewCard");
				var newCard=cards[tData.cardNext++];
				if(tData.putType==0||tData.putType==4) { tData.curPlayer=(tData.curPlayer+1)%4; }
				var uid=tData.uids[tData.curPlayer];
				var pl=tb.getPlayer(uid);
				pl.mjhand.push(newCard);
				pl.isNew=true;
				tData.tState=TableState.waitPut;
				tb.AllPlayerRun(function(pl){ pl.mjState=TableState.waitPut; pl.eatFlag=0; });
				if(pl.onLine)pl.notify("newCard",newCard);
				tb.NotifyAll("waitPut",tData);

				tb.mjlog.push("newCard",app.CopyPtys(tData));//发牌
			}
			else//没有牌了
			{
				EndGame(tb,null);
			}
		}
	}
	function EndRoom(tb,msg)
	{
		var playInfo=null;
		if(tb.tData.roundNum>-2)
		{
			if(tb.tData.roundNum!=tb.createPara.round)
			{

				logid++;
				var playid=app.serverId+"_"+logid;
				var endTime=new Date();
				var nowStr=endTime.Format("yyyy-MM-dd hh:mm:ss");
				var startTimeStr = tb.tData.startTime.Format("yyyy-MM-dd hh:mm:ss");
				var tableName=endTime.Format("yyyy-MM-dd");
				var tData=tb.tData;

				playInfo={ip:app.getPublicIp(),owner:tData.owner,money:tb.createPara.money,now:nowStr,tableid:tb.tableid,logid:playid,players:[]};

				//战绩日志
				var logData = {};
				logData.uid1 = tData.owner;
				logData.gameid = tb.createPara.nPlayType; //tb.nPlayType;
				logData.start = startTimeStr;
				logData.time = nowStr;
				logData.money = tb.createPara.money;
				logData.tableid = tb.tableid;
				logData.logid = playid;
				logData.createRound = tb.createPara.round;
				logData.remainRound = tb.tData.roundNum;

				var logIndex = 1;

				tb.AllPlayerRun(function(p)
				{
					var pinfo={};
					pinfo.uid=p.uid;
					pinfo.winall=p.winall;
					pinfo.nickname=p.info.nickname||p.info.name;
					pinfo.money=p.info.money;
					playInfo.players.push(pinfo);

					//战绩日志
					if(logData.uid1 == p.uid) {
						logData['winall1'] = p.winall;
						logData['money1'] = p.info.money;
					} else {
						logIndex++;
						logData['uid' + logIndex] = p.uid;
						logData['winall' + logIndex] = p.winall;
						logData['money' + logIndex] = p.info.money;
					}
				});

				//战绩日志，如果不足死人添加默认值
				if(logIndex < 4) {
					for(var logNum = logIndex + 1; logNum <= 4; logNum++) {
						logData['uid' + logNum] = 0;
						logData['winall' + logNum] = 0;
						logData['money' + logNum] = 0;
					}
				}

				doGameLog(logData);
				//战绩日志END



				tb.AllPlayerRun(function(p)
				{
					var pinfo={};
					pinfo.uid=p.uid;
					pinfo.winall=p.winall;
					pinfo.nickname=p.info.nickname||p.info.name;
					pinfo.money=p.info.money;
					playInfo.players.push(pinfo);
				});
				GLog("*****************战斗回放记录********************");
				GLog("" + JSON.stringify(playInfo));
				GLog("*****************战斗回放记录********************");
				tb.AllPlayerRun(function(p)
				{
					var table="majiangLog";
					app.mdb.db.collection("majiangLog").update({_id:p.uid},
					{$push:{logs:{$each:[playInfo],$slice: -50}}},{upsert:true}, function(er,doc)
					{
					});
				});


				//统计场数
				var dayID=parseInt(endTime.Format("yyyyMMdd"));
				/*字段 添加*/
				tb.AllPlayerRun(function(p)
				{
					var table="majiangLog";
					app.mdb.db.collection("majiangLog").update({_id:p.uid},
						{$push:{logs:{$each:[playInfo],$slice: -50}},$set:{lastGameDay:dayID}},{upsert:true}, function(er,doc)
						{
						});

				});
				/*字段 添加*/
				var methodArray=["tdh","xa","bj","yl","hs"];
			    var inc={};	inc[tData.roundAll+"_"+methodArray[tData.playType-1]+"_c"+(tData.canEat?1:0)+"_f"+(tData.withWind?1:0)+"_p"+(tData.canEatHu?1:0)+"_lz"+(tData.withZhong?1:0)]=1;
				inc.dayMoney = playInfo.money; // 每日消耗钻石统计
				app.mdb.db.collection("dayLog").update({_id:dayID},{$inc:inc},{upsert:true}, function(er,doc)
				{

				});
				if(!existCheck["/playlog/"+tableName])
				{
					if(!fs.existsSync("/playlog")) fs.mkdirSync("/playlog");
					if(!fs.existsSync("/playlog/"+tableName)) fs.mkdirSync("/playlog/"+tableName);
					existCheck["/playlog/"+tableName]=true;
				}


				// GLog("*****************回放长度 = ********************",tb.mjlog.length);
				//GLog("*****************回放长度 = ********************",tb.mjlog.columnCount);
				if(!app.playlog) app.playlog=[];
				app.FileWork(app.playlog,"/playlog/"+tableName+"/"+tData.owner+"_"+tb.tableid+".json",tb.mjlog);


 	        }

			if(msg)
			{
		       if(playInfo) msg.playInfo=playInfo;
			   msg.showEnd=tb.tData.roundNum!=tb.createPara.round;
		       tb.NotifyAll("endRoom",msg);
		    }


			tb.SetTimer();
			tb.tData.roundNum=-2;
			DestroyTable(tb);


			// GLog("EndRoom 988");
			{
				var uid2did=tb.uid2did;
				var uids={};
				for(var uid in uid2did)
				{
					var did=uid2did[uid];
					var ids=uids[did];
					if(!ids)uids[did]=ids=[];
					ids.push(uid);
				}
				for(var did in uids)
				{
					var ids=uids[did];
					app.rpc.pkplayer.Rpc.endVipTable(did,{uids:ids,tableid:tb.tableid},function(){});
				}
			}
		}
		return playInfo;
	}

	Table.prototype.MJPass=function(pl,msg,session,next)
	{
		next(null,null); //if(this.GamePause()) return;
		var tData=this.tData;

		///zys --add
		majiang.init(this);

		if(tData.tState==TableState.waitEat&&pl.mjState==TableState.waitEat)
		{
			pl.mjState=TableState.waitCard;

			if(pl.eatFlag>=8) pl.skipHu=true;
			pl.eatFlag=0;
			SendNewCard(this);//过后尝试发牌
		}
		else if(tData.tState==TableState.roundFinish&&pl.mjState==TableState.roundFinish)
		{
			pl.mjState=TableState.isReady;

			this.NotifyAll('onlinePlayer',{uid:pl.uid,onLine:true,mjState:pl.mjState});
			pl.eatFlag=0;
			this.startGame();
	    }

	}
	//抢杠胡 退杠
	function ReturnGangWin(tb,pl,gcd,toPeng)
	{
		var len=pl.mjgang2.length-1;

		if(len >=0)
		{
		    pl.mjpeng.push(gcd);
			pl.mjgang2.length=pl.mjgang2.length-1;
		}
	}

	Table.prototype.MJChi=function(pl,msg,session,next)
	{
		next(null,null);if(this.GamePause()) return;
		var tData=this.tData;
		///zys --add
		majiang.init(this);
		if(
		     tData.canEat
		   &&tData.tState==TableState.waitEat
		   &&pl.mjState==TableState.waitEat
		   &&tData.uids[tData.curPlayer]!=pl.uid
		   &&tData.uids[(tData.curPlayer+1)%4]==pl.uid//下家限制
		)
		{
			//此处必须保证没有其他玩家想 胡牌 碰牌 杠牌
			if(this.AllPlayerCheck(function(p){ if(p==pl) return true; return p.eatFlag==0; }))
			{
				var cd0=tData.lastPut;	var cd1=tData.lastPut;
				if(msg.pos==0)      {cd0+=1; cd1+=2;}
				else if(msg.pos==1) {cd0-=1; cd1+=1;}
				else {cd0-=2; cd1-=1;}
				var hand=pl.mjhand;
                var idx0=hand.indexOf(cd0);
                var idx1=hand.indexOf(cd1);
				if(idx0>=0&&idx1>=0)
				{
					hand.splice(idx0,1);
					idx1=hand.indexOf(cd1);
					hand.splice(idx1,1);
					pl.mjchi.push(cd0);
					pl.mjchi.push(cd1);
					pl.mjchi.push(tData.lastPut);
					pl.isNew=false;
					var eatCards=[cd0,cd1,tData.lastPut];
					var lastPlayer=tData.curPlayer;
					var pPut=this.getPlayer(tData.uids[lastPlayer]);
					pPut.mjput.length=pPut.mjput.length-1;

					tData.curPlayer=tData.uids.indexOf(pl.uid);
					tData.tState=TableState.waitPut;

					this.AllPlayerRun(function(p){ p.mjState=TableState.waitPut; p.eatFlag=0; });

					var chiMsg={mjchi:eatCards,tData:app.CopyPtys(tData),pos:msg.pos,from:lastPlayer};
					this.NotifyAll('MJChi',chiMsg);
					this.mjlog.push("MJChi",chiMsg);//吃
				}
				//else console.error("chi num error");
			}
			else
			{
				//console.error("chi state error");
			}
		}
		else
		{
			//console.error(tData.tState+" "+pl.mjState+" "+tData.uids[tData.curPlayer]+" "+pl.uid);
		}

	}
	Table.prototype.DownPao=function (pl,msg,session,next) {

		next(null,null);
		// 保存下炮数量，通知全体
		pl.paoNum = msg.num;
		if (pl.onLine)
		{
			pl.mjState = TableState.doneDownPao;
			this.NotifyAll("DoneDownPao", {uid:pl.uid,paoNum:pl.paoNum});
		}

		if (this.tData.roundNum>0&&this.PlayerCount()==4
			&&this.AllPlayerCheck(function(pl){ return pl.mjState==TableState.doneDownPao }))
		{
			this.startGame();
		}
	}
	Table.prototype.MJPeng=function(pl,msg,session,next)
	{
		next(null,null); //if(this.GamePause()) return;
		var tData=this.tData;
		///zys --add
		majiang.init(this);
		if(tData.playType==PlayType.hsMethod&&tData.cardNext>=53&&tData.cardNext<=56)
		{
			tData.hasPeng = true;
		}

		if(  tData.tState==TableState.waitEat
		   &&pl.mjState==TableState.waitEat
		   &&tData.uids[tData.curPlayer]!=pl.uid
		)
		{
			//此处必须保证没有其他玩家想胡牌
			if(this.AllPlayerCheck(function(p){ if(p==pl) return true; return p.eatFlag<8; }) )
			{
				var hand=pl.mjhand;
				var matchnum=0;
				for(var i=0;i<hand.length;i++)
				{
					if(hand[i]==tData.lastPut)
					{
						matchnum++;
					}
			    }
				if(matchnum>=2)
				{
					hand.splice(hand.indexOf(tData.lastPut),1);
					hand.splice(hand.indexOf(tData.lastPut),1);
					pl.mjpeng.push(tData.lastPut);
					if(matchnum==3) pl.mjpeng4.push(tData.lastPut);
					pl.isNew=false;
					var lastPlayer=tData.curPlayer;
					var pPut=this.getPlayer(tData.uids[lastPlayer]);
					pPut.mjput.length=pPut.mjput.length-1;
					tData.curPlayer=tData.uids.indexOf(pl.uid);
					this.AllPlayerRun(function(p)
					{
					    p.mjState=TableState.waitPut; p.eatFlag=0;
					});
					tData.tState=TableState.waitPut;
					this.NotifyAll('MJPeng',{tData:tData,from:lastPlayer});
					this.mjlog.push('MJPeng',{tData:app.CopyPtys(tData),from:lastPlayer});//碰
				}
				else
				{
					//console.error("peng num error");
				}
			}
			else
			{
				//console.error("peng state error");
			}
		}
		else
		{
			//console.error(tData.tState+" "+pl.mjState+" "+tData.uids[tData.curPlayer]+" "+pl.uid);
		}

	}
	Table.prototype.MJGang=function(pl,msg,session,next)
	{
		next(null,null); //if(this.GamePause()) return;
		var tData = this.tData;
		///zys --add
		majiang.init(this);
		if(
            //最后一张不能杠
		    tData.cardNext<this.cards.length
		    &&
			(
			  //吃牌杠
				tData.tState==TableState.waitEat&&pl.mjState==TableState.waitEat&&tData.uids[tData.curPlayer]!=pl.uid
			  //此处必须保证没有其他玩家想胡牌 邵阳麻将 可以抢杠 不需要检查胡

			  &&( /*!tData.canEatHu || */
			  this.AllPlayerCheck(function(p){ if(p==pl) return true; return p.eatFlag<8; }) )

			  //摸牌杠
			  ||tData.tState==TableState.waitPut&&pl.mjState==TableState.waitPut&&tData.uids[tData.curPlayer]==pl.uid
			)
		)
		{
		    var hand=pl.mjhand;
			var handNum=0;
		    for(var i=0;i<hand.length;i++)
			{
				if(hand[i]==msg.card)
				{
					handNum++;
				}
			}
			if(tData.tState==TableState.waitEat&&handNum==3&&tData.lastPut==msg.card)
			{

				var fp=this.getPlayer(tData.uids[tData.curPlayer]);
				var mjput=fp.mjput;
				if(mjput.length>0&&mjput[mjput.length-1]==msg.card)
				{
					mjput.length=mjput.length-1;
				}
				else return;

		        pl.mjgang0.push(msg.card);//吃明杠  点杠
				pl.gang0uid[msg.card]=tData.curPlayer;
			    hand.splice(hand.indexOf(msg.card),1);
			    hand.splice(hand.indexOf(msg.card),1);
			    hand.splice(hand.indexOf(msg.card),1);
				if(tData.playType==PlayType.ylMethod&&pl.isTing)
				{
					pl.canNotPutList.splice(pl.canNotPutList.indexOf(msg.card),1);
					pl.canNotPutList.splice(pl.canNotPutList.indexOf(msg.card),1);
					pl.canNotPutList.splice(pl.canNotPutList.indexOf(msg.card),1);
				}
				msg.gang=1;
				msg.from=tData.curPlayer;
                pl.isNew=false;

			}
			else if(tData.tState==TableState.waitPut&&handNum==4)
			{
		        pl.mjgang1.push(msg.card);//暗杠
			    hand.splice(hand.indexOf(msg.card),1);
			    hand.splice(hand.indexOf(msg.card),1);
			    hand.splice(hand.indexOf(msg.card),1);
			    hand.splice(hand.indexOf(msg.card),1);
				if(tData.playType==PlayType.ylMethod&&pl.isTing)
				{
					pl.canNotPutList.splice(pl.canNotPutList.indexOf(msg.card),1);
					pl.canNotPutList.splice(pl.canNotPutList.indexOf(msg.card),1);
					pl.canNotPutList.splice(pl.canNotPutList.indexOf(msg.card),1);
					pl.canNotPutList.splice(pl.canNotPutList.indexOf(msg.card),1);
				}
				msg.gang=3;
			}
			else if(tData.tState==TableState.waitPut&&handNum==1&&pl.mjpeng.indexOf(msg.card)>=0&&pl.mjhand.indexOf(msg.card)>=0&&pl.mjpeng4.indexOf(msg.card)<0)
			{
		        pl.mjgang2.push(msg.card);//自摸明杠
			    hand.splice(hand.indexOf(msg.card),1);
				if(tData.playType==PlayType.ylMethod&&pl.isTing)
				{
					pl.canNotPutList.splice(pl.canNotPutList.indexOf(msg.card),1);
				}
				pl.mjpeng.splice(pl.mjpeng.indexOf(msg.card),1);
				msg.gang=2;
			}
			else return;
			msg.uid=pl.uid;
			var canEatGang=false; //陕西麻将不能抢杠
			if(pl.mjgang2.length >0 && tData.canEatHu == true)
			{
				canEatGang=true;
			}
			
			this.AllPlayerRun(function(p){
			    p.mjState=TableState.waitCard; p.eatFlag=0;
				if( canEatGang && p!=pl)
				{
					var hType=GetHuType(tData,p,msg.card);//开杠测试
                    if(hType>0&&!p.skipHu)//开杠胡
					{
						if(tData.playType!=PlayType.ylMethod||tData.playType==PlayType.ylMethod&&p.isTing&&ylCanNotEatWinList.indexOf(msg.card)<0){
							if(tData.canEatHu)
							{
								if(msg.gang!=3||hType==13)
								{
									p.mjState=TableState.waitEat;p.eatFlag=8;
								}
							}
							else
							{
								if(msg.gang!=3||hType==13)
								{
									p.mjState=TableState.waitEat;p.eatFlag=8;
								}
							}
						}
					}
				}
			});
			this.NotifyAll('MJGang',msg);
			this.mjlog.push('MJGang',msg);//杠
			// if(canEatGang)
			// {
				tData.putType=msg.gang;
				tData.curPlayer=tData.uids.indexOf(pl.uid);
				tData.lastPut=msg.card;
			// }
			// else
			// {
			// 	tData.curPlayer=(tData.uids.indexOf(pl.uid)+3)%4;
			// }
			tData.tState=TableState.waitEat;
			SendNewCard(this); //杠后尝试补牌
		}
		else
		{
			//console.error(tData.tState+" "+pl.mjState+" "+tData.uids[tData.curPlayer]+" "+pl.uid);
		}
	}

	function HighPlayerHu(tb,pl)//此处必须保证没有其他玩家想胡牌,
	{
		var tData=tb.tData;
		var uids=tData.uids;
		for(var i=(tData.curPlayer+1)%4; uids[i]!=pl.uid; i=(i+1)%4)
		{
		    if (tb.players[uids[i]].eatFlag >= 8)
		        return true;
		}
		return false;
	}

	Table.prototype.MJHu=function(pl,msg,session,next)
	{
		//此处必须保证胡牌顺序
		next(null,null); //if(this.GamePause()) return;
		var tData=this.tData;
		var uids=this.tData.uids;

		///zys --add
		majiang.init(this);
		var canEnd = false;
		GLog(" MJHu  pl.eatFlag: " + pl.eatFlag);
		//自摸胡
		if(
 		      tData.tState==TableState.waitPut&&pl.mjState==TableState.waitPut&&pl.isNew
			  &&tData.uids[tData.curPlayer]==pl.uid&& GetHuType(tData,pl)>0//自摸测试
		)
		{
			GLog(" == 自摸胡 == ");
		      //补摸
		      if(tData.putType>0&&tData.putType<4)
			  {
				  if(tData.putType==1)
				  {
					  pl.winType=WinType.pickGang1;
				  }
				  else//自摸杠在补摸
				  {
					  pl.winType=WinType.pickGang23;
				  }
			  }
			  else//自摸
			  {
				  pl.winType=WinType.pickNormal;
			  }
			  canEnd=true;

		}
		//点炮胡 抢杠胡
		else if(
		           !pl.skipHu
		        && tData.tState == TableState.waitEat && pl.mjState == TableState.waitEat
                && tData.uids[tData.curPlayer] != pl.uid && pl.eatFlag >= 8
		        &&(tData.putType>0||tData.canEatHu)
				//&&!HighPlayerHu(this,pl) // 拦截胡
			)
		{
			GLog("== 点胡 ==");
			 if(tData.tState==TableState.waitEat)
			 {
		        var fp=this.getPlayer(tData.uids[tData.curPlayer]);
				var winType=null;
				var mjput=null;
				//0 2 4 8 吃 碰 杠 胡
				if(tData.putType==0)
				{
					winType=WinType.eatPut;
					mjput=fp.mjput;
				}
				else if(tData.putType==4)
				{
					winType=WinType.eatGangPut;
					mjput=fp.mjput;
				}
				else //抢杠包3家
				{
					winType=WinType.eatGang;
					if(tData.putType==3) mjput=fp.mjgang1;
					else mjput=fp.mjgang0;
					ReturnGangWin(tData,fp,tData.lastPut,true);
				}
				var huNum=0;
				if(mjput.length>0&&mjput[mjput.length-1]==tData.lastPut)
				{
					mjput.length=mjput.length-1;
					huNum=0;
				}
			    // else return;
				//一炮多响
				//  GLog("== 判断胡牌玩家个数 ==");
				this.AllPlayerRun(function(p){
				    if(p.mjState==TableState.waitEat&&p.eatFlag>=8 )
					{
						if(p != pl)
						{
							p.mjhand.push(tData.lastPut);
							p.winType = winType;
						}
						huNum +=1;
					}
				 });
				 if(huNum >=1 )
				 {
					pl.winType=winType;

					pl.mjhand.push(tData.lastPut);
					canEnd=true;
				 }else
				 {
				    canEnd=false;
				 }
		     }
		}
		GLog("=== canEnd : " + canEnd);
		if(canEnd){
			////zys.添加胡牌log
			//
			// bug : 修改回放里，不能胡牌的bug
			GLog(tData.curPlayer + "胡牌   ****************==胡牌 winType: " + pl.winType);
			this.NotifyAll("MJHu",{uid:pl.uid,eatFlag:msg.eatFlag});
			this.mjlog.push("MJHu",{uid:pl.uid,eatFlag:msg.eatFlag});
			EndGame(this,pl);
		}
		else
		{
			if(!app.huError) app.huError=[];
			app.FileWork(app.huError,app.serverId+"huError.txt",
		     tData.tState+" "+pl.mjState+" "+pl.isNew  +" "+tData.uids[tData.curPlayer]+" "+pl.uid+" "+pl.huType
			);
		}
		
	}
	Table.prototype.DelRoom=function(pl,msg,session,next)
	{
		next(null,null);
		var table=this;
		var tData=this.tData;

		if(pl.delRoom==0)
		{
			var yesuid = [];
			var nouid = [];
			if (msg.yes)
			{
				if (this.PlayerCount() < 4) {
					EndRoom(this, {reason: 0});
					return;//人数不足
				}
				pl.delRoom = 1;
				if (tData.delEnd == 0) {
					tData.delEnd = Date.now() + 5 * 60000;
					tData.firstDel = pl.uid;
					this.SetTimer
					(
						5 * 60000, function ()
						{
							if (tData.delEnd != 0)
							{//超时
								EndRoom(table, {reason: 1});
							}
						}
					);
				}
				//包括发起人3个以上同意结束房间
				else if (this.CheckPlayerCount(function (p)
					{
						if (p.delRoom > 0) {
							yesuid.push(p.uid);
							return true;
						}
						return false;
					}) >= 3) {

					EndRoom(this, {reason: 2, yesuid: yesuid});
					return; //同意
				}
			}
			else {
				pl.delRoom = -1;
				//2个以上不同意结束房间
				if (this.CheckPlayerCount(function (p) {
						if (p.delRoom < 0) {
							nouid.push(p.uid);
							return true;
						}
						return false;
					}) >= 1) {
					tData.delEnd = 0;
					tData.firstDel = -1;
					this.SetTimer();
					this.AllPlayerRun(function (p) {
						p.delRoom = 0;
					});
				}
			}
			this.NotifyAll("DelRoom", {players: this.collectPlayer("delRoom"), tData: tData, nouid: nouid});
		}
	}
}
