
function newReplayLayer()
{
	var PlayerPosId = {
		down:0,
		right:1,
		top:2,
		left:3
	}
	var windPos = [];
	var windObj = [];
	var roundnumImgObj;
	var rvnPos = [0,1,2,3];
	var vnPos = [];
	var TableState = {
		waitJoin: 1,
		waitReady: 2,
		waitPut: 3,
		waitEat: 4,
		waitCard: 5,
		roundFinish: 6,
		isReady: 7,
		waitSelect:8,//承包选择：继续游戏 或 弃牌
	}
	var ActionType =  //图片提示
	{
		CHI:1,
		PENG:2,
		GANG:3,
		FLOWER:5,
		HU:6,
		CHENG_BAO:7,
	}
	var WinType=
	{
		eatPut:1,       //点炮
		eatGang:2,      //抢杠胡  杠的人*2
		pickNormal:3,   //自摸  *1
		gangKai:4,      //杠开  *2  宁波:杠别人牌补摸胡牌-杠头开花
		baoTou:5,       //爆头  *2  等于宁波的抛搭：手中有百搭牌，胡任意牌
		gangBao:6,      //杠爆  自摸杠后补摸爆头  *4
		caiPiao:7,      //打出了财神后又爆头 *2 * 财神数的2次方
		gangPiao:8,     //杠飘  *8
		piaoGang:9,     //飘杠  *8
		moDa:10,        //摸搭 摸到百搭牌胡牌
		gangKai2:11,    //宁波:杠上开花-自摸明杠或暗杠后补摸胡牌（跟杠头开花不一样）
	};
	var actionZindex = 1000;
	var baidaOject;
	var noPutWithChi = [];//吃之后不能打相应的牌

	function SelfUid() {
		return jsclient.data.pinfo.uid
	}

	function IsMyTurn() {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		return SelfUid() == tData.uids[tData.curPlayer];
	}
	function GLog(log)
	{
		console.log(log);
	}

	function PutAwayCard(cdui, cd) {
		//宁波混牌可以打出去
		// if(jsclient.gameType == jsclient.GAME_TYPE.NING_BO && jsclient.majiang.isEqualHunCard(cd))
		// {
		// 	return;
		// }

		if(jsclient.rePlayVideo == jsclient.GAME_TYPE.NING_BO)
		{
			//不能打吃相关的牌
			cc.log("noPutWithChi = " + noPutWithChi + ", cd = " + cd);
			for(var i = 0; i < noPutWithChi.length; i++)
			{
				if(cd == noPutWithChi[i])
				{
					return;
				}
			}
			noPutWithChi = [];
		}
		var children = cdui.parent.children;
		var mjhandNum = 0;
		//var newCard;
		var standUI = cdui.parent.getChildByName("stand");
		for (var i = 0; i < children.length; i++) {
			if (children[i].name == "mjhand") {
				/*if (children[i].isnewCard)
				 {
				 newCard=children[i];
				 }*/

				if (children[i].y > standUI.y + 10) {
					children[i].y = standUI.y;
				}
				mjhandNum++;
			}
		}

		var pl = getUIPlayer(0);
		if (mjhandNum == pl.mjhand.length) {
			jsclient.gamenet.request("pkroom.handler.tableMsg", {
				cmd: "MJPut",
				card: cd
			});
			jsclient.lastPutPos = {
				x: cdui.x,
				y: cdui.y
			};
			//if(newCard) newCard.isnewCard=false;
			HandleMJPut(cdui.parent, {
				uid: SelfUid(),
				card: cd
			}, 0);

		}

	}

	function baidaCompmentState(node)
	{
		if (jsclient.rePlayVideo == jsclient.GAME_TYPE.NING_BO)
		{
			node.setVisible(true);
			cc.log("jsclient.hunCard = " + jsclient.hunCard);
			AddNewCard(node, "baidaImg", "", jsclient.hunCard,0);
			//AddNewCard(node, "baidaImg", "", 181,0);
		}
		else
		{
			node.setVisible(false);
		}
	}

	function setBaiDaVisible(isVisible)
	{
		if (jsclient.rePlayVideo == jsclient.GAME_TYPE.NING_BO)
		{
			baidaOject.setVisible(isVisible);
		}
	}

	function getEatFlag() {

		var eat = jsclient.replayui.jsBind.eat;
		var eatFlag = 0;

		if (eat.gang0._node.visible) {
			eatFlag = eatFlag + 4;
		}
		if (eat.hu._node.visible) {
			eatFlag = eatFlag + 8;
		}
		if (eat.chi0._node.visible) {
			eatFlag = eatFlag + 1;
		}
		if (eat.peng._node.visible) {
			eatFlag = eatFlag + 2;
		}

		mylog("eatFlag" + eatFlag)

		return eatFlag;

	}
	jsclient.MJPass2NetForHangZhou = function() {
		console.log(">>>>>>>>>client  过 <<<<<<<<");
		var sData = jsclient.data.sData;
		var tData = sData.tData;

		if (IsMyTurn() && tData.tState == TableState.waitPut) {
			var eat = jsclient.replayui.jsBind.eat;
			var msg = "确认过";
			if (eat.gang0._node.visible) msg += " 杠 ";
			if (eat.hu._node.visible) msg += " 胡 ";
			jsclient.showMsg(msg + "吗?", function() {
				eat.gang0._node.visible = false;
				eat.hu._node.visible = false;
				eat.guo._node.visible = false;
			}, function() {}, "1");

			/*
			 var cduis=jsclient.playui.jsBind.down._node.children;
			 var pl=jsclient.data.sData.players[SelfUid()];
			 var lastCard=pl.mjhand[pl.mjhand.length-1];
			 for(var i=cduis.length-1;i>=0;i--)
			 {
			 if(cduis[i].tag==lastCard)
			 {
			 PutAwayCard(cduis[i],lastCard);
			 break;
			 }
			 }*/
		} else {
			if (jsclient.replayui.jsBind.eat.hu._node.visible) {
				jsclient.showMsg("确认不胡吗?", ConfirmMJPass, function() {}, "1");
			} else {
				ConfirmMJPass();
			}
		}
	}

	function MJGang2Net(cd) {
		console.log(">>>>>>>>>client  杠 <<<<<<<<");
		jsclient.gamenet.request("pkroom.handler.tableMsg", {
			cmd: "MJGang",
			card: cd,
			eatFlag: getEatFlag()
		});
	}

	function MJChi2Net(pos) {
		console.log(">>>>>>>>>client  吃 <<<<<<<<");
		jsclient.gamenet.request("pkroom.handler.tableMsg", {
			cmd: "MJChi",
			pos: pos,
			eatFlag: getEatFlag()
		});
	}

	function MJHu2Net() {
		console.log(">>>>>>>>>client  胡 <<<<<<<<");
		jsclient.gamenet.request("pkroom.handler.tableMsg", {
			cmd: "MJHu",
			eatFlag: getEatFlag()
		});
	}

	function MJPeng2Net() {
		console.log(">>>>>>>>>client  碰 <<<<<<<<");
		jsclient.gamenet.request("pkroom.handler.tableMsg", {
			cmd: "MJPeng",
			eatFlag: getEatFlag()
		});
	}
	function MJSelect2Net(isPlay) {
		console.log(">>>>>>>>>client  承包 <<<<<<<< isPlay = "+isPlay);
		jsclient.gamenet.request("pkroom.handler.tableMsg", {
			cmd: "MJSelect",
			select: (isPlay ? 1 : 0)
		});
	}
	function ConfirmMJPass() {
		var pl = getUIPlayer(0);
		if (jsclient.replayui.jsBind.eat.hu._node.visible) {
			pl.skipHu.push(jsclient.data.sData.tData.lastPut);
		}
		jsclient.gamenet.request("pkroom.handler.tableMsg", {
			cmd: "MJPass",
			eatFlag: getEatFlag()
		});
		//pl.mjState=TableState.waitCard;	CheckEatVisible(jsclient.playui.jsBind.eat);

	}

	function setInfo(isVisible)
	{
		var info = jsclient.replayui.jsBind.info._node;
		if(isVisible) {
			var sData = jsclient.data.sData;
			var tData = sData.tData;
			var dir = ["东", "南", "西", "北"];
			var text = "";

			switch (jsclient.rePlayVideo) {
				case jsclient.GAME_TYPE.HANG_ZHOU:
					text += "杭州麻将\n"
					break;
				case jsclient.GAME_TYPE.NING_BO:
				{
					text += "宁波麻将\n";
					if(tData.isHunPengQing)
					{
						text += (tData.tai.toString() + "台" + " 混碰清\n");
					}
					else
					{
						text += (tData.tai.toString() + "台\n");
					}
					text += (tData.isHunNum7 ? "7百搭\n" : "3百搭\n");
					text += dir[tData.curRingWind % 4] + "风圈\n";
				}
					break;
				case jsclient.GAME_TYPE.TAI_ZHOU:
				{
					text += "台州麻将\n"
					text += (""+tData.huNum + "糊\n");
					//text += dir[tData.curRingWind % 4] + "风圈";
				}
					break;
			}
			info.setString(text);
		}
		info.setVisible(isVisible);
	}

	function ShowMjChiCard(node, off) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;

		if (off == 0)
		{
			var card1 = node.getChildByName("card1");
			var card2 = node.getChildByName("card2");
			var card3 = node.getChildByName("card3");
			card1.visible = true;
			card2.visible = true;
			card3.visible = true;
			card1.color = cc.color(255,255,0);
			card2.color = cc.color(255,255,255);
			card3.color = cc.color(255,255,255);
			setCardPic(card1,tData.lastPut,0);
			setCardPic(card2,tData.lastPut+1,0);
			setCardPic(card3,tData.lastPut+2,0);

		}else if (off==1)
		{
			var card1 = node.getChildByName("card4");
			var card2 = node.getChildByName("card5");
			var card3 = node.getChildByName("card6");
			card1.visible = true;
			card2.visible = true;
			card3.visible = true;
			card1.color = cc.color(255,255,255);
			card2.color = cc.color(255,255,0);
			card3.color = cc.color(255,255,255);
			setCardPic(card1,tData.lastPut-1,0);
			setCardPic(card2,tData.lastPut,0);
			setCardPic(card3,tData.lastPut+1,0);
		}else if (off==2)
		{
			var card1 = node.getChildByName("card7");
			var card2 = node.getChildByName("card8");
			var card3 = node.getChildByName("card9");
			card1.visible = true;
			card2.visible = true;
			card3.visible = true;
			card1.color = cc.color(255,255,255);
			card2.color = cc.color(255,255,255);
			card3.color = cc.color(255,255,0);
			setCardPic(card1,tData.lastPut-2,0);
			setCardPic(card2,tData.lastPut-1,0);
			setCardPic(card3,tData.lastPut,0);
		}
	}

	function CheckChangeuiVisible() {
		jsclient.replayui.jsBind.eat.changeui.changeuibg._node.visible = false;
	}

	function ShowSkipHu() {
		var jsonui = ccs.load("res/SkipHu.json");
		doLayout(jsonui.node.getChildByName("Image_1"), [0.2, 0.2], [0.5, 0.3], [0, 0]);
		jsclient.Scene.addChild(jsonui.node);
		jsonui.node.runAction(cc.sequence(cc.delayTime(2), cc.removeSelf()));
	}

	function getAllCardsTotal(withWind)
	{

		///zys add --- back cards total
		return 136;

		switch (jsclient.rePlayVideo)
		{
			case jsclient.GAME_TYPE.HANG_ZHOU:
				return 136;
			case jsclient.GAME_TYPE.NING_BO:
				return 144;
			case jsclient.GAME_TYPE.TAI_ZHOU:
				return 108;
			case jsclient.GAME_TYPE.WEN_ZHOU:
				return 144;
		}
	}
//补花不能打牌
	var isCanPutCard = true;
	function CheckEatVisibleForHangZhou(eat) {

		CheckChangeuiVisible();
		var eatNode = eat._node;
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var leftCard = getAllCardsTotal(tData.withWind) - tData.cardNext;
		eat.chi0._node.visible = false;
		eat.chi1._node.visible = false;
		eat.chi2._node.visible = false;
		eat.peng._node.visible = false;
		eat.gang0._node.visible = false;
		eat.gang1._node.visible = false;
		eat.gang2._node.visible = false;
		eat.hu._node.visible = false;
		eat.guo._node.visible = false;
		var pl = sData.players[SelfUid() + ""];


		if (pl.mjState == TableState.waitEat
			|| pl.mjState == TableState.waitPut
			&& tData.uids[tData.curPlayer] == SelfUid()) {

		} else {
			return;
		}

		jsclient.gangCards = [];
		jsclient.eatpos = [];
		var mj = jsclient.majiang;
		var vnode = [];

		//gang hu put
		if (tData.tState == TableState.waitPut && pl.mjState == TableState.waitPut) {
			if (IsMyTurn()) {
				if (pl.isNew && mj.canHu(!tData.canHu7, pl.mjhand, 0,
						tData.canHuWith258, tData.withZhong) > 0) {
					vnode.push(eat.hu._node);
				}
				if (tData.caipiaoPlayer.length == 0) {
					var rtn = leftCard > 0 ? mj.canGang1(pl.mjpeng, pl.mjhand, pl.mjpeng4) : [];
					if (rtn.length > 0 && rtn.indexOf(tData.lastPut) < 0 && pl.isNew) {
						jsclient.gangCards = rtn;
						if (jsclient.gangCards == 1) {
							eat.gang0.bgground.visible = true;
							eat.gang0.card1._node.visible = true;
							setCardPic(eat.gang0.card1._node, jsclient.gangCards[0], 0);
						} else {
							eat.gang0.bgground.visible = false;
							eat.gang0.card1._node.visible = false;
						}
						vnode.push(eat.gang0._node);
						/*var gang=[eat.gang0,eat.gang1,eat.gang2];
						 for(var i=0;i<rtn.length&&i<gang.length;i++)
						 {
						 vnode.push(gang[i]._node);
						 setCardPic(gang[i].card._node,rtn[i],4);
						 gang[i]._node.tag=rtn[i];
						 }*/
					}
				}
				if (vnode.length > 0) vnode.push(eat.guo._node);
			}
		} else if (tData.tState == TableState.waitEat) {
			if (!IsMyTurn()) {
				var huType = mj.canHu(!tData.canHu7, pl.mjhand, tData.lastPut,
					tData.canHuWith258, tData.withZhong);
				cc.log("####### huType = " + huType);
				if (huType > 0) {
					var canHu = false;
					if ((tData.putType == 0) || tData.putType == 4) {
						var lastPutPlayer = sData.players[tData.uids[tData.curPlayer] + ""];

						if ((lastPutPlayer.linkZhuang >= 3 || pl.linkZhuang >= 3) && !jsclient.majiang.isEqualHunCard(tData.lastPut)) {
							canHu = true;
						}
					} else if (tData.putType > 0 && tData.putType < 4) {
						// if (tData.canEatHu) {
						if (tData.putType != 3 || huType == 13) {
							var lastPutPlayer = sData.players[tData.uids[tData.curPlayer] + ""];
							if ((lastPutPlayer.linkZhuang >= 3 || pl.linkZhuang >= 3) && !jsclient.majiang.isEqualHunCard(tData.lastPut)) {
								canHu = true;
							}
						}
						// } else {
						// 	if (tData.putType != 3 || huType == 13) {

						// 		var lastPutPlayer = sData.players[tData.uids[tData.lastPutPlayer] + ""];

						// 		if (lastPutPlayer.linkZhuang >= 3 || pl.linkZhuang >= 3) {

						// 			canHu = true;

						// 		}
						// 	}
						// }
					}
					if (canHu) {
						if (pl.skipHu && pl.skipHu.length > 0) {
							var skip = false;
							for (var i = 0; i < pl.skipHu.length; i++) {
								if (tData.lastPut == pl.skipHu[i]) {
									skip = true;
								}
							}
							;
							if (skip) {
								ShowSkipHu();
							} else {
								if (tData.caipiaoPlayer.length > 0) {
									vnode.push(eat.hu._node);
								}
							}
						} else {
							if (tData.caipiaoPlayer.length == 0) {
								vnode.push(eat.hu._node);
							}
						}
					}
				}

				if ((tData.putType == 0 || tData.putType == 4)) {

					if (leftCard > 0 && mj.canGang0(pl.mjhand, tData.lastPut)) {
						if (tData.caipiaoPlayer.length == 0) {
							vnode.push(eat.gang0._node);
						}
						jsclient.gangCards = [tData.lastPut];
						eat.gang0.bgground.visible = true;
						eat.gang0.card1._node.visible = true;
						setCardPic(eat.gang0.card1._node, jsclient.gangCards[0], 0);
						/*setCardPic(eat.gang0.card._node,tData.lastPut,4);
						 eat.gang0._node.tag=tData.lastPut;*/
					}
					if ((leftCard > 4 || tData.noBigWin) && mj.canPeng(pl.mjhand, tData.lastPut)) {

						if (pl.skipPeng.indexOf(tData.lastPut) < 0) {

							if (tData.caipiaoPlayer.length == 0) {
								vnode.push(eat.peng._node);
							}

						}

					}

					if ((leftCard > 4 || tData.noBigWin) && tData.canEat && tData.uids[(tData.curPlayer + 1) % 4] == SelfUid()) {

						var eatpos = mj.canChi(pl.mjhand, tData.lastPut);


						jsclient.eatpos = eatpos;

						if (eatpos.length > 0) {

							if (tData.caipiaoPlayer.length == 0) {
								vnode.push(eat.chi0._node);
							}
						}
					}



				}
				if (vnode.length > 0) vnode.push(eat.guo._node);
				else getUIPlayer(0).mjState = TableState.waitCard;
			}
		}

		var btnImgs = {
			"peng": ["res/playing/gameTable/youxizhong-2_57.png", "res/playing/gameTable/youxizhong-2_07.png"],
			"gang0": ["res/playing/gameTable/youxizhong-2_55.png", "res/playing/gameTable/youxizhong-2_05.png"],
			"chi0": ["res/playing/gameTable/youxizhong-2_59.png", "res/playing/gameTable/youxizhong-2_09.png"],
		}

		for (var i = 0; i < vnode.length; i++) {
			vnode[i].visible = true;
			if (vnode[i].getChildByName("card1")) vnode[i].getChildByName("card1").visible = false;
			if (vnode[i].getChildByName("bgground")) vnode[i].getChildByName("bgground").visible = false;
			if (vnode[i].getChildByName("bgimg")) vnode[i].getChildByName("bgimg").visible = true;
			var btnName = vnode[i].name;


			if (btnName == "peng" || btnName == "chi0" || btnName == "gang0") {
				vnode[i].loadTextureNormal(btnImgs[btnName][0]);
				vnode[i].loadTexturePressed(btnImgs[btnName][0]);
			}

			if (i == 0) {

				var cardVal = 0;

				if (vnode[i].getChildByName("bgimg")) vnode[i].getChildByName("bgimg").visible = false;

				if (btnName == "peng" || btnName == "chi0" || btnName == "gang0") {
					vnode[i].loadTextureNormal(btnImgs[btnName][1]);
					vnode[i].loadTexturePressed(btnImgs[btnName][1]);
				}
				if (btnName == "peng") {
					cardVal = tData.lastPut;
				} else if (btnName == "chi0") {
					if (jsclient.eatpos.length == 1) cardVal = tData.lastPut;
				} else if (btnName == "gang0") {
					if (jsclient.gangCards.length == 1) cardVal = jsclient.gangCards[0];
				} else if (btnName == "hu") {
					if (IsMyTurn()) cardVal = pl.mjhand[pl.mjhand.length - 1];
					else cardVal = tData.lastPut;
				}
				if (cardVal && cardVal > 0) {
					setCardPic(vnode[0].getChildByName("card1"), cardVal, 0);
					vnode[0].getChildByName("card1").visible = true;
				}
				vnode[0].getChildByName("bgground").zIndex = -1;
				vnode[0].getChildByName("bgground").visible = true;

			}
			doLayout(vnode[i], [0, 0.12], [0.5, 0], [(1 - vnode.length) / 2.0 + i * 1.7, 2.5], false, false);
		}
	}
	function CheckEatVisibleForNingBo(eat)
	{
		CheckChangeuiVisible();
		var eatNode = eat._node;
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var leftCard = getAllCardsTotal(tData.withWind) - tData.cardNext;
		eat.chi0._node.visible = false;
		eat.chi1._node.visible = false;
		eat.chi2._node.visible = false;
		eat.peng._node.visible = false;
		eat.gang0._node.visible = false;
		eat.gang1._node.visible = false;
		eat.gang2._node.visible = false;
		eat.hu._node.visible = false;
		eat.guo._node.visible = false;
		var pl = sData.players[SelfUid() + ""];
		if(tData.isChengBao && tData.noPlayUids.indexOf(SelfUid()) >= 0)
		{
			return;
		}
		if (pl.mjState == TableState.waitEat
			|| pl.mjState == TableState.waitPut
			&& tData.uids[tData.curPlayer] == SelfUid()) {

		} else {
			return;
		}
		jsclient.gangCards = [];
		jsclient.eatpos = [];
		var mj = jsclient.majiang;
		var vnode = [];
		setTaiInfo("");

		//gang hu put
		if (tData.tState == TableState.waitPut && pl.mjState == TableState.waitPut) {
			if (IsMyTurn()) {
				isCanPutCard = false;
				var flowerCard = RequestFlower();
				if(flowerCard > 0)
				{
					var cduis=jsclient.replayui.jsBind.down._node.children;
					var cardIndex = null;
					for(var i=cduis.length-1;i>=0;i--)
					{
						if(cduis[i].name == "mjhand" && cduis[i].tag == flowerCard)
						{
							cardIndex = i;
							// PutAwayCard(cduis[i],lastCard);
							break;
						}
					}
					if(cardIndex)
					{
						var callback = function () {
							PutAwayCard(cduis[cardIndex],flowerCard);
						};
						cduis[cardIndex].runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(callback)));
						return;
					}
				}

				isCanPutCard = true;
				if (pl.isNew)
				{
					var huType = mj.canHu(!tData.canHu7, pl.mjhand, 0, tData.canHuWith258, tData.withZhong);
					//7百搭乱风
					if(tData.isHunNum7 && huType < 1)
					{
						if(mj.allWindHu(pl))
						{
							huType = 3;
						}
					}
					GLog("huType = " + huType);
					if(huType > 0)
					{
						if(mj.EndGameForNingBo(jsclient.data.sData, pl, false))
						{
							vnode.push(eat.hu._node);
						}
						setTaiInfo(pl.mjdesc);
					}
				}

				var rtn = leftCard > 0 ? mj.canGang1(pl.mjpeng, pl.mjhand, pl.mjpeng4) : [];
				if (rtn.length > 0 && rtn.indexOf(tData.lastPut) < 0 && pl.isNew) {
					jsclient.gangCards = rtn;
					if (jsclient.gangCards == 1) {
						eat.gang0.bgground.visible = true;
						eat.gang0.card1._node.visible = true;
						setCardPic(eat.gang0.card1._node, jsclient.gangCards[0], 0);
					} else {
						eat.gang0.bgground.visible = false;
						eat.gang0.card1._node.visible = false;
					}
					vnode.push(eat.gang0._node);
				}
				if (vnode.length > 0) vnode.push(eat.guo._node);
			}
		} else if (tData.tState == TableState.waitEat) {
			if (!IsMyTurn()) {
				var huType = 0;
				if(tData.isHunNum7)
				{
					GLog("=====tData.putType : " + tData.putType);
					if (tData.putType == 2)//抢杠胡
					{
						huType = mj.canHu(!tData.canHu7, pl.mjhand, tData.lastPut,tData.canHuWith258, tData.withZhong);
						//乱风抢杠
						if( huType < 1)
						{
							if(mj.allWindHu(pl, tData.lastPut))
							{
								huType = 3;
							}
						}
					}
				}
				else
				{
					var isPaoDa = (pl.mjhand.length == 1 && mj.isEqualHunCard(pl.mjhand[0])); //抛搭单吊任意牌-只能自摸
					var isThreeHunCard = mj.hasThreeHunHu(pl.mjhand); //三财神只能自摸
					if(!isPaoDa && !isThreeHunCard)
					{
						huType = mj.canHu(!tData.canHu7, pl.mjhand, tData.lastPut,tData.canHuWith258, tData.withZhong);
					}
				}
				/*var huType = (!isPaoDa)&& mj.canHu(!tData.canHu7, pl.mjhand, tData.lastPut,
				 tData.canHuWith258, tData.withZhong);*/
				cc.log("####### huType = " + huType);
				if (huType > 0) {
					if(mj.EndGameForNingBo(jsclient.data.sData, pl, false)) {
						if (pl.skipHu && pl.skipHu.length > 0) {
							var skip = false;
							for (var i = 0; i < pl.skipHu.length; i++) {
								if (tData.lastPut == pl.skipHu[i]) {
									skip = true;
								}
							}
							;
							if (skip) {
								ShowSkipHu();
							} else {
								vnode.push(eat.hu._node);
							}
						} else {
							vnode.push(eat.hu._node);
						}
					}
					setTaiInfo(pl.mjdesc);
				}

				if ((tData.putType == 0 || tData.putType == 4)) {

					var isHunCard = mj.isEqualHunCard(tData.lastPut);
					if (leftCard > 0 && !isHunCard && mj.canGang0(pl.mjhand, tData.lastPut)) {
						if (tData.caipiaoPlayer.length == 0) {
							vnode.push(eat.gang0._node);
						}
						jsclient.gangCards = [tData.lastPut];
						eat.gang0.bgground.visible = true;
						eat.gang0.card1._node.visible = true;
						setCardPic(eat.gang0.card1._node, jsclient.gangCards[0], 0);
						/*setCardPic(eat.gang0.card._node,tData.lastPut,4);
						 eat.gang0._node.tag=tData.lastPut;*/
					}
					if (!isHunCard && mj.canPeng(pl.mjhand, tData.lastPut)) {
						if (pl.skipPeng.indexOf(tData.lastPut) < 0)
						{
							vnode.push(eat.peng._node);
						}

					}

					if (!tData.isHunNum7 && tData.canEat
						&& !isHunCard
						&&tData.uids[(tData.curPlayer + 1) % 4] == SelfUid()) {

						var eatpos = mj.canChiForNingBo(pl.mjhand, tData.lastPut);


						jsclient.eatpos = eatpos;

						if (eatpos.length > 0) {

							if (tData.caipiaoPlayer.length == 0) {
								vnode.push(eat.chi0._node);
							}
						}
					}



				}


				if (vnode.length > 0) vnode.push(eat.guo._node);
				else getUIPlayer(0).mjState = TableState.waitCard;
			}
		}

		var btnImgs = {
			"peng": ["res/playing/gameTable/youxizhong-2_57.png", "res/playing/gameTable/youxizhong-2_07.png"],
			"gang0": ["res/playing/gameTable/youxizhong-2_55.png", "res/playing/gameTable/youxizhong-2_05.png"],
			"chi0": ["res/playing/gameTable/youxizhong-2_59.png", "res/playing/gameTable/youxizhong-2_09.png"],
		}

		for (var i = 0; i < vnode.length; i++) {
			vnode[i].visible = true;
			if (vnode[i].getChildByName("card1")) vnode[i].getChildByName("card1").visible = false;
			if (vnode[i].getChildByName("bgground")) vnode[i].getChildByName("bgground").visible = false;
			if (vnode[i].getChildByName("bgimg")) vnode[i].getChildByName("bgimg").visible = true;
			var btnName = vnode[i].name;


			if (btnName == "peng" || btnName == "chi0" || btnName == "gang0") {
				vnode[i].loadTextureNormal(btnImgs[btnName][0]);
				vnode[i].loadTexturePressed(btnImgs[btnName][0]);
			}

			if (i == 0) {

				var cardVal = 0;

				if (vnode[i].getChildByName("bgimg")) vnode[i].getChildByName("bgimg").visible = false;

				if (btnName == "peng" || btnName == "chi0" || btnName == "gang0") {
					vnode[i].loadTextureNormal(btnImgs[btnName][1]);
					vnode[i].loadTexturePressed(btnImgs[btnName][1]);
				}
				if (btnName == "peng") {
					cardVal = tData.lastPut;
				} else if (btnName == "chi0") {
					if (jsclient.eatpos.length == 1) cardVal = tData.lastPut;
				} else if (btnName == "gang0") {
					if (jsclient.gangCards.length == 1) cardVal = jsclient.gangCards[0];
				} else if (btnName == "hu") {
					if (IsMyTurn()) cardVal = pl.mjhand[pl.mjhand.length - 1];
					else cardVal = tData.lastPut;
				}
				if (cardVal && cardVal > 0) {
					setCardPic(vnode[0].getChildByName("card1"), cardVal, 0);
					vnode[0].getChildByName("card1").visible = true;
				}
				vnode[0].getChildByName("bgground").zIndex = -1;
				vnode[0].getChildByName("bgground").visible = true;

			}
			doLayout(vnode[i], [0, 0.12], [0.5, 0], [(1 - vnode.length) / 2.0 + i * 1.7, 2.5], false, false);
		}
	}

	function CheckEatVisibleForTaiZhou(eat)
	{
		console.log(">>>>>>>> 检查台州麻将 <<<<<<<<<<")

		CheckChangeuiVisible();
		var eatNode = eat._node;
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var leftCard = getAllCardsTotal(tData.withWind) - tData.cardNext;
		eat.chi0._node.visible = false;
		eat.chi1._node.visible = false;
		eat.chi2._node.visible = false;
		eat.peng._node.visible = false;
		eat.gang0._node.visible = false;
		eat.gang1._node.visible = false;
		eat.gang2._node.visible = false;
		eat.hu._node.visible = false;
		eat.guo._node.visible = false;
		var pl = sData.players[SelfUid() + ""];

		if (pl.mjState == TableState.waitEat
			|| pl.mjState == TableState.waitPut
			&& tData.uids[tData.curPlayer] == SelfUid()) {

		} else {
			return;
		}

		jsclient.gangCards = [];
		jsclient.eatpos = [];
		var mj = jsclient.majiang;
		var vnode = [];
		//gang hu put
		if (tData.tState == TableState.waitPut && pl.mjState == TableState.waitPut) {
			if (IsMyTurn()) {
				isCanPutCard = false;
				var flowerCard = RequestFlower();
				if(flowerCard > 0)
				{
					var cduis=jsclient.replayui.jsBind.down._node.children;
					var cardIndex = null;
					for(var i=cduis.length-1;i>=0;i--)
					{
						if(cduis[i].name == "mjhand" && cduis[i].tag == flowerCard)
						{
							cardIndex = i;
							// PutAwayCard(cduis[i],lastCard);
							break;
						}
					}
					if(cardIndex)
					{
						var callback = function () {
							PutAwayCard(cduis[cardIndex],flowerCard);
						};
						cduis[cardIndex].runAction(cc.sequence(cc.delayTime(0.5), cc.callFunc(callback)));
						return;
					}
				}
				isCanPutCard = true;

				if (pl.isNew && mj.canHu(!tData.canHu7, pl.mjhand, 0,
						tData.canHuWith258, tData.withZhong) > 0)
				{
					vnode.push(eat.hu._node);
				}

				var rtn = leftCard > 0 ? mj.canGang1(pl.mjpeng, pl.mjhand, pl.mjpeng4) : [];
				if (rtn.length > 0 && rtn.indexOf(tData.lastPut) < 0 && pl.isNew) {
					jsclient.gangCards = rtn;
					if (jsclient.gangCards == 1) {
						eat.gang0.bgground.visible = true;
						eat.gang0.card1._node.visible = true;
						setCardPic(eat.gang0.card1._node, jsclient.gangCards[0], 0);
					} else {
						eat.gang0.bgground.visible = false;
						eat.gang0.card1._node.visible = false;
					}
					vnode.push(eat.gang0._node);
				}
				if (vnode.length > 0) vnode.push(eat.guo._node);
			}
		} else if (tData.tState == TableState.waitEat) {
			if (!IsMyTurn()) {
				console.log("------- 台州不能胡7对 ----"  + tData.canHu7);
				var huType = mj.canHu(!tData.canHu7, pl.mjhand, tData.lastPut,
					tData.canHuWith258, tData.withZhong);

				//台州不能胡别人打的财神,liang fang
				if (huType > 0 && tData.lastPut != 91) {
					if (pl.skipHu && pl.skipHu.length > 0) {
						var skip = false;
						for (var i = 0; i < pl.skipHu.length; i++) {
							if (tData.lastPut == pl.skipHu[i]) {
								skip = true;
							}
						}
						;
						if (skip) {
							ShowSkipHu();
						} else {
							vnode.push(eat.hu._node);
						}
					} else {
						vnode.push(eat.hu._node);
					}

				}

				if ((tData.putType == 0 || tData.putType == 4)) {
					var isHunCard = mj.isEqualHunCard(tData.lastPut);
					if (leftCard > 0 && !isHunCard && mj.canGang0(pl.mjhand, tData.lastPut)) {
						if (tData.caipiaoPlayer.length == 0) {
							vnode.push(eat.gang0._node);
						}
						jsclient.gangCards = [tData.lastPut];
						eat.gang0.bgground.visible = true;
						eat.gang0.card1._node.visible = true;
						setCardPic(eat.gang0.card1._node, jsclient.gangCards[0], 0);
					}
					if (!isHunCard && mj.canPeng(pl.mjhand, tData.lastPut)) {
						if (pl.skipPeng.indexOf(tData.lastPut) < 0)
						{
							vnode.push(eat.peng._node);
						}
					}
					if (!tData.isHunNum7
						&& tData.canEat
						&& !isHunCard
						&&tData.uids[(tData.curPlayer + 1) % 4] == SelfUid()) {
						var eatpos = mj.canChiForNingBo(pl.mjhand, tData.lastPut);
						jsclient.eatpos = eatpos;

						if (eatpos.length > 0) {
							vnode.push(eat.chi0._node);
						}
					}

				}


				if (vnode.length > 0) vnode.push(eat.guo._node);
				else getUIPlayer(0).mjState = TableState.waitCard;
			}
		}


		var btnImgs = {
			"peng": ["res/playing/gameTable/youxizhong-2_57.png", "res/playing/gameTable/youxizhong-2_07.png"],
			"gang0": ["res/playing/gameTable/youxizhong-2_55.png", "res/playing/gameTable/youxizhong-2_05.png"],
			"chi0": ["res/playing/gameTable/youxizhong-2_59.png", "res/playing/gameTable/youxizhong-2_09.png"],
		}

		for (var i = 0; i < vnode.length; i++) {
			vnode[i].visible = true;
			if (vnode[i].getChildByName("card1")) vnode[i].getChildByName("card1").visible = false;
			if (vnode[i].getChildByName("bgground")) vnode[i].getChildByName("bgground").visible = false;
			if (vnode[i].getChildByName("bgimg")) vnode[i].getChildByName("bgimg").visible = true;
			var btnName = vnode[i].name;


			if (btnName == "peng" || btnName == "chi0" || btnName == "gang0") {
				vnode[i].loadTextureNormal(btnImgs[btnName][0]);
				vnode[i].loadTexturePressed(btnImgs[btnName][0]);
			}

			if (i == 0) {

				var cardVal = 0;

				if (vnode[i].getChildByName("bgimg")) vnode[i].getChildByName("bgimg").visible = false;

				if (btnName == "peng" || btnName == "chi0" || btnName == "gang0") {
					vnode[i].loadTextureNormal(btnImgs[btnName][1]);
					vnode[i].loadTexturePressed(btnImgs[btnName][1]);
				}
				if (btnName == "peng") {
					cardVal = tData.lastPut;
				} else if (btnName == "chi0") {
					if (jsclient.eatpos.length == 1) cardVal = tData.lastPut;
				} else if (btnName == "gang0") {
					if (jsclient.gangCards.length == 1) cardVal = jsclient.gangCards[0];
				} else if (btnName == "hu") {
					if (IsMyTurn()) cardVal = pl.mjhand[pl.mjhand.length - 1];
					else cardVal = tData.lastPut;
				}
				if (cardVal && cardVal > 0) {
					setCardPic(vnode[0].getChildByName("card1"), cardVal, 0);
					vnode[0].getChildByName("card1").visible = true;
				}
				vnode[0].getChildByName("bgground").zIndex = -1;
				vnode[0].getChildByName("bgground").visible = true;

			}
			doLayout(vnode[i], [0, 0.12], [0.5, 0], [(1 - vnode.length) / 2.0 + i * 1.7, 2.5], false, false);
		}
	}
	function CheckEatVisibleForWenZhou(eat)
	{
		CheckEatVisibleForHangZhou(eat);
	}

	function CheckEatVisible(eat)
	{

		switch (jsclient.rePlayVideo)
		{
			case jsclient.GAME_TYPE.HANG_ZHOU:
				CheckEatVisibleForHangZhou(eat);
				break;
			case jsclient.GAME_TYPE.NING_BO:
				CheckEatVisibleForNingBo(eat);
				break;
			case jsclient.GAME_TYPE.WEN_ZHOU:
				CheckEatVisibleForWenZhou(eat);
				break;
			case jsclient.GAME_TYPE.TAI_ZHOU:
				CheckEatVisibleForTaiZhou(eat);
				break;
			default:
				break;
		}

	}
	function setFlowerImg(node, pl)
	{
		if(jsclient.rePlayVideo == jsclient.GAME_TYPE.HANG_ZHOU)
		{
			return;
		}

		cc.log("setFlowerImg(...) pl.mjflower = " + pl.mjflower);
		if(pl.mjflower && pl.mjflower.length > 0)
		{
			var parent = node.getChildByName("head").getChildByName("flower_layout")
			parent.setVisible(true);
			for(var i = 0; i < pl.mjflower.length; ++i)
			{
				var card = pl.mjflower[i];
				var flower = parent.getChildByName("flower_" + card);
				if(flower)
				{
					var img = "res/playing/gameTable/flower_press_" + card + ".png";
					flower.loadTexture(img);
				}
			}
		}
	}
	function initFlower(isVisible)
	{
		if(jsclient.rePlayVideo == jsclient.GAME_TYPE.HANG_ZHOU)
		{
			isVisible = false;
		}
		var jsBind=jsclient.replayui.jsBind;
		var ui=[jsBind.down,jsBind.right,jsBind.top,jsBind.left];
		for(var i = 0; i < 4; i++)
		{
			var parent = ui[i]._node.getChildByName("head").getChildByName("flower_layout");
			if(parent)
			{
				parent.setVisible(isVisible);
			}
		}
	}
	function replayShowHuLogo(node,off,pos){
		var pl = getUIPlayer(off);
		if(pos == 0) { //胡
			if (pl.winType > 0
				&& pl.winType < 4) {
				node.visible = true;
			}
			else {
				node.visible = false;
			}
		}
		else if (pos == 1){ //自摸胡
			if (pl.winType > 3) {
				node.visible = true;
				if (off == 1) {
					node.rotation = 90;
				} else if (off == 3) {
					node.rotation = -90;
				}
			} else {
				node.visible = false;
			}
		}
		else {
			node.visible = false;
		}
	}

	function resetFlowerForPlayer(node, off)
	{
		// var pl = getUIPlayer(off);
		var parent = node.getChildByName("head").getChildByName("flower_layout");
		if(parent)
		{
			for(var i = 111; i <= 181; ++i)
			{
				var card = i;
				var flower = parent.getChildByName("flower_" + card);
				if(flower)
				{
					var img = "res/playing/gameTable/flower_normal_" + card + ".png";
					flower.loadTexture(img);
				}
			}
			parent.setVisible(false);
		}
	}


	function checkCanTing(msg)
	{
		cc.log("checkCanTing1");
		var pl=getUIPlayer(0);
		var cd = msg.newCard;
		var down =jsclient.replayui.jsBind.down._node;
		var children = down.children;
		children = down.children;
		if (SelfUid() == msg.uid &&pl.mjting)
		{
			for(var i=0;i<children.length;i++)
			{
				if (children[i].name == "mjhand"&&children[i].tag ==cd )
				{
					jsclient.lastPutPos={x:children[i].x,y:children[i].y};
				}
			}
		}
		/*
		 找出新发的牌的位置
		 */


		jsclient.tingCard =cd;
		if (pl.firstPick ==1)
		{
			cc.log("checkCanTing2");
			var cardIndex = pl.mjhand.indexOf(cd);
			pl.mjhand.splice(cardIndex,1);
			var maxWin = jsclient.majiang.missHandMax(pl);
			pl.mjhand.splice(cardIndex,0,cd);
			if(maxWin>0&&pl.mjpeng.length==0&&pl.mjgang0.length==0&&pl.mjgang1.length==0)
			{
				jsclient.data.tingCardTouch = 2;
				CheckEatVisible(jsclient.replayui.jsBind.eat);
				return;
			}else
			{
				jsclient.data.tingCardTouch = 1;
				CheckEatVisible(jsclient.replayui.jsBind.eat);
			}

		}
	}

//圈风显示
	function setPlayerRoundDir(off)
	{
		setInfo(true);
		if(jsclient.rePlayVideo == jsclient.GAME_TYPE.NING_BO
			|| jsclient.rePlayVideo == jsclient.GAME_TYPE.TAI_ZHOU)
		{
			var sData = jsclient.data.sData;
			var tData = sData.tData;
			var pl = getUIPlayer(off);
			if(pl)
			{
				var roundDir = jsclient.majiang.getWindDir(tData.uids.indexOf(pl.info.uid), tData.zhuang);//位风
				// var roundDir = jsclient.majiang.getRingWindDir(tData, pl.info);//圈风
				// cc.log("tData.curRingWind = " + tData.curRingWind);
				// cc.log("setPlayerRoundDir: name = " + unescape(pl.info.nickname || pl.info.name) + ", dir = " + pl.roundDir);

				var node = jsclient.replayui.jsBind.arrowbk._node;
				var child = ["dir_down", "dir_right", "dir_up", "dir_left"];
				var dir = node.getChildByName(child[off]);
				if (dir)
				{
					dir.setVisible(true);
					var isZhuang = tData.uids[tData.zhuang] == pl.info.uid;
					// cc.log("tData.zhuang = " + tData.zhuang+", tData.uids[tData.zhuang] = " + tData.uids[tData.zhuang] + ", pl.info.uid = " + pl.info.uid);
					if(isZhuang)
					{
						// cc.log("===================> zhuang' dir = " +roundDir);
						dir.loadTexture("res/playing/gameTable/dir_press_" + roundDir + ".png");
					}
					else
					{
						// cc.log("===================> dir = " + roundDir);
						dir.loadTexture("res/playing/gameTable/dir_normal_" + roundDir + ".png");
					}

				}
			}
			else
			{
				var node = jsclient.replayui.jsBind.arrowbk._node;
				var child = ["dir_down", "dir_right", "dir_up", "dir_left"];
				var dir = node.getChildByName(child[off]);
				if (dir)
				{
					var tmpPos = rvnPos.slice();
					for (var i = 0; i < tData.uids.length; i++)
					{
						var roundDir = jsclient.majiang.getWindDir(i, tData.zhuang);//位风
						if (tmpPos.indexOf(roundDir) >= 0){
							tmpPos.splice(tmpPos.indexOf(roundDir), 1);
						}
					}
					if (tmpPos[0])
						dir.loadTexture("res/playing/gameTable/dir_normal_" + tmpPos[0] + ".png");
				}
			}
		}
	}

	function setDirVisible(node, isVisible)
	{
		var child = ["dir_down", "dir_right", "dir_up", "dir_left"];
		var url = "res/playing/gameTable/";
		for(var i = 0; i < child.length; i++)
		{
			var dir = node.getChildByName(child[i]);
			if(dir)
			{
				dir.setVisible(isVisible);
				dir.loadTexture(isVisible ? (url + "dir_press_" +i + ".png") : (url + "dir_normal_" + i + ".png"));
			}
		}
	}

	function SetPlayerVisible(node, off) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var pl = getUIPlayer(off);
		var head = node.getChildByName("head");
		var name = head.getChildByName("name");
		var nobody = head.getChildByName("nobody");
		var coin = head.getChildByName("coin");
		var offline = head.getChildByName("offline");
		var coin = head.getChildByName("coin");
		var playState = head.getChildByName("play_state");
		GLog("SetPlayerVisible 跟不跟, playState = "+playState);
		playState.visible = false;
		if (pl) {
			name.visible = true;
			coin.visible = true;
			//offline.visible = true;

			setFlowerImg(node,pl);
			jsclient.loadWxHead(pl.info.uid, pl.info.headimgurl);
			//setOffline(node, off);
			InitPlayerHandUI(node, off);
			GLog("tData.noPlayUids = "+tData.noPlayUids);
			GLog("pl.info.uid = "+pl.info.uid);
			if(tData.noPlayUids.indexOf(pl.info.uid) >= 0)
			{
				playState.visible = true;
			}
			if(off == 0)
			{
				HandleWaitSelect(jsclient.replayui.jsBind.chengbao._node);
			}
		} else {
			name.visible = false;
			coin.visible = false;
			offline.visible = false;
			coin.visible = false;
			var WxHead = nobody.getChildByName("WxHead");
			if (WxHead)
			{
				WxHead.removeFromParent(true);
			}
		}
	}

	function CheckInviteVisible() {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		if (TableState.waitJoin == tData.tState) {
			return Object.keys(sData.players).length < tData.maxPlayer;
		} else {
			return false;
		}
	}

	function CheckArrowVisible() {
		var sData = jsclient.data.sData;
		var tData = sData.tData;

		//mylog("CheckArrowVisible "+tData.tState);
		if (TableState.waitPut == tData.tState
			|| TableState.waitEat == tData.tState
			|| TableState.waitCard == tData.tState
			|| TableState.waitSelect == tData.tState) {
			return true;
		} else {
			return false;
		}
	}

	function clearCardUI(node) {
		mylog("clearCardUI");
		var children = node.children;
		for (var i = 0; i < children.length; i++) {
			var ni = children[i];
			if (ni.name != "head"
				&& ni.name != "up"
				&& ni.name != "down"
				&& ni.name != "stand"
				&& ni.name != "out0"
				&& ni.name != "out1"
				&& ni.getName() != "ready"
				&& ni.getName() != "play_tips"
				&& ni.getName() != "tai_layout") {
				ni.removeFromParent(true);
			}
			else if(ni.getName() == "play_tips")
			{
				InitShowEatActionNode(ni.getParent());
			}
		}
	}
	function InitShowEatActionNode(head) {
		var play_tips = head.getChildByName("play_tips");
		for(var i=0;i<play_tips.children.length;i++)
		{
			play_tips.children[i].visible = false;
		}
	}
//台数信息
	function setTaiInfo(text)
	{
		var taiInfo = jsclient.replayui.jsBind.down._node.getChildByName("tai_layout").getChildByName("tai_info");
		if(taiInfo)
		{
			GLog("台数信息 text: " + text);
			taiInfo.setString(text+"");
		}
	}
	function resetEatActionAnim()
	{
		var jsBind=jsclient.replayui.jsBind;
		var ui=[jsBind.down,jsBind.right,jsBind.top,jsBind.left];
		for(var i = 0; i < 4; i++)
		{
			InitShowEatActionNode(ui[i]._node);
		}
	}

	function ShowEatActionAnim(node, actType, off)
	{
		var delayTime = 2;
		var eatActionNode = node.getChildByName("play_tips");
		if(!eatActionNode)
		{
			cc.log(" eatActionNode ======= null");
			return;
		}
		var eatActionChild;
		var callback = function () {
			eatActionChild.visible = false;
		};
		eatActionNode.visible = true;
		switch (actType){
			case ActionType.CHI:
				eatActionChild = eatActionNode.getChildByName("chi");
				eatActionChild.visible = true;
				eatActionChild.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(callback)));
				break;
			case ActionType.PENG:
				eatActionChild = eatActionNode.getChildByName("peng");
				eatActionChild.visible = true;
				eatActionChild.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(callback)));
				break;
			case ActionType.GANG:
				eatActionChild = eatActionNode.getChildByName("gang");
				eatActionChild.visible = true;
				eatActionChild.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(callback)));
				break;
			case ActionType.HU:
				eatActionChild = eatActionNode.getChildByName("hu");
				eatActionChild.visible = true;
				break;
			case ActionType.FLOWER:
				eatActionChild = eatActionNode.getChildByName("hua");
				eatActionChild.visible = true;
				eatActionChild.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(callback)));
				break;
			case ActionType.CHENG_BAO:
				eatActionChild = eatActionNode.getChildByName("chengbao");
				eatActionChild.visible = true;
				eatActionChild.runAction(cc.sequence(cc.delayTime(delayTime), cc.callFunc(callback)));
				break;

		}
	}
	function HandleNewCard(node, msg, off) {

		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var uids = tData.uids;
		var pl = getUIPlayer(off);
		if (uids[tData.curPlayer] == pl.info.uid) {
			if (off == 0) {
				AddNewCard(node, "stand", "mjhand", msg, off);
			} else if (pl.mjhand) {
				AddNewCard(node, "up", "mjhand", msg, off);
			}
			RestoreCardLayout(node, off);
		}
	}

	function HandleWaitPut(node, msg, off) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var uids = tData.uids;
		var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
		if (tData.curPlayer == selfIndex) {
			//AddNewCard(node, "stand", "standPri");
			RestoreCardLayout(node, off);
		}
	}

	function HandleMJChi(node, msg, off) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var uids = tData.uids;
		var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
		if (tData.curPlayer == selfIndex) {
			var fromOff = [];
			var fromBind = GetUIBind(msg.from, fromOff);
			var fnode = fromBind._node;
			RemoveNewOutCard(fnode);
			var cds = msg.mjchi;
			cds.sort(function(a, b){return a - b;});
			if(off == 0)
			{
				if (msg.pos == 0) {
					noPutWithChi.push(cds[0])
					noPutWithChi.push(cds[0] + 3)
				}
				else if (msg.pos == 1) {
					noPutWithChi.push(cds[1])
				}
				else {
					noPutWithChi.push(cds[2] - 3)
					noPutWithChi.push(cds[2])
				}
			}
			// cc.log("cds = " + cds);
			// cc.log("Chiiiiiiiiiiiiiiiiiiiiiiiii pos = " + msg.pos + ", off = " + off);
			for (var i = 0; i < cds.length; i++) {

				// if (i % 3 == 0 && off % 3 == 0 || i % 3 == 2 && off % 3 != 0) {
				if (cds[i] == tData.lastPut) {
					var sp = AddNewCard(node, "up", "chi", cds[i], (off+1)%4, "heng");
					sp.ignoreContentAdaptWithSize(true);
					// sp.setColor(cc.color(255,0,0));
				} else {
					AddNewCard(node, "up", "chi", cds[i], off);
				}

				if (off == 0 && cds[i] != tData.lastPut) {
					RemoveBackNode(node, "mjhand", 1, cds[i]);
				}
			}
			//删掉俩张stand
			if (off == 3) RemoveBackNode(node, "standPri", 2);
			else if (off != 0) RemoveFrontNode(node, "standPri", 2);
			RestoreCardLayout(node, off);
			RestoreCardLayout(fnode, fromOff[0]);
			ShowEatActionAnim(node, ActionType.CHI, off);
		}
	}

	function HandleMJPeng(node, msg, off) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var uids = tData.uids;
		var pl = getUIPlayer(off);
		var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
		if (tData.curPlayer == selfIndex) {
			var fromOff = [];
			var fromBind = GetUIBind(msg.from, fromOff);
			var fnode = fromBind._node;
			RemoveNewOutCard(fnode);

			for (var i = 0; i < 3; i++) {
				AddNewCard(node, "up", "peng", tData.lastPut, off);
			}
			//删掉俩张stand
			if (pl.mjhand)    RemoveBackNode(node, "mjhand", 2, tData.lastPut);
			else if (off == 3) RemoveBackNode(node, "standPri", 2);
			else RemoveFrontNode(node, "standPri", 2);

			RestoreCardLayout(node, off);
		}
	}

	function HandleMJHu(node,msg,off)
	{
		var sData=jsclient.data.sData;
		var tData=sData.tData;
		var selfIndex=(tData.uids.indexOf(SelfUid())+off)%4;
		if( tData.uids[selfIndex]!=msg.uid) return;
		var pl = getUIPlayer(off);
		if(pl)
		{
			CheckEatVisible(jsclient.replayui.jsBind.eat);
			ShowEatActionAnim(node,ActionType.HU,off);
		}
	}
	function HandleMJFlower(node,msg,off)
	{
		console.log("----------------- HandleMJFlower --------------------- " + JSON.stringify(msg));
		var sData=jsclient.data.sData;
		var tData=sData.tData;
		var selfIndex=(tData.uids.indexOf(SelfUid())+off)%4;
		if( tData.uids[selfIndex]!=msg.uid) return;
		var pl = getUIPlayer(off);
		if(pl)
		{

			RemoveBackNode(node, "mjhand", 1, msg.card);
			/*if(off==0)
			 {
			 RemoveBackNode(node, "mjhand", 1, msg.card);
			 }
			 else if(off==1)
			 {
			 RemoveBackNode(node, "standPri", 1);
			 }
			 else if(off == 2 || off == 3)
			 {
			 RemoveFrontNode(node, "standPri", 1);
			 }*/
			//不显示花牌
			// if(flowerShowTag != 2)
			// {
			// 	AddNewCard(node,"up","flower",msg.card,off);
			// }
			RestoreCardLayout(node,off);
			setFlowerImg(node, pl);
			ShowEatActionAnim(node,ActionType.FLOWER,off);
		}
	}

//自动打牌
	function AutoPutAwayCard()
	{
		var cduis=jsclient.replayui.jsBind.down._node.children;
		var pl=jsclient.data.sData.players[SelfUid()];
		var lastCard=pl.mjhand[pl.mjhand.length-1];
		var cardIndex = null;
		for(var i=cduis.length-1;i>=0;i--)
		{
			if(cduis[i].tag==lastCard)
			{
				cardIndex = i;
				// PutAwayCard(cduis[i],lastCard);
				break;
			}
		}
		if(cardIndex)
		{
			var callback = function () {
				PutAwayCard(cduis[cardIndex],lastCard);
			};
			cduis[cardIndex].runAction(cc.sequence(cc.delayTime(0.3), cc.callFunc(callback)));
		}
	}

	function RequestFlower()
	{
		var pl = getUIPlayer(0);
		if(pl)
		{

			function canFlower(hand)
			{
				for(var i=0;i<hand.length;i++)
				{
					if(jsclient.majiang.isFlower8(hand[i]))
					{
						if(!jsclient.majiang.isEqualHunCard(hand[i]))
						{
							return hand[i];
						}
					}
				}
				return -1;
			}
			return canFlower(pl.mjhand);
		}
		return -1;
	}

	function RemoveFrontNode(node, name, num, tag) {

		var children = node.children;

		for (var i = 0; i < children.length && num > 0; i++) {
			var ci = children[i];
			if (ci.name == name && (!(tag > 0) || ci.tag == tag)) {
				ci.removeFromParent(true);
				num--;
			}
		}
		if (num != 0) mylog(node.name + " RemoveFrontNode fail " + name + " " + tag);
	}


	function RemoveNewOutCard(node) {
		var children = node.children;
		for (var i = 0; i < children.length; i++) {
			var ci = children[i];
			if (ci.name == "newout") {
				ci.removeFromParent(true);
			}
		}
	}

	function RemoveBackNode(node, name, num, tag) {

		var children = node.children;
		for (var i = children.length - 1; i >= 0 && num > 0; i--) {
			var ci = children[i];
			if (ci.name == name && (!(tag > 0) || ci.tag == tag)) {
				ci.removeFromParent(true);
				num--;
			}
		}
		if (num != 0) mylog(node.name + " RemoveBackNode fail " + name + " " + tag);
	}

	function AddNewCard(node, copy, name, tag, off, specialTAG) {
		var cpnode = node.getChildByName(copy);
		var cp = cpnode.clone();
		cp.visible = true;
		cp.name = name;
		if (specialTAG == "isgang4") {
			cp.isgang4 = true;
		}
		node.addChild(cp);
		if (tag > 0) {
			var count;
			if (name == "mjhand" && off == 0) {
				count = 4;
			} else {
				count = off;
			}
			setCardPic(cp, tag, count);
		}
		return cp;
	}

	function GetUIBind(uidPos, offStore) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var uids = tData.uids;
		var selfIndex = uids.indexOf(SelfUid());
		var uiOff = (uidPos + 4 - selfIndex) % 4;
		if (offStore) offStore.push(uiOff);
		var jsBind = jsclient.replayui.jsBind;
		var ui = [jsBind.down, jsBind.right, jsBind.top, jsBind.left];
		return ui[uiOff];
	}

	function HandleMJGang(node, msg, off) {

		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var uids = tData.uids;
		var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
		if (uids[selfIndex] != msg.uid) return;

		if (msg.gang == 1) {
			var fromOff = [];
			var fromBind = GetUIBind(msg.from, fromOff);
			var fnode = fromBind._node;
			RemoveNewOutCard(fnode);
			if (off == 0) RemoveBackNode(node, "mjhand", 3, msg.card);
			RestoreCardLayout(fnode, fromOff[0]);
		} else if (msg.gang == 2) {
			RemoveBackNode(node, "peng", 3, msg.card);
			if (off == 0) RemoveBackNode(node, "mjhand", 1, msg.card);
		} else if (msg.gang == 3) {
			if (off == 0) RemoveBackNode(node, "mjhand", 4, msg.card);
		}
		if (off != 0) {
			if (off == 3) {
				if (msg.gang == 1) {
					var fromOff = [];
					var fromBind = GetUIBind(msg.from, fromOff);
					var fnode = fromBind._node;
					RemoveNewOutCard(fnode);
					RemoveBackNode(node, "standPri", 3);
				} else if (msg.gang == 2) {
					RemoveBackNode(node, "peng", 3, msg.card);
					RemoveBackNode(node, "standPri", 1);
				} else if (msg.gang == 3) {
					RemoveBackNode(node, "standPri", 4);
				}

			} else {

				if (msg.gang == 1) {
					var fromOff = [];
					var fromBind = GetUIBind(msg.from, fromOff);
					var fnode = fromBind._node;
					RemoveNewOutCard(fnode);
					RemoveFrontNode(node, "standPri", 3);
				} else if (msg.gang == 2) {
					RemoveFrontNode(node, "peng", 3, msg.card);
					RemoveFrontNode(node, "standPri", 1);
				} else if (msg.gang == 3) {
					RemoveFrontNode(node, "standPri", 4);
				}

			}
		}

		var pl = sData.players[tData.uids[selfIndex] + ""];
		var i = pl.pengchigang.peng.length - 1;
		var idx = tData.uids.indexOf(pl.info.uid);
		var offIdx = (pl.pengchigang.peng[i] - idx + 4) % 4 - 1;




		for (var j = 0; j < 4; j++) {
			if (msg.gang == 3) {
				if (j == 3) {
					AddNewCard(node, "down", "gang1", 0, off, "isgang4").tag = msg.card;
				} else {
					AddNewCard(node, "up", "gang1", msg.card, off);
				}

			} else {

				for (var j = 0; j < 4; j++) {

					if (j == 3) {
						AddNewCard(node, "up", "gang0", msg.card, off, "isgang4").tag = msg.card;
					} else {
						if (j % 3 == 2 - offIdx && off % 3 == 0 || j % 3 == offIdx && off % 3 != 0) {
							if (offIdx == 1) {
								AddNewCard(node, "up", "gang0", msg.card, off);
							} else {
								var sp = AddNewCard(node, "up", "gang0", msg.card, (off+1)%4, "heng", "heng");
								sp.ignoreContentAdaptWithSize(true);
							}
						}else {
							AddNewCard(node, "up", "gang0", msg.card, off);
						}
					}
				}

				// if (i == 3) {
				// 	AddNewCard(node, "up", "gang0", msg.card, off, "isgang4").tag = msg.card;
				// } else {
				// 	AddNewCard(node, "up", "gang0", msg.card, off);
				// }

			}

		}

		RestoreCardLayout(node, off);
		ShowEatActionAnim(node, ActionType.GANG, off);
	}

// function TagOrder(na, nb) {
// 	if (jsclient.majiang.isEqualHunCard(na.tag)) {
// 		return -1;
// 	} else if (jsclient.majiang.isEqualHunCard(nb.tag)) {
// 		return 1;
// 	} else {
// 		return na.tag - nb.tag;
// 	}
// }
	function TagOrder(na, nb) {
		return na.tag - nb.tag;
	}


	function RestoreCardLayout(node, off, endonepl) {
		var newC = null;
		var newVal = 0;
		var pl;
		if (endonepl) {
			pl = endonepl;
		} else {
			pl = getUIPlayer(off);
		}
		var mjhandNum = 0;
		var children = node.children;
		for (var i = 0; i < children.length; i++) {
			var ci = children[i];
			if (ci.name == "mjhand") {
				mjhandNum++;
			}
		}
		if (pl.mjhand && pl.mjhand.length > 0) {
			var count = jsclient.majiang.CardCount(pl);

			if (count == 14 && mjhandNum == pl.mjhand.length) {
				if (pl.isNew || endonepl)
					newVal = pl.mjhand[pl.mjhand.length - 1];
				else newVal = Math.max.apply(null, pl.mjhand);
			}
		}

		var up = node.getChildByName("up");
		var stand = node.getChildByName("stand");
		var start, offui;
		switch (off) {
			case 0:
				start = up;
				offui = stand;
				break;
			case 1:
				start = stand;
				offui = up;
				break;
			case 2:
				start = stand;
				offui = up;
				break;
			case 3:
				start = up;
				offui = up;
				break;
		}
		var upSize = offui.getSize();
		var upS = offui.scale;
		//mjhand standPri out chi peng gang0 gang1
		var uipeng = [];
		var uigang0 = [];
		var uigang1 = [];
		var uichi = [];
		var uistand = [];
		var uihun = [];//癞子牌在最左边

		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var isChengBao = (tData.noPlayUids.indexOf(pl.info.uid) >= 0);
		for (var i = 0; i < children.length; i++) {
			var ci = children[i];
			if (ci.name == "mjhand") {
				if (newC == null && newVal == ci.tag) {
					newC = ci;
				}
				else
				{
					if(jsclient.majiang.isEqualHunCard(ci.tag))
					{
						uihun.push(ci);
					}
					else
					{
						uistand.push(ci);
					}
				}
				if(isChengBao)
				{
					ci.setColor(cc.color(127,127,127));
				}
				else
				{
					if(jsclient.rePlayVideo == jsclient.GAME_TYPE.NING_BO && jsclient.majiang.isEqualHunCard(ci.tag))
					{
						ci.setColor(cc.color(255,255,63));
					}
				}

			} else if (ci.name == "standPri") {
				uistand.push(ci);
			} else if (ci.name == "gang0") {
				uigang0.push(ci);
			} else if (ci.name == "gang1") {
				uigang1.push(ci);
			} else if (ci.name == "chi") {
				uichi.push(ci);
			} else if (ci.name == "peng") {
				uipeng.push(ci);
			}

			/*
			 **去掉旧牌的特殊标签
			 */
		}
		// uipeng.sort(TagOrder);
		// uigang0.sort(TagOrder);
		// uigang1.sort(TagOrder);
		// uichi.sort(TagOrder);

		uistand.sort(TagOrder);
		if(uihun.length > 0) {
			for (var i = 0; i < uihun.length; i++) {
				uistand.unshift(uihun[i]);
			}
		}

		if (newC) {
			uistand.push(newC);
		}
		var uiOrder = [uigang1, uigang0, uipeng, uichi, uistand];
		if (off == 1 || off == 2) uiOrder.reverse();
		var orders = [];
		for (var j = 0; j < uiOrder.length; j++) {
			var uis = uiOrder[j];
			for (var i = 0; i < uis.length; i++)
			{
				orders.push(uis[i]);
			}
		}
		var slotwith = upSize.width * upS * 0.3;
		var slotheigt = upSize.height * upS * 0.3;
		for (var i = 0; i < orders.length; i++) {
			var ci = orders[i];
			if (off % 2 == 0) {
				if (i != 0) {
					if (ci.name == orders[i - 1].name) {

						if (ci.isgang4) {
							ci.x = orders[i - 2].x;
							ci.y = orders[i - 2].y + upSize.height * upS * 0.18;
						} else if (orders[i - 1].isgang4) {
							ci.x = orders[i - 1].x + upSize.width * upS * 2;
						} else {
							if (ci.heng) {
								if (off == 0) {
									ci.x = orders[i - 1].x + upSize.width * upS * 0.85;
									if (orders[i - 1].heng) {
										ci.y = orders[i - 1].y;
									} else {
										ci.y = orders[i - 1].y - upSize.height * upS * 0.13;
									}

								} else {
									ci.x = orders[i - 1].x + upSize.width * upS * 1.05;
									if (orders[i - 1].heng) {
										ci.y = orders[i - 1].y;
									} else {
										ci.y = orders[i - 1].y - upSize.height * upS * 0.15;
									}
								}
							} else {
								if (ci.name == "mjhand") {
									if (off == 0) {
										ci.x = orders[i - 1].x + upSize.width * upS * 0.95;
									} else {
										ci.x = orders[i - 1].x + upSize.width * upS * 1;
									}
								} else {
									if (off == 0) {
										if (orders[i - 1].heng) {
											ci.x = orders[i - 1].x + upSize.width * upS * 0.84;
										} else {
											ci.x = orders[i - 1].x + upSize.width * upS * 0.75;
										}
									} else {
										if (orders[i - 1].heng) {
											ci.x = orders[i - 1].x + upSize.width * upS * 0.1;
										} else {
											//调整up位置
											ci.x = orders[i - 1].x + upSize.width * upS * 0.9 + 2;
										}
									}
								}
							}
						}

					} else if (orders[i - 1].name == "gang0") {
						if (ci.heng) {
							ci.x = orders[i - 2].x + upSize.width * upS * 0.85;
							if (orders[i - 2].heng) {
								ci.y = orders[i - 2].y;
							} else {
								ci.y = orders[i - 2].y - upSize.height * upS * 0.13;
							}
						} else {
							ci.x = orders[i - 2].x + upSize.width * upS + slotwith;
						}
					} else if (orders[i - 1].name == "gang1") {
						if (ci.heng) {
							ci.x = orders[i - 2].x + upSize.width * upS * 0.85;
							if (orders[i - 2].heng) {
								ci.y = orders[i - 2].y;
							} else {
								ci.y = orders[i - 2].y - upSize.height * upS * 0.13;
							}
						} else {
							ci.x = orders[i - 2].x + upSize.width * upS + slotwith;
						}
					} else {
						if (ci.heng) {
							ci.x = orders[i - 1].x + upSize.width * upS + slotwith * 4;
							if (orders[i - 1].heng) {
								ci.y = orders[i - 2].y - upSize.height * upS * 0.14;
							} else {
								ci.y = orders[i - 1].y - upSize.height * upS * 0.14;
							}
						} else {
							ci.x = orders[i - 1].x + upSize.width * upS + slotwith;
						}
					}
					/*`
					 判断是不是新抓的牌
					 */
					if (off == 0) {

						if (i == orders.length - 1) {


							if (newC && endonepl) {
								ci.x = ci.x + slotwith + 10;
							} else if (newC) {
								ci.x = ci.x + slotwith + 10;
								//发牌的位置
								//ci.y += 20;
							}
						}
					}
				} else {
					if (ci.heng) {
						ci.x = start.x + upSize.width * upS + slotwith;
						ci.y = start.y - upSize.height * upS * 0.14;
					} else {
						ci.x = start.x + upSize.width * upS;
					}
				}
			} else {
				if (i != 0) {
					if (ci.name == orders[i - 1].name) {
						if (ci.isgang4) {
							ci.y = orders[i - 2].y + slotheigt;
						} else if (orders[i - 1].isgang4) {
							ci.y = orders[i - 2].y - upSize.height * upS * 0.7;
						} else {
							if (ci.heng) {
								if (off == 1) {
									ci.x = orders[i - 1].x + upSize.width * upS * 0.1;
								} else {
									ci.x = orders[i - 1].x - upSize.width * upS * 0.1;
								}
								ci.y = orders[i - 1].y - upSize.height * upS * 0.9;
							} else {
								if (orders[i - 1].heng) {
									//调整左右位置
									ci.y = orders[i - 1].y - upSize.height * upS * 1.0 - 5;
								} else {
									ci.y = orders[i - 1].y - upSize.height * upS * 0.7 - 5;
								}
							}
						}
					} else if (orders[i - 1].name == "standPri") {
						// ci.y = orders[i - 1].y - upSize.height * upS * 2;
						if (ci.heng) {
							if (off == 1) {
								ci.x = orders[i - 1].x + upSize.width * upS * 0.35;
							} else {
								ci.x = orders[i - 1].x - upSize.width * upS * 0.1;
							}
							ci.y = orders[i - 1].y - upSize.height * upS * 2;
						} else {
							ci.y = orders[i - 1].y - upSize.height * upS * 2;
						}
					} else if (orders[i - 1].name == "gang0") {
						if (ci.heng) {
							if (off == 1) {
								ci.x = orders[i - 2].x + upSize.width * upS * 0.1;
							} else {
								ci.x = orders[i - 2].x - upSize.width * upS * 0.1;
							}
							ci.y = orders[i - 2].y - upSize.height * upS * 0.9 - slotheigt;
						} else {
							ci.y = orders[i - 2].y - upSize.height * upS * 0.7 - slotheigt;
						}
					} else if (orders[i - 1].name == "gang1") {
						if (ci.heng) {
							if (off == 1) {
								ci.x = orders[i - 2].x + upSize.width * upS * 0.1;
							} else {
								ci.x = orders[i - 2].x - upSize.width * upS * 0.1;
							}
							ci.y = orders[i - 2].y - upSize.height * upS * 0.9 - slotheigt;
						} else {
							ci.y = orders[i - 2].y - upSize.height * upS * 0.7 - slotheigt;
						}
					} else {
						if (ci.heng) {
							if (off == 1) {
								ci.x = orders[i - 2].x + upSize.width * upS * 0.1;
							} else {
								ci.x = orders[i - 2].x - upSize.width * upS * 0.1;
							}
							ci.y = orders[i - 1].y - upSize.height * upS * 0.7 - slotheigt;
						} else {
							ci.y = orders[i - 1].y - upSize.height * upS * 0.7 - slotheigt;
						}
					}



				} else {
					if (ci.heng) {
						if (off == 1) {
							ci.x = start.x + upSize.width * upS * 0.1;
						} else {
							ci.x = start.x - upSize.width * upS * 0.1;
						}
						ci.y = start.y - upSize.height * upS * 0.9;
					} else {
						ci.y = start.y - upSize.height * upS * 0.7;
					}
				}

				if (off == 3) {
					if (!ci.isgang4) {
						ci.zIndex = i;
					} else {
						ci.zIndex = 200;
					}

				}

				if (off == 1) {
					if (!ci.isgang4) {
						ci.zIndex = i;
					} else {
						ci.zIndex = 200;
					}
				}
			}
		}
	}

	function HandleMJPut(node, msg, off, outNum) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var uids = tData.uids;
		var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
		if (uids[selfIndex] == msg.uid) {
			var pl = sData.players[msg.uid];
			var putnum = outNum >= 0 ? outNum : (pl.mjput.length - (off == 0 ? 0 : 1));
			var out0 = node.getChildByName("out0");
			var out1 = node.getChildByName("out1");
			var oSize = out0.getSize();
			var oSc = out0.scale;

			var out;
			if (putnum > 11) {
				out = out1.clone();
			} else {
				out = out0.clone();
			}
			if (off == 0 && putnum > 11) {
				node.addChild(out);
			} else if (off == 1 || off == 0) {
				node.addChild(out, 200 - putnum);
			} else if (off == 2 || off == 3) {
				node.addChild(out, putnum);
			}
			else {
				node.addChild(out);
			}
			for (var i = 0; i < node.children.length; i++) {
				if (node.children[i].name == "newout") node.children[i].name = "out";
			}
			out.visible = true;
			out.name = "out";
			setCardPic(out, msg.card, off);
			var endPoint = cc.p(0, 0);
			var Midpoint = cc.p(0, 0);
			var ws = cc.director.getWinSize();
			if (putnum > 11) {
				out.x = out1.x;
				out.y = out1.y;
				putnum -= 12;
			}
			var mjhand = getUIPlayer(off).mjhand;
			if (off == 0) {
				endPoint.y = out.y;
				endPoint.x = out.x + oSize.width * oSc * putnum;
				Midpoint.x = ws.width / 2;
				Midpoint.y = ws.height / 4;
				if (!(outNum >= 0)) {
					RemoveBackNode(node, "mjhand", 1, msg.card);
				}

			}
			else if (off == 1) {
				if (!(outNum >= 0)) {
					if (mjhand) {
						RemoveBackNode(node, "mjhand", 1, msg.card);
					} else {
						RemoveFrontNode(node, "standPri", 1);
					}
				}
				endPoint.y = out.y + oSize.height * oSc * putnum * 0.7;
				endPoint.x = out.x;
				Midpoint.x = ws.width / 4 * 3;
				Midpoint.y = ws.height / 2;
				out.zIndex = 100 - putnum;
			}
			else if (off == 2) {
				if (!(outNum >= 0)) {
					if (mjhand) {
						RemoveBackNode(node, "mjhand", 1, msg.card);
					} else {
						RemoveFrontNode(node, "standPri", 1);
					}

				}
				endPoint.x = out.x - oSize.width * oSc * putnum;
				endPoint.y = out.y;
				Midpoint.x = ws.width / 2;
				Midpoint.y = ws.height / 4 * 3;
			}
			else if (off == 3) {
				if (!(outNum >= 0)) {
					if (mjhand) {
						RemoveBackNode(node, "mjhand", 1, msg.card);
					} else {
						RemoveFrontNode(node, "standPri", 1);
					}

				}
				endPoint.y = out.y - oSize.height * oSc * putnum * 0.7;
				endPoint.x = out.x;
				Midpoint.x = ws.width / 4;
				Midpoint.y = ws.height / 2;
				out.zIndex = putnum;
			}


			if (outNum >= 0)//重连
			{
				if ((outNum == pl.mjput.length - 1) && tData.curPlayer == selfIndex && tData.tState == TableState.waitEat) {
				}
				else {
					out.x = endPoint.x;
					out.y = endPoint.y;
					return;
				}
			}
			else//打牌
			{
			}

			var zoder = out.zIndex;
			out.zIndex = 200;
			out.visible = false;
			var outAction = node.getParent().getChildByName("top").getChildByName("out0").clone();
			outAction.name = "outAction";
			outAction.visible = true;
			node.addChild(outAction);

			out.x = Midpoint.x
			out.y = Midpoint.y

			out.scale = 2 * oSc;

			out.name = "newout";

			setCardPic(outAction, msg.card, 2);

			outAction.scale = oSc;


			outAction.zIndex = 200
			if (off == 0 && jsclient.lastPutPos) {
				outAction.x = jsclient.lastPutPos.x;
				outAction.y = jsclient.lastPutPos.y;
			}
			else {
				outAction.x = node.getChildByName("stand").x;
				outAction.y = node.getChildByName("stand").y;
			}

			/**
			 设置出牌动画的方向
			 */

			var callbackFUNC = function () {
				out.zIndex = zoder;

			};
			var callbackFUNCROTATION = function () {
				out.visible = true;
				out.runAction(cc.sequence(cc.spawn(cc.moveTo(0.2, endPoint), cc.scaleTo(0.2, oSc)), cc.callFunc(callbackFUNC)));

			};
			outAction.runAction(cc.sequence(cc.spawn(cc.moveTo(0.2, Midpoint), cc.scaleTo(0.2, 2 * oSc))
					//cc.DelayTime(0.4),cc.callFunc(callbackFUNCROTATION),cc.removeSelf()
				)
			);

			function RemovePutCard(onlySelf) {
				var delayNum = 0.4 - (Date.now() - putTime) / 1000;
				if (delayNum < 0) delayNum = 0;
				if (!onlySelf)outAction.runAction(cc.sequence(cc.DelayTime(delayNum), cc.callFunc(callbackFUNCROTATION), cc.removeSelf()));
				else outAction.runAction(cc.sequence(cc.DelayTime(delayNum), cc.removeSelf()));
			}

			var putTime = Date.now();
			var outActionBind = {
				_event: {
					waitPut: function () {
						RemovePutCard(false)
					},
					MJChi: function () {
						RemovePutCard(true)
					},
					MJPeng: function () {
						RemovePutCard(true)
					},
					MJGang: function () {
						RemovePutCard(true)
					}
				}
			}
			ConnectUI2Logic(outAction, outActionBind);
			if (!(outNum >= 0))RestoreCardLayout(node, off);
		}
	}

	/*function HandleMJPut(node, msg, off, outNum) {
	 console.log("================== 删除牌型 ============== " + JSON.stringify(msg));

	 var sData = jsclient.data.sData;
	 var tData = sData.tData;
	 var uids = tData.uids;
	 var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
	 if (uids[selfIndex] == msg.uid) {
	 var pl = sData.players[msg.uid];
	 var putnum = outNum >= 0 ? outNum : (pl.mjput.length - (off == 0 ? 0 : 1));
	 var out0 = node.getChildByName("out0");
	 var out1 = node.getChildByName("out1");
	 var oSize = out0.getSize();
	 var oSc = out0.scale;

	 var out;
	 if (putnum > 11) {
	 out = out1.clone();
	 } else {
	 out = out0.clone();
	 }
	 if (off == 0 && putnum > 11) {
	 node.addChild(out);
	 } else if (off == 1 || off == 0) {
	 node.addChild(out, 200 - putnum);
	 } else if (off == 2 || off == 3) {
	 node.addChild(out, putnum);
	 } else {
	 node.addChild(out);
	 }
	 for (var i = 0; i < node.children.length; i++) {
	 if (node.children[i].name == "newout") node.children[i].name = "out";
	 }
	 out.visible = true;
	 out.name = "out";
	 setCardPic(out, msg.card, off);
	 var endPoint = cc.p(0, 0);
	 var Midpoint = cc.p(0, 0);
	 var ws = cc.director.getWinSize();
	 if (putnum > 11) {
	 out.x = out1.x;
	 out.y = out1.y;
	 putnum -= 12;
	 }
	 if (off == 0) {
	 endPoint.y = out.y;
	 endPoint.x = out.x + oSize.width * oSc * putnum;
	 Midpoint.x = ws.width / 2;
	 Midpoint.y = ws.height / 4;
	 if (!(outNum >= 0)) {
	 RemoveBackNode(node, "mjhand", 1, msg.card);
	 }

	 } else if (off == 1) {
	 if (!(outNum >= 0)) RemoveFrontNode(node, "standPri", 1);
	 endPoint.y = out.y + oSize.height * oSc * putnum * 0.7;
	 endPoint.x = out.x;
	 Midpoint.x = ws.width / 4 * 3;
	 Midpoint.y = ws.height / 2;
	 out.zIndex = 100 - putnum;
	 } else if (off == 2) {
	 if (!(outNum >= 0)) RemoveFrontNode(node, "standPri", 1);
	 endPoint.x = out.x - oSize.width * oSc * putnum;
	 endPoint.y = out.y;
	 Midpoint.x = ws.width / 2;
	 Midpoint.y = ws.height / 4 * 3;
	 } else if (off == 3) {
	 if (!(outNum >= 0)) RemoveBackNode(node, "standPri", 1);
	 endPoint.y = out.y - oSize.height * oSc * putnum * 0.7;
	 endPoint.x = out.x;
	 Midpoint.x = ws.width / 4;
	 Midpoint.y = ws.height / 2;
	 out.zIndex = putnum;
	 }


	 if (outNum >= 0) //重连
	 {
	 if ((outNum == pl.mjput.length - 1) && tData.curPlayer == selfIndex && tData.tState == TableState.waitEat) {} else {
	 out.x = endPoint.x;
	 out.y = endPoint.y;
	 return;
	 }
	 } else //打牌
	 {}

	 var zoder = out.zIndex;
	 out.zIndex = 200;
	 out.visible = false;
	 var outAction = node.getParent().getChildByName("top").getChildByName("out0").clone();
	 outAction.name = "outAction";
	 outAction.visible = true;
	 node.addChild(outAction);

	 out.x = Midpoint.x
	 out.y = Midpoint.y

	 out.scale = 2 * oSc;

	 out.name = "newout";

	 setCardPic(outAction, msg.card, 0);

	 outAction.scale = oSc;


	 outAction.zIndex = 200
	 if (off == 0 && jsclient.lastPutPos) {
	 outAction.x = jsclient.lastPutPos.x;
	 outAction.y = jsclient.lastPutPos.y;
	 } else {
	 outAction.x = node.getChildByName("stand").x;
	 outAction.y = node.getChildByName("stand").y;
	 }

	 /!**
	 设置出牌动画的方向
	 *!/

	 var callbackFUNC = function() {
	 out.zIndex = zoder;

	 };
	 var callbackFUNCROTATION = function() {
	 out.visible = true;
	 out.runAction(cc.sequence(cc.spawn(cc.moveTo(0.2, endPoint), cc.scaleTo(0.2, oSc)), cc.callFunc(callbackFUNC)));
	 // out.getChildren()[0].runAction(cc.scaleTo(0.2, oSc * 0.7));
	 };
	 outAction.runAction(cc.sequence(cc.spawn(cc.moveTo(0.2, Midpoint), cc.scaleTo(0.2, 2 * oSc))
	 //cc.DelayTime(0.4),cc.callFunc(callbackFUNCROTATION),cc.removeSelf()
	 ));
	 // outAction.getChildren()[0].runAction(cc.scaleTo(0.2, 2 * oSc * 0.7));

	 function RemovePutCard(onlySelf) {
	 var delayNum = 0.4 - (Date.now() - putTime) / 1000;
	 if (delayNum < 0) delayNum = 0;
	 if (!onlySelf) outAction.runAction(cc.sequence(cc.DelayTime(delayNum), cc.callFunc(callbackFUNCROTATION), cc.removeSelf()));
	 else outAction.runAction(cc.sequence(cc.DelayTime(delayNum), cc.removeSelf()));
	 }

	 var putTime = Date.now();
	 var outActionBind = {
	 _event: {
	 waitPut: function() {
	 RemovePutCard(false)
	 },
	 MJChi: function() {
	 RemovePutCard(true)
	 },
	 MJPeng: function() {
	 RemovePutCard(true)
	 },
	 MJGang: function() {
	 RemovePutCard(true)
	 },
	 roundEnd: function() {
	 RemovePutCard(true)
	 // baidaOject.setVisible(false);
	 setBaiDaVisible(false);
	 }
	 }
	 }
	 if(jsclient.majiang.isFlower8(msg.card))
	 {
	 RemovePutCard(true); //MJFlower
	 }
	 else
	 {
	 ConnectUI2Logic(outAction, outActionBind);
	 }

	 if (!(outNum >= 0)) RestoreCardLayout(node, off);
	 }
	 }*/

//选择 跟|不跟
	function HandleWaitSelect(node, msg)
	{
		var tData = jsclient.data.sData.tData;
		GLog("tData.tState = "+tData.tState);
		if(tData.tState == TableState.waitSelect)
		{
			var pl = getUIPlayer(0);
			var isVisible = (tData.selectUids.indexOf(pl.info.uid) >= 0);
			var btnStopPlay = node.getChildByName("btn_stop_play");
			var btnPlay = node.getChildByName("btn_play");
			var tips = node.getChildByName("tips");

			node.setVisible(true);
			btnStopPlay.setVisible(isVisible);
			btnPlay.setVisible(isVisible);
			tips.setVisible(!isVisible);

			if(msg)
			{
				//提示：承包
				var jsBind=jsclient.relayui.jsBind;
				var ui=[jsBind.down,jsBind.right,jsBind.top,jsBind.left];
				for(var i = 0; i < 4; i++) {
					var pl = getUIPlayer(i);
					if (pl.info.uid == msg.fromUid) {
						ShowEatActionAnim(ui[i]._node, ActionType.CHENG_BAO, i);
						break;
					}
				}
			}
		}

	}

//处理跟|不跟结果
	function HandleMJSelect(node, msg)
	{
		var tData = jsclient.data.sData.tData;
		var jsBind=jsclient.playui.jsBind;
		var ui=[jsBind.down,jsBind.right,jsBind.top,jsBind.left];
		for(var i = 0; i < 4; i++)
		{
			var pl = getUIPlayer(i);
			if(pl.info.uid == msg.uid)
			{
				var playState = ui[i]._node.getChildByName("head").getChildByName("play_state");
				if(playState)
				{
					if(tData.noPlayUids.indexOf(msg.uid) >= 0)
					{
						playState.visible = true;
						RestoreCardLayout(ui[i]._node,i);
					}
					if(i == 0)
					{
						node.setVisible(false);
					}
				}
				break;
			}
		}
		if(tData.tState != TableState.waitSelect)
		{
			node.setVisible(false);
		}
	}

	function resetSelectNode(node,off)
	{
		var playState = node.getChildByName("head").getChildByName("play_state");
		if(playState)
		{
			playState.visible = false;
		}
	}

//东南西北中发白
	var imgNames = ["Bamboo_", "Character_", "Dot_", "Wind_east", "Wind_south", "Wind_west", "Wind_north", "Red", "Green", "White1"];
	var offSets = [[50, 90], [60, 70], [50, 90], [60, 70], [48, 62]]

	function setCardPic(node, cd, off) {

		node.loadTexture("res/playing/MJ/Mj_up_" + off + ".png");
		// cc.log("res/playing/MJ/Mj_up_" + off + ".png")

		if (off != 0 && off != 1 && off != 2 && off != 3 && off != 4) {
			cc.log("off = " + off);
		}

		var img = new ccui.ImageView();
		if (off == 4) {
			// img.scaleX = 0.7;
			// img.scaleY = 0.7;
		} else {
			img.setRotation(-90 * (off));
			// img.scaleX = 0.35;
			// img.scaleY = 0.35;
		}
		img.setPosition(offSets[off][0], offSets[off][1]);
		node.removeAllChildren();
		node.addChild(img);
		var path = "res/playing/MJ/"
		var imgName = "";
		if (cd < 30) {
			imgName = imgNames[Math.floor(cd / 10)] + cd % 10;
		}
		else if(cd >= 111)
		{
			imgName = "flower_" + cd;
		}
		else {
			if (cd == 91 && (jsclient.rePlayVideo == jsclient.GAME_TYPE.HANG_ZHOU || jsclient.rePlayVideo == jsclient.GAME_TYPE.TAI_ZHOU))
			{
				imgName = "White";
			}
			else
			{
				imgName = imgNames[Math.floor(cd / 10)];//东西南北中发白
			}

		}
		// cc.log(path + imgName + ".png    off = " + off);
		node.tag = cd;
		var callback = function() {
			img.loadTexture(path + imgName + ".png");

		};
		node.stopAllActions();
		node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callback), cc.delayTime(1))));

	}

	function SetArrowRotation(abk) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var uids = tData.uids;
		var selfIndex = uids.indexOf(SelfUid());
		selfIndex = (tData.curPlayer + 4 - selfIndex) % 4;
		abk.getChildByName("arrow").rotation = 270 - 90 * selfIndex;
	}



	function SetCardTouchHandler(standUI, cardui) {
		cardui.addTouchEventListener(function(btn, tp) {
			if (tp != 2) return;
			var sData = jsclient.data.sData;
			var tData = sData.tData;
			if (!IsMyTurn() || tData.tState != TableState.waitPut) {
				mylog("not my turn");
				return;
			}
			//补花中
			if(!isCanPutCard || tData.isWaitFlower)
			{
				mylog("waitFlower");
				return;
			}
			//mylog(btn.y+" "+standUI.y);
			if (btn.y >= standUI.y + 10) {
				PutAwayCard(cardui, cardui.tag);
			} else {
				var mjhandNum = 0;
				var children = btn.getParent().children;
				for (var i = 0; i < children.length; i++) {
					if (children[i].name == "mjhand") {
						mjhandNum++;
						if (children[i].y > standUI.y + 10)
							children[i].y = standUI.y;
					}
				}
				if (mjhandNum == getUIPlayer(0).mjhand.length) {
					btn.y = standUI.y + 20;
				}
			}

		}, cardui);
	}

	function reConectHeadLayout(node) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var down = node.getChildByName("down").getChildByName("head");
		var top = node.getChildByName("top").getChildByName("head");
		var left = node.getChildByName("left").getChildByName("head");
		var right = node.getChildByName("right").getChildByName("head");
		cc.log("reConectHeadLayout");
		var pl = getUIPlayer(0);
		resetEatActionAnim();
		if (tData.tState == TableState.waitJoin || tData.tState == TableState.roundFinish) {
			doLayout(down, [0.18, 0.18], [0.5, 0.5], [0, -1.9], false, false);
			doLayout(top, [0.18, 0.18], [0.5, 0.5], [0, 2.1], false, false);
			doLayout(left, [0.18, 0.18], [0.5, 0.5], [-3, 0.1], false, false);
			doLayout(right, [0.18, 0.18], [0.5, 0.5], [3, 0.1], false, false);
			initFlower(false);

		} else {

			doLayout(down, [0.18, 0.18], [0, 0], [0.6, 0.5], false, false);
			doLayout(top, [0.18, 0.18], [0, 1], [2.8, -0.9], false, false);
			doLayout(left, [0.18, 0.18], [0, 0.5], [0.6, 0.5], false, false);
			doLayout(right, [0.18, 0.18], [1, 0.5], [-0.6, 0.5], false, false);
			initFlower(true);

		}
		//test action
		// var jsBind=jsclient.playui.jsBind;
		// var ui=[jsBind.down,jsBind.right,jsBind.top,jsBind.left];
		// for(var i = 0; i < 4; i++)
		// {
		// 	ShowEatActionAnim(ui[i]._node, ActionType.PENG,3);
		// }

	}

	function tableStartHeadPlayAction(node) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		cc.log("tableStartHeadPlayAction");
		var pl = getUIPlayer(0);
		//if (CheckArrowVisible())
		{

			var down = node.getChildByName("down").getChildByName("head");
			var top = node.getChildByName("top").getChildByName("head");
			var left = node.getChildByName("left").getChildByName("head");
			var right = node.getChildByName("right").getChildByName("head");
			doLayout(down, [0.18, 0.18], [0, 0], [0.6, 0.5], false, false);
			doLayout(top, [0.18, 0.18], [0, 1], [2.8, -0.9], false, false);
			doLayout(left, [0.18, 0.18], [0, 0.5], [0.6, 0.5], false, false);
			doLayout(right, [0.18, 0.18], [1, 0.5], [-0.6, 0.5], false, false);

			var downPoint = cc.p(down.x, down.y);
			var topPoint = cc.p(top.x, top.y);
			var rightPoint = cc.p(right.x, right.y);
			var leftPoint = cc.p(left.x, left.y);

			doLayout(down, [0.18, 0.18], [0.5, 0.5], [0, -1.9], false, false);
			doLayout(top, [0.18, 0.18], [0.5, 0.5], [0, 2.1], false, false);
			doLayout(left, [0.18, 0.18], [0.5, 0.5], [-3, 0.1], false, false);
			doLayout(right, [0.18, 0.18], [0.5, 0.5], [3, 0.1], false, false);
			down.runAction(cc.moveTo(0.5, downPoint));
			top.runAction(cc.moveTo(0.5, topPoint));
			left.runAction(cc.moveTo(0.5, leftPoint));
			right.runAction(cc.moveTo(0.5, rightPoint));
			initFlower(true);
		}
	}


	function InitPlayerNameAndCoin(node, off) {
		var pl = getUIPlayer(off);
		if (!pl) return;
		var tData = jsclient.data.sData.tData;
		var bind = {
			head: {
				name: {
					_text: function () {
						return unescape(pl.info.nickname || pl.info.name || "玩家");
					}
				}
			}
		}
		ConnectUI2Logic(node, bind);
	}


	function InitPlayerHandUI(node, off) {

		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var pl = getUIPlayer(off);
		if(!pl)return;
		InitPlayerNameAndCoin(node, off);

		setPlayerRoundDir(off);
		if(vnPos.indexOf(off) == -1)
		{
			vnPos.push(off);
		}

		if(jsclient.gameType == jsclient.GAME_TYPE.TAI_ZHOU)
		{
			var tmpPos = [];
			if (vnPos.length == 3) {
				for(var i=0; i < rvnPos.length; i++){
					var flag = true;
					for(var j=0; j < vnPos.length; j++){
						if(rvnPos[i] == vnPos[j])
							flag = false;
					}
					if(flag) {
						tmpPos.push(rvnPos[i]);
					}
				}
				vnPos = [];
			}
			if (tmpPos[0])
				setPlayerRoundDir(tmpPos[0]);
		}

		if (tData.tState != TableState.waitPut
			&& tData.tState != TableState.waitEat
			&& tData.tState != TableState.waitCard
			&& tData.tState != TableState.waitSelect) return;
		baidaCompmentState(baidaOject);

		//添加碰
		if(typeof(pl.mjpeng) != "undefined")
		{
			for (var i = 0; i < pl.mjpeng.length; i++) {
				//AddNewCard(node,copy,name,tag,off)

				var idx = tData.uids.indexOf(pl.info.uid);
				var offIdx = (pl.pengchigang.peng[i] - idx + 4) % 4 - 1;

				for (var j = 0; j < 3; j++) {
					if (j % 3 == 2 - offIdx && off % 3 == 0 || j % 3 == offIdx && off % 3 != 0) {
						if (offIdx == 1) {
							AddNewCard(node, "up", "peng", pl.mjpeng[i], off);
						} else {
							var sp = AddNewCard(node, "up", "peng", pl.mjpeng[i], (off+1)%4, "heng", "heng");
							sp.ignoreContentAdaptWithSize(true);
						}
					} else {
						AddNewCard(node, "up", "peng", pl.mjpeng[i], off);
					}
				}
			}
		}

		//添加明杠
		if(typeof(pl.mjgang0) != "undefined")
		{
			for (var i = 0; i < pl.mjgang0.length; i++) {

				var idx = tData.uids.indexOf(pl.info.uid);
				var offIdx = (pl.pengchigang.gang[i] - idx + 4) % 4 - 1;

				for (var j = 0; j < 4; j++) {

					if (j == 3) {
						AddNewCard(node, "up", "gang0", pl.mjgang0[i], off, "isgang4").tag = pl.mjgang0[i];
					} else {
						if (j % 3 == 2 - offIdx && off % 3 == 0 || j % 3 == offIdx && off % 3 != 0) {
							if (offIdx == 1) {
								AddNewCard(node, "up", "gang0", pl.mjgang0[i], off);
							} else {
								var sp = AddNewCard(node, "up", "gang0", pl.mjgang0[i], (off+1)%4, "heng", "heng");
								sp.ignoreContentAdaptWithSize(true);
							}
						}else {
							AddNewCard(node, "up", "gang0", pl.mjgang0[i], off);
						}
					}
				}
			}
		}

		//添加暗杠
		if(typeof(pl.mjgang1) != "undefined")
		{
			for (var i = 0; i < pl.mjgang1.length; i++) {

				for (var j = 0; j < 4; j++) {

					if (j == 3) {
						AddNewCard(node, "down", "gang1", 0, off, "isgang4").tag = pl.mjgang1[i];
					} else {
						AddNewCard(node, "up", "gang1", pl.mjgang1[i], off);
					}

				}

			}
		}

		//添加吃
		// for (var i = 0; i < pl.mjchi.length; i++) {
		// 	if (i % 3 == 0 && off % 3 == 0 || i % 3 == 2 && off % 3 != 0) {
		// 		var sp = AddNewCard(node, "up", "chi", pl.mjchi[i], (off+1)%4, "heng");
		// 		sp.ignoreContentAdaptWithSize(true);
		// 		sp.setColor(cc.color(255,0,0));
		// 	} else {
		// 		AddNewCard(node, "up", "chi", pl.mjchi[i], off);
		// 	}
		// }
		cc.log("pl.mjchi = " + pl.mjchi);
		var chiIdx = 0;
		if(typeof(pl.mjchi) != "undefined")
		{
			for (var i = 0; i < pl.mjchi.length; i++) {
				if(i%3==0)
				{
					chiIdx++;
				}
				if (pl.mjchiCard[chiIdx-1] == pl.mjchi[i]) {
					var sp = AddNewCard(node, "up", "chi", pl.mjchi[i], (off + 1) % 4, "heng");
					sp.ignoreContentAdaptWithSize(true);
					// sp.setColor(cc.color(255, 0, 0));
				} else {
					AddNewCard(node, "up", "chi", pl.mjchi[i], off);
				}
			}
		}
		//添加打出的牌
		if(typeof(pl.mjput) != "undefined")
		{
			for (var i = 0; i < pl.mjput.length; i++) {
				var msg = {
					card: pl.mjput[i],
					uid: pl.info.uid
				};
				HandleMJPut(node, msg, off, i);


			}
		}


		/*//添加手牌
		 if (pl.mjhand) {
		 for (var i = 0; i < pl.mjhand.length; i++) {

		 AddNewCard(node, "stand", "mjhand", pl.mjhand[i], off);
		 }
		 } else {
		 var CardCount = 0;
		 if (
		 tData.tState == TableState.waitPut && tData.uids[tData.curPlayer] == pl.info.uid
		 //&&pl.mjState==TableState.waitPut
		 ) {
		 CardCount = 14;
		 } else {
		 CardCount = 13;
		 }
		 var upCardCount = CardCount - ((pl.mjpeng.length + pl.mjgang0.length + pl.mjgang1.length) * 3 + pl.mjchi.length);
		 for (var i = 0; i < upCardCount; i++) {
		 AddNewCard(node, "up", "standPri");
		 }

		 }
		 RestoreCardLayout(node, off);*/
		//添加手牌
		if (off == 0) {
			for (var i = 0; i < pl.mjhand.length; i++) {
				if (off == 0) {
					AddNewCard(node, "stand", "mjhand", pl.mjhand[i], off);
				}
			}
		} else if (plmjhand1 || plmjhand2 || plmjhand3) {
			if (off == 1) {
				pl.mjhand = plmjhand1;
			} else if (off == 2) {
				pl.mjhand = plmjhand2;
			} else if (off == 3) {
				pl.mjhand = plmjhand3;
			}
			for (var i = 0; i < pl.mjhand.length; i++) {
				AddNewCard(node, "up", "mjhand", pl.mjhand[i], off);
			}
		} else {
			var CardCount = 0;
			if (
				tData.tState == TableState.waitPut && tData.uids[tData.curPlayer] == pl.info.uid
			) {
				CardCount = 14;
			} else {
				CardCount = 13;
			}
			var upCardCount = CardCount - ((pl.mjpeng.length + pl.mjgang0.length + pl.mjgang1.length) * 3 + pl.mjchi.length);
			for (var i = 0; i < upCardCount; i++) {
				//AddNewCard(node, "stand", "standPri");
			}
		}

		RestoreCardLayout(node, off);

	}
	var playAramTimeID = null;

	function updateArrowbkNumber(node) {

		node.setString("10");

		var number = function() {

			if (node.getString() == 0) {

				node.cleanup();

			} else {

				var number = node.getString() - 1

				if (number > 9) {

					node.setString(number);

				} else {

					node.setString("0" + number);
					var sData = jsclient.data.sData;
					var tData = sData.tData;
					var uids = tData.uids;

					if (uids[tData.curPlayer] == SelfUid()) {
						if (number == 3) {
							playAramTimeID = playEffect("timeup_alarm");
						} else if (number == 0) {
							jsclient.native.NativeVibrato();
						}
					}
				}
			}
		};

		node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1.0), cc.callFunc(number, node))));
	}

	function getUIPlayer(off) {
		//console.log("---------- off ------- " + off);
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var uids = tData.uids;
		//console.log("---------- selfUid ------- " + SelfUid());
		var selfIndex = uids.indexOf(SelfUid());
		//console.log("---------- selfIndex ------- " + selfIndex);
		selfIndex = (selfIndex + off) % 4;
		//console.log("---------- sData.players[uids[selfIndex] ------- " + JSON.stringify(sData.players[uids[selfIndex]]));
		if (selfIndex < uids.length) return sData.players[uids[selfIndex]];
		return null;
	}


	function getIndexPlayer(uid) {
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var uids = tData.uids;
		var selfIndex = uids.indexOf(SelfUid());
		var targetIndex = uids.indexOf(uid);

		return (targetIndex - selfIndex + 4) % 4;
	}

	function getUIHead(off) {
		var pl = getUIPlayer(off);
		if (!pl) return {};
		return {
			uid: pl.info.uid,
			url: pl.info.headimgurl
		};
	}

	function setWxHead(node, d, off) {
		if (d.uid == getUIHead(off).uid) {
			var sp = new cc.Sprite(d.img);
			sp.setName("WxHead");
			var nobody = node.getChildByName("nobody");
			nobody.addChild(sp);
			doLayout(sp, [0.9, 0.9], [0.5, 0.5], [-0.03, 0.03], false, true);
		}
	}

	function setOffline(node, off) {
		var pl = getUIPlayer(off);
		if (!pl) return;
		node.getChildByName("head").getChildByName("offline").zIndex = 99;
		node.getChildByName("head").getChildByName("offline").visible = false;
	}

	function showPlayerInfo(off, node) {
		var tData = jsclient.data.sData.tData;
		var pl = getUIPlayer(off);
		if (pl) {
			jsclient.showPlayerInfo(pl.info);
		}
		return;

		//mylog(pl.mjState+"|"+pl.mjgang1+"|"+pl.mjgang0+"|"+pl.mjpeng+"|"+pl.mjhand);
		//mylog(pl.mjchi+"|"+pl.mjput);
		//mylog(tData.tState+" c "+tData.curPlayer+" e "+tData.canEatHu);


		var names = [];
		for (var i = 0; i < node.children.length; i++) {
			names.push(node.children[i].name + "|" + node.children[i].tag);
		}
		cc.log(names);

	}

	function showPlayerZhuangLogo(node, off) {

		var sData = jsclient.data.sData;
		var tData = sData.tData;
		var pl = getUIPlayer(off);
		node.zIndex = 100;
		if (tData && pl) {
			if (tData.uids[tData.zhuang] == pl.info.uid) {
				node.visible = true;
				var linkZhuang = node.getChildByName("linkZhuang");
				var linkX = node.getChildByName("X");
				var path = "res/playing/gameTable/shuzi/shuzi_" + pl.linkZhuang + ".png";
				cc.log("path = " + path);
				linkZhuang.loadTexture(path);
				var isVisible = (tData.gameType == jsclient.GAME_TYPE.HANG_ZHOU);
				linkZhuang.setVisible(isVisible);
				linkX.setVisible(isVisible);
			} else {
				node.visible = false;
			}

		}
	}

	function updatePower(node) {
		var callNative = jsclient.native.NativeBattery;
		node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callNative), cc.DelayTime(30))));
	}

	function updateWIFI(node) {


		var callback = function() {
			var ms = jsclient.reqPingPong / 1000.0;
			// cc.log("ms" + ms);
			if (ms < 0.3) {
				node.loadTexture("res/playing/gameTable/WIFI_1.png");
			} else if (ms < 0.6) {
				node.loadTexture("res/playing/gameTable/WIFI_2.png");
			} else if (ms < 1) {
				node.loadTexture("res/playing/gameTable/WIFI_3.png");
			} else {
				node.loadTexture("res/playing/gameTable/WIFI_4.png");
			}
		};

		node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callback), cc.DelayTime(5))));
	}

	function CheckDelRoomUI() {
		var sData = jsclient.data.sData;
		if (sData.tData.delEnd != 0 && !jsclient.delroomui) {
			jsclient.Scene.addChild(new DelRoomLayer());
		} else if (sData.tData.delEnd == 0 && jsclient.delroomui) {
			jsclient.delroomui.removeFromParent(true);
			delete jsclient.delroomui;
		}
	}

	function CheckReadyVisible(node, off) {
		if (off < 0) {
			node.visible = false;
			return false;
		}
		var p0 = getUIPlayer(off);
		var sData = jsclient.data.sData;
		var tData = sData.tData;

		if (p0 && p0.mjState == TableState.isReady && tData.tState != TableState.waitJoin) {
			node.visible = true;
		} else {
			node.visible = false;
		}
		return node.visible;
	}

	function MJChichange(tag) {
		//	jsclient.gangCards = [];
		//	jsclient.eatpos = [];
		cc.log("chi " + jsclient.eatpos.length);
		// mylog("chi " + jsclient.eatpos.length);
		// mylog(jsclient.eatpos);
		cc.log("chi " + jsclient.eatpos.length);
		cc.log(jsclient.eatpos);

		var eat = jsclient.replayui.jsBind.eat;
		var changeuibg = eat.changeui.changeuibg;
		var card1 = changeuibg.card1._node;
		var card2 = changeuibg.card2._node;
		var card3 = changeuibg.card3._node;
		var card4 = changeuibg.card4._node;
		var card5 = changeuibg.card5._node;
		var card6 = changeuibg.card6._node;
		var card7 = changeuibg.card7._node;
		var card8 = changeuibg.card8._node;
		var card9 = changeuibg.card9._node;
		var card0 = changeuibg.card0._node;
		card1.visible = false;
		card2.visible = false;
		card3.visible = false;
		card4.visible = false;
		card5.visible = false;
		card6.visible = false;
		card7.visible = false;
		card8.visible = false;
		card9.visible = false;
		card0.visible = false;

		if (jsclient.eatpos.length == 1) {
			MJChi2Net(jsclient.eatpos[0]);

		} else {
			eat.chi0._node.visible = false;
			eat.chi1._node.visible = false;
			eat.chi2._node.visible = false;
			eat.peng._node.visible = false;
			eat.gang0._node.visible = false;
			eat.gang1._node.visible = false;
			eat.gang2._node.visible = false;
			eat.hu._node.visible = false;
			eat.guo._node.visible = false;
			changeuibg._node.visible = true;
			for (var i = 0; i < jsclient.eatpos.length; i++) {
				ShowMjChiCard(changeuibg._node, jsclient.eatpos[i]);
			}

		}
	}

	function MJGangchange(tag) {
		var eat = jsclient.replayui.jsBind.eat;
		var changeuibg = eat.changeui.changeuibg;
		var card1 = changeuibg.card1._node;
		var card2 = changeuibg.card2._node;
		var card3 = changeuibg.card3._node;
		var card4 = changeuibg.card4._node;
		var card5 = changeuibg.card5._node;
		var card6 = changeuibg.card6._node;
		var card7 = changeuibg.card7._node;
		var card8 = changeuibg.card8._node;
		var card9 = changeuibg.card9._node;
		var card0 = changeuibg.card0._node;
		card1.visible = false;
		card2.visible = false;
		card3.visible = false;
		card4.visible = false;
		card5.visible = false;
		card6.visible = false;
		card7.visible = false;
		card8.visible = false;
		card9.visible = false;
		card0.visible = false;
		cc.log("jsclient.gangCards.length" + jsclient.gangCards.length);
		if (jsclient.gangCards.length == 1) {

			MJGang2Net(jsclient.gangCards[0]);
		} else {
			eat.chi0._node.visible = false;
			eat.chi1._node.visible = false;
			eat.chi2._node.visible = false;
			eat.peng._node.visible = false;
			eat.gang0._node.visible = false;
			eat.gang1._node.visible = false;
			eat.gang2._node.visible = false;
			eat.hu._node.visible = false;
			eat.guo._node.visible = false;
			changeuibg._node.visible = true;

			for (var i = 0; i < jsclient.gangCards.length; i++) {
				if (i == 0) {
					card1.visible = true;
					setCardPic(card1, jsclient.gangCards[i], 4);
				} else if (i == 1) {
					card3.visible = true;
					setCardPic(card3, jsclient.gangCards[i], 4);
				} else if (i == 2) {
					card0.visible = true;
					setCardPic(card0, jsclient.gangCards[i], 4);
				}
			}
		}
	}

	function MJCreateCardsecLayer(name) {
		if (name == "gang") {

		} else if (name == "chi") {

		}
	}

	function emojiPlayAction(node, num) {
		/*	,happy:{_click:function(){emojiAction(0);}}
		 ,angry:{_click:function(){emojiAction(1);}}
		 ,smaile:{_click:function(){emojiAction(2);}}
		 ,han:{_click:function(){emojiAction(3);}}
		 ,zhiya:{_click:function(){emojiAction(4);}}
		 ,shihua:{_click:function(){emojiAction(5);}}
		 ,jiong:{_click:function(){emojiAction(6);}}
		 ,sleep:{_click:function(){emojiAction(7);}}
		 ,fennu:{_click:function(){emojiAction(8);}}
		 ,yun:{_click:function(){emojiAction(9);}}
		 ,lihai:{_click:function(){emojiAction(10);}}
		 ,touxiang:{_click:function(){emojiAction(11);}}
		 ,se:{_click:function(){emojiAction(12);}}
		 ,huaxiao:{_click:function(){emojiAction(13);}}
		 ,shaoxiang:{_click:function(){emojiAction(14);}}*/
		var framename;
		var number = 0;
		var arry = [];
		var delaytime = 0;
		var sumtime = 0;
		var playtime = 3;
		var imgSize;
		switch (num) {
			case 0:
				framename = "happy";
				delaytime = 0.1;
				break;
			case 1:
				framename = "angry";
				delaytime = 0.15;
				break;
			case 2:
				framename = "smaile";
				delaytime = 0.2;
				break;
			case 3:
				framename = "han";
				delaytime = 0.2;
				break;
			case 4:
				framename = "zhiya";
				delaytime = 0.2;
				break;
			case 5:
				framename = "shihua";
				delaytime = 0.2;
				break;
			case 6:
				framename = "jiong";
				delaytime = 0.23;
				break;
			case 7:
				framename = "sleep";
				delaytime = 0.2;
				break;
			case 8:
				framename = "fennu";
				delaytime = 0.2;
				break;
			case 9:
				framename = "yun";
				delaytime = 0.2;
				break;
			case 10:
				framename = "lihai";
				delaytime = 0.2;
				break;
			case 11:
				framename = "touxiang";
				delaytime = 0.2;
				break;
			case 12:
				framename = "se";
				delaytime = 0.2;
				break;
			case 13:
				framename = "huaixiao";
				delaytime = 0.2;
				break;
			case 14:
				framename = "shaoxiang";
				delaytime = 0.2;
				break;
			default:
				break;

		}
		for (var i = 0; i < 15; i++) {
			var frame = cc.spriteFrameCache.getSpriteFrame(framename + i + ".png");

			if (frame) {
				imgSize = frame.getOriginalSize();
				arry.push(framename + i);
			}
		}
		//var animation = new cc.Animation(arry,0.3);
		//var animate = cc.animate(animation);
		var callback = function() {

			if (arry.length == number) {
				number = 0;

			}
			cc.log("||" + arry[number] + ".png");
			node.loadTexture(arry[number] + ".png", ccui.Widget.PLIST_TEXTURE);
			number++;
			sumtime = sumtime + delaytime;
			if (sumtime > playtime) {
				node.cleanup();
				node.visible = false;
			}

		};
		node.cleanup();
		node.visible = true;
		node.setSize(imgSize);
		node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callback), cc.delayTime(delaytime))));

	}


	createAnimation = function(path, count, rect) {
		var frames = [];
		var prefix = path;
		for (var temp_x = 0; temp_x < count; temp_x++) {
			var fileName = prefix + temp_x + ".png";
			var frame = new cc.SpriteFrame(fileName, rect);
			frames.push(frame);
		}
		var animation = new cc.Animation(frames, 0.25);
		var action = new cc.Animate(animation);
		return action;
	};


	function showchat(node, off, msg) {
		var pl = getUIPlayer(off);
		var uid = msg.uid;
		var type = msg.type;
		var message = msg.msg;
		var num = msg.num;
		//mylog("uid"+uid+" type" +type +"message"+message+"||uid"+pl.info.uid);

		if (pl && msg.uid == pl.info.uid) {
			if (type == 0) {
				node.getParent().visible = true;
				node.setString(message);
				var callback = function() {
					node.getParent().visible = false;
				};

				node.getParent().width = node.stringLength * node.fontSize + 72;
				node.runAction(cc.sequence(cc.delayTime(2.5), cc.callFunc(callback)));
			} else if (type == 1) {
				node.getParent().visible = true;
				node.setString(message);
				var callback = function() {
					node.getParent().visible = false;
				};
				var musicnum = msg.num + 1;

				var one = node.getCustomSize().width / 20.0;
				node.getParent().width = node.stringLength * node.fontSize + 72;
				playEffect("fix_msg_" + musicnum);
				node.runAction(cc.sequence(cc.delayTime(2.5), cc.callFunc(callback)));
			} else if (type == 2) {
				var em_node = node.getParent().getParent().getChildByName("emoji");
				emojiPlayAction(em_node, msg.num);
			} else if (type == 3) {
				cc.audioEngine.pauseMusic();
				cc.audioEngine.setEffectsVolume(1);

				cc.audioEngine.unloadEffect(message);
				cc.audioEngine.playEffect(message);

				node.getParent().setVisible(true);
				node.setString(" ");
				node.getParent().width = node.stringLength * node.fontSize + 72;

				var voicebg = node.getParent().getChildByName("voicebg");
				voicebg.setVisible(true);

				var callback = function() {
					node.getParent().setVisible(false);
					voicebg.setVisible(false);
					voicebg.stopAllActions();
					cc.audioEngine.resumeMusic();
				};

				if (!jsclient.data._tempRecordVoiceAnimate) {
					jsclient.data._tempRecordVoiceAnimate = createAnimation("res/animate/voice/", 4, cc.rect(0, 0, 23, 30));
					jsclient.data._tempRecordVoiceAnimate.retain();
				}

				voicebg.runAction(cc.repeatForever(jsclient.data._tempRecordVoiceAnimate));
				node.runAction(cc.sequence(cc.delayTime(Number(num / 1000) < 1 ? 1 : Number(num / 1000)), cc.callFunc(callback)));
			}
		}
	}


	/**
	 * 获取 录音动画
	 * */
	function getRecordStatusLayer() {
		if (!jsclient.data._tempRecordStatusLayer) {
			var size = cc.winSize;
			jsclient.data._tempRecordStatusLayer = new cc.Layer();
			cc.director.getRunningScene().addChild(jsclient.data._tempRecordStatusLayer);

			var voiceBackGround = new ccui.Scale9Sprite("res/animate/startRecord/voiceBackGround.png");
			var layerSize = voiceBackGround.getContentSize();

			voiceBackGround.setContentSize(cc.size(layerSize.width, layerSize.height * 1.25));
			voiceBackGround.setPosition(size.width * 0.5, size.height * 0.55);
			jsclient.data._tempRecordStatusLayer.addChild(voiceBackGround);
			var height = cc.winSize.height / 3 / voiceBackGround.getContentSize().height;
			voiceBackGround.setScale(height);

			layerSize = voiceBackGround.getContentSize();

			var voiceStatusIcon = new cc.Sprite("res/animate/startRecord/0.png");
			voiceStatusIcon.setPosition(layerSize.width * 0.675, layerSize.height * 0.55);
			voiceBackGround.addChild(voiceStatusIcon);

			var voiceIcon = new cc.Sprite("res/animate/startRecord/recordIcon.png");
			voiceIcon.setPosition(layerSize.width * 0.325, layerSize.height * 0.55);
			voiceBackGround.addChild(voiceIcon);

			var voiceCancel = new cc.Sprite("res/animate/startRecord/cancel.png");
			voiceCancel.setPosition(layerSize.width * 0.5, layerSize.height * 0.55);
			voiceBackGround.addChild(voiceCancel);


			var voiceShort = new cc.Sprite("res/animate/startRecord/timeShort.png");
			voiceShort.setPosition(layerSize.width * 0.5, layerSize.height * 0.55);
			voiceBackGround.addChild(voiceShort);


			var tipsLabel = new cc.LabelTTF("手指上滑 , 取消发送","", 20);
			tipsLabel.setPosition(layerSize.width * 0.5, layerSize.height * 0.15);
			voiceBackGround.addChild(tipsLabel);

			jsclient.data._tempVoiceStatusAnimate = createAnimation("res/animate/startRecord/", 7, cc.rect(0,0,44,82));
			voiceStatusIcon.runAction(cc.repeatForever(jsclient.data._tempVoiceStatusAnimate));

			var callback = function ()
			{
				jsclient.data._tempRecordStatusLayer.setVisible(false);
			};


			jsclient.data._tempRecordStatusLayer.runCancelRecord = function () {
				voiceIcon.setVisible(false);
				voiceStatusIcon.setVisible(false);
				voiceShort.setVisible(false);
				voiceCancel.setVisible(true);
				tipsLabel.setString("取消发送");
				jsclient.data._tempRecordStatusLayer.scheduleOnce(callback, 0.5);
			};

			jsclient.data._tempRecordStatusLayer.runStartRecord = function () {
				voiceIcon.setVisible(true);
				voiceStatusIcon.setVisible(true);
				voiceCancel.setVisible(false);
				voiceShort.setVisible(false);
				tipsLabel.setString("手指上滑 , 取消发送");

				jsclient.data._tempRecordStatusLayer.setVisible(true);
				jsclient.data._tempRecordStatusLayer.unschedule(callback);
			};

			jsclient.data._tempRecordStatusLayer.runToCancelRecord = function () {
				voiceIcon.setVisible(false);
				voiceStatusIcon.setVisible(false);
				voiceCancel.setVisible(true);
				voiceShort.setVisible(false);
				tipsLabel.setString("松开手指 , 取消发送");

				jsclient.data._tempRecordStatusLayer.setVisible(true);
				//jsclient.data._tempRecordStatusLayer.unschedule(callback);
			};

			jsclient.data._tempRecordStatusLayer.runStopRecord = function () {
				voiceIcon.setVisible(true);
				voiceStatusIcon.setVisible(true);
				voiceCancel.setVisible(false);
				voiceShort.setVisible(false);

				//jsclient.data._tempRecordStatusLayer.scheduleOnce(callback, 0.5);
				jsclient.data._tempRecordStatusLayer.unschedule(callback);
				callback();
			};

			jsclient.data._tempRecordStatusLayer.runShortRecord = function () {
				voiceIcon.setVisible(false);
				voiceStatusIcon.setVisible(false);
				voiceCancel.setVisible(false);
				voiceShort.setVisible(true);
				tipsLabel.setString("录音时间太短");

				jsclient.data._tempRecordStatusLayer.scheduleOnce(callback, 0.5);
			};
		}
		return jsclient.data._tempRecordStatusLayer;
	}

	function initVData() {
		console.log("jsclient.remoteCfg" + jsclient.remoteCfg.voiceUrl);
		jsclient.data._tempRecordStatusLayer = null;
		jsclient.data._tempMessage = null;
		jsclient.data._tempRecordVoiceAnimate = null;
		jsclient.data._JiaheTempTime = null;
	}

	/**
	 * 运行录音动画
	 * */
	function runRecordAction() {
		var animateLayer = getRecordStatusLayer();
		animateLayer.runStartRecord();
	}

	/**
	 * 停止录音动画
	 * */
	function stopRecordAction() {
		var animateLayer = getRecordStatusLayer();
		animateLayer.runStopRecord();
	}

	/**
	 * 取消录音动画
	 * */
	function cancelRecordAction() {
		var animateLayer = getRecordStatusLayer();
		animateLayer.runCancelRecord();
	}

	function shortRecordAction() {
		var animateLayer = getRecordStatusLayer();
		animateLayer.runShortRecord();
	}

	function getTouchListener() {
		return {
			event: cc.EventListener.TOUCH_ONE_BY_ONE,
			swallowTouches: false,
			status: null,
			onTouchBegan: function(touch, event) {
				console.log("在触摸东西");
				var target = event.getCurrentTarget();
				var pos = target.getParent().convertTouchToNodeSpace(touch); // 世界坐标转换 (子节点相对于父节点的位置)
				// 如果触碰起始地点在本区域中
				if (!cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					return false;
				}
				console.log("好吧");
				return true;
			},
			onTouchMoved: function(touch, event) {
				console.log("子啊华东呢");
				var target = event.getCurrentTarget();
				var pos = target.getParent().convertTouchToNodeSpace(touch); // 世界坐标转换 (子节点相对于父节点的位置)
				// 如果触碰起始地点在本区域中
				if (!cc.rectContainsPoint(target.getBoundingBox(), pos)) {
					if (this.status == 0) {
						return false;
					}
					this.status = 0;
					console.log("松开手指取消发送");
					getRecordStatusLayer().runToCancelRecord();

					return true;
				}

				if (this.status == 1) {
					return false;
				}
				console.log("上滑取消发送");

				this.status = 1;
				getRecordStatusLayer().runStartRecord();

				return true;
			},
			onTouchEnded: function(touch, event) {

				return true;
			},
			onTouchCancelled: function(touch, event) {

				return true;
			}
		};
	}

	/**
	 * 开始录音
	 * */
	function startRecord() {
		jsclient.data._JiaheTempTime = new Date();
		cc.audioEngine.pauseMusic();
		jsclient.native.StartRecord(jsb.fileUtils.getWritablePath(), "recordFile" + SelfUid());
		runRecordAction();
	}

	/**
	 * 结束录音
	 * */
	function endRecord() {
		jsclient.data._JiaheTempTime = new Date().getTime() - jsclient.data._JiaheTempTime.getTime();
		jsclient.native.HelloOC(jsclient.data._JiaheTempTime);
		cc.audioEngine.resumeMusic();

		if (jsclient.data._JiaheTempTime > 1000) {
			jsclient.native.EndRecord("uploadRecord");
			stopRecordAction();
		} else {
			jsclient.data._JiaheTempTime = 0;
			jsclient.native.EndRecord("cancelRecord");
			shortRecordAction();
		}

	}

	/**
	 * 取消录音
	 * */
	function cancelRecord() {
		jsclient.data._JiaheTempTime = 0;
		cc.audioEngine.resumeMusic();
		jsclient.native.EndRecord("cancelRecord");
		cancelRecordAction();
	}


	/**
	 * 下载录音, 调用 播放函数
	 * */
	function downAndPlayVoice(uid, filePath) {
		var index = getIndexPlayer(uid);
		console.log("index is downAndPlayVoice" + index);
		jsclient.native.DownLoadFile(jsb.fileUtils.getWritablePath(), index + ".mp3", jsclient.remoteCfg.voiceUrl + filePath, "playVoice");
	}



	var play_canHuWith258;
	var play_canHu7;
	var rePlayLayer = cc.Layer.extend({
		jsBind: {
			_event: {
				mjhand: function() {
					/*var sData = jsclient.data.sData;
					 var tData = sData.tData;
					 if (tData.roundNum != tData.roundAll) return;
					 var pls = sData.players;
					 var ip2pl = {};
					 for (var uid in pls) {
					 var pi = pls[uid];
					 var ip = pi.info.remoteIP;
					 if (ip) {
					 if (!ip2pl[ip]) ip2pl[ip] = [];
					 ip2pl[ip].push(unescape(pi.info.nickname || pi.info.name));
					 }
					 }
					 var ipmsg = [];
					 for (var ip in ip2pl) {
					 var ips = ip2pl[ip];
					 if (ips.length > 1) {
					 ipmsg.push("玩家:" + ips + "\n为同一IP地址\n")
					 }
					 }
					 if (ipmsg.length > 0) {
					 if(cc.sys.OS_WINDOWS != cc.sys.os)
					 {
					 ShowSameIP(ipmsg.join(""));
					 }
					 }
					 mylog("ipmsg " + ipmsg.length);*/

				},
				game_on_hide: function() {
					//jsclient.tickGame(-1);
				},
				game_on_show: function() {
					//jsclient.tickGame(1);
				},
				reinitSceneData: function() {
					reConectHeadLayout(this);
					CheckDelRoomUI();
				},

			},
			roundnumImg: {
				// _layout: [
				// 	[0.1, 0.1],
				// 	[0.5, 0.5],
				// 	[-1.1, -1+0.4]
				// ],
				_run:function () {
					roundnumImgObj = this;


					///zys -- add
					//if(jsclient.rePlayVideo == jsclient.GAME_TYPE.NING_BO)
					//{
					//	doLayout(this,[0.1, 0.1], [0.5, 0.5], [-1.1, -1+0.4]);
					//}
					//else
					{
						doLayout(this,[0.1, 0.1], [0.5, 0.5], [1, 0]);
					}
				},
				_event: {
					initSceneData: function(eD) {
						this.visible = CheckArrowVisible();
					},
					mjhand: function(eD) {
						this.visible = CheckArrowVisible();
						// baidaCompmentState(baidaOject);
					},
					onlinePlayer: function(eD) {
						this.visible = CheckArrowVisible();
					}
				},
				roundnumAtlas: {
					_text: function() {
						var sData = jsclient.data.sData;
						var tData = sData.tData;
						if (tData) return tData.roundNum - 1;
					},
					_event: {
						mjhand: function() {
							var sData = jsclient.data.sData;
							var tData = sData.tData;
							if (tData) return this.setString(tData.roundNum);
						}
					}
				}
			},
			cardNumImg: {
				// _layout: [
				// 	[0.1, 0.1],
				// 	[0.5, 0.5],
				// 	[-1.1, 0+0.4]
				// ],
				_run:function () {


					///zys add
					//if(jsclient.rePlayVideo == jsclient.GAME_TYPE.NING_BO)
					//{
					//	doLayout(this,[0.1, 0.1], [0.5, 0.5], [-1.1, 0+0.4]);
					//}
					//else
					{
						doLayout(this,[0.1, 0.1], [0.5, 0.5], [-1.1, 0]);
					}
				},
				_event: {
					initSceneData: function(eD) {
						this.visible = CheckArrowVisible();
					},
					mjhand: function(eD) {
						this.visible = CheckArrowVisible();
						// baidaCompmentState(baidaOject);
					},
					onlinePlayer: function(eD) {
						this.visible = CheckArrowVisible();
					}
				},
				cardnumAtlas: {
					_text: function() {
						var sData = jsclient.data.sData;
						var tData = sData.tData;
						if (tData) return getAllCardsTotal(tData.withWind) - tData.cardNext;
					},
					_event: {
						waitPut: function() {
							var sData = jsclient.data.sData;
							var tData = sData.tData;

							if (tData) this.setString(getAllCardsTotal(tData.withWind) - tData.cardNext);
						}

					}
				}
			},
			back: {
				back: {
					_layout: [
						[0, 1],
						[0.5, 0.5],
						[0, 0], true
					],
				},
				clt: {
					_layout: [
						[0.15, 0.15],
						[0, 1],
						[0.5, -0.5]
					],
					play: {

						canEat: {
							_visible: function() {
								return jsclient.data.sData.tData.canEat;
							}
						},
						zzmj: {
							_visible: function() {
								return jsclient.data.sData.tData.noBigWin;
							}
						},
						symj: {
							_visible: function() {
								return !jsclient.data.sData.tData.noBigWin;
							}
						},
						canEatHu: {
							_visible: function() {
								return jsclient.data.sData.tData.canEatHu;
							}
						},
						withWind: {
							_visible: function() {
								return jsclient.data.sData.tData.withWind;
							}
						},
						canHu7: {
							_run: function() {
								play_canHu7 = this;
							},
							_visible: function() {
								return (jsclient.data.sData.tData.noBigWin && jsclient.data.sData.tData.canHu7);
							}
						},
						canHuWith258: {
							_run: function() {
								play_canHuWith258 = this;
							},
							_visible: function() {
								return jsclient.data.sData.tData.canHuWith258;
							}
						},
						canHu_hongzhong: {
							_run: function() {
								if ((!play_canHuWith258.visible) && (!play_canHu7.visible)) {
									this.y = play_canHuWith258.y;
								} else if ((play_canHuWith258.visible) && (play_canHu7.visible)) {

								} else {
									this.y = play_canHu7.y;
								}
							},
							_visible: function() {
								return jsclient.data.sData.tData.withZhong;
							}
						},
						_event: {
							reinitSceneData: function(eD) {
								this.visible = this.visible = CheckArrowVisible();

							},
							mjhand: function(eD) {
								this.visible = CheckArrowVisible();
								// baidaCompmentState(baidaOject);
							},

						}
					}
				},
				zz_play_back: {
					_layout: [
						[0.2, 0.2],
						[0.5, 0.5],
						[0, 1.2]
					],
					_visible: function() {
						return jsclient.data.sData.tData.noBigWin;
					}
				},
				sy_name_back: {
					_layout: [
						[0.2, 0.2],
						[0.5, 0.5],
						[0, 1.2]
					],
					_visible: function() {
						cc.log("sy_name_back");
						return !jsclient.data.sData.tData.noBigWin;
					}
				},
				clb: {
					_layout: [
						[0.15, 0.15],
						[0, 0],
						[0.5, 0.5]
					]
				},
				crt: {
					_layout: [
						[0.15, 0.15],
						[1, 1],
						[-0.5, -0.5]
					]
				},
				crb: {
					_layout: [
						[0.15, 0.15],
						[1, 0],
						[-0.5, 0.5]
					]
				},
				barl: {
					_layout: [
						[0, 1],
						[0, 0.5],
						[0.6, 0], true
					]
				},
				barr: {
					_layout: [
						[0, 1],
						[1, 0.5],
						[-0.4, 0], true
					]
				},
				bart: {
					_layout: [
						[1, 0],
						[0.5, 1],
						[0, -0.3], true
					]
				},
				barb: {
					_layout: [
						[1, 0],
						[0.5, 0],
						[0, 0.6], true
					]
				},
			},
			info:
			{
				_layout: [
					[0.16, 0.16],
					[0.01, 0.935],
					[0, 0]
				]
			},
			banner: {
				_layout: [
					[0.16, 0.16],
					[0, 1],
					[0, 0]
				],
				wifi: {
					_run: function() {
						updateWIFI(this);
					}
				},
				powerBar: {
					_run: function() {
						cc.log("powerBar_run");
						updatePower(this);
					},
					_event: {
						nativePower: function(d) {

							this.setPercent(Number(d));
						}
					}
				},
				tableid: {
					_event: {
						reinitSceneData: function () {
							if(jsclient.data.sData.tData.tableid < 1000000)
								this.setString("0"+jsclient.data.sData.tData.tableid);
							else
								this.setString(jsclient.data.sData.tData.tableid);
						}
					}
				},
				setting: {
					_click: function() {
						var settringLayer = new SettingLayer();
						settringLayer.setName("PlayLayerClick");
						jsclient.Scene.addChild(settringLayer);
					}
				},
				Button_1: {
					_click: function() {
						jsclient.openWeb({
							url: jsclient.remoteCfg.helpHangZhouUrl,
							help: true
						});
					}
				}
			},
			arrowbk: {
				_layout: [
					[0.2, 0.2],
					[0.5, 0.5],
					[0, 0]
				],
				_run:function () {


					///zys edit

					//setDirVisible(this, jsclient.rePlayVideo == jsclient.GAME_TYPE.NING_BO);
					//windObj["dong"] = this.getChildByName("dir_right");
					//windObj["nan"] = this.getChildByName("dir_down");
					//windObj["xi"] = this.getChildByName("dir_left");
					//windObj["bei"] = this.getChildByName("dir_up");
					//windPos["dong"] = windObj["dong"].getPosition();
					//windPos["nan"]   = windObj["nan"].getPosition();
					//windPos["xi"]   =  windObj["xi"].getPosition();
					//windPos["bei"]  = windObj["bei"].getPosition();
					//if(jsclient.rePlayVideo == jsclient.GAME_TYPE.TAI_ZHOU)
					//{
					//	for(var i in windObj)
					//	{
					//		windObj[i].setVisible(true);
					//	}
					//	doLayout(roundnumImgObj,[0.1, 0.1], [0.5, 0.5], [1.4, 0]);
					//}
				},
				_event: {
					reinitSceneData: function (eD) {
						this.visible = CheckArrowVisible();
						SetArrowRotation(this)
					},
					mjhand: function(eD) {
						this.visible = CheckArrowVisible();
						SetArrowRotation(this);
						// baidaCompmentState(baidaOject);
					},
					onlinePlayer: function(eD) {
						this.visible = CheckArrowVisible();
					},
					waitPut: function(eD) {
						SetArrowRotation(this)
					},
					MJPeng: function(eD) {
						SetArrowRotation(this)
					},
					MJChi: function(eD) {
						SetArrowRotation(this)
					},
					MJGang: function(eD) {
						SetArrowRotation(this)
					},
					MJFlower: function(eD) {
						SetArrowRotation(this)
					},
					WaitFlower: function(eD) {
						SetArrowRotation(this)
					}
				},
				number: {
					_run: function() {

						updateArrowbkNumber(this);
					},
					_event: {
						MJPeng: function() {
							this.cleanup();
							stopEffect(playAramTimeID)
							updateArrowbkNumber(this);
						},
						MJChi: function() {
							this.cleanup();
							stopEffect(playAramTimeID)
							updateArrowbkNumber(this);
						},
						waitPut: function() {
							this.cleanup();
							stopEffect(playAramTimeID)
							updateArrowbkNumber(this);
						},
						MJPut: function(msg) {
							if (msg.uid == SelfUid())
								this.cleanup();


						},
						roundEnd: function() {
							this.cleanup();
							stopEffect(playAramTimeID)
							// baidaOject.setVisible(false);
							setBaiDaVisible(false);

						}

					}
				}
			},
			wait: {
				wxinvite: {
					_layout: [
						[0.22, 0.22],
						[0.5, 0.65],
						[0, 0]
					],
					_click: function() {
						var tData = jsclient.data.sData.tData;

						/*switch (jsclient.rePlayVideo) {
						 case jsclient.GAME_TYPE.HANG_ZHOU:
						 GLog("房间号:" + tData.tableid + ",杭州麻将," + tData.fanNum + "番," + tData.roundNum + "局,速度加入【星悦麻将】");
						 jsclient.native.wxShareUrl(jsclient.remoteCfg.wxShareUrl, "星悦浙江麻将",
						 "房间号:" + tData.tableid + ",杭州麻将," + tData.fanNum + "番," + tData.roundNum + "局,速度加入【星悦麻将】")
						 break;
						 case jsclient.GAME_TYPE.NING_BO:
						 GLog("房间号:" + tData.tableid + ",宁波麻将," + (tData.isHunNum7 ? "7百搭,":"3百搭,")+tData.fanNum + "番," + tData.tai + "台," + tData.roundNum + "局,速度加入【星悦麻将】");
						 jsclient.native.wxShareUrl(jsclient.remoteCfg.wxShareUrl, "星悦浙江麻将",
						 "房间号:" + tData.tableid + ",宁波麻将," + (tData.isHunNum7 ? "7百搭,":"3百搭,")+ tData.tai + "台,"+(tData.isHunPengQing?"混碰清,":"")+tData.fanNum + "番,"+ tData.roundNum + "局,速度加入【星悦麻将】")
						 break;
						 case jsclient.GAME_TYPE.WEN_ZHOU:
						 jsclient.native.wxShareUrl(jsclient.remoteCfg.wxShareUrl, "星悦浙江麻将",
						 "房间号:" + tData.tableid + ",温州麻将," + tData.fanNum + "番," + tData.tai + "台," + tData.roundNum + "局,速度加入【星悦麻将】")
						 break;
						 case jsclient.GAME_TYPE.TAI_ZHOU:
						 jsclient.native.wxShareUrl(jsclient.remoteCfg.wxShareUrl, "星悦浙江麻将",
						 "房间号:" + tData.tableid + ",台州麻将," + tData.fanNum + "番," + tData.huNum + "糊," + tData.roundNum + "局,速度加入【星悦麻将】")
						 break;
						 }*/
					},
					_visible:false,
				},
				delroom: {
					_layout: [
						[0.22, 0.22],
						[0.5, 0.5],
						[0, 0]
					],
					_click: function() {
						jsclient.delRoom(true);
					},
					_visible:false,
				},
				_event: {
					initSceneData: function(eD) {
						console.log(">>>>>> play initSceneData >>>> " + jsclient.rePlayVideo
							+ " hunCard " + jsclient.hunCard);
						this.visible = CheckInviteVisible();
					},
					addPlayer: function(eD) {
						console.log(">>>>>> play add player >>>>");
						this.visible = CheckInviteVisible();
					},
					removePlayer: function(eD) {
						this.visible = CheckInviteVisible();
					}
				}
			},
			down: {

				head: {
					zhuang: {
						_run: function() {
							this.visible = false;
						},
						_event: {
							waitPut: function () {
								showPlayerZhuangLogo(this, 0);
							},
							reinitSceneDatareinitSceneData: function () {
								if (CheckArrowVisible()) showPlayerZhuangLogo(this, 0);
							}
						}
					},
					play_state:{
						_run:function()
						{
							this.setVisible(false);
						}
					},
					chatbg: {
						_run: function() {
							this.getParent().zIndex = 600;
						},
						chattext: {
							_event: {

								MJChat: function(msg) {

									showchat(this, 0, msg);
								},
								playVoice: function(voicePath) {
									jsclient.data._tempMessage.msg = voicePath;
									showchat(this, 0, jsclient.data._tempMessage);
								}
							}
						}
					},
					flower_layout: {_visible:false},
					_click: function(btn) {
						showPlayerInfo(0, btn);
					},
					_event: {
						loadWxHead: function(d) {
							setWxHead(this, d, 0);
						}

					},
					_run: function () {
						// this.zIndex = 600;
					},

				},
				play_tips: {
					_layout: [[0.1, 0.1], [0.5, 0.2], [0, 0]],
					_run: function () {
						this.zIndex = actionZindex;
					},
					_visible:false,
				},
				tai_layout:{
					_layout: [
						[0.018, 0.018],
						[0, 0],
						[0, 0.2]
					],
					tai_info:{
						_visible:true,
						_run: function () {
							this.setString("");
						}
					},
				},

				ready: {
					_layout: [
						[0.07, 0.07],
						[0.5, 0.5],
						[0, -1.5]
					],
					_run: function() {
						CheckReadyVisible(this, 0);
					},
					_event: {
						moveHead: function() {
							CheckReadyVisible(this, -1);
						},
						addPlayer: function() {
							CheckReadyVisible(this, 0);
						},
						removePlayer: function() {
							CheckReadyVisible(this, 0);
						},
						onlinePlayer: function() {
							CheckReadyVisible(this, 0);
						}
					}
				},
				stand: {
					_layout: [
						[0.057, 0],
						[0.5, 0],
						[8, 0.7]
					],
					_visible: false,
					_run: function () {
						// this.zIndex = 500;
					},
				},

				up: {
					_layout: [
						[0.045, 0],
						[0, 0],
						[2, 0.7]
					],
					_visible: false
				},
				down: {
					_layout: [
						[0.057, 0],
						[0, 0],
						[3.5, 1]
					],
					_visible: false
				},
				out1: {
					_layout: [
						[0, 0.07],
						[0.5, 0],
						[-6, 5.35]
					],
					_visible: false
				},
				out0: {
					_layout: [
						[0, 0.07],
						[0.5, 0],
						[-6, 4.5]
					],
					_visible: false
				},
				_event: {
					clearCardUI: function() {
						clearCardUI(this, 0);
					},
					reinitSceneData: function(eD) {
						SetPlayerVisible(this, 0);
					},
					addPlayer: function(eD) {
						SetPlayerVisible(this, 0);
					},
					removePlayer: function(eD) {
						SetPlayerVisible(this, 0);
					},
					mjhand: function(eD) {
						//down
						InitPlayerHandUI(this, 0);
					},
					roundEnd: function() {
						InitPlayerNameAndCoin(this, 0);
						resetFlowerForPlayer(this, 0);
						// baidaOject.setVisible(false);
						setBaiDaVisible(false);
						resetSelectNode(this,0);
						setTaiInfo("");
					},
					newCard: function(eD) {
						HandleNewCard(this,eD,0);// checkCanTing(eD);
					},
					MJPut: function(eD) { //HandleMJPut(this,eD,0);
					},
					MJChi: function(eD) {
						HandleMJChi(this, eD, 0);
					},
					MJGang: function(eD) {
						HandleMJGang(this, eD, 0);
					},
					MJFlower: function(eD) {
						HandleMJFlower(this, eD, 0);
					},
					MJPeng: function(eD) {
						HandleMJPeng(this, eD, 0);
					},
					MJHu: function(eD) {
						HandleMJHu(this, eD, 0);
					},
					onlinePlayer: function(eD) {
						setOffline(this, 0);
					},
					MJTick: function(eD) {
						setOffline(this, 0);
					},
					MJHu: function(eD) {
						HandleMJHu(this, eD, 0);
					},
				}
				,hulogo: {
					//_layout: [[0, 0.05], [0.5, 0], [0, 4.5]],
					_event: {
						reinitSceneData: function () {
							this.visible = false;
						},
						MJHu: function () {
							replayShowHuLogo(this,PlayerPosId.down,0);
						}
					}
				}
			},
			right: {

				head: {
					zhuang: {
						_run: function() {
							this.visible = false;
						},
						_event: {
							waitPut: function () {
								showPlayerZhuangLogo(this, 1);
							},
							reinitSceneData: function () {
								if (CheckArrowVisible())
									showPlayerZhuangLogo(this, 1);
							}
						}
					},
					play_state:{
						_run:function()
						{
							this.setVisible(false);
						}
					},
					chatbg: {
						_run: function() {
							this.getParent().zIndex = 500;
						},
						chattext: {
							_event: {

								MJChat: function(msg) {

									showchat(this, 1, msg);
								},
								playVoice: function(voicePath) {
									jsclient.data._tempMessage.msg = voicePath;
									showchat(this, 1, jsclient.data._tempMessage);
								}
							}
						}
					},
					flower_layout: {_visible:false},
					_click: function(btn) {
						showPlayerInfo(1, btn);
					},
					_event: {
						loadWxHead: function(d) {
							setWxHead(this, d, 1);
						}

					}


				},
				play_tips: {
					_layout: [[0.1, 0.1], [0.8, 0.5], [0, 0]],
					_run: function () {
						this.zIndex = actionZindex;
					},
					_visible:false,
				},
				ready: {
					_layout: [
						[0.07, 0.07],
						[0.5, 0.5],
						[2, 0]
					],
					_run: function() {
						CheckReadyVisible(this, 1);
					},
					_event: {
						moveHead: function() {
							CheckReadyVisible(this, -1);
						},
						addPlayer: function() {
							CheckReadyVisible(this, 1);
						},
						removePlayer: function() {
							CheckReadyVisible(this, 1);
						},
						onlinePlayer: function() {
							CheckReadyVisible(this, 1);
						}
					}
				},


				stand: {
					_layout: [
						[0, 0.08],
						[1, 1],
						[-2, -2.5]
					],
					_visible: false
				},

				up: {
					_layout: [
						[0, 0.05],
						[1, 0],
						[-4, 6]
					],
					_visible: false
				},
				down: {
					_layout: [
						[0, 0.05],
						[1, 0],
						[-4, 6.3]
					],
					_visible: false
				},

				out0: {
					_layout: [
						[0, 0.05],
						[1, 0.5],
						[-6, -3.8]
					],
					_visible: false
				},
				out1: {
					_layout: [
						[0, 0.05],
						[1, 0.5],
						[-7, -3.8]
					],
					_visible: false
				},

				_event: {
					clearCardUI: function() {
						clearCardUI(this, 1);
					},
					reinitSceneData: function(eD) {
						SetPlayerVisible(this, 1);
					},
					addPlayer: function(eD) {
						SetPlayerVisible(this, 1);
					},
					removePlayer: function(eD) {
						SetPlayerVisible(this, 1);
					},
					mjhand: function(eD) {
						//right
						InitPlayerHandUI(this, 1);
						// baidaCompmentState(baidaOject);
					},
					roundEnd: function() {
						InitPlayerNameAndCoin(this, 1);
						resetFlowerForPlayer(this, 1);
						// baidaOject.setVisible(false);
						setBaiDaVisible(false);
						resetSelectNode(this,1);
					},
					newCard: function (eD) {
						HandleNewCard(this, eD, 1);
					},
					waitPut: function(eD) {
						HandleWaitPut(this, eD, 1);
					},
					MJPut: function(eD) {
						HandleMJPut(this, eD, 1);
					},
					MJChi: function(eD) {
						HandleMJChi(this, eD, 1);
					},
					MJGang: function(eD) {
						HandleMJGang(this, eD, 1);
					},
					MJFlower: function(eD) {
						HandleMJFlower(this, eD, 1);
					},
					MJPeng: function(eD) {
						HandleMJPeng(this, eD, 1);
					},
					MJHu: function(eD) {
						HandleMJHu(this, eD,1);
					},
					onlinePlayer: function(eD) {
						setOffline(this, 1);
					},
					MJTick: function(eD) {
						setOffline(this, 1);
					},
					MJHu: function(eD) {
						HandleMJHu(this, eD, 1);
					},
				},
				hulogo: {
					//_layout: [[0, 0.05], [0.5, 0], [0, 4.5]],
					_event: {
						reinitSceneData: function () {
							this.visible = false;
						},
						MJHu: function () {
							replayShowHuLogo(this,PlayerPosId.right,0);
						}
					}
				},
			},
			top: {
				head: {
					_visible:function()
					{
						return true;
					},
					zhuang: {
						_run: function() {
							this.visible = false;
						},
						_event: {
							waitPut: function () {
								showPlayerZhuangLogo(this, 2);
							},
							reinitSceneData: function () {
								if (CheckArrowVisible())
									showPlayerZhuangLogo(this, 2);
							}
						}

					},
					play_state:{
						_run:function()
						{
							this.setVisible(false);
						}
					},
					chatbg: {
						_run: function() {
							this.getParent().zIndex = 500;
						},
						chattext: {
							_event: {

								MJChat: function(msg) {

									showchat(this, 2, msg);
								},
								playVoice: function(voicePath) {
									jsclient.data._tempMessage.msg = voicePath;
									showchat(this, 2, jsclient.data._tempMessage);
								}
							}
						}
					},
					flower_layout: {_visible:false},
					_click: function(btn) {
						showPlayerInfo(2, btn);
					},
					_event: {
						loadWxHead: function(d) {
							setWxHead(this, d, 2);
						}

					}

				},
				play_tips: {
					_layout: [[0.1, 0.1], [0.5, 0.8], [0, 0]],
					_run: function () {
						this.zIndex = actionZindex;
					},
					_visible:false,
				},
				ready: {
					_layout: [
						[0.07, 0.07],
						[0.5, 0.5],
						[0, 1.5]
					],
					_run: function() {
						CheckReadyVisible(this, 2);
					},
					_event: {
						moveHead: function() {
							CheckReadyVisible(this, -1);
						},
						addPlayer: function() {
							CheckReadyVisible(this, 2);
						},
						removePlayer: function() {
							CheckReadyVisible(this, 2);
						},
						onlinePlayer: function() {
							CheckReadyVisible(this, 2);
						}
					}
				},

				stand: {
					_layout: [
						[0, 0.07],
						[0.5, 1],
						[-6, -2.5]
					],
					_visible: false
				},

				up: {
					_layout: [
						[0, 0.07],
						[0.5, 1],
						[6, -2.5]
					],
					_visible: false
				},
				down: {
					_layout: [
						[0, 0.07],
						[0.5, 1],
						[6, -2.2]
					],
					_visible: false
				},

				out0: {
					_layout: [
						[0, 0.07],
						[0.5, 1],
						[5, -4.6]
					],
					_visible: false
				},
				out1: {
					_layout: [
						[0, 0.07],
						[0.5, 1],
						[5, -5.45]
					],
					_visible: false
				},
				hulogo: {
					//_layout: [[0, 0.05], [0.5, 0], [0, 4.5]],
					_event: {
						reinitSceneData: function () {
							this.visible = false;
						},
						MJHu: function () {
							replayShowHuLogo(this,PlayerPosId.top,0);
						}
					}
				},

				_event: {
					clearCardUI: function() {
						clearCardUI(this, 2);
					},
					reinitSceneData: function(eD) {
						SetPlayerVisible(this, 2);
					},
					addPlayer: function(eD) {
						SetPlayerVisible(this, 2);
					},
					removePlayer: function(eD) {
						SetPlayerVisible(this, 2);
					},
					mjhand: function(eD) {
						//top
						InitPlayerHandUI(this, 2);
						// baidaCompmentState(baidaOject);
					},
					roundEnd: function() {
						InitPlayerNameAndCoin(this, 2);
						resetFlowerForPlayer(this, 2);
						// baidaOject.setVisible(false);
						setBaiDaVisible(false);
						resetSelectNode(this,2);

					},
					newCard: function (eD) {
						HandleNewCard(this, eD, 2);
					},
					waitPut: function(eD) {
						HandleWaitPut(this, eD, 2);
					},
					MJPut: function(eD) {
						HandleMJPut(this, eD, 2);
					},
					MJChi: function(eD) {
						HandleMJChi(this, eD, 2);
					},
					MJGang: function(eD) {
						HandleMJGang(this, eD, 2);
					},
					MJFlower: function(eD) {
						HandleMJFlower(this, eD, 2);
					},
					MJPeng: function(eD) {
						HandleMJPeng(this, eD, 2);
					},
					MJHu: function(eD) {
						HandleMJHu(this, eD,2);
					},
					onlinePlayer: function(eD) {
						setOffline(this, 2);
					},
					MJTick: function(eD) {
						setOffline(this, 2);
					},
					MJHu: function(eD) {
						HandleMJHu(this, eD, 2);
					},
				}
			},
			left: {
				head: {
					zhuang: {
						_run: function() {
							this.visible = false;
						},
						_event: {
							waitPut: function () {
								showPlayerZhuangLogo(this, 3);
							},
							reinitSceneData: function () {
								if (CheckArrowVisible())
									showPlayerZhuangLogo(this, 3);
							}
						}
					},
					play_state:{
						_run:function()
						{
							this.setVisible(false);
						}
					},
					chatbg: {
						_run: function() {
							this.getParent().zIndex = 500;
						},
						chattext: {
							_event: {

								MJChat: function(msg) {

									showchat(this, 3, msg);
								},
								playVoice: function(voicePath) {
									jsclient.data._tempMessage.msg = voicePath;
									showchat(this, 3, jsclient.data._tempMessage);
								}
							}
						}
					},
					flower_layout: {_visible:false},
					_click: function(btn) {
						showPlayerInfo(3, btn);
					},
					_event: {
						loadWxHead: function(d) {
							setWxHead(this, d, 3);
						}


					}
				},
				play_tips: {
					_layout: [[0.1, 0.1], [0.2, 0.5], [0, 0]],
					_run: function () {
						this.zIndex = actionZindex;
					},
					_visible:false,
				},
				ready: {
					_layout: [
						[0.07, 0.07],
						[0.5, 0.5],
						[-2, 0]
					],
					_run: function() {
						CheckReadyVisible(this, 3);
					},
					_event: {
						moveHead: function() {
							CheckReadyVisible(this, -1);
						},
						addPlayer: function() {
							CheckReadyVisible(this, 3);
						},
						removePlayer: function() {
							CheckReadyVisible(this, 3);
						},
						onlinePlayer: function() {
							CheckReadyVisible(this, 3);
						}
					}
				},

				up: {
					_layout: [
						[0, 0.05],
						[0, 1],
						[3.6, -3.3]
					],
					_visible: false
				},
				down: {
					_layout: [
						[0, 0.05],
						[0, 1],
						[3.6, -3]
					],
					_visible: false
				},
				stand: {
					_layout: [
						[0, 0.08],
						[0, 0],
						[3.5, 3]
					],
					_visible: false
				},

				out0: {
					_layout: [
						[0, 0.05],
						[0, 0.5],
						[5.5, 3.7]
					],
					_visible: false
				},
				out1: {
					_layout: [
						[0, 0.05],
						[0, 0.5],
						[6.5, 3.7]
					],
					_visible: false
				},
				_event: {
					clearCardUI: function() {
						clearCardUI(this, 3);
					},
					reinitSceneData: function(eD) {
						SetPlayerVisible(this, 3);
					},
					addPlayer: function(eD) {
						SetPlayerVisible(this, 3);
					},
					removePlayer: function(eD) {
						SetPlayerVisible(this, 3);
					},
					mjhand: function(eD) {
						//left
						InitPlayerHandUI(this, 3);
						// baidaCompmentState(baidaOject);
					},
					/*roundEnd: function() {
					 InitPlayerNameAndCoin(this, 3);
					 resetFlowerForPlayer(this, 3);
					 // baidaOject.setVisible(false);
					 setBaiDaVisible(false);
					 resetSelectNode(this,3);

					 },*/
					newCard: function (eD) {
						HandleNewCard(this, eD, 3);
					},
					waitPut: function(eD) {
						HandleWaitPut(this, eD, 3);
					},
					MJPut: function(eD) {
						HandleMJPut(this, eD, 3);
					},
					MJChi: function(eD) {
						HandleMJChi(this, eD, 3);
					},
					MJGang: function(eD) {
						HandleMJGang(this, eD, 3);
					},
					MJFlower: function(eD) {
						HandleMJFlower(this, eD, 3);
					},
					MJPeng: function(eD) {
						HandleMJPeng(this, eD, 3);
					},
					MJHu: function(eD) {
						HandleMJHu(this, eD, 3);
					},
					onlinePlayer: function(eD) {
						setOffline(this, 3);
					},
					MJTick: function(eD) {
						setOffline(this, 3);
					},
					MJHu: function(eD) {
						HandleMJHu(this, eD, 3);
					},
				},
				hulogo: {
					//_layout: [[0, 0.05], [0.5, 0], [0, 4.5]],
					_event: {
						reinitSceneData: function () {
							this.visible = false;
						},
						MJHu: function () {
							replayShowHuLogo(this,PlayerPosId.left,0);
						}
					}
				},
			},
			eat: {

				chi0: {
					_visible: false,
					_layout: [
						[0, 0.1],
						[0.5, 0],
						[1.3, 2.5]
					],
					_touch: function(btn, eT) {
						if (eT == 2) MJChichange(btn.tag);
					},
					bgimg: {
						_run: function() {
							this.zIndex = -1;
						}
					},
					bgground: {
						_run: function() {
							this.zIndex = -1;
						}
					},
					card1: {},
					card2: {},
					card3: {}
				},
				chi1: {
					_visible: false,
					_layout: [
						[0, 0.1],
						[0.5, 0],
						[1.3, 3.8]
					],
					_touch: function(btn, eT) {
						if (eT == 2) MJChichange(btn.tag);
					}
				},
				chi2: {
					_visible: false,
					_layout: [
						[0, 0.1],
						[0.5, 0],
						[1.3, 5.1]
					],
					_touch: function(btn, eT) {
						if (eT == 2) MJChichange(btn.tag);
					}

				},
				peng: {
					_visible: false,
					_layout: [
						[0, 0.1],
						[0.5, 0],
						[0, 2.5]
					],
					_touch: function(btn, eT) {
						console.log(">>>> lf，点击碰按钮");
						if (eT == 2) MJPeng2Net();
					},
					bgimg: {
						_run: function() {
							this.zIndex = -1;
						}
					}
				},
				gang0: {
					_visible: false,
					_layout: [
						[0, 0.1],
						[0.5, 0],
						[-1.7, 2.5]
					],
					card1: {},
					_touch: function(btn, eT) {
						if (eT == 2) MJGangchange(btn.tag);
					},
					bgimg: {
						_run: function() {
							this.zIndex = -1;
						}
					},
					bgground: {
						_run: function() {
							this.zIndex = -1;
						}
					}
				},
				gang1: {
					_visible: false,
					_layout: [
						[0, 0.1],
						[0.5, 0],
						[-1.7, 3.8]
					],
					card: {},
					_touch: function(btn, eT) {
						if (eT == 2) MJGangchange(btn.tag);
					}
				},
				gang2: {
					_visible: false,
					_layout: [
						[0, 0.1],
						[0.5, 0],
						[-1.7, 5.1]
					],
					card: {},
					_touch: function(btn, eT) {
						if (eT == 2) MJGangchange(btn.tag);
					}
				},
				guo: {
					_visible: false,
					_layout: [
						[0, 0.1],
						[0.5, 0],
						[4.6, 2.5]
					],
					_touch: function(btn, eT) {
						if (eT == 2) jsclient.MJPass2NetForHangZhou();
					},
					bgimg: {
						_run: function() {
							this.zIndex = -1;
						}
					}
				},
				hu: {
					_visible: false,
					_layout: [
						[0, 0.1],
						[0.5, 0],
						[-3, 2.5]
					],
					_touch: function(btn, eT) {
						if (eT == 2) MJHu2Net();
					},
					bgimg: {
						_run: function() {
							this.zIndex = -1;
						}
					}
				},
				changeui: {
					changeuibg: {
						_layout: [
							[0.2, 0.2],
							[0.5, 0],
							[0, 0]
						],
						_run: function() {
							this.y = this.getParent().getParent().getChildByName("chi0").y;
						},
						card0: {
							_touch: function(btn, et) {
								if (et == 2) {
									if (btn.getParent().getChildByName("card2").visible) {
										MJChi2Net(0);
									} else {
										MJGang2Net(btn.tag);
									}
								}
							}
						},
						card1: {
							_touch: function(btn, et) {
								if (et == 2) {
									if (btn.getParent().getChildByName("card2").visible) {
										MJChi2Net(0);
									} else {
										MJGang2Net(btn.tag);
									}
								}
							}
						},
						card2: {
							_touch: function(btn, et) {
								if (et == 2) {
									MJChi2Net(0);
								}
							}
						},
						card3: {
							_touch: function(btn, et) {
								if (et == 2) {
									if (btn.getParent().getChildByName("card2").visible) {
										MJChi2Net(0);
									} else {
										MJGang2Net(btn.tag);
									}
								}
							}
						},
						card4: {
							_touch: function(btn, et) {
								if (et == 2) {
									MJChi2Net(1);
								}
							}
						},
						card5: {
							_touch: function(btn, et) {
								if (et == 2) {
									MJChi2Net(1)
								}
							}
						},
						card6: {
							_touch: function(btn, et) {
								if (et == 2) {
									MJChi2Net(1)
								}
							}
						},
						card7: {
							_touch: function(btn, et) {
								if (et == 2) {
									MJChi2Net(2);
								}
							}
						},
						card8: {
							_touch: function(btn, et) {
								if (et == 2) {
									MJChi2Net(2)
								}
							}
						},
						card9: {
							_touch: function(btn, et) {
								if (et == 2) {
									MJChi2Net(2)
								}
							}
						},
						guobg: {
							guo: {
								_touch: function(btn, eT) {
									if (eT == 2) jsclient.MJPass2NetForHangZhou();
								}
							},
							fanhui: {
								_touch: function(btn, et) {
									if (et == 2) {
										btn.getParent().getParent().visible = false;
										CheckEatVisible(jsclient.replayui.jsBind.eat);
									}
								}
							}
						}

					}
				},
				_event: {
					MJPass: function(eD) {
						CheckEatVisible(jsclient.replayui.jsBind.eat);
					},
					mjhand: function(eD) {
						CheckEatVisible(jsclient.replayui.jsBind.eat);
						// baidaCompmentState(baidaOject);
					},
					waitPut: function(eD) {
						CheckEatVisible(jsclient.replayui.jsBind.eat);
					},
					MJPut: function(eD) {
						CheckEatVisible(jsclient.replayui.jsBind.eat);
					},
					MJPeng: function(eD) {
						CheckEatVisible(jsclient.replayui.jsBind.eat);
					},
					MJChi: function(eD) {
						CheckEatVisible(jsclient.replayui.jsBind.eat);
					},
					MJGang: function(eD) {
						CheckEatVisible(jsclient.replayui.jsBind.eat);
					},
					MJFlower: function(eD) {
						CheckEatVisible(jsclient.replayui.jsBind.eat);
					},
					WaitFlower:function (eD) {
						CheckEatVisible(jsclient.replayui.jsBind.eat);
					},
					roundEnd: function(eD) {
						CheckEatVisible(jsclient.replayui.jsBind.eat);
						// baidaOject.setVisible(false);
						setBaiDaVisible(false);
					},
					initSceneData: function(eD) {
						// CheckEatVisible(jsclient.playui.jsBind.eat);
						//reconnect时，比 mjhand delay 执行
						function delayExe()
						{
							CheckEatVisible(jsclient.replayui.jsBind.eat);
						}
						this.runAction(cc.sequence(cc.DelayTime(0.1),cc.callFunc(delayExe)));
					}

				}
			},
			controllerBg: {
				_layout: [[0.5, 0.5], [0.5, 0.3], [0, 0]]
				, play_btn: {
					_click: function () {
						updatelayer_itme_node.resume();
					}
				}
				, pause_btn: {
					_click: function () {
						updatelayer_itme_node.pause();
					}
				}
				, kuaijin_btn: {
					_click: function () {
					}
				}
				, return_btn: {
					_click: function () {
						updatelayer_itme_node.stopAllActions();
						jsclient.replayui.removeFromParent(true);
						jsclient.replayui = null;
						//jsclient.data.sData = null;
						playMusic("bgMain");
					}
				}
				, kuaitui_btn: {
					_click: function () {
					}
				}
			},
			chengbao:
			{
				_layout: [
					[0.01, 0.01],
					[0.5, 0.3],
					[0, 0]
				],
				_visible:function () {

				},
				btn_play:{
					_click: function() {
						MJSelect2Net(true);
					}
				},
				btn_stop_play:
				{
					_click: function() {
						MJSelect2Net(false);
					}
				},
				_event:
				{
					WaitSelect:function (eD) {
						HandleWaitSelect(jsclient.replayui.jsBind.chengbao._node,eD);
					},
					MJSelect:function (eD) {
						HandleMJSelect(jsclient.replayui.jsBind.chengbao._node,eD);
					},
				}
			},
			chat_btn: {
				_layout: [
					[0.09, 0.09],
					[0.95, 0.1],
					[0, 0]
				],
				_click: function() {
					var chatlayer = new ChatLayer();
					jsclient.Scene.addChild(chatlayer);
				},
				_visible:false,
			},
			voice_btn: {
				_layout: [
					[0.09, 0.09],
					[0.95, 0.2],
					[0, 0]
				],
				_run: function() {
					initVData();
					cc.eventManager.addListener(getTouchListener(), this);
					//ios隐藏
					//if(cc.sys.OS_IOS==cc.sys.os) this.visible=false;
				},
				_touch: function(btn, eT) {
					// 点击开始录音 松开结束录音,并且上传至服务器, 然后通知其他客户端去接受录音消息, 播放
					if (eT == 0) {
						startRecord();
					} else if (eT == 2) {
						endRecord();
					} else if (eT == 3) {
						cancelRecord();
					}
				},
				_visible:false,
				_event: {
					cancelRecord: function() {
						jsclient.native.HelloOC("cancelRecord !!!");
					},
					uploadRecord: function(filePath) {
						if (filePath) {
							jsclient.native.HelloOC("upload voice file");
							jsclient.native.UploadFile(filePath, jsclient.remoteCfg.voiceUrl, "sendVoice");
						} else {
							jsclient.native.HelloOC("No voice file update");
						}
					},
					sendVoice: function(fullFilePath) {
						if (!fullFilePath) {
							console.log("sendVoice No fileName");
							return;
						}

						var getFileName = /[^\/]+$/;
						var extensionName = getFileName.exec(fullFilePath);
						var fileName = extensionName[extensionName.length - 1];
						console.log("sfileName is:" + fileName);

						jsclient.gamenet.request("pkroom.handler.tableMsg", {
							cmd: "downAndPlayVoice",
							uid: SelfUid(),
							type: 3,
							msg: fileName,
							num: jsclient.data._JiaheTempTime
						});
						jsclient.native.HelloOC("download file");
					},
					downAndPlayVoice: function(msg) {
						jsclient.native.HelloOC("downloadPlayVoice ok");
						jsclient.data._tempMessage = msg;
						jsclient.native.HelloOC("mas is" + JSON.stringify(msg));
						downAndPlayVoice(msg.uid, msg.msg);
					}
				}
			},
			backHomebtn: {
				_layout: [
					[0.22, 0.22],
					[0.5, 0.35],
					[0, 0]
				],
				_click: function(btn) {
					var sData = jsclient.data.sData;
					if (sData) {
						if (IsRoomOwner()) {
							jsclient.showMsg("返回大厅房间仍然保留\n赶快去邀请好友吧",
								function() {
									jsclient.replayui.visible = false;
									sendEvent("returnHome");
								},
								function() {});
						} else {
							jsclient.showMsg("返回大厅房间将退出游戏\n确定退出房间吗",
								function() {
									jsclient.leaveGame();
								},
								function() {});
						}
					}

				},
				_event: {
					returnPlayerLayer: function() {
						jsclient.replayui.visible = true;
					},
					initSceneData: function(eD) {
						this.visible = CheckInviteVisible();
					},
					addPlayer: function(eD) {
						this.visible = CheckInviteVisible();
					},
					removePlayer: function(eD) {
						this.visible = CheckInviteVisible();
					}
				},
				_visible:false,
			},
			baidaText: {
				_run:function()
				{
					baidaOject = this;
					baidaOject.setVisible(false);
				},
				_layout: [
					[0, 0.07],
					[1, 1],
					[-4.5, -5.45]
				],
				// _event:{
				// 	onlinePlayer: function(eD) {
				// 		baidaCompmentState(this);
				// 	}
				// }
			}

		},
		ctor: function() {
			this._super();
			console.log("--------------创建replay----------------------------------");
			var playui = ccs.load("res/Replay.json");
			playMusic("bgFight");
			ConnectUI2Logic(playui.node, this.jsBind);
			this.addChild(playui.node);
			jsclient.lastMJTick = Date.now();
			this.runAction(cc.repeatForever(cc.sequence(cc.callFunc(function() {
				if (jsclient.game_on_show) jsclient.tickGame(0);
			}), cc.delayTime(7))));
			jsclient.replayui = this;
			return true;
		},

	});
	var rePlayLayer = new rePlayLayer();
	return rePlayLayer;
}
