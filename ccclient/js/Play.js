var TableState = {
	waitJoin: 1,
	waitReady: 2,
	waitPut: 3,
	waitEat: 4,
	waitCard: 5,
	roundFinish: 6,
	isReady: 7,
	downPao:8,
	doneDownPao:9,
}
var TableDir = ["down","right","top","left"];
var ActionType = {
	CHI:0,
	PENG:1,
	GANG:2,
	HU:3,
	TING:4
}
var PlayType={
	sxMethod:1,		// 陕西麻将
	xaMethod:2,		// 西安麻将
	bjMethod:3,		// 宝鸡麻将
	ylMethod:4,		// 榆林麻将
	hsMethod:5, 	// 划水麻将
}
var Playeroff= {
	self_off: 0,
	right_off: 1,
	top_off:2,
	left_off:3,
}

/*存储听牌时显示的按钮*/
/*听牌后可打出牌列表*/
var canNotPutList=[];
var winList=[];
var autoOutOn=false;
/*标记听是否被点击*/
var tingClicked = false;
var ylCanNotWinList=[1,2,11,12,21,22]
var ylCanNotEatWinList=[1,2,3,4,5,11,12,13,14,15,21,22,23,24,25]
function hideRelativeBtn() {
	var eat = jsclient.playui.jsBind.eat;
	eat.peng._node.visible = false;
	eat.gang0._node.visible = false;
	eat.gang1._node.visible = false;
	eat.gang2._node.visible = false;
	eat.hu._node.visible = false;
	eat.guo._node.visible = false;
	eat.ting._node.visible = false;
}
function resetTingAndTingList(tData) {
	if (tData.playType == PlayType.ylMethod)
	{
		for (var i=0; i <4; i++)
		{
			var pl = getUIPlayer(i);
			if (pl.isTing) {
				pl.isTing = false;
			}
			if (pl.canNotPutList) {
				pl.canNotPutList.splice(0,pl.canNotPutList.length);
			}
		}
		canNotPutList.splice(0,canNotPutList.length);
	}
}
/**
 听牌以后设置牌的亮度，改变触摸事件，copy自贵阳捉鸡
 */
function MJTingCanNotPutCard()
{
	var down =jsclient.playui.jsBind.down._node;
	var children = down.children;
	for(var i=0;i<children.length;i++)
	{
		if (children[i].name == "mjhand"&&canNotPutList.indexOf(children[i].tag)>=0)
		{
			children[i].color = cc.color(150,150,150);
			children[i].enabled =false;
		}
	}
}
//自动出牌
function AutoPutAwayCard(node) {
	// cc.log(node.getName());
	var children = node.getChildByName("down").children;
	var pl = getUIPlayer(0);
	// console.log(" pl.mjhand: " + pl.mjhand);
	var cd = pl.mjhand[pl.mjhand.length-1];
	// cc.log(" 自动出牌 autoPutAwayCard: "+cd + " pl.newCard: " + pl.newCard );
	if (canNotPutList.indexOf(cd) > 0 && pl.newCard && pl.newCard != cd)
	{
		return;
	}
	for (var i = 0; i < children.length; i++) {
		var ci = children[i];
		// cc.log("ci.name: "+ci.name + " ci.tag: " + ci.tag);
		if (ci.name == "mjhand" && (ci.tag == cd)) {
			PutAwayCard(ci,cd);
			break;
		}
	}
}
function ShowEatActionAnim(node,actType,off) {
	if(off==0)
	{
		return;
	}
	var aniNode;
	
	if ( actType == ActionType.PENG )
		aniNode = node.getChildByName("pengPlay");
	else if ( actType == ActionType.GANG )
		aniNode = node.getChildByName("gangPlay");
	else if (actType == ActionType.TING)
		aniNode = node.getChildByName("tingPlay");
	else
		return;

	if (aniNode){
		aniNode.runAction(
			cc.sequence(cc.Show(), cc.scaleTo(0.3, 1.4), cc.ScaleTo(0.1, 1.2), cc.scaleTo(0.1, 0.8),
				cc.delayTime(0.8), cc.Hide()));
		aniNode.setScale(0.07);
	} else {
		cc.log("aniNode: " + aniNode);
	}
}
function SelfUid()
{
	return jsclient.data.pinfo.uid
}
function setDownPaoNum(num) {
	jsclient.data.pinfo.downPaoNum = num;
}
function downPaoNum() {
	return jsclient.data.pinfo.downPaoNum;
}
function IsMyTurn()
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	return SelfUid() == tData.uids[tData.curPlayer];
}
function PutAwayCard(cdui, cd)
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var children = cdui.parent.children;
	var mjhandNum = 0;
	//var newCard;
	var standUI = cdui.parent.getChildByName("stand");
	for (var i = 0; i < children.length; i++)
	{
		if (children[i].name == "mjhand")
		{
			/*if (children[i].isnewCard)
			 {
			 newCard=children[i];
			 }*/

			if (children[i].y > standUI.y + 10)
			{
				children[i].y = standUI.y;
			}
			mjhandNum++;
		}
	}
	var pl = getUIPlayer(0);
	if (mjhandNum == pl.mjhand.length)
	{
		if(tData.playType==PlayType.ylMethod&&!pl.isTing && tingClicked)
		{
			// 如果是榆林玩法听后出牌
			jsclient.gamenet.request("pkroom.handler.tableMsg", {cmd: "MJPut", card: cd, tingClicked:tingClicked})
			jsclient.lastPutPos = {x: cdui.x, y: cdui.y};
			//if(newCard) newCard.isnewCard=false;
			cd+=100;
			console.log("=== 听牌后出牌的处理 === cd: " + cd);
			HandleMJPut(cdui.parent, {uid: SelfUid(), card: cd}, 0);
			canNotPutList.splice(0,canNotPutList.length);
			for(var i=0;i<pl.mjhand.length; i++) {
				canNotPutList[i]=pl.mjhand[i];
			}
			if(canNotPutList.indexOf(cd-100) >= 0) {
				canNotPutList.splice(canNotPutList.indexOf(cd-100), 1);
			}
			MJTingCanNotPutCard();
			// 初始化胡牌列表
			console.log(" mjhand: " + pl.mjhand);
			var cds = pl.mjhand.slice();
			console.log(" cds: before delete put card " + cds);
			cds.splice(cds.indexOf(cd-100),1);
			console.log(" cds: after delete put card " + cds);
			winList.splice(0,winList.length);
			winList=jsclient.majiang.tingWinList(true,cds,false);
			tingClicked=false;
			console.log("=== 听牌之后 winList: " + winList);
		}
		else
		{
			if(tData.playType==PlayType.ylMethod&&pl.isTing)
			{
				console.log("=== cannotPutList.length: " + canNotPutList.length + " mjhand.length: " + pl.mjhand.length);
				if(canNotPutList.length<pl.mjhand.length-1)
				{
					canNotPutList.splice(0,canNotPutList.length);
					for(var i=0;i<pl.mjhand.length; i++) {
						canNotPutList[i]=pl.mjhand[i];
					}
					if(canNotPutList.indexOf(cd-100) >= 0) {
						canNotPutList.splice(canNotPutList.indexOf(cd-100), 1);
					}
				}
				MJTingCanNotPutCard();
			}
			jsclient.gamenet.request("pkroom.handler.tableMsg", {cmd: "MJPut", card: cd});
			jsclient.lastPutPos = {x: cdui.x, y: cdui.y};
			//if(newCard) newCard.isnewCard=false;
			HandleMJPut(cdui.parent, {uid: SelfUid(), card: cd}, 0);
		}
	}
}

function ShowSkipHu() {
	var jsonui = ccs.load("res/SkipHu.json");
	doLayout(jsonui.node.getChildByName("Image_1"),[0.2,0.2],[0.5,0.3],[0,0] );
	jsclient.Scene.addChild(jsonui.node);
	jsonui.node.runAction(cc.sequence(cc.delayTime(2),cc.removeSelf()));
}

function getEatFlag()
{
	var eat = jsclient.playui.jsBind.eat;
	var eatFlag = 0;
	if (eat.gang0._node.visible)
	{
		eatFlag = eatFlag + 4;
	}
	if (eat.hu._node.visible)
	{
		eatFlag = eatFlag + 8;
	}
	if (eat.chi0._node.visible)
	{
		eatFlag = eatFlag + 1;
	}
	if (eat.peng._node.visible)
	{
		eatFlag = eatFlag + 2;
	}
	// mylog("eatFlag" + eatFlag);
	return eatFlag;
}

jsclient.MJPass2Net = function ()
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	if (IsMyTurn() && tData.tState == TableState.waitPut)
	{
		var eat=jsclient.playui.jsBind.eat;
		var msg="确认过";
		if(eat.gang0._node.visible) msg+=" 杠 ";
		if(eat.hu._node.visible)    msg+=" 胡 ";
		if(eat.ting._node.visible) msg+=" 听 ";

		jsclient.showMsg(msg+"吗?",function(){
			eat.gang0._node.visible=false;
			eat.hu._node.visible=false;
			eat.ting._node.visible=false;
			eat.guo._node.visible=false;
		},function(){},"1");

		// var cduis = jsclient.playui.jsBind.down._node.children;
		// var pl = jsclient.data.sData.players[SelfUid()];
		// var lastCard = pl.mjhand[pl.mjhand.length - 1];
		// for (var i = cduis.length - 1; i >= 0; i--)
		// {
		// 	if (cduis[i].tag == lastCard)
		// 	{
		// 		PutAwayCard(cduis[i], lastCard);
		// 		break;
		// 	}
		// }
	}
	else
	{
		// 暂时隐藏不执行 TODO　fixme
		//jsclient.gamenet.request("pkroom.handler.tableMsg", {cmd: "MJPass"});
		//var pl = getUIPlayer(0);
		//pl.mjState = TableState.waitCard;
		//CheckEatVisible(jsclient.playui.jsBind.eat);

		if (jsclient.playui.jsBind.eat.hu._node.visible) {
			jsclient.showMsg("确认不胡吗?", ConfirmMJPass, function () {});
		}
		else {
			ConfirmMJPass();
		}
	}
};
function downPao2Net(num) {
	jsclient.gamenet.request("pkroom.handler.tableMsg", {cmd: "DownPao", num: num});
}

function MJGang2Net(cd)
{
	jsclient.gamenet.request("pkroom.handler.tableMsg", {cmd: "MJGang", card: cd});
}
function MJChi2Net(pos)
{
	jsclient.gamenet.request("pkroom.handler.tableMsg", {cmd: "MJChi", pos: pos});
}
function MJHu2Net()
{
	jsclient.gamenet.request("pkroom.handler.tableMsg", {cmd: "MJHu"});
}
function MJPeng2Net()
{
	jsclient.gamenet.request("pkroom.handler.tableMsg", {cmd: "MJPeng"});
}

function ConfirmMJPass()
{
	var pl = getUIPlayer(0);
	if (jsclient.playui.jsBind.eat.hu._node.visible)
	{
		pl.skipHu = true;
	}
	jsclient.gamenet.request("pkroom.handler.tableMsg", {cmd: "MJPass", eatFlag: getEatFlag()});
	pl.mjState = TableState.waitCard;
	CheckEatVisible(jsclient.playui.jsBind.eat);
}


function ShowMjChiCard(node, off)
{
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
		setCardPic(card1, tData.lastPut, 0);
		setCardPic(card2, tData.lastPut + 1, 0);
		setCardPic(card3, tData.lastPut + 2, 0);

	}
	else if (off == 1)
	{
		var card1 = node.getChildByName("card4");
		var card2 = node.getChildByName("card5");
		var card3 = node.getChildByName("card6");
		card1.visible = true;
		card2.visible = true;
		card3.visible = true;
		setCardPic(card1, tData.lastPut - 1, 0);
		setCardPic(card2, tData.lastPut, 0);
		setCardPic(card3, tData.lastPut + 1, 0);
	}
	else if (off == 2)
	{
		var card1 = node.getChildByName("card7");
		var card2 = node.getChildByName("card8");
		var card3 = node.getChildByName("card9");
		card1.visible = true;
		card2.visible = true;
		card3.visible = true;
		setCardPic(card1, tData.lastPut - 2, 0);
		setCardPic(card2, tData.lastPut - 1, 0);
		setCardPic(card3, tData.lastPut, 0);
	}


}
function CheckChangeuiVisible()
{
	jsclient.playui.jsBind.eat.changeui.changeuibg._node.visible = false;
}

function CheckEatVisible(eat)
{
	CheckChangeuiVisible();
	var eatNode = eat._node;
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var leftCard = (tData.withWind ? 136 : 108) - tData.cardNext;
	eat.chi0._node.visible = false;
	eat.chi1._node.visible = false;
	eat.chi2._node.visible = false;
	eat.peng._node.visible = false;
	eat.gang0._node.visible = false;
	eat.gang1._node.visible = false;
	eat.gang2._node.visible = false;
	eat.hu._node.visible = false;
	eat.guo._node.visible = false;
	eat.ting._node.visible = false;

	var pl = sData.players[SelfUid() + ""];
	if (
		pl.mjState == TableState.waitEat
		|| pl.mjState == TableState.waitPut && tData.uids[tData.curPlayer] == SelfUid()
	)
	{

	}
	else
	{
		return;
	}

	jsclient.gangCards = [];
	jsclient.eatpos = [];
	var mj = jsclient.majiang;
	var vnode = [];
	if (tData.tState == TableState.waitPut && pl.mjState == TableState.waitPut)//gang hu put ting(ylMethod)
	{
		if (IsMyTurn())
		{
			if (tData.playType == PlayType.ylMethod)
			{
				if(pl.isTing)
				{
					if (pl.isNew && mj.canHu(!tData.canHu7, pl.mjhand, 0, tData.canHuWith258, tData.withZhong)>0)
					{
						if (ylCanNotWinList.indexOf(pl.mjhand[pl.mjhand.length-1]) < 0)
						{
							vnode.push(eat.hu._node);
						}
					}
				}
				else
				{
					canNotPutList=mj.canTing(true,pl.mjhand,false);
					
					if (canNotPutList.length<pl.mjhand.length)
					{
						vnode.push(eat.ting._node);
						// canTing=true;
					}
				}
			}
			else
			{
				if (pl.isNew && mj.canHu(!tData.canHu7, pl.mjhand, 0,
						tData.canHuWith258, tData.withZhong) > 0) {
					vnode.push(eat.hu._node);
				}
			}

			var rtn;
			if (tData.playType == PlayType.ylMethod && pl.isTing)
			{
				rtn = leftCard > 0 ? mj.canTingGang1(pl.mjpeng, pl.mjhand, pl.mjpeng4, pl.isTing) : [];
				if(rtn.length>0)
				{
					if(winList.length==0)
					{//断线重连，如果在checkeatvisible后执行
						winList=pl.winList.slice();
					}
					for(var i=0; i<rtn.length; i++)
					{
						var cds = pl.mjhand.slice();
						for(var j=0; j<4; j++)
						{
							if(cds.indexOf(rtn[i])>=0)
							{
								cds.splice(cds.indexOf(rtn[i]),1);
							}
							else
							{
								break;
							}
						}
						// console.log(" 删除杠牌之后的列表: " + cds);
						// console.log(" mj.tingwinlist: " + mj.tingWinList(true,cds,false).length + " " + winList.length + " " + mj.tingWinList(true,cds,false).sort().toString() + " " +winList.sort().toString() );
						if(mj.tingWinList(true,cds,false).length==winList.length&&(mj.tingWinList(true,cds,false).sort().toString()==winList.sort().toString()))
						{// 不影响，不处理
							console.log("== 不影响,可开杠 ==");
						}
						else
						{
							rtn.splice(rtn.indexOf(rtn[i]),1);
						}
					}
					console.log("=== 判断完 rtn: " + rtn);
				}
			}
			else
			{
				rtn = leftCard > 0 ? mj.canGang1(pl.mjpeng, pl.mjhand, pl.mjpeng4) : [];
			}
			if (rtn.length > 0)
			{
				jsclient.gangCards = rtn;
				if (jsclient.gangCards == 1)
				{
					eat.gang0.bgground.visible = true;
					eat.gang0.card1._node.visible = true;
					setCardPic(eat.gang0.card1._node, jsclient.gangCards[0], 0);
				}
				else
				{
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
			
			if (vnode.length > 0)
			{
				vnode.push(eat.guo._node);
			}
		}
	}
	else if (tData.tState == TableState.waitEat)
	{

		if (!IsMyTurn()) {
			var huType = mj.canHu(!tData.canHu7, pl.mjhand, tData.lastPut,
				tData.canHuWith258, tData.withZhong);
			if (huType > 0)
			{
				var canHu = false;
				if (((tData.putType == 0|| tData.putType == 4) && tData.canEatHu) /*|| tData.putType == 4*/)
				{
					canHu = true;
				}
				else if (tData.putType > 0 && tData.putType < 4)
				{
					if (tData.canEatHu)
					{
						if (tData.putType != 3 || huType == 13)
						{
							canHu = true;
						}
					}
					else
					{
						if (tData.putType != 3 || huType == 13)
						{
							canHu = true;
						}
					}

				}
				if (tData.playType == PlayType.ylMethod) {
					if (canHu&&pl.isTing&&ylCanNotEatWinList.indexOf(tData.lastPut)<0) {
						canHu = true;
					} else {
						canHu = false;
					}
				}
				if (canHu)
				{
					if(pl.skipHu) ShowSkipHu();
					else vnode.push(eat.hu._node);
				}
			}


			if ((tData.putType == 0 || tData.putType == 4))
			{
				if (tData.playType==PlayType.ylMethod&&pl.isTing){
					if(leftCard>0&&mj.canTingGang0(pl.mjhand, tData.lastPut))
					{
						var cds = pl.mjhand.slice();
						cds.splice(cds.indexOf(tData.lastPut), 1);
						cds.splice(cds.indexOf(tData.lastPut), 1);
						cds.splice(cds.indexOf(tData.lastPut), 1);
						if(winList.length==mj.tingWinList(true, cds, false).length)
						{
							if(winList.sort().toString()==mj.tingWinList(true,cds,false).sort().toString())
							{
								vnode.push(eat.gang0._node);
								jsclient.gangCards = [tData.lastPut];
								eat.gang0.bgground.visible = true;
								eat.gang0.card1._node.visible = true;
								setCardPic(eat.gang0.card1._node, jsclient.gangCards[0], 0);
							}
						}
					}
				} else {
					if (leftCard > 0 && mj.canGang0(pl.mjhand, tData.lastPut))
					{
						vnode.push(eat.gang0._node);
						jsclient.gangCards = [tData.lastPut];
						eat.gang0.bgground.visible = true;
						eat.gang0.card1._node.visible = true;
						setCardPic(eat.gang0.card1._node, jsclient.gangCards[0], 0);
						/*setCardPic(eat.gang0.card._node,tData.lastPut,4);
						 eat.gang0._node.tag=tData.lastPut;*/
					}
				}

				if (mj.canPeng(pl.mjhand, tData.lastPut))
				{
					if(tData.playType==PlayType.ylMethod&&pl.isTing)
					{

					}
					else
					{
						vnode.push(eat.peng._node);
					}
				}

				if (tData.canEat && tData.uids[(tData.curPlayer + 1) % 4] == SelfUid())
				{

					var eatpos = mj.canChi(pl.mjhand, tData.lastPut);


					jsclient.eatpos = eatpos;

					if (eatpos.length > 0)
					{
						vnode.push(eat.chi0._node);
					}
					/*if (jsclient.eatpos.length ==1)
					 {
					 eat.chi0.bgground._node.visible = true;
					 var card1 = eat.chi0.card1._node;
					 var card2 = eat.chi0.card2._node;
					 var card3 = eat.chi0.card3._node;
					 card1.visible =false;
					 card2.visible =false;
					 card3.visible =false;
					 if (jsclient.eatpos[0] == 0)
					 {
					 setCardPic(card1,tData.lastPut,0);
					 setCardPic(card2,tData.lastPut+1,0);
					 setCardPic(card3,tData.lastPut+2,0);
					 }else if(jsclient.eatpos[0] == 1)
					 {
					 setCardPic(card1,tData.lastPut-1,0);
					 setCardPic(card2,tData.lastPut,0);
					 setCardPic(card3,tData.lastPut+1,0);
					 }else if(jsclient.eatpos[0] == 2)
					 {
					 setCardPic(card1,tData.lastPut-2,0);
					 setCardPic(card2,tData.lastPut-1,0);
					 setCardPic(card3,tData.lastPut,0);
					 }
					 }else
					 {
					 eat.chi0.bgground._node.visible = false;
					 eat.chi0.card1._node.visible =false;
					 eat.chi0.card2._node.visible =false;
					 eat.chi0.card3._node.visible =false;
					 }*/
					/*var eatbtn=[eat.chi0._node,eat.chi1._node,eat.chi2._node];
					 for(var i=0;i<eatpos.length;i++)
					 {
					 vnode.push(eatbtn[i]);
					 eatbtn[i].tag=eatpos[i];
					 ShowMjChiCard(eatbtn[i],eatpos[i]);
					 }	*/
				}


			}


			if (vnode.length > 0)
			{
				vnode.push(eat.guo._node);
			}
			else
			{
				getUIPlayer(0).mjState = TableState.waitCard;
			}
		}
	}

	var btnImgs = {
		"peng": ["res/png/pghg/Z_peng.png", "res/png/pghg/Z_peng_light.png"],
		"gang0": ["res/png/pghg/Z_gang.png", "res/png/pghg/Z_gang_light.png"],
		"chi0": ["res/png/pghg/chi.png", "res/png/pghg/chi_light.png"],
	}

	for (var i = 0; i < vnode.length; i++)
	{
		vnode[i].visible = true;
		if (vnode[i].getChildByName("card1"))
		{
			vnode[i].getChildByName("card1").visible = false;
		}
		if (vnode[i].getChildByName("bgground"))
		{
			vnode[i].getChildByName("bgground").visible = false;
		}
		if (vnode[i].getChildByName("bgimg"))
		{
			vnode[i].getChildByName("bgimg").visible = true;
		}
		var btnName = vnode[i].name;


		if (btnName == "peng" || btnName == "chi0" || btnName == "gang0")
		{
			vnode[i].loadTextureNormal(btnImgs[btnName][0]);
			vnode[i].loadTexturePressed(btnImgs[btnName][0]);
		}

		if (i == 0)
		{

			var cardVal = 0;

			if (vnode[i].getChildByName("bgimg"))
			{
				vnode[i].getChildByName("bgimg").visible = false;
			}

			if (btnName == "peng" || btnName == "chi0" || btnName == "gang0")
			{
				vnode[i].loadTextureNormal(btnImgs[btnName][1]);
				vnode[i].loadTexturePressed(btnImgs[btnName][1]);
			}
			if (btnName == "peng")
			{
				cardVal = tData.lastPut;
			}
			else if (btnName == "chi0")
			{
				if (jsclient.eatpos.length == 1)
				{
					cardVal = tData.lastPut;
				}
			}
			else if (btnName == "gang0")
			{
				if (jsclient.gangCards.length == 1)
				{
					cardVal = jsclient.gangCards[0];
				}
			}
			else if (btnName == "hu")
			{
				if (IsMyTurn())
				{
					cardVal = pl.mjhand[pl.mjhand.length - 1];
				}
				else
				{
					cardVal = tData.lastPut;
				}
			}
			if (cardVal && cardVal > 0)
			{
				setCardPic(vnode[0].getChildByName("card1"), cardVal, 0);
				vnode[0].getChildByName("card1").visible = true;
			}
			vnode[0].getChildByName("bgground").zIndex = -1;
			if(vnode[0].name!="ting")
			vnode[0].getChildByName("bgground").visible = true;
			else {
				vnode[0].getChildByName("bgimg").visible=true;
				vnode[0].getChildByName("bgimg").zIndex=-1;
			}

		}
		doLayout(vnode[i], [0, 0.12], [0.5, 0], [(1 - vnode.length) / 2.0 + i * 1.7, 2.5], false, false);
	}
	if(vnode.length<=0&&tData.playType==PlayType.ylMethod&&pl.isTing&&tData.tState==TableState.waitPut&&pl.isNew)
	{
		autoOutOn=true;
		eatNode.runAction(cc.sequence(cc.delayTime(0.7), cc.callFunc(function () {//延迟，保证手牌初始化已完成
			AutoPutAwayCard(eatNode.getParent());
		})));
	}
}

function SetPlayerVisible(node, off)
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var pl = getUIPlayer(off);

	var head = node.getChildByName("head");
	var name = head.getChildByName("name");
	var moneybk = head.getChildByName("moneybk");
	var offline = head.getChildByName("offline");
	var coin = head.getChildByName("coin");
	var paonum = head.getChildByName("paonum");
	var tinglogo = head.getChildByName("tinglogo");
	if (pl)
	{
		name.visible = true;
		moneybk.visible = true;
		offline.visible = true;
		coin.visible = true;
		if (tData.playType==PlayType.xaMethod&&tData.withPao)
		{
			if (pl.mjState==TableState.doneDownPao||(pl.mjState>=3&&pl.mjState<=5&&pl.paoNum>0))
			{
				cc.log(" ==== " + JSON.stringify(pl));
				paonum.visible = true;
				paonum.zIndex = 800;
				resetPaoNumPic(paonum,pl.paoNum);
			}
		}
		else
		{
			paonum.visible = false;
		}
		if (tData.playType==PlayType.ylMethod) {
			if(pl.isTing) {
				tinglogo.visible=true;
				tinglogo.zIndex=99;
			}
		}
		jsclient.loadWxHead(pl.info.uid, pl.info.headimgurl);
		setOffline(node, off);
		InitPlayerHandUI(node, off);

		if (off==0 && tData.playType==PlayType.ylMethod && pl.isTing) {
			if(pl.canNotPutList.length <= pl.mjhand.length)
			{//
				var children = node.children;
				var canNotPutList = pl.canNotPutList.slice();
				for(var i=0; i < children.length; i++) {
					if (children[i].name == "mjhand"&&canNotPutList.indexOf(children[i].tag)>=0) {
						children[i].color = cc.color(150,150,150);
						children[i].enabled =false;
						canNotPutList.splice(canNotPutList.indexOf(children[i].tag),1);
					}
				}
			}
			if(winList.length!=pl.winList.length)
			{
				winList.splice(0,winList.length);
				winList=pl.winList.slice();
			}
		}
	}
	else
	{
		name.visible = false;
		moneybk.visible = false;
		offline.visible = false;
		coin.visible = false;
		// paonum.visible = false;
		var WxHead = head.getChildByName("WxHead");
		if (WxHead)
		{
			WxHead.removeFromParent(true);
		}
	}
}
function CheckInviteVisible()
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	if (TableState.waitJoin == tData.tState)
	{
		return Object.keys(sData.players).length < 4;
	}
	else
	{
		return false;
	}
}
function CheckDonePaoVisible() {
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var pl = getUIPlayer(0);
	return ((!tData.sxMethod) && ( pl.mjState == TableState.downPao ));
}
function CheckArrowVisible()
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;

	//mylog("CheckArrowVisible "+tData.tState);

	if (TableState.waitPut == tData.tState
		|| TableState.waitEat == tData.tState
		|| TableState.waitCard == tData.tState
	)
	{
		return true;
	}
	else
	{
		return false;
	}
}
function clearCardUI(node)
{
	// mylog("clearCardUI");
	var children = node.children;
	for (var i = 0; i < children.length; i++)
	{
		var ni = children[i];
		if (ni.getName() != "pengPlay" && ni.getName() != "gangPlay" && ni.getName() != "huPlay" && ni.getName() != "moreWinPlay" && ni.name != "head" && ni.name != "up" && ni.name != "down" && ni.name != "stand" && ni.name != "out0"
			&& ni.name != "out1" && ni.getName() != "ready" && ni.getName() != "pao" && ni.getName() != "tinglogo" && ni.getName() != "tingPlay" && ni.name != "down_out0" && ni.name != "down_out1")
		{
			ni.removeFromParent(true);
		}
	}
}
function HandleNewCard(node, msg, off)
{
	/*
	 *去除过期的newcard 标签
	 *
	 for (var i = 0; i < node.children.length; i++) {
	 if (node.children[i].isnewCard)
	 {
	 node.children[i].isnewCard = false;
	 }

	 }*/

	AddNewCard(node, "stand", "mjhand", msg, off);
	RestoreCardLayout(node, 0);
}
function HandleWaitPut(node, msg, off)
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
	if (tData.curPlayer == selfIndex)
	{
		AddNewCard(node, "stand", "standPri");
		RestoreCardLayout(node, off);
	}
}
function HandleMJChi(node, msg, off)
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
	if (tData.curPlayer == selfIndex)
	{
		var fromOff = [];
		var fromBind = GetUIBind(msg.from, fromOff);
		var fnode = fromBind._node;
		RemoveNewOutCard(fnode);

		var cds = msg.mjchi;
		for (var i = 0; i < cds.length; i++)
		{
			AddNewCard(node, "up", "chi", cds[i], off);
			if (off == 0 && cds[i] != tData.lastPut)
			{
				RemoveBackNode(node, "mjhand", 1, cds[i]);
			}
		}
		//删掉俩张stand
		if (off == 3)
		{
			RemoveBackNode(node, "standPri", 2);
		}
		else if (off != 0)
		{
			RemoveFrontNode(node, "standPri", 2);
		}
		RestoreCardLayout(node, off);
		RestoreCardLayout(fnode, fromOff[0]);
	}
}
function HandleMJPeng(node, msg, off)
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;

	if (tData.curPlayer == selfIndex)
	{
		var fromOff = [];
		var fromBind = GetUIBind(msg.from, fromOff);
		var fnode = fromBind._node;
		ShowEatActionAnim(node,ActionType.PENG,off);
		RemoveNewOutCard(fnode);


		for (var i = 0; i < 3; i++)
		{
			AddNewCard(node, "up", "peng", tData.lastPut, off);
		}
		//删掉俩张stand
		if (off == 0)
		{
			RemoveBackNode(node, "mjhand", 2, tData.lastPut);
		}
		else if (off == 3)
		{
			RemoveBackNode(node, "standPri", 2);
		}
		else
		{
			RemoveFrontNode(node, "standPri", 2);
		}
		RestoreCardLayout(node, off);
		RestoreCardLayout(fnode, fromOff[0]);
	}

}
function RemoveFrontNode(node, name, num, tag)
{
	var children = node.children;


	for (var i = 0; i < children.length && num > 0; i++)
	{
		var ci = children[i];

		if(ci.getName() == name && (!(tag > 0) || ci.tag == tag))
		{
			ci.removeFromParent(true);
			num--;
		}
		// if (ci.name == name && (!(tag > 0) || ci.tag == tag))
		// {
		// 	ci.removeFromParent(true);
		// 	num--;
		// }
	}

	// if (num != 0)
	// {
	// 	mylog(node.name + " RemoveFrontNode fail " + name + " " + tag);
	// }
	if (num != 0)
	{
		mylog(node.getName() + " RemoveFrontNode fail " + name + " " + tag);
	}
}


function RemoveNewOutCard(node)
{
	var children = node.children;
	for (var i = 0; i < children.length; i++)
	{
		var ci = children[i];
		if (ci.name == "newout")
		{
			ci.removeFromParent(true);
		}
	}
}
function RemoveBackNode(node, name, num, tag)
{

	var children = node.children;
	for (var i = children.length - 1; i >= 0 && num > 0; i--)
	{
		var ci = children[i];
		// if (ci.name == name && (!(tag > 0) || ci.tag == tag))
		// {
		// 	ci.removeFromParent(true);
		// 	num--;
		// }
		if (ci.getName() == name && (!(tag > 0) || ci.tag == tag))
		{
			ci.removeFromParent(true);
			num--;
		}
	}
	// if (num != 0)
	// {
	// {
	// 	mylog(node.name + " RemoveBackNode fail " + name + " " + tag);
	// }
	if (num != 0)
	{
		mylog(node.getName() + " RemoveBackNode fail " + name + " " + tag);
	}
}
function AddNewCard(node, copy, name, tag, off, specialTAG)
{
	var cpnode = node.getChildByName(copy);
	var cp = cpnode.clone();
	cp.visible = true;
	cp.name = name;
	if (specialTAG == "isgang4")
	{

		cp.isgang4 = true;
	}
	/*else if(specialTAG == "newCard")
	 {
	 cp.isnewCard = true;
	 }*/
	node.addChild(cp);
	if (tag > 0)
	{
		setCardPic(cp, tag, name == "mjhand" ? 4 : off);
		if (name == "mjhand")
		{
			SetCardTouchHandler(cpnode, cp);
		}
	}
	return cp;
}



function GetUIBind(uidPos, offStore)
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = uids.indexOf(SelfUid());
	var uiOff = (uidPos + 4 - selfIndex) % 4;
	if (offStore)
	{
		offStore.push(uiOff);
	}
	var jsBind = jsclient.playui.jsBind;
	var ui = [jsBind.down, jsBind.right, jsBind.top, jsBind.left];
	return ui[uiOff];
}


/*
*
* 处理自摸抓6张牌
*
*
* */
function HandleRandCards(eD,node)
{

	var winSizeWidth=cc.director.getWinSize().width;
	var winSizeHeight=cc.director.getWinSize().height;
	var singleCardWidth =winSizeWidth*(36/1280);
	var singleCardHeight =winSizeHeight*(30/720);



/*	var oSize =node.getChildByName("out1").getSize();
	var oSc = node.getChildByName("out1").scale;
	singleCardWidth = oSize.width * oSc ;
	singleCardHeight =  oSize.height * oSc ;*/

	var cpGroups =[];
	for(var x =0;x<6;x++) {

		var name;
		if(eD.off ==0) {
			name = "mjhand";
		}else {
			name ="oter";
		}
		//ar donwNode = node.getChildByName("down");

		var cpnode = node.getChildByName("out1");
		var cp = cpnode.clone();
		cp.visible = true;
		cp.name = name;


		// cp.setPosition(cc.p(cc.director.getWinSize().width/2+20*x,80));
		// this.addChild(cp);


		//cp.setPosition(cc.p(cc.director.getWinSize().width/2+20*x,80));

		if (eD.sixRandCard[x] > 0)
		{
			console.log("-------------------------------------eD.off = "+eD.off);
			setCardPic(cp, eD.sixRandCard[x], name == "mjhand" ? 4 : eD.off);
		}
		cpGroups.push(cp);
		//var bgNode =node.getChildByName("out1");
		/*if(x ==0)
		{
			node.addChild(cp);
			firstCp = cp;

		}else{
			cp.setPositionX(firstCp.getPositionX()+x*20);
			//cp.setPositionY(firstCp.getPositionY());
			firstCp.addChild(cp);
		}*/
		//cp.setPositionX(cp.getPositionX()+x*20);
		/*var bgNode =node.getChildByName("out1");
		bgNode.addChild(cp);*/

		if(eD.off ==0)
		{

			cp.setPosition(cc.p(cc.director.getWinSize().width/2+(x-2)*singleCardWidth,cc.director.getWinSize().height*3/12));

			cp.setLocalZOrder(cp.getLocalZOrder()+1000);
			console.log("*************(eD.off ==0");

		}else if(eD.off == 1)
		{
			console.log("*************(eD.off ==1");
			//cp.setPositionY(cp.getPositionY()+x*18);
			console.log("--------wei------------------------cc.director.getWinSize().width/2 ="+cc.director.getWinSize().width/2);
			cp.setPosition(cc.p(cc.director.getWinSize().width*3/4,cc.director.getWinSize().height/2+(x-2)*singleCardHeight));//1080

				cp.setLocalZOrder(-x+1000);
				console.log("///////////////////cp.zOrder ="+cp.getLocalZOrder());

		}else if(eD.off == 2)
		{
			cp.setPosition(cc.p(cc.director.getWinSize().width/2-(x-2)*singleCardWidth,cc.director.getWinSize().height*9/12));
			console.log("*************(eD.off ==2");
			cp.setLocalZOrder(cp.getLocalZOrder()+1000);
			//cp.setPositionX(cp.getPositionX()-x*20);
		}else if(eD.off == 3)
		{
			cp.setPosition(cc.p(cc.director.getWinSize().width*1/4,cc.director.getWinSize().height/2-(x-2)*singleCardHeight));//1080
			console.log("*************(eD.off ==3");
			cp.setLocalZOrder(cp.getLocalZOrder()+1000);
			//cp.setPositionY(cp.getPositionY()-x*18);
		}



		node.addChild(cp)//pl.mjput.length - (eD.off == 0 ? 0 : 1);


	}
//	cpGroups.setPosition(cc.p(cc.director.getWinSize().width/2,80));
	//node.addChild(cpGroups);
}



/**
 * added by bp
 * msg.gang = 3 暗杠
 * msg.gang = 2 补杠
 * msg.gang = 1 点杠
 */
function HandleMJGang(node, msg, off)
{
	// mylog("== HandleMJGang ==");
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
	if (uids[selfIndex] != msg.uid)
	{
		return;
	}
// mylog("== HandleMJGang ==" + off);

	if(off==0&&tData.playType==PlayType.ylMethod)
	{// yl canNotPutList maintain
		var pl = getUIPlayer(off)
		if (pl.isTing)
		{
			if(msg.gang == 1)
			{//点杠
				canNotPutList.splice(canNotPutList.indexOf(msg.card,1));
				canNotPutList.splice(canNotPutList.indexOf(msg.card,1));
				canNotPutList.splice(canNotPutList.indexOf(msg.card,1));
			}
			else if (msg.gang == 2)
			{//补杠
				canNotPutList.splice(canNotPutList.indexOf(msg.card,1));
			}
			else if (msg.gang == 3)
			{//暗杠
				canNotPutList.splice(canNotPutList.indexOf(msg.card,1));
				canNotPutList.splice(canNotPutList.indexOf(msg.card,1));
				canNotPutList.splice(canNotPutList.indexOf(msg.card,1));
				canNotPutList.splice(canNotPutList.indexOf(msg.card,1));
			}
		}
	}

	ShowEatActionAnim(node, ActionType.GANG, off);
	if (msg.gang == 1)
	{
		var fromOff = [];
		var fromBind = GetUIBind(msg.from, fromOff);
		var fnode = fromBind._node;
		RemoveNewOutCard(fnode);
		if (off == 0)
		{
			RemoveBackNode(node, "mjhand", 3, msg.card);
		}
		RestoreCardLayout(fnode, fromOff[0]);
	}
	else if (msg.gang == 2)
	{
		RemoveBackNode(node, "peng", 3, msg.card);
		if (off == 0)
		{
			RemoveBackNode(node, "mjhand", 1, msg.card);
		}
	}
	else if (msg.gang == 3)
	{
		if (off == 0)
		{
			RemoveBackNode(node, "mjhand", 4, msg.card);
		}
	}
	if (off != 0)
	{
		if (off == 3)
		{
			if (msg.gang == 1)
			{
				var fromOff = [];
				var fromBind = GetUIBind(msg.from, fromOff);
				var fnode = fromBind._node;
				RemoveNewOutCard(fnode);
				RemoveBackNode(node, "standPri", 3);
			}
			else if (msg.gang == 2)
			{
				RemoveBackNode(node, "peng", 3, msg.card);
				RemoveBackNode(node, "standPri", 1);
			}
			else if (msg.gang == 3)
			{
				RemoveBackNode(node, "standPri", 4);
			}

		}
		else
		{
			if (msg.gang == 1)
			{
				var fromOff = [];
				var fromBind = GetUIBind(msg.from, fromOff);
				var fnode = fromBind._node;
				RemoveNewOutCard(fnode);
				RemoveFrontNode(node, "standPri", 3);
			}
			else if (msg.gang == 2)
			{
				RemoveFrontNode(node, "peng", 3, msg.card);
				RemoveFrontNode(node, "standPri", 1);
			}
			else if (msg.gang == 3)
			{
				RemoveFrontNode(node, "standPri", 4);
			}

		}
	}

	for (var i = 0; i < 4; i++)
	{
		if (msg.gang == 3)
		{
			if (i == 3)
			{
				var card = AddNewCard(node, "down", "gang1", 0, off, "isgang4").tag = msg.card;
			}
			else
			{
				AddNewCard(node, "up", "gang1", msg.card, off);
			}

		}
		else if ( msg.gang == 1 )
		{
			if (i == 3)
			{
				AddNewCard(node, "up", "gang0", msg.card, off, "isgang4").tag = msg.card;
			}
			else
			{
				AddNewCard(node, "up", "gang0", msg.card, off);
				// node.children.count
			}

		}
		else if ( msg.gang == 2 )
		{
			if (i == 3)
			{
				AddNewCard(node, "up", "gang2", msg.card, off, "isgang4").tag = msg.card;
			}
			else
			{
				AddNewCard(node, "up", "gang2", msg.card, off);
			}

		}

	}

	RestoreCardLayout(node, off);
}
function TagOrder(na, nb)
{
	return na.tag - nb.tag
}

function RestoreCardLayout(node, off, endonepl)
{
	var newC = null;
	var newVal = 0;
	var pl;
	if (endonepl)
	{
		pl = endonepl;
	}
	else
	{
		pl = getUIPlayer(off);
	}
	var mjhandNum = 0;
	var children = node.children;

	for (var i = 0; i < children.length; i++)
	{

		var ci = children[i];
		if (ci.name == "mjhand")
		{
			mjhandNum++;
		}
	}
	if (pl.mjhand && pl.mjhand.length > 0)
	{
		var count = jsclient.majiang.CardCount(pl);
		if (count == 14 && mjhandNum == pl.mjhand.length)
		{
			if (pl.isNew || endonepl)
			{
				newVal = pl.mjhand[pl.mjhand.length - 1];
			}
			else
			{
				newVal = Math.max.apply(null, pl.mjhand);
			}
			cc.log(" newVal " + newVal + endonepl + pl.isNew);
		}
	}


	var up = node.getChildByName("up");
	var stand = node.getChildByName("stand");
	var start, offui;
	switch (off)
	{
		case Playeroff.self_off:
			start = up;
			offui = stand;
			break;
		case Playeroff.right_off:
			start = stand;
			offui = up;
			break;
		case Playeroff.top_off:
			start = stand;
			offui = up;
			break;
		case Playeroff.left_off:
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
	var uigang2 = [];
	var uichi = [];
	var uistand = [];

	for (var i = 0; i < children.length; i++)
	{
		var ci = children[i];
		if (ci.name == "mjhand")
		{
			if (newC == null && newVal == ci.tag)
			{
				if(pl.isTing&&i==(children.length-1)||!pl.isTing)
				newC = ci;
				else
					uistand.push(ci);
			}
			else
			{
				uistand.push(ci);
			}
		}
		else if (ci.name == "standPri")
		{
			uistand.push(ci);
		}
		else if (ci.name == "gang0")
		{
			uigang0.push(ci);
		}
		else if (ci.name == "gang1")
		{
			uigang1.push(ci);
		}
		else if (ci.name == "gang2")
		{
			uigang2.push(ci);
		}
		else if (ci.name == "chi")
		{
			uichi.push(ci);
		}
		else if (ci.name == "peng")
		{
			uipeng.push(ci);
		}
		/*
		 **去掉旧牌的特殊标签
		 */
	}
	uipeng.sort(TagOrder);
	uigang0.sort(TagOrder);
	uigang1.sort(TagOrder);
	uigang2.sort(TagOrder);
	uichi.sort(TagOrder);
	uistand.sort(TagOrder);

	if (newC)
	{
		uistand.push(newC);

	}
	var uiOrder = [uigang1, uigang2, uigang0, uipeng, uichi, uistand];
	if (off == Playeroff.right_off || off == Playeroff.top_off)
	{
		uiOrder.reverse();
	}
	var orders = [];
	for (var j = 0; j < uiOrder.length; j++)
	{
		var uis = uiOrder[j];
		for (var i = 0; i < uis.length; i++)
		{
			orders.push(uis[i]);
		}
	}
	var slotwith = upSize.width * upS * 0.3;
	var slotheigt = upSize.height * upS * 0.3;
	for (var i = 0; i < orders.length; i++)
	{
		var ci = orders[i];
		// 上下麻将位置
		if (off % 2 == 0)
		{
			//i ,表示：uigang1, uigang2, uigang0, uipeng, uichi, uistand
			if (i != 0)
			{
				if (ci.name == orders[i - 1].name)
				{

					if (ci.isgang4)
					{

						ci.x = orders[i - 2].x;
						ci.y = orders[i - 2].y + upSize.height * upS * 0.3;
					}
					else if (orders[i - 1].isgang4)
					{
						ci.x = orders[i - 1].x + upSize.width * upS * 2;
					}
					else
					{
						//当前玩家手牌
						ci.x = orders[i - 1].x + upSize.width * upS *0.95;
					}
				}
				else if (orders[i - 1].name == "gang0")
				{
					ci.x = orders[i - 2].x + upSize.width * upS + slotwith;
				}
				else if (orders[i - 1].name == "gang1")
				{
					ci.x = orders[i - 2].x + upSize.width * upS + slotwith;
				}
				else if (orders[i-1].name == "gang2")
				{
					ci.x = orders[i - 2].x + upSize.width * upS + slotwith;
				}
				else
				{
					ci.x = orders[i - 1].x + upSize.width * upS + slotwith;
				}

				/*
				 判断是不是新抓的牌 ，  这里是新抓的牌
				 */
				if (off == Playeroff.self_off)
				{

					if (i == orders.length - 1)
					{


						if (newC && endonepl)
						{
							ci.x = ci.x + slotwith;
						}
						else if (newC)
						{
							ci.x = ci.x + slotwith;
							ci.y += 20;
						}
					}
				}
			}
			else
			{
				///uigang1的牌
				ci.x = start.x + upSize.width * upS;
			}
		}
		else
		{
			///左右麻将修改
			if (i != 0)
			{
				if (ci.name == orders[i - 1].name)
				{
					if (ci.isgang4)
					{

						ci.y = orders[i - 2].y + slotheigt;
					}
					else if (orders[i - 1].isgang4)
					{
						ci.y = orders[i - 2].y - upSize.height * upS * 0.7;
					}
					else
					{
						if (off ==  Playeroff.right_off){//第二个玩家 右手边玩家手牌的距离需要变大
							ci.y = orders[i - 1].y - upSize.height * upS * 0.85;
						}else{
							ci.y = orders[i - 1].y - upSize.height * upS * 0.7;
						}

					}

				}
				else if (orders[i - 1].name == "standPri")
				{
					ci.y = orders[i - 1].y - upSize.height * upS * 2;
				}
				else if (orders[i - 1].name == "gang0")
				{
					ci.y = orders[i - 2].y - upSize.height * upS * 0.7 - slotheigt;
				}
				else if (orders[i - 1].name == "gang1")
				{
					ci.y = orders[i - 2].y - upSize.height * upS * 0.7 - slotheigt;
				}
				else if (orders[i-1].name == "gang2")
				{
					ci.y = orders[i - 2].y - upSize.height * upS * 0.7 - slotheigt;
				}
				else
				{
					ci.y = orders[i - 1].y - upSize.height * upS * 0.7 - slotheigt;
				}


			}
			else
			{
				ci.y = start.y - upSize.height * upS * 0.7;
			}

			//左边玩家
			if (off == Playeroff.left_off)
			{
				if (!ci.isgang4)
				{
					ci.zIndex = i;
				}
				else
				{
					ci.zIndex = 200;
				}

			}

			///右边玩家
			if (off == Playeroff.right_off)
			{
				if (!ci.isgang4)
				{
					ci.zIndex = i;
				}
				else
				{
					ci.zIndex = 200;
				}

			}
		}

	}
}
function initPaoNum(node, eD, off) {
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;

	if ( selfIndex == uids.indexOf(eD.uid) && eD.paoNum > 0 )
	{
		node.visible = true
		node.zIndex = 800;
		resetPaoNumPic(node,eD.paoNum);
	}
}
function initTingLogo(node, eD, off) {
	if (!eD.tingClicked) {return;}

	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
	if (tData.playType == PlayType.ylMethod && selfIndex == uids.indexOf(eD.uid)) {
		node.visible = true;
		node.zIndex=99;
		ShowEatActionAnim(node.getParent().getParent(), ActionType.TING, off);
	}
}
function resetPaoNumPic(node, num) {
	if ( num == 1 )
		node.setTexture("res/playing/other/jiaobiao1.png");
	else if ( num == 2 )
		node.setTexture("res/playing/other/jiaobiao2.png");
	else if ( num == 3 )
		node.setTexture("res/playing/other/jiaobiao3.png");
	else if ( num == 4 )
		node.setTexture("res/playing/other/jiaobiao4.png");
	else
		cc.log(" DownPao Error num = " + num);
}
function HandleMJPut(node, msg, off, outNum)
{
	console.log("------------off = "+off);
	console.log("------------outNum = "+outNum);
	console.log("------------msg = "+msg);

	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = (uids.indexOf(SelfUid()) + off) % 4;
	if (uids[selfIndex] == msg.uid)
	{
		var pl = sData.players[msg.uid];
		var putnum = outNum >= 0 ? outNum : (pl.mjput.length - (off == 0 ? 0 : 1));
		var out0 = node.getChildByName("out0");
		var out1 = node.getChildByName("out1");
		// added by hlq
		var down_out0 = node.getChildByName("down_out0");
		var down_out1 = node.getChildByName("down_out1");
		var oSize = out0.getSize();
		var oSc = out0.scale;

		var out;
		if (putnum > 11)
		{
			if(msg.card>100) {
				// console.log("=== 听牌 ===");
				out = down_out1.clone();
			} else {
				out = out1.clone();
			}
		}
		else
		{
			if (msg.card>100) {
				// console.log("=== 听牌 out = down_out0 ===");
				out = down_out0.clone();
			} else {
				out = out0.clone();
			}
		}
		if (off == 0 && putnum > 11)
		{
			node.addChild(out);
		}
		else if (off == 1 || off == 0)
		{
			node.addChild(out, 200 - putnum);
		}
		else if (off == 2 || off == 3)
		{
			node.addChild(out, putnum);
		}
		else
		{
			node.addChild(out);
		}
		for (var i = 0; i < node.children.length; i++)
		{
			if (node.children[i].name == "newout")
			{
				node.children[i].name = "out";
			}
		}
		out.visible = true;
		out.name = "out";

		setCardPic(out, msg.card, off);
		var endPoint = cc.p(0, 0);
		var Midpoint = cc.p(0, 0);
		var ws = cc.director.getWinSize();
		console.log("--------------------ws = "+ws.width);
		if (putnum > 11)
		{
			if(off ==0){
				out.x = out1.x;
				out.y = out1.y+ws.width/128;
			}else if(off ==1){
				out.x = out1.x+ ws.width/800;
				out.y = out1.y;
			}else if(off ==2){
				out.x = out1.x;
				out.y = out1.y-ws.height/70;
			}else{
				out.x = out1.x;
				out.y = out1.y;
			}

			putnum -= 12;
		}

		if (off == 0)
		{

			//endPoint.y = out.y-50;
			endPoint.y = out.y-ws.width/25.6;
			endPoint.x = out.x + oSize.width * oSc * putnum;
			Midpoint.x = ws.width / 2;
			Midpoint.y = ws.height / 4;
			if (!(outNum >= 0)) {
				RemoveBackNode(node, "mjhand", 1, msg.card);
			}

			/*if (!(outNum >= 0))
			{
				if(msg.card>100)
				{
					RemoveBackNode(node, "mjhand", 1, msg.card-100);
				}
				else
				{
					RemoveBackNode(node, "mjhand", 1, msg.card);
				}
			}*/
		}
		else if (off == 1)
		{
			if (!(outNum >= 0))
			{
				RemoveFrontNode(node, "standPri", 1);
			}
			endPoint.y = out.y + oSize.height * oSc * putnum*0.75 ;
			endPoint.x = out.x+ws.height/28.8;
			Midpoint.x = ws.width / 4 * 3;
			Midpoint.y = ws.height / 2;
			out.zIndex = 100 - putnum;
		}
		else if (off == 2)
		{
			if (!(outNum >= 0))
			{
				RemoveFrontNode(node, "standPri", 1);
			}
				endPoint.x = out.x - oSize.width * oSc * putnum;
				endPoint.y = out.y+ws.width/24;
			Midpoint.x = ws.width / 2;
			Midpoint.y = ws.height / 4 * 3;
		}
		else if (off == 3)
		{
			if (!(outNum >= 0))
			{
				RemoveBackNode(node, "standPri", 1);
			}
			endPoint.y = out.y - oSize.height * oSc * putnum *0.75;
			endPoint.x = out.x-ws.width/71.1;
			Midpoint.x = ws.width / 4;
			Midpoint.y = ws.height / 2;
			out.zIndex = putnum;
		}


		if (outNum >= 0)//重连
		{
			if ((outNum == pl.mjput.length - 1) && tData.curPlayer == selfIndex && tData.tState == TableState.waitEat)
			{
			}
			else
			{
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

		var outAction  = node.getParent().getChildByName("top").getChildByName("out0").clone();

		outAction.name = "outAction";
		outAction.visible = true;
		node.addChild(outAction);

		out.x = Midpoint.x
		out.y = Midpoint.y

		out.scale = 2 * oSc;

		out.name = "newout";

		///设置纹理，mode：麻将容器，cd : 牌数据 ， off: 位置，
		setCardPic(outAction, msg.card, 0);

		outAction.scale = oSc;


		outAction.zIndex = 200
		if (off == 0 && jsclient.lastPutPos)
		{
			outAction.x = jsclient.lastPutPos.x;
			outAction.y = jsclient.lastPutPos.y;
		}
		else
		{
			outAction.x = node.getChildByName("stand").x;
			outAction.y = node.getChildByName("stand").y;
		}

		/**
		 设置出牌动画的方向
		 */

		var callbackFUNC = function ()
		{
			out.zIndex = zoder;

		};
		var callbackFUNCROTATION = function ()
		{
			out.visible = true;
			out.runAction(
				cc.sequence(cc.spawn(cc.moveTo(0.2, endPoint), cc.scaleTo(0.2, oSc)), cc.callFunc(callbackFUNC)));

		};
		outAction.runAction(cc.sequence(cc.spawn(cc.moveTo(0.2, Midpoint), cc.scaleTo(0.2, 2 * oSc))
			//cc.DelayTime(0.4),cc.callFunc(callbackFUNCROTATION),cc.removeSelf()
			)
		);

		function RemovePutCard(onlySelf)
		{
			var delayNum = 0.4 - (Date.now() - putTime) / 1000;
			if (delayNum < 0)
			{
				delayNum = 0;
			}
			if (!onlySelf)
			{
				outAction.runAction(
					cc.sequence(cc.DelayTime(delayNum), cc.callFunc(callbackFUNCROTATION), cc.removeSelf()));
			}
			else
			{
				outAction.runAction(cc.sequence(cc.DelayTime(delayNum), cc.removeSelf()));
			}
		}

		var putTime = Date.now();
		var outActionBind = {
			_event: {
				waitPut: function ()
				{
					RemovePutCard(false)
				}
				, MJChi: function ()
				{
					RemovePutCard(true)
				}
				, MJPeng: function ()
				{
					RemovePutCard(true)
				}
				, MJGang: function ()
				{
					RemovePutCard(true)
				}
				, roundEnd: function ()
				{
					RemovePutCard(true)
				}
			}
		}
		ConnectUI2Logic(outAction, outActionBind);

		if (!(outNum >= 0))
		{
			RestoreCardLayout(node, off);
		}
	}
}


//东南西北中发白
var imgNames = ["Bamboo_", "Character_", "Dot_", "Wind_east", "Wind_south", "Wind_west", "Wind_north", "Red", "Green", "White1"];
var offSets = [[50, 90], [60, 70], [50, 90], [60, 70], [48, 62]]
function setCardPic(node, cd, off) {
	console.log("----------setCardPic ------off = "+off);
	console.log("----------setCardPic ------cd = "+cd);

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
		if (cd == 91 )//&& (jsclient.gameType == jsclient.GAME_TYPE.HANG_ZHOU || jsclient.gameType == jsclient.GAME_TYPE.TAI_ZHOU)
		 {
		 imgName = "White";
		 }
		 else
		 {
		 imgName = imgNames[Math.floor(cd / 10)];//东西南北中发白
		 }
		//imgName = imgNames[Math.floor(cd / 10)];//东西南北中发白

	}
	// cc.log(path + imgName + ".png    off = " + off);
	node.tag = cd;
	var callback = function() {
		img.loadTexture(path + imgName + ".png");

	};
	node.stopAllActions();
	node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callback), cc.delayTime(1))));

}
/*function setCardPic(node, cd, off)
{
	console.log("------------*--------setCardPic------------*----------");
	console.log("-------node = "+node);
	console.log("-------cd = "+cd);
	console.log("-------off = "+off);
	if(off==0&&node.name=="outAction"&&cd>100)
	{
		console.log("== newout off(0) cd:" + cd);
		cd-=100;
	}
	var imgName = "";
	if (cd < 30)
	{
		imgName = imgOff[off] + imgNames[Math.floor(cd / 10)] + cd % 10;
		console.log("3-------imgName = "+imgName);
	}
	else
	{
		if(cd>100) {
			// 听牌暗牌
			if(off==0&&node.name=="out")
			{// 加水印
				var carNum = cd-100;
				if(carNum>=11&&carNum<=19)
				{
					carNum+=10;
				}
				else if (carNum>=21&&carNum<=29)
				{
					carNum-=10;
				}
				imgName = "mj_" + carNum + ".png";
				console.log("1-------imgName = "+imgName);
				node.getChildByName("cardContent").loadTexture(imgName, ccui.Widget.PLIST_TEXTURE);
				node.getChildByName("cardContent").setOpacity(110);
			}
		}
		else
		{
			imgName = imgOff[off] + imgNames[Math.floor(cd / 10)];
			console.log("2-------imgName = "+imgName);
		}
	}
	node.tag = cd;
	var callback = function ()
	{
		if(cd<100) {
			node.loadTexture(imgName + ".png", ccui.Widget.PLIST_TEXTURE);
		}
	};
	node.stopAllActions();
	node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callback), cc.delayTime(1))));

}*/
function SetArrowRotation(abk)
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = uids.indexOf(SelfUid());
	selfIndex = (tData.curPlayer + 4 - selfIndex) % 4;
	abk.getChildByName("arrow").rotation = 270 - 90 * selfIndex;
}


function SetCardTouchHandler(standUI, cardui)
{
	///zys 添加新的监听方式
	// cc.eventManager.addListener(getCardTouchListener(), cardui);

	///可注释
	cardui.addTouchEventListener(function (btn, tp)
	{
		if (tp != 2)
		{
			return;
		}
		var sData = jsclient.data.sData;
		var tData = sData.tData;
		if (!IsMyTurn() || tData.tState != TableState.waitPut)
		{
			mylog("not my turn");
			return;
		}
		// mylog(btn.y+" "+standUI.y);
		if (btn.y >= standUI.y + 10)
		{
			if(tData.playType==PlayType.ylMethod)
			{
				var pl = getUIPlayer(0);
				if(pl.isTing)
				{
					if(autoOutOn)
					{
						jsclient.playui.jsBind.eat._node.stopAllActions();
						autoOutOn=false;
					}
				}
			}
			PutAwayCard(cardui, cardui.tag);
		}
		else
		{
			var mjhandNum = 0;
			var children = btn.getParent().children;
			for (var i = 0; i < children.length; i++)
			{
				if (children[i].name == "mjhand")
				{
					mjhandNum++;
					if (children[i].y > standUI.y + 10)
					{
						children[i].y = standUI.y;
					}
				}
			}
			if (mjhandNum == getUIPlayer(0).mjhand.length)
			{
				btn.y = standUI.y + 20;
			}
		}

	}, cardui);
}

/*
 new put card type.
 * */
/*function getDwonTouchListener(downNode)
{
	console.log("--*-*-*-*----");
	// ///起始位置
	var oldPos;
	var startPos;
	var isStartMove = false;
	var children;
	var touchCard;
	var originPos;

	var sData = jsclient.data.sData;
	var tData = sData.tData;
	if (!IsMyTurn() || tData.tState != TableState.waitPut)
	{
		mylog("not my turn");
		return;
	}
	return {
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		swallowTouches: false,
		status: null,
		onTouchBegan: function (touch, event)
		{
			children = downNode.children;
			var target = event.getCurrentTarget();
			startPos = target.getParent().convertTouchToNodeSpace(touch);   // 世界坐标转换 (子节点相对于父节点的位置)
			console.log("onT***** startPos.x = " , startPos.x , ",startPos.y = " , startPos.y);
			for (var i = 0; i < children.length; i++) {
				var ci = children[i];
				if (ci.name == "mjhand") {

					var rect = ci.getBoundingBox();
					if (cc.rectContainsPoint(rect, startPos))
					{
						console.log("触摸----------------  : ",ci.tag);
						touchCard = ci;
						originPos.x =ci.x;
						originPos.y = ci.y;
						return true;
					}
				}
			}
			return false;
		}, onTouchMoved: function (touch, event)
		{
			var target = event.getCurrentTarget();
			var pos = target.getParent().convertTouchToNodeSpace(touch);   // 世界坐标转换 (子节点相对于父节点的位置)

			var distance = pos.y - startPos.y;
			if( distance > 0 ) {
				isStartMove = true;
			}else{
				isStartMove = false;
			}
			touchCard.x = pos.x;
			touchCard.y = pos.y;

			return true;
		},
		onTouchEnded: function (touch, event)
		{
			console.log("isStartMove = " ,isStartMove);

			console.log("isStartMove = " ,isStartMove);
			if (isStartMove == false){
				var target = event.getCurrentTarget();
				touchCard.x = oldPos.x;
				touchCard.y = oldPos.y;
			}
			if(distance > 30){
				PutAwayCard(touchCard, touchCard.tag);
			}else{
				touchCard.x = originPos.x;
				touchCard.y = originPos.y;
			}
			return true;
		}, onTouchCancelled: function (touch, event)
		{

			console.log("isStartMove = " ,isStartMove);
			if (isStartMove == false){
				var target = event.getCurrentTarget();
				touchCard.x = oldPos.x;
				touchCard.y = oldPos.y;
			}

			return true;
		}
	};
}*/


////
//
// zys , 麻将牌，拖动方式打牌
//
///
/*function getCardTouchListener()
{
	// ///起始位置
	var oldPos;
	var startPos;
	var isStartMove = false;
	var index = 0;
	console.log("getCardTouchListener----------------   ");
	return {
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		swallowTouches: false,
		status: null,
		onTouchBegan: function (touch, event)
		{
			///判断是否该自己出手
			// var sData = jsclient.data.sData;
			// var tData = sData.tData;
			// if (!IsMyTurn() || tData.tState != TableState.waitPut)
			// {
			// 	mylog("not my turn");
			// 	return false;
			// }

			var target = event.getCurrentTarget();
			///原始位置
			oldPos = {x:target.x,y:target.y};
			startPos = target.getParent().convertTouchToNodeSpace(touch);   // 世界坐标转换 (子节点相对于父节点的位置)
			// 如果触碰起始地点在本区域中
			console.log("onTouchBegan********* startPos.x = " , startPos.x , ",startPos.y = " , startPos.y);

			var rect = target.getBoundingBox();
			console.log("onTouchBegan********* rect.x = " , rect.x , ",rect.y = " , rect.y , " , rect.width =" , rect.width, ", rect.height =" , rect.height);
			if (!cc.rectContainsPoint(target.getBoundingBox(), startPos))
			{
				console.log("没有触摸----------------  : ",target.name);
				return false;
			}else{
				console.log("******触摸----------------  : ",target.name);
			}
			return true;
		}, onTouchMoved: function (touch, event)
		{

			var target = event.getCurrentTarget();
			var pos = target.getParent().convertTouchToNodeSpace(touch);   // 世界坐标转换 (子节点相对于父节点的位置)

			var distance = pos.y - startPos.y;
			if( distance > 0 ) {
				isStartMove = true;
			}else{
				isStartMove = false;
			}
			target.x = pos.x;
			target.y = pos.y;
			return true;
		},
		onTouchEnded: function (touch, event)
		{
			console.log("isStartMove = " ,isStartMove);
			if (isStartMove == false){
				var target = event.getCurrentTarget();
				target.x = oldPos.x;
				target.y = oldPos.y;
			}
			return true;
		}, onTouchCancelled: function (touch, event)
		{
			console.log("isStartMove = " ,isStartMove);
			if (isStartMove == false){
				var target = event.getCurrentTarget();
				target.x = oldPos.x;
				target.y = oldPos.y;
			}
			return true;
		}
	};
}*/

function reConectHeadLayout(node)
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var down = node.getChildByName("down").getChildByName("head");
	var top = node.getChildByName("top").getChildByName("head");
	var left = node.getChildByName("left").getChildByName("head");
	var right = node.getChildByName("right").getChildByName("head");
	cc.log("reConectHeadLayout");
	var pl = getUIPlayer(0);

	if (tData.tState == TableState.waitJoin || tData.tState == TableState.roundFinish)
	{
		doLayout(down, [0.13, 0.13], [0.5, 0.5], [0, -1.9], false, false);
		doLayout(top, [0.13, 0.13], [0.5, 0.5], [0, 2.1], false, false);
		doLayout(left, [0.13, 0.13], [0.5, 0.5], [-4, 0.1], false, false);
		doLayout(right, [0.13, 0.13], [0.5, 0.5], [4, 0.1], false, false);


	}
	else
	{

		doLayout(down, [0.13, 0.13], [0, 0], [0.8, 2.5], false, false);
		doLayout(top, [0.13, 0.13], [0, 1], [2.6, -0.9], false, false);
		doLayout(left, [0.13, 0.13], [0, 0.5], [0.8, 0.5], false, false);
		doLayout(right, [0.13, 0.13], [1, 0.5], [-0.8, 0.5], false, false);

	}


}

function tableStartHeadPlayAction(node)
{
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
		doLayout(down, [0.13, 0.13], [0, 0], [0.8, 2.5], false, false);
		doLayout(top, [0.13, 0.13], [0, 1], [2.6, -0.9], false, false);
		doLayout(left, [0.13, 0.13], [0, 0.5], [0.8, 0.5], false, false);
		doLayout(right, [0.13, 0.13], [1, 0.5], [-0.8, 0.5], false, false);

		var downPoint = cc.p(down.x, down.y);
		var topPoint = cc.p(top.x, top.y);
		var rightPoint = cc.p(right.x, right.y);
		var leftPoint = cc.p(left.x, left.y);

		doLayout(down, [0.13, 0.13], [0.5, 0.5], [0, -1.9], false, false);
		doLayout(top, [0.13, 0.13], [0.5, 0.5], [0, 2.1], false, false);
		doLayout(left, [0.13, 0.13], [0.5, 0.5], [-4, 0.1], false, false);
		doLayout(right, [0.13, 0.13], [0.5, 0.5], [4, 0.1], false, false);
		down.runAction(cc.moveTo(0.5, downPoint));
		top.runAction(cc.moveTo(0.5, topPoint));
		left.runAction(cc.moveTo(0.5, leftPoint));
		right.runAction(cc.moveTo(0.5, rightPoint));
	}
}


function InitPlayerNameAndCoin(node, off)
{
	var pl = getUIPlayer(off);
	if (!pl)
	{
		return;
	}

    var tData = jsclient.data.sData.tData;
    var bind = {
        head: {
            name: {
                _text: function () {
                    return unescape(pl.info.nickname || pl.info.name);
                }
            }
            , coin: {
                _visible: true,
                _run: function () {
                    changeLabelAtals(this, tData.initCoin + pl.winall);

                },
                _event : {
                    changeCoin : function(msg){
                        changeLabelAtals(this, tData.initCoin + pl.winall);
                    }
                }

            }
        }
    }
    ConnectUI2Logic(node, bind);


}
function showCoinChange(text,msg,off){
    var uid = getPlayerUID(off);
    var score = msg.c_score[uid];
    if(score == 0){
        return;
    }
    var t = score > 0 ? "+" : "";
    text.visible = true;
    text.setString(t + score);
    text.stopAllActions();
    text.runAction(cc.sequence(cc.moveBy(2,cc.p(0,30)), cc.delayTime(1), cc.hide(),cc.callFunc(function(){
        text.y -= 30;
    })));
}
function InitPlayerHandUI(node, off) {
    var sData = jsclient.data.sData;
    var tData = sData.tData;
    var pl = getUIPlayer(off);

	InitPlayerNameAndCoin(node, off);
	if (tData.tState != TableState.waitPut
		&& tData.tState != TableState.waitEat
		&& tData.tState != TableState.waitCard)
	{
		return;
	}

	//添加碰
	for (var i = 0; i < pl.mjpeng.length; i++)
	{
		//AddNewCard(node,copy,name,tag,off)
		for (var j = 0; j < 3; j++)
		{
			AddNewCard(node, "up", "peng", pl.mjpeng[i], off);
		}
	}
	//添加明杠
	for (var i = 0; i < pl.mjgang0.length; i++)
	{

		for (var j = 0; j < 4; j++)
		{
			if (j == 3)
			{
				AddNewCard(node, "up", "gang0", pl.mjgang0[i], off, "isgang4").tag = pl.mjgang0[i];
			}
			else
			{
				AddNewCard(node, "up", "gang0", pl.mjgang0[i], off);
			}

		}
	}
	//添加暗杠
	for (var i = 0; i < pl.mjgang1.length; i++)
	{

		for (var j = 0; j < 4; j++)
		{

			if (j == 3)
			{
				AddNewCard(node, "down", "gang1", 0, off, "isgang4").tag = pl.mjgang1[i];
			}
			else
			{
				AddNewCard(node, "up", "gang1", pl.mjgang1[i], off);
			}


		}

	}
	// 添加补杠
	for (var i = 0; i < pl.mjgang2.length; i++)
	{

		for (var j = 0; j < 4; j++)
		{
			if (j == 3)
			{
				AddNewCard(node, "up", "gang2", pl.mjgang2[i], off, "isgang4").tag = pl.mjgang2[i];
			}
			else
			{
				AddNewCard(node, "up", "gang2", pl.mjgang2[i], off);
			}

		}
	}
	//添加吃
	for (var i = 0; i < pl.mjchi.length; i++)
	{

		AddNewCard(node, "up", "chi", pl.mjchi[i], off);
	}
	//添加打出的牌
	for (var i = 0; i < pl.mjput.length; i++)
	{
		var msg = {card: pl.mjput[i], uid: pl.info.uid};
		HandleMJPut(node, msg, off, i);


	}
	//添加手牌
	if (pl.mjhand)
	{
		for (var i = 0; i < pl.mjhand.length; i++)
		{

			AddNewCard(node, "stand", "mjhand", pl.mjhand[i], off);
		}
	}
	else
	{
		var CardCount = 0;
		if (
			tData.tState == TableState.waitPut && tData.uids[tData.curPlayer] == pl.info.uid
		//&&pl.mjState==TableState.waitPut
		)
		{
			CardCount = 14;
		}
		else
		{
			CardCount = 13;
		}
		var upCardCount = CardCount - ((pl.mjpeng.length + pl.mjgang0.length + pl.mjgang1.length) * 3
			+ pl.mjchi.length);
		for (var i = 0; i < upCardCount; i++)
		{
			AddNewCard(node, "stand", "standPri");
		}

	}
	RestoreCardLayout(node, off);

}
var playAramTimeID = null;
function updateArrowbkNumber(node)
{
	console.log("--------------------------------updateArrowbkNumber(node) node.setString(10); ");
	node.setString("10");
	var number = function ()
	{
		if (node.getString() == 0)
		{
			node.cleanup();
		}
		else
		{
			var number = node.getString() - 1
			if (number > 9)
			{
				node.setString(number);
			}
			else
			{
				node.setString("0" + number);
				var sData = jsclient.data.sData;
				var tData = sData.tData;
				var uids = tData.uids;
				if (uids[tData.curPlayer] == SelfUid())
				{
					if (number == 3)
					{

						playAramTimeID = playEffect("timeup_alarm");

					}
					else if (number == 0)
					{
						jsclient.native.NativeVibrato();
					}
				}

			}

		}
	};

	node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1.0), cc.callFunc(number, node))));
}

function getUIPlayer(off)
{
	var sData = jsclient.data.sData;
	if(!sData) return;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = uids.indexOf(SelfUid());
	selfIndex = (selfIndex + off) % 4;
	if (selfIndex < uids.length)
	{
		return sData.players[uids[selfIndex]];
	}
	return null;
}

function getIndexPlayer(uid)
{
	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var uids = tData.uids;
	var selfIndex = uids.indexOf(SelfUid());
	var targetIndex = uids.indexOf(uid);

	return (targetIndex - selfIndex + 4) % 4;
}


function getUIHead(off)
{
	var pl = getUIPlayer(off);
	if (!pl)
	{
		return {};
	}
	return {uid: pl.info.uid, url: pl.info.headimgurl};
}
function setWxHead(node, d, off)
{
	if (d.uid == getUIHead(off).uid)
	{
		var sp = new cc.Sprite(d.img);
		sp.setName("WxHead");
		node.addChild(sp);
		doLayout(sp, [0.68, 0.68], [0.5, 0.5], [-0.03, 0.03], false, true);
	}
}
function setOffline(node, off)
{
	var pl = getUIPlayer(off);
	if (!pl)
	{
		return;
	}
	node.getChildByName("head").getChildByName("offline").zIndex = 99;
	node.getChildByName("head").getChildByName("offline").visible = !pl.onLine;
}
function showPlayerInfo(off, node)
{
	var tData = jsclient.data.sData.tData;
	var pl = getUIPlayer(off);
	if (pl)
	{
		jsclient.showPlayerInfo(pl.info);
		mylog(tData.initCoin + " " + pl.winall);
	}
	return;

	//mylog(pl.mjState+"|"+pl.mjgang1+"|"+pl.mjgang0+"|"+pl.mjpeng+"|"+pl.mjhand);
	//mylog(pl.mjchi+"|"+pl.mjput);
	//mylog(tData.tState+" c "+tData.curPlayer+" e "+tData.canEatHu);


	var names = [];
	for (var i = 0; i < node.children.length; i++)
	{
		names.push(node.children[i].name + "|" + node.children[i].tag);
	}
	cc.log(names);

}

function showPlayerZhuangLogo(node, off)
{

	var sData = jsclient.data.sData;
	var tData = sData.tData;
	var pl = getUIPlayer(off);
	node.zIndex = 100;
	if (tData)
	{
		if (tData.uids[tData.zhuang] == pl.info.uid)
		{
			node.visible = true;
		}
		else
		{
			node.visible = false;
		}

	}
}

function updatePower(node)
{
	var callNative = jsclient.native.NativeBattery;
	node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callNative), cc.DelayTime(30))));
}

function updateWIFI(node)
{


	var callback = function ()
	{
		var ms = jsclient.reqPingPong / 1000.0;
		// cc.log("ms" + ms);
		if (ms < 0.3)
		{
			node.loadTexture("Z_wifi_1.png", ccui.Widget.PLIST_TEXTURE);
		}
		else if (ms < 0.6)
		{
			node.loadTexture("Z_wifi_2.png", ccui.Widget.PLIST_TEXTURE);
		}
		else if (ms < 1)
		{
			node.loadTexture("Z_wifi_3.png", ccui.Widget.PLIST_TEXTURE);
		}
		else
		{
			node.loadTexture("Z_wifi_4.png", ccui.Widget.PLIST_TEXTURE);
		}
	};

	node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callback), cc.DelayTime(5))));
}
function CheckDelRoomUI()
{
	var sData = jsclient.data.sData;
	if (sData.tData.delEnd != 0 && !jsclient.delroomui)
	{
		jsclient.Scene.addChild(new DelRoomLayer());
	}
	else if (sData.tData.delEnd == 0 && jsclient.delroomui)
	{
		jsclient.delroomui.removeFromParent(true);
		delete jsclient.delroomui;
	}
}
function CheckReadyVisible(node, off)
{
	if (off < 0)
	{
		node.visible = false;
		return false;
	}
	var p0 = getUIPlayer(off);
	var sData = jsclient.data.sData;
	var tData = sData.tData;

	if (p0 && p0.mjState == TableState.isReady && tData.tState != TableState.waitJoin)
	{
		node.visible = true;
	}
	else
	{
		node.visible = false;
	}
	return node.visible;
}

function MJChichange(tag)
{
//	jsclient.gangCards = [];
//	jsclient.eatpos = [];
// 	mylog("chi " + jsclient.eatpos.length);
// 	mylog(jsclient.eatpos);

	var eat = jsclient.playui.jsBind.eat;
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
	card1.visible = false;
	card2.visible = false;
	card3.visible = false;
	card4.visible = false;
	card5.visible = false;
	card6.visible = false;
	card7.visible = false;
	card8.visible = false;
	card9.visible = false;

	if (jsclient.eatpos.length == 1)
	{
		MJChi2Net(jsclient.eatpos[0]);

	}
	else
	{
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
		for (var i = 0; i < jsclient.eatpos.length; i++)
		{
			ShowMjChiCard(changeuibg._node, jsclient.eatpos[i]);
		}

	}
}

function MJGangchange(tag)
{
	var eat = jsclient.playui.jsBind.eat;
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
	card1.visible = false;
	card2.visible = false;
	card3.visible = false;
	card4.visible = false;
	card5.visible = false;
	card6.visible = false;
	card7.visible = false;
	card8.visible = false;
	card9.visible = false;
	cc.log("jsclient.gangCards.length" + jsclient.gangCards.length);
	if (jsclient.gangCards.length == 1)
	{

		MJGang2Net(jsclient.gangCards[0]);
	}
	else
	{
		eat.chi0._node.visible = false;
		eat.chi1._node.visible = false;
		eat.chi2._node.visible = false;
		eat.peng._node.visible = false;
		eat.gang0._node.visible = false;
		eat.gang1._node.visible = false;
		eat.gang2._node.visible = false;
		eat.hu._node.visible = false;
		eat.ting._node.visible = false;
		eat.guo._node.visible = false;
		changeuibg._node.visible = true;

		for (var i = 0; i < jsclient.gangCards.length; i++)
		{
			if (i == 0)
			{
				card9.visible = true;
				setCardPic(card9, jsclient.gangCards[i], 4);
			}
			else if (i == 1)
			{
				card7.visible = true;
				setCardPic(card7, jsclient.gangCards[i], 4);
			}
			else if (i == 2)
			{
				card5.visible = true;
				setCardPic(card5, jsclient.gangCards[i], 4);
			}
		}
	}
}

function MJCreateCardsecLayer(name)
{
	if (name == "gang")
	{

	}
	else if (name == "chi")
	{

	}
}

function emojiPlayAction(node, num)
{
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
	switch (num)
	{
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
	for (var i = 0; i < 15; i++)
	{
		var frame = cc.spriteFrameCache.getSpriteFrame(framename + i + ".png");

		if (frame)
		{
			imgSize = frame.getOriginalSize();
			arry.push(framename + i);
		}
	}
	//var animation = new cc.Animation(arry,0.3);
	//var animate = cc.animate(animation);
	var callback = function ()
	{

		if (arry.length == number)
		{
			number = 0;

		}
		cc.log("||" + arry[number] + ".png");
		node.loadTexture(arry[number] + ".png", ccui.Widget.PLIST_TEXTURE);
		number++;
		sumtime = sumtime + delaytime;
		if (sumtime > playtime)
		{
			node.cleanup();
			node.visible = false;
		}

	};
	node.cleanup();
	node.visible = true;
	node.setSize(imgSize);
	node.runAction(cc.repeatForever(cc.sequence(cc.callFunc(callback), cc.delayTime(delaytime))));

}


createAnimation = function (path, count, rect)
{
	var frames = [];
	var prefix = path;
	for (var temp_x = 0; temp_x < count; temp_x++)
	{
		var fileName = prefix + temp_x + ".png";
		var frame = new cc.SpriteFrame(fileName, rect);
		frames.push(frame);
	}
	var animation = new cc.Animation(frames, 0.25);
	var action = new cc.Animate(animation);
	return action;
};


function showchat(node, off, msg)
{
	var pl = getUIPlayer(off);
	var uid = msg.uid;
	var type = msg.type;
	var message = msg.msg;
	var num = msg.num;
	//mylog("uid"+uid+" type" +type +"message"+message+"||uid"+pl.info.uid);

	if (pl && msg.uid == pl.info.uid)
	{
		if (type == 0)
		{
			node.getParent().visible = true;
			node.setString(message);
			var callback = function ()
			{
				node.getParent().visible = false;
			};

			node.getParent().width = node.stringLength * node.fontSize + 72;
			node.runAction(cc.sequence(cc.delayTime(2.5), cc.callFunc(callback)));
		}
		else if (type == 1)
		{
			node.getParent().visible = true;
			node.setString(message);
			var callback = function ()
			{
				node.getParent().visible = false;
			};
			var musicnum = msg.num + 1;

			var one = node.getCustomSize().width / 20.0;
			node.getParent().width = node.stringLength * node.fontSize + 72;
			playEffect("fix_msg_" + musicnum);
			node.runAction(cc.sequence(cc.delayTime(2.5), cc.callFunc(callback)));
		}
		else if (type == 2)
		{
			var em_node = node.getParent().getParent().getChildByName("emoji");
			emojiPlayAction(em_node, msg.num);
		}
		else if (type == 3)
		{
			cc.audioEngine.pauseMusic();
			cc.audioEngine.setEffectsVolume(1);
			cc.audioEngine.unloadEffect(message);
			cc.audioEngine.playEffect(message);

			node.getParent().setVisible(true);
			node.setString(" ");
			node.getParent().width = node.stringLength * node.fontSize + 72;

			var voicebg = node.getParent().getChildByName("voicebg");
			voicebg.setVisible(true);

			var callback = function ()
			{
				node.getParent().setVisible(false);
				voicebg.setVisible(false);
				voicebg.stopAllActions();
				cc.audioEngine.resumeMusic();
			};

			if (!jsclient.data._tempRecordVoiceAnimate)
			{
				jsclient.data._tempRecordVoiceAnimate = createAnimation("res/animate/voice/", 4, cc.rect(0, 0, 23, 30));
				jsclient.data._tempRecordVoiceAnimate.retain();
			}

			voicebg.runAction(cc.repeatForever(jsclient.data._tempRecordVoiceAnimate));
			node.runAction(
				cc.sequence(cc.delayTime(Number(num / 1000) < 1 ? 1 : Number(num / 1000)), cc.callFunc(callback)));
		}
	}
}


/**
 * 初始化数据
 * */
function initVData()
{
	console.log("jsclient.remoteCfg" + jsclient.remoteCfg.voiceUrl);
	jsclient.data._tempMessage = null;
	jsclient.data._tempRecordVoiceAnimate = null;
	jsclient.data._JiaheTempTime = null;
}

function getTouchListener()
{
	return {
		event: cc.EventListener.TOUCH_ONE_BY_ONE,
		swallowTouches: false,
		status: null,
		onTouchBegan: function (touch, event)
		{
			console.log("在触摸东西");
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
			var target = event.getCurrentTarget();
			var pos = target.getParent().convertTouchToNodeSpace(touch);   // 世界坐标转换 (子节点相对于父节点的位置)
			// 如果触碰起始地点在本区域中
			if (!cc.rectContainsPoint(target.getBoundingBox(), pos))
			{
				if (this.status == 0)
				{
					return false;
				}
				this.status = 0;
				console.log("松开手指取消发送");
				sendEvent("runToCancelRecord");
				return true;
			}

			if (this.status == 1)
			{
				return false;
			}
			console.log("上滑取消发送");

			this.status = 1;
			sendEvent("runStartRecord");
			return true;
		},
		onTouchEnded: function (touch, event)
		{
			return true;
		}, onTouchCancelled: function (touch, event)
		{
			return true;
		}
	};
}

/**
 * 开始录音
 * */
function startRecord()
{
	jsclient.data._JiaheTempTime = new Date();
	cc.audioEngine.pauseMusic();
	jsclient.native.StartRecord(jsb.fileUtils.getWritablePath(), "recordFile" + SelfUid());
	sendEvent("runStartRecord");
}

/**
 * 结束录音
 * */
function endRecord()
{
	jsclient.data._JiaheTempTime = new Date().getTime() - jsclient.data._JiaheTempTime.getTime();
	jsclient.native.HelloOC(jsclient.data._JiaheTempTime);
	cc.audioEngine.resumeMusic();

	if (jsclient.data._JiaheTempTime > 1000)
	{
		jsclient.native.EndRecord("uploadRecord");
		sendEvent("runStopRecord");
	}
	else
	{
		jsclient.data._JiaheTempTime = 0;
		jsclient.native.EndRecord("cancelRecord");
		sendEvent("runShortRecord");
	}

}



/**
 * 取消录音
 * */
function cancelRecord()
{
	jsclient.data._JiaheTempTime = 0;
	cc.audioEngine.resumeMusic();
	jsclient.native.EndRecord("cancelRecord");
	sendEvent("runCancelRecord");
}



/**
 * 下载录音, 调用 播放函数
 * */
function downAndPlayVoice(uid, filePath)
{
	var index = getIndexPlayer(uid);
	console.log("index is downAndPlayVoice" + index);
	jsclient.native.DownLoadFile(jsb.fileUtils.getWritablePath(), index + ".mp3",
		jsclient.remoteCfg.voiceUrl + filePath, "playVoice");
}
var play_canHuWith258;
var play_canHu7;
var paly_hongzhong;
var play_withWind;
var play_fish_Num;
var PlayLayer = cc.Layer.extend({
	jsBind: {
		_event: {
			mjhand: function ()
			{
				var sData = jsclient.data.sData;
				var tData = sData.tData;
				if (tData.roundNum != tData.roundAll)
				{
					return;
				}
				var pls = sData.players;
				var ip2pl = {};
				for (var uid in pls)
				{
					var pi = pls[uid];
					var ip = pi.info.remoteIP;
					if (ip)
					{
						if (!ip2pl[ip])
						{
							ip2pl[ip] = [];
						}
						ip2pl[ip].push(unescape(pi.info.nickname || pi.info.name));
					}
				}
				var ipmsg = [];
				for (var ip in ip2pl)
				{
					var ips = ip2pl[ip];
					if (ips.length > 1)
					{
						ipmsg.push("玩家:" + ips + "\n为同一IP地址\n")
					}
				}
				if (ipmsg.length > 0)
				{
					ShowSameIP(ipmsg.join(""));
				}
				// mylog("ipmsg " + ipmsg.length);

			},
			game_on_hide: function ()
			{
				jsclient.tickGame(-1);
			}
			, game_on_show: function ()
			{
				jsclient.tickGame(1);
			}
			, LeaveGame: function ()   //解散房间
			{
				mylog("+++I'm leave+++");
				jsclient.playui.removeFromParent(true);
				delete jsclient.playui;
				playMusic("bgMain");
			},
			endRoom: function (msg)
			{
				if (msg.showEnd)
				{
					console.log("----------------endRoom!");
					this.addChild(new EndAllLayer());
				}
				else
				{
					jsclient.Scene.addChild(new EndRoomLayer());
				}
			},
			logout:function () {
				jsclient.playui.removeFromParent(true);
				delete jsclient.playui;
			},
			roundEnd: function (d)
			{/*
				console.log("-------------------------www----d.isZiMo = "+d.isZiMo);
					if(d.isZiMo)
					{
						var sData = jsclient.data.sData;
						var tData = sData.tData;
						var selfUid = SelfUid();

						var off = (tData.winners[0] + 4 -tData.uids.indexOf(selfUid))%4;
						//sendEvent("playHu", TableDir[off]);
						var obj={};
						obj.pos = TableDir[off];
						obj.zimo_ = d.isZiMo;
						obj.sixRandCard =d.sixRandomCards;
						sendEvent("playHu", obj);
						resetTingAndTingList(tData);
					}else{
						var sData = jsclient.data.sData;
						var tData = sData.tData;
						var selfUid = SelfUid();
						if ( tData.winners.length >= 2 )
						{
							for(var i = 0; i < tData.winners.length; i++)
							{
								var off = (tData.winners[i] + 4 -tData.uids.indexOf(selfUid))%4;
								sendEvent("playMoreWin", TableDir[off]);
							}
						}
						else if (tData.winners.length == 1 && !d.isZiMo)
						{
							console.log("**************(tData.winners.length == 1 && !d.isZiMo)*");

							var off = (tData.winners[0] + 4 -tData.uids.indexOf(selfUid))%4;
							console.log("off ="+off);
							sendEvent("playHu", TableDir[off]);
							//var obj = TableDir[off];
							//obj.zimo_ = d.isZiMo;
							//obj.sixRandCard =d.sixRandomCards;

							//sendEvent("playHu", obj);
						}
						else {
							sendEvent("playHuang");
						}
						resetTingAndTingList(tData);
					}*/

				console.log("------play.js roundEnd");
				var sData = jsclient.data.sData;
				var tData = sData.tData;
				var selfUid = SelfUid();
				var tempTime =0;
				if (jsclient.data.sData.tData.playType == PlayType.hsMethod){
					tempTime =2.5;
				}

				if ( tData.winners.length >= 2 )
				{
					for(var i = 0; i < tData.winners.length; i++)
					{
						var off = (tData.winners[i] + 4 -tData.uids.indexOf(selfUid))%4;
						sendEvent("playMoreWin", TableDir[off]);
					}
				}
				else if (tData.winners.length == 1 )
				{
					if(d.isZiMo)
					{
						console.log("------1");
						var off = (tData.winners[0] + 4 -tData.uids.indexOf(selfUid))%4;
						//sendEvent("playHu", TableDir[off]);
						var obj={};
						obj.pos = TableDir[off];
						obj.zimo_ = d.isZiMo;
						obj.sixRandCard =d.sixRandomCards;
						sendEvent("playHu", obj);
					}else {
						console.log("------2");

						var off = (tData.winners[0] + 4 -tData.uids.indexOf(selfUid))%4;
						console.log("-----off ="+off);
						var obj={};
						obj.pos = TableDir[off];
						sendEvent("playHu", obj);
					}

				}
				else {
					sendEvent("playHuang");
				}
				resetTingAndTingList(tData);



			}, roundEndUI: function (d) {

				console.log("7897897898789--------tb.tData.withSixCards = "+jsclient.data.sData.tData.withSixCards);
				var tempTime =0;
				if (jsclient.data.sData.tData.playType == PlayType.hsMethod && jsclient.data.sData.tData.withSixCards){
					tempTime =2.5;
				}

				function ziMoSixCards()
				{
					console.log("------------------------1");
					if (tData.roundNum <= 0)
					{
						console.log("------------------------2a");
						this.addChild(new EndOneLayer());
					}else{
						console.log("------------------------2b");
						this.addChild(new EndOneLayer());
					}


				}

				function endAllCallback()
				{
					console.log("***************endAllCallback");
					this.addChild(new EndAllLayer());
					//this.addChild(new EndOneLayer());
				}



				var sData = jsclient.data.sData;
				var tData = sData.tData;
				console.log("------------------------tData.roundNum = "+tData.roundNum);
				if (tData.roundNum <= 0)
				{
					console.log("------------------------4");
					//this.addChild(new EndAllLayer());
					console.log("------------------------tempTime = "+tempTime);

					if(jsclient.data.sData.tData.playType == PlayType.sxMethod){
						//this.addChild(new EndOneLayer());
					}

					if(d.zimo_ && (jsclient.data.sData.tData.playType == PlayType.hsMethod) && jsclient.data.sData.tData.withSixCards)
					{
						this.runAction(cc.sequence(cc.delayTime(tempTime),cc.callFunc(endAllCallback, this)));
						console.log("-----------------------hello ");
					}else{
						this.addChild(new EndAllLayer());
					}

				}
				if (tData.playType == PlayType.xaMethod && tData.withPao)
				{
					sendEvent("hidePaoNum");
				}
				else if (tData.playType==PlayType.ylMethod)
				{
					sendEvent("resetTingLogo");
				}

				if(d.zimo_ && (jsclient.data.sData.tData.playType == PlayType.hsMethod) && jsclient.data.sData.tData.withSixCards)
				{
					var sData = jsclient.data.sData;
					var tData = sData.tData;
					var selfUid = SelfUid();
					var off = (tData.winners[0] + 4 -tData.uids.indexOf(selfUid))%4;
					d.off = off;
					sendEvent("MJRandCards",d);//d.sixRandCard
					for(var h=0;h<6;h++)
					{
						console.log("---------------"+d.sixRandCard[h]);
						//jsclient.gamenet.request("pkroom.handler.tableMsg", {cmd: "MJRandCards"});
						//randomZiMoCards(d.sixRandCard[h],off);
						//AddNewCard(playui.node, "stand", "mjhand", d.sixRandCard[h], off);
					}
					this.runAction(cc.sequence(cc.delayTime(tempTime),cc.callFunc(ziMoSixCards, this)));
				}else{
					this.addChild(new EndOneLayer());
				}
			}, moveHead: function ()
			{
				tableStartHeadPlayAction(this);
			}, initSceneData: function ()
			{
				reConectHeadLayout(this);
				CheckDelRoomUI();
			}, onlinePlayer: function ()
			{
				reConectHeadLayout(this);
			}, DelRoom: CheckDelRoomUI
		}, roundnumImg: {
			_layout: [[0.1, 0.1], [0.5, 0.5], [1, 0]]
			, _event: {
				initSceneData: function (eD)
				{
					this.visible = CheckArrowVisible();
				}
				, mjhand: function (eD)
				{
					this.visible = CheckArrowVisible();
				}
				, onlinePlayer: function (eD)
				{
					this.visible = CheckArrowVisible();
				}
			}
			, roundnumAtlas: {
				_text: function ()
				{
					var sData = jsclient.data.sData;
					var tData = sData.tData;
					if (tData)
					{
						return tData.roundNum - 1;
					}
				}, _event: {
					mjhand: function ()
					{
						var sData = jsclient.data.sData;
						var tData = sData.tData;
						if (tData)
						{
							return this.setString(tData.roundNum-1);
						}
					}
				}
			}
		}, cardNumImg: {
			_layout: [[0.1, 0.1], [0.5, 0.5], [-1.1, 0]]
			, _event: {
				initSceneData: function (eD)
				{
					this.visible = CheckArrowVisible();
				}
				, mjhand: function (eD)
				{
					this.visible = CheckArrowVisible();
				}
				, onlinePlayer: function (eD)
				{
					this.visible = CheckArrowVisible();
				}
			}
			, cardnumAtlas: {
				_text: function ()
				{
					var sData = jsclient.data.sData;
					var tData = sData.tData;
					if (tData)
					{
						if(jsclient.data.sData.tData.playType == PlayType.sxMethod){
							var cardNum = (tData.withWind ? 136 : 108) - tData.cardNext
							return tData.withZhong?cardNum+4:cardNum;

						}else if(jsclient.data.sData.tData.playType == PlayType.hsMethod){
							console.log("划水  划水   划水");
							var cardNum = (tData.withWind ? 136 : 108) - tData.cardNext
							if(tData.withWind){
								return tData.withZhong?cardNum:cardNum;
							}else {
								return tData.withZhong?cardNum+4:cardNum;
							}
						}


					}
				}, _event: {
					waitPut: function ()
					{
						var sData = jsclient.data.sData;
						var tData = sData.tData;

						if (tData)
						{

							if(jsclient.data.sData.tData.playType == PlayType.sxMethod){

								var cardNum = (tData.withWind ? 136 : 108) - tData.cardNext;
								this.setString(tData.withZhong?cardNum+4:cardNum);

							}else if(jsclient.data.sData.tData.playType == PlayType.hsMethod){
								console.log("tdata.cardNext = "+tData.cardNext);
								var cardNum = (tData.withWind ? 136 : 108) - tData.cardNext;
								if(tData.withWind){
									this.setString(tData.withZhong?cardNum:cardNum);
								}else {
									this.setString(tData.withZhong?cardNum+4:cardNum);
								}

							}

						}
					}

				}
			}


			

				/*_text: function ()
				{
					var sData = jsclient.data.sData;
					var tData = sData.tData;
					if (tData)
					{
						var cardNum = (tData.withWind ? 136 : 108) - tData.cardNext;
						console.log("***-------1 cardNum = "+cardNum);
						/!*if(tData.withWind){
							console.log("------------change---cardNum ="+cardNum);
							return cardNum;
						}else{
							console.log("------------change---tData.withZhong?cardNum+4:cardNum ="+tData.withZhong?cardNum+4:cardNum);
							return tData.withZhong?cardNum+4:cardNum;
						}*!/



						if(jsclient.data.sData.tData.playType == PlayType.sxMethod){
							console.log("***------2 推倒户 = "+(tData.withZhong?cardNum+4:cardNum));
							return tData.withZhong?cardNum+4:cardNum;
						}else if(jsclient.data.sData.tData.playType == PlayType.hsMethod){
							console.log("***------3 划水 = tData.withWind) = "+tData.withWind);
							if(tData.withWind){
								console.log("***-------4 cardNum = "+cardNum);
								this.setString(cardNum);
							}else
							{
								console.log("***-------5 cardNum = "+(tData.withZhong?cardNum+4:cardNum));
								return tData.withZhong?cardNum+4:cardNum;
							}
						}
					}
				}, _event: {
					waitPut: function ()
					{
						var sData = jsclient.data.sData;
						var tData = sData.tData;

						if (tData)
						{
							var cardNum = (tData.withWind ? 136 : 108) - tData.cardNext;
							console.log("cardNum ="+cardNum);
							console.log("***--------6--------jsclient.data.sData.tData.playType ="+jsclient.data.sData.tData.playType);
							if(jsclient.data.sData.tData.playType == PlayType.sxMethod){
								console.log("cardNum ="+);
								console.log("***--------7--------tData.withZhong?cardNum+4:cardNum ="+(tData.withZhong?cardNum+4:cardNum));
								return tData.withZhong?cardNum+4:cardNum;
							}else if(jsclient.data.sData.tData.playType == PlayType.hsMethod){
								console.log("tsete122121212");
								if(tData.withWind){
									console.log("***---------8--------cardNum");
									console.log("***---------8--------cardNum ="+cardNum);
									this.setString(cardNum);
								}else
								{
									console.log("***---------9--------cardNum");
									console.log("***-----9--------tData.withZhong?cardNum+4:cardNum ="+(tData.withZhong?cardNum+4:cardNum));
									return tData.withZhong?cardNum+4:cardNum;
								}
							}
						}
					}

				}*/

		}

		, back: {
			back: {_layout: [[0, 1], [0.5, 0.5], [0, 0], true]},
			playType:{
				_layout:[[0.157,0],[0.5,0.6],[0,0]],
				_run:function () {
					if (jsclient.data.sData.tData.playType == PlayType.sxMethod){
						return;
					} else if (jsclient.data.sData.tData.playType == PlayType.xaMethod) {
						this.setTexture("res/playing/other/xianmj.png");
					} else if (jsclient.data.sData.tData.playType == PlayType.bjMethod) {
						this.setTexture("res/playing/other/baojimj.png");
					} else if (jsclient.data.sData.tData.playType == PlayType.ylMethod) {
						this.setTexture("res/playing/other/yulinmajiang.png");
					} else if (jsclient.data.sData.tData.playType == PlayType.hsMethod) {
						this.setTexture("res/playing/other/huashuimajiang.png");
					}

				}
			},
			clt: {
				_layout: [[0.17, 0.17], [0, 1], [0, 0]],
				play:{
					noCanEatHu:{
						_visible:function(){
							if (jsclient.data.sData.tData.playType==PlayType.sxMethod)
							{
								console.log("== 只炸不胡的显示 == "+(!jsclient.data.sData.tData.canEatHu));
								return (!jsclient.data.sData.tData.canEatHu);
							}
							else return false;
						}
					},
					canHuWith258:{
						_run:function(){ play_canHuWith258=this; },
						_visible:function(){
							if (jsclient.data.sData.tData.playType==PlayType.sxMethod) return jsclient.data.sData.tData.canHuWith258;
							else return false;
						}
					},
					canHu7:{
						_run:function(){
							if(!jsclient.data.sData.tData.canHuWith258){
								this.y = play_canHuWith258.y;
							}
							play_canHu7=this;
						},
						_visible:function(){
							if (jsclient.data.sData.tData.playType==PlayType.sxMethod){
								return (jsclient.data.sData.tData.noBigWin&&jsclient.data.sData.tData.canHu7);
							}else if(jsclient.data.sData.tData.playType==PlayType.hsMethod) {
								//console.log("$$$$$$$$$$-----------$$$$$$$$$--------$$$$$$$$-$--------$$$jsclient.data.sData.tData.hsMethod = "+jsclient.data.sData.tData.hsMethod);
								//console.log("$$$$$$$$$$-----------$$$$$$$$$--------$$$$$$$$-$--------$$$jsclient.data.sData.tData.hsMethod = "+jsclient.data.sData.tData.canHu7);
								return (jsclient.data.sData.tData.canHu7);//jsclient.data.sData.tData.hsMethod&&
							}else{
								return false;
							}
						}
					},
					canHu_hongzhong:{
						_run:function(){
							if((!play_canHuWith258.visible)&&(!play_canHu7.visible)){
								this.y = play_canHuWith258.y;
							}else if((play_canHuWith258.visible)&&(play_canHu7.visible)){

							}else{
								this.y = play_canHuWith258.y-22;
							}
							paly_hongzhong = this;
						},
						_visible:function(){
							if (jsclient.data.sData.tData.playType==PlayType.sxMethod){
								return jsclient.data.sData.tData.withZhong;
							} else if(jsclient.data.sData.tData.playType==PlayType.hsMethod) {
								//console.log("$$$$$$$$$$-----------$$$$$$$$$--------$$$$$$$$-$--------$$$jsclient.data.sData.tData.hsMethod = "+jsclient.data.sData.tData.hsMethod);
								//console.log("$$$$$$$$$$-----------$$$$$$$$$--------$$$$$$$$-$--------$$$jsclient.data.sData.tData.hsMethod = "+jsclient.data.sData.tData.canHu7);
								return (jsclient.data.sData.tData.withZhong);//jsclient.data.sData.tData.hsMethod&&
							}else{
								return false;
							}
						}
					},
					withWind:{
						_run:function(){
							if((!play_canHuWith258.visible)&&(!play_canHu7.visible)&&(!paly_hongzhong.visible)){
								this.y = play_canHuWith258.y;
							}else if((play_canHuWith258.visible)&&(play_canHu7.visible)&&(paly_hongzhong.visible)){
								//this.y = play_canHuWith258.y-22*3;
							}else{

								var x =0;
								if(play_canHuWith258.visible){
									x+=1;
								}
								if(play_canHu7.visible){
									console.log("play_canHu7"+x);
									x+=1;
								}
								if(jsclient.data.sData.tData.withZhong){
									x+=1;
								}
								if(x ==1){
									this.y = play_canHu7.y-22;
								}else if(x ==2){
									this.y = play_canHu7.y-22*2;
								}

							}
							play_withWind = this;
						},
						_visible:function(){
							if (jsclient.data.sData.tData.playType==PlayType.hsMethod) {
								return jsclient.data.sData.tData.withWind;
							}else{
								return false;
							}
						}
					},
					fish_Num:{
						_run:function(){
							play_fish_Num = this;
							if((!play_canHuWith258.visible)&&(!play_canHu7.visible)&&(!paly_hongzhong.visible)&&(!play_withWind.visible)){
								this.y = play_canHuWith258.y;
							}else if((play_canHuWith258.visible)&&(play_canHu7.visible)&&(paly_hongzhong.visible)&&(play_withWind.visible)){

							}else{

								var x =0;
								if(play_canHuWith258.visible){
									x+=1;
								}
								if(play_canHu7.visible){
									x+=1;
								}
								if(paly_hongzhong.visible){
									x+=1;
								}
								if(play_withWind.visible){
									x+=1;
								}

								if(x ==1){
									this.y = play_canHuWith258.y-22;
								}else if(x ==2){
									this.y = play_canHuWith258.y-22*2;
								}else if(x ==3){
									this.y = play_canHuWith258.y-22*3;
								}

							}

                            if(jsclient.data.sData.tData.fishNum == 2){

                            }else if(jsclient.data.sData.tData.fishNum == 5){
                            	console.log("------------------------------------",this);





								// try{
									 this.loadTexture("res/playing/other/fish_five.png");
									//this.loadTextures("res/home/joinGame.png");
								// }catch (e){
								// 	console.log("----------***-"+JSON.stringify(e));
								// }

                            }else if(jsclient.data.sData.tData.fishNum == 8){
                               // this.setTexture("res/playing/other/fish_eight.png");
								this.loadTexture("res/playing/other/fish_eight.png");
                            }


						},
						_visible:function(){
							if (jsclient.data.sData.tData.playType==PlayType.hsMethod &&jsclient.data.sData.tData.fishNum !=1 ) {
								console.log("9------------------9----------------------9------------9jsclient.data.sData.tData.fishNum = "+jsclient.data.sData.tData.fishNum);

								return jsclient.data.sData.tData.fishNum;
							}else{
								return false;
							}
						}
					},
					_visible:function(){
						return jsclient.data.sData.tData.withZhong||jsclient.data.sData.tData.canHuWith258||jsclient.data.sData.tData.canHu7||!jsclient.data.sData.tData.noCanEatHu;
					}
				}
			},
			clb: {_layout: [[0.17, 0.17], [0, 0], [0, 0]]},
			crt: {_layout: [[0.17, 0.17], [1, 1], [0, 0]]},
			crb: {_layout: [[0.17, 0.17], [1, 0], [0, 0]]},
			barl: {_layout: [[0, 1], [0, 0.5], [0, 0], true]},
			barr: {_layout: [[0, 1], [1, 0.5], [0, 0], true]},
			bart: {_layout: [[1, 0], [0.5, 1], [0, 0], true]},
			barb: {_layout: [[1, 0], [0.5, 0], [0, 0], true]},
		},
		banner: {
			_layout: [[0.5, 0.5], [0.5, 1], [0, -0.5]]
			, wifi: {
				_run: function ()
				{
					updateWIFI(this);
				}
			}, powerBar: {
				_run: function ()
				{
					cc.log("powerBar_run");
					updatePower(this);
				}, _event: {
					nativePower: function (d)
					{

						this.setPercent(Number(d));
					}
				}
			}
            , tableid: {
                _run: function () {
                    if(jsclient.data.sData.tData.coinRoomCreate)
                    {
                        this.visible = false;
                    }
                },
				_event: {
					initSceneData: function ()
					{
						this.setString(jsclient.data.sData.tData.tableid);
					}
				}
			},
            Z_room_txt_1:{
                _run: function () {
                    if(jsclient.data.sData.tData.coinRoomCreate)
                    {
                        // this.visible = false;
						this.setTexture("res/playing/other/biaoti.png");
						this.x = this.x + 40;
                    }
                }
            },
			setting: {
				_click: function ()
				{
					var settringLayer = new SettingLayer();
					settringLayer.setName("PlayLayerClick");
					jsclient.Scene.addChild(settringLayer);
				}
			},
			Button_1: {
				_click: function ()
				{
					jsclient.openWeb({url: jsclient.remoteCfg.helpUrl, help: true});
				}
			}
		},
		arrowbk: {
			_layout: [[0.15, 0.15], [0.5, 0.5], [0, 0]],
			_event: {
				initSceneData: function (eD)
				{
					this.visible = CheckArrowVisible();
					SetArrowRotation(this)
				}
				, mjhand: function (eD)
				{
					this.visible = CheckArrowVisible();
					SetArrowRotation(this);
				}
				, onlinePlayer: function (eD)
				{
					this.visible = CheckArrowVisible();
				}
				, waitPut: function (eD)
				{
					SetArrowRotation(this)
				}
				, MJPeng: function (eD)
				{
					SetArrowRotation(this)
				}
				, MJChi: function (eD)
				{
					SetArrowRotation(this)
				}
				, MJGang: function (eD)
				{
					SetArrowRotation(this)
				}
			}, number: {
				_run: function ()
				{

					updateArrowbkNumber(this);
				},
				_event: {
					MJPeng: function ()
					{
						this.cleanup();
						stopEffect(playAramTimeID)
						updateArrowbkNumber(this);
					}
					, MJChi: function ()
					{
						this.cleanup();
						stopEffect(playAramTimeID)
						updateArrowbkNumber(this);
					}
					, waitPut: function ()
					{
						this.cleanup();
						stopEffect(playAramTimeID)
						updateArrowbkNumber(this);
					},
					MJPut: function (msg)
					{
						if (msg.uid == SelfUid())
						{
							this.cleanup();
						}


					}, roundEnd: function ()
					{
						this.cleanup();
						stopEffect(playAramTimeID);
					}

				}
			}
		},
		wait: {
			wxinvite: {
				_layout: [[0.15, 0.15], [0.51, 0.51], [-0.68, 0]],
                _run: function () {
                    if(jsclient.data.sData.tData.coinRoomCreate||jsclient.remoteCfg.hideWechat)
                    {
                        this.visible = false;
                    }
                },
				_click: function ()
				{
					jsclient.showShareExplainedByUrl(jsclient.remoteCfg.wxShareUrl);

					// if (cc.sys.OS_ANDROID == cc.sys.os || cc.sys.OS_IOS==cc.sys.os) {
						// jsclient.block();
						// var tData=jsclient.data.sData.tData;
						// jsclient.getWXDeepShareUrl({vipTable:tData.tableid},function (url) {
						// 	cc.log("share url : " + url);
						// 	jsclient.unblock();
						// 	jsclient.showShareExplainedByUrl(url);
						// },function () {
						// 	jsclient.unblock();
						// 	jsclient.showShareExplainedByUrl(jsclient.remoteCfg.wxShareUrl);
						// });
					// }
					// else {
					// 	jsclient.showShareExplainedByUrl(jsclient.remoteCfg.wxShareUrl);
					// }
				}
			},
			delroom: {
				_layout: [[0.15, 0.15], [0.51, 0.51], [0.62, 0]],
                _run: function () {
                    if(jsclient.data.sData.tData.coinRoomCreate||jsclient.remoteCfg.hideWechat)
                    {
                        doLayout(this,[0.15, 0.15], [0.5, 0.5], [0, 0]);
                    }
                    else
                    {
                        doLayout(this,[0.15, 0.15], [0.51, 0.51], [0.62, 0]);
                    }
                },
				_click: function ()
				{
					jsclient.delRoom(true);
				}
			},
			_event: {
				initSceneData: function (eD)
				{
					this.visible = CheckInviteVisible();
				},
				addPlayer: function (eD)
				{
					this.visible = CheckInviteVisible();
				}, removePlayer: function (eD)
				{
					this.visible = CheckInviteVisible();
				}
			}
		},
		down: {
			_run:function(){
				//cc.eventManager.addListener(getDwonTouchListener(this), this);

			},
			gangPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [0, -2.5]],
				_run:function() {
					this.visible = false;
					this.zIndex = 800;
				},
			},
			pengPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [0, -2.5]],
				_run:function() {
					this.visible = false;
					this.zIndex = 800;
				},
			},
			tingPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [0, -2.5]],
				_run:function() {
					this.visible = false;
					this.zIndex = 800;
				},
			},
			huPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [0, -2.5]],
				_run:function() {
					this.visible = false;
					this.zIndex = 700;
				},
				_event:{
					playHu: function( dir )
					{
						console.log("ok");


						// 播放开杠的动画
						if (dir.pos == "down") {
							// this.visible = true;
							this.runAction(
								cc.sequence(cc.Show(),cc.scaleTo(0.3, 1.4), cc.scaleTo(0.1, 1.2), cc.scaleTo(0.1,1.0),
									cc.delayTime(0.8),cc.Hide(), cc.callFunc(function () {
										sendEvent("roundEndUI",dir);
									})));
							this.setScale(0.07);
						}
					}
				}
			},
			moreWinPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [0, -3.5]],
				_run:function() {
					this.visible = false;
					this.zIndex = 700;
				},
				_event:{
					playMoreWin: function( dir )
					{
						// 播放开杠的动画
						if (dir == "down") {
							// this.visible = true;
							this.runAction(
								cc.sequence(cc.Show(),cc.scaleTo(0.2, 1.0), cc.scaleTo(0.1, 0.8), cc.scaleTo(0.1, 0.7),
									cc.delayTime(0.8),cc.Hide(), cc.callFunc(function () {
										var sData = jsclient.data.sData;
										var tData = sData.tData;
										if ( tData.uiend == true )
										{
											jsclient.data.sData.tData.uiend = false;
											sendEvent("roundEndUI",false);
										}
										else
											return;
									})));
							this.setScale(0.07);
						}
					}
				}
			},
			head: {
				paonum:{
					_run:function () {
						this.visible = false;
					},
					_event:{
						DoneDownPao:function (eD) {
							initPaoNum(this, eD, 0);
						}
						,hidePaoNum:function () {
							this.visible = false;
						}
					}
				},
				tinglogo:{
					_run:function () {
						this.visible = false;
					},
					_event:{
						MJPut:function (eD) {
							initTingLogo(this, eD, 0);
						},
						resetTingLogo:function () {
							cc.log("== reset tinglogo 0");
							this.visible=false;
						}
					}
				},
				zhuang: {
					_run: function ()
					{
						this.visible = false;
					}, _event: {
						waitPut: function ()
						{
							showPlayerZhuangLogo(this, 0);
						}
						, initSceneData: function ()
						{
							if (CheckArrowVisible())
							{
								showPlayerZhuangLogo(this, 0);
							}
						}
					}
				}, chatbg: {
					_run: function ()
					{
						this.getParent().zIndex = 600;
					}, chattext: {
						_event: {

							MJChat: function (msg)
							{

								showchat(this, 0, msg);
							}, playVoice: function (voicePath)
							{
								jsclient.data._tempMessage.msg = voicePath;
								showchat(this, 0, jsclient.data._tempMessage);
							}
						}
					}
				}
				, _click: function (btn)
				{
					showPlayerInfo(0, btn);
				}
				, _event: {
					loadWxHead: function (d)
					{
						setWxHead(this, d, 0);
					}

				}

			},
			ready: {
				_layout: [[0.07, 0.07], [0.5, 0.5], [0, -1.5]],
				_run: function ()
				{
					CheckReadyVisible(this, 0);
				},
				_event: {
					moveHead: function ()
					{
						CheckReadyVisible(this, -1);
					}
					, addPlayer: function ()
					{
						CheckReadyVisible(this, 0);
					}, removePlayer: function ()
					{
						CheckReadyVisible(this, 0);
					}
					, onlinePlayer: function ()
					{
						CheckReadyVisible(this, 0);
					}
					, downPao: function () {
						this.visible = false;
					}
				}
			},
			stand: {_layout: [[0.057, 0], [0.5, 0], [7, 0.7]], _visible: false},

			up: {_layout: [[0.057, 0], [0, 0], [0.8, 0.7]], _visible: false},
			down: {_layout: [[0.057, 0], [0, 0], [3, 1]], _visible: false},

			out1: {_layout: [[0, 0.07], [0.5, 0], [-6, 5.2]], _visible: false},
			out1_0:{_visible:false},
			out0: {_layout: [[0, 0.07], [0.5, 0], [-6, 4.5]], _visible: false},
			down_out0:{_layout: [[0, 0.07], [0.5, 0], [-6, 4.5]], _visible: false},
			down_out1:{_layout: [[0, 0.07], [0.5, 0], [-6, 5.2]], _visible: false},
			_event: {
				clearCardUI: function ()
				{
					clearCardUI(this, 0);
				},
				initSceneData: function (eD)
				{
					SetPlayerVisible(this, 0);
				},
				addPlayer: function (eD)
				{
					SetPlayerVisible(this, 0);
				}, removePlayer: function (eD)
				{
					SetPlayerVisible(this, 0);
				},
				mjhand: function (eD)
				{
					InitPlayerHandUI(this, 0);
				},
				roundEnd: function ()
				{
					InitPlayerNameAndCoin(this, 0);
				},
				newCard: function (eD)
				{
					HandleNewCard(this, eD, 0);
				},
				MJPut: function (eD)
				{  //HandleMJPut(this,eD,0);
				},
				MJChi: function (eD)
				{
					HandleMJChi(this, eD, 0);
				},
				MJGang: function (eD)
				{
					HandleMJGang(this, eD, 0);
				},
				MJPeng: function (eD)
				{
					HandleMJPeng(this, eD, 0);
				},
				onlinePlayer: function (eD)
				{
					setOffline(this, 0);
				},
				MJTick: function (eD)
				{
					setOffline(this, 0);
				},
				MJRandCards: function (eD)
				{

					if(eD.off == 0)
					{console.log("--0000000000000-----------------wei--------MJRandCards () ");
						HandleRandCards(eD,this);

					}

				}
			}
		},
		right: {
			gangPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
			},
			pengPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
			},
			tingPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
			},
			huPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
				_event:{
					playHu: function( dir )
					{
						console.log("ok");
						// 播放开杠的动画

						if (dir.pos == "right") {
							// this.visible = true;
							this.runAction(
								cc.sequence(cc.Show(),cc.scaleTo(0.3, 1.4), cc.scaleTo(0.1, 1.2), cc.scaleTo(0.1, 1.0),
									cc.delayTime(0.8),cc.Hide(),cc.callFunc(function () {
										sendEvent("roundEndUI",dir);
									})));
							this.setScale(0.07);
						}
					}
				}
			},
			moreWinPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
				_event:{
					playMoreWin: function( dir )
					{
						// 播放开杠的动画
						if (dir == "right") {
							// this.visible = true;
							this.runAction(
								cc.sequence(cc.Show(),cc.scaleTo(0.2, 1.0), cc.scaleTo(0.1, 0.8), cc.scaleTo(0.1, 0.7),
									cc.delayTime(0.8),cc.Hide(), cc.callFunc(function () {
										var sData = jsclient.data.sData;
										var tData = sData.tData;
										if ( tData.uiend == true )
										{
											jsclient.data.sData.tData.uiend = false;
											sendEvent("roundEndUI",false);
										}
										else
											return;
									})));
							this.setScale(0.07);
						}
					}
				}
			},
			head: {
				paonum:{
					_run:function () {
						this.visible = false;
					},
					_event:{
						DoneDownPao:function (eD) {
							initPaoNum(this, eD, 1);
						}
						,hidePaoNum:function () {
							this.visible = false;
						}
					}
				},
				tinglogo:{
					_run:function () {
						this.visible = false;
					},
					_event:{
						MJPut:function (eD) {
							initTingLogo(this, eD, 1);
						},
						resetTingLogo:function () {
							cc.log("== reset tinglogo 1");
							this.visible=false;
						}
					}
				},
				zhuang: {
					_run: function ()
					{
						this.visible = false;
					}, _event: {
						waitPut: function ()
						{
							showPlayerZhuangLogo(this, 1);
						}
						, initSceneData: function ()
						{
							if (CheckArrowVisible())
							{
								showPlayerZhuangLogo(this, 1);
							}
						}
					}
				}, chatbg: {
					_run: function ()
					{
						this.getParent().zIndex = 500;
					}, chattext: {
						_event: {

							MJChat: function (msg)
							{

								showchat(this, 1, msg);
							}, playVoice: function (voicePath)
							{
								jsclient.data._tempMessage.msg = voicePath;
								showchat(this, 1, jsclient.data._tempMessage);
							}
						}
					}
				}
				, _click: function (btn)
				{
					showPlayerInfo(1, btn);
				}
				, _event: {
					loadWxHead: function (d)
					{
						setWxHead(this, d, 1);
					}

				}
			},

			ready: {
				_layout: [[0.07, 0.07], [0.5, 0.5], [2, 0]],
				_run: function ()
				{
					CheckReadyVisible(this, 1);
				},
				_event: {
					moveHead: function ()
					{
						CheckReadyVisible(this, -1);
					}
					, addPlayer: function ()
					{
						CheckReadyVisible(this, 1);
					}, removePlayer: function ()
					{
						CheckReadyVisible(this, 1);
					}
					, onlinePlayer: function ()
					{
						CheckReadyVisible(this, 1);
					}
					, downPao: function () {
						this.visible = false;
					}
				}
			},


			stand: {_layout: [[0, 0.08], [1, 1], [-7, -2.5]], _visible: false},

			up: {_layout: [[0, 0.05], [1, 0], [-4, 6]], _visible: false},
			down: {_layout: [[0, 0.05], [1, 0], [-4, 6.3]], _visible: false},

			out0: {_layout: [[0, 0.05], [1, 0.5], [-6, -3.8]], _visible: false},
			out1: {_layout: [[0, 0.05], [1, 0.5], [-7, -3.8]], _visible: false},
			out1_0:{_visible:false},
			down_out0: {_layout: [[0, 0.05], [1, 0.5], [-6, -3.8]], _visible: false},
			down_out1: {_layout: [[0, 0.05], [1, 0.5], [-7, -3.8]], _visible: false},
			_event: {
				clearCardUI: function ()
				{
					clearCardUI(this, 1);
				},
				initSceneData: function (eD)
				{
					SetPlayerVisible(this, 1);
				},
				addPlayer: function (eD)
				{
					SetPlayerVisible(this, 1);
				}, removePlayer: function (eD)
				{
					SetPlayerVisible(this, 1);
				},
				mjhand: function (eD)
				{
					InitPlayerHandUI(this, 1);
				},
				roundEnd: function ()
				{
					InitPlayerNameAndCoin(this, 1);
				},
				waitPut: function (eD)
				{
					HandleWaitPut(this, eD, 1);
				},
				MJPut: function (eD)
				{
					HandleMJPut(this, eD, 1);
				},
				MJChi: function (eD)
				{
					HandleMJChi(this, eD, 1);
				},
				MJGang: function (eD)
				{
					HandleMJGang(this, eD, 1);
				},
				MJPeng: function (eD)
				{
					HandleMJPeng(this, eD, 1);
				},
				onlinePlayer: function (eD)
				{
					setOffline(this, 1);
				},
				MJTick: function (eD)
				{
					setOffline(this, 1);
				},
				MJRandCards: function (eD)
				{

					if(eD.off == 1)
					{
						console.log("--1111111111111111-----------------wei--------MJRandCards () ");
						HandleRandCards(eD,this);
					}
				}
			}
		},

		top: {
			gangPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [0, 2.5]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
				// _event:{
				// 	playGang: function( off )
				// 	{
				// 		// 播放开杠的动画
				// 		// mylog(" == playGang == top ")
				// 		if (off == 2) {
				// 			// this.visible = true;
				// 			this.runAction(
				// 				cc.sequence(cc.Show(),cc.scaleTo(0.3, 2.0), cc.scaleTo(0.1, 1.8),
				// 					cc.delayTime(0.8),cc.Hide()));
				// 			this.setScale(0.07);
				// 		}
				// 	}
				// }
			},
			pengPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [0, 2.5]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
			},
			tingPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
			},
			huPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [0, 2.5]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
				_event:{
					playHu: function( dir )
					{
						console.log("ok");
						// 播放开杠的动画

						if (dir.pos == "top") {
							// this.visible = true;
							this.runAction(
								cc.sequence(cc.Show(),cc.scaleTo(0.3, 1.4), cc.scaleTo(0.1, 1.2), cc.scaleTo(0.1, 1.2),
									cc.delayTime(0.8),cc.Hide(),cc.callFunc(function () {
										sendEvent("roundEndUI",dir);
									})));
							this.setScale(0.07);
						}
					}
				}
			},
			moreWinPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [0, 3.5]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
				_event:{
					playMoreWin: function( dir )
					{
						// 播放开杠的动画
						if (dir == "top") {
							// this.visible = true;
							this.runAction(
								cc.sequence(cc.Show(),cc.scaleTo(0.2, 1.0), cc.scaleTo(0.1, 0.8), cc.scaleTo(0.1, 0.7),
									cc.delayTime(0.8),cc.Hide(),cc.callFunc(function () {
										var sData = jsclient.data.sData;
										var tData = sData.tData;
										if ( tData.uiend == true )
										{
											jsclient.data.sData.tData.uiend = false;
											sendEvent("roundEndUI",false);

										}
										else
											return;
									})));
							this.setScale(0.07);
						}
					}
				}
			},
			head: {
				paonum:{
					_run:function () {
						this.visible = false;
					},
					_event:{
						DoneDownPao:function (eD) {
							initPaoNum(this, eD, 2);
						}
						,hidePaoNum:function () {
							this.visible = false;
						}
					}
				},
				tinglogo:{
					_run:function () {
						this.visible = false;
					},
					_event:{
						MJPut:function (eD) {
							initTingLogo(this, eD, 2);
						},
						resetTingLogo:function () {
							cc.log("== reset tinglogo 2");
							this.visible=false;
						}
					}
				},
				zhuang: {
					_run: function ()
					{
						this.visible = false;
					}, _event: {
						waitPut: function ()
						{
							showPlayerZhuangLogo(this, 2);
						}
						, initSceneData: function ()
						{
							if (CheckArrowVisible())
							{
								showPlayerZhuangLogo(this, 2);
							}
						}
					}

				}, chatbg: {
					_run: function ()
					{
						this.getParent().zIndex = 500;
					}, chattext: {
						_event: {

							MJChat: function (msg)
							{

								showchat(this, 2, msg);
							}, playVoice: function (voicePath)
							{
								jsclient.data._tempMessage.msg = voicePath;
								showchat(this, 2, jsclient.data._tempMessage);
							}
						}
					}
				}
				, _click: function (btn)
				{
					showPlayerInfo(2, btn);
				}
				, _event: {
					loadWxHead: function (d)
					{
						setWxHead(this, d, 2);
					}

				}

			},
			ready: {
				_layout: [[0.07, 0.07], [0.5, 0.5], [0, 1.5]],
				_run: function ()
				{
					CheckReadyVisible(this, 2);
				},
				_event: {
					moveHead: function ()
					{
						CheckReadyVisible(this, -1);
					}
					, addPlayer: function ()
					{
						CheckReadyVisible(this, 2);
					}, removePlayer: function ()
					{
						CheckReadyVisible(this, 2);
					}
					, onlinePlayer: function ()
					{
						CheckReadyVisible(this, 2);
					}
					, downPao: function () {
						this.visible = false;
					}
				}
			},

			stand: {_layout: [[0, 0.07], [0.5, 1], [-6, -2.5]], _visible: false},

			up: {_layout: [[0, 0.07], [0.5, 1], [6, -2.5]], _visible: false},
			down: {_layout: [[0, 0.07], [0.5, 1], [6, -2.2]], _visible: false},

			out0: {_layout: [[0, 0.07], [0.5, 1], [5, -4.6]], _visible: false},
			out1: {_layout: [[0, 0.07], [0.5, 1], [5, -5.3]], _visible: false},
			out1_0:{_visible:false},
			down_out0: {_layout: [[0, 0.07], [0.5, 1], [5, -4.6]], _visible: false},
			down_out1: {_layout: [[0, 0.07], [0.5, 1], [5, -5.3]], _visible: false},
			_event: {
				clearCardUI: function ()
				{
					clearCardUI(this, 2);
				},
				initSceneData: function (eD)
				{
					SetPlayerVisible(this, 2);
				},
				addPlayer: function (eD)
				{
					SetPlayerVisible(this, 2);
				}, removePlayer: function (eD)
				{
					SetPlayerVisible(this, 2);
				},
				mjhand: function (eD)
				{
					InitPlayerHandUI(this, 2);
				},
				roundEnd: function ()
				{
					InitPlayerNameAndCoin(this, 2);
				},
				waitPut: function (eD)
				{
					HandleWaitPut(this, eD, 2);
				},
				MJPut: function (eD)
				{
					HandleMJPut(this, eD, 2);
				},
				MJChi: function (eD)
				{
					HandleMJChi(this, eD, 2);
				},
				MJGang: function (eD)
				{
					HandleMJGang(this, eD, 2);
				},
				MJPeng: function (eD)
				{
					HandleMJPeng(this, eD, 2);
				},
				onlinePlayer: function (eD)
				{
					setOffline(this, 2);
				},
				MJTick: function (eD)
				{
					setOffline(this, 2);
				},
				MJRandCards: function (eD)
				{

					if(eD.off ==2)
					{
						console.log("--22222222222222-----------------wei--------MJRandCards () ");
						HandleRandCards(eD,this);
					}


				}
			}
		},


		left: {
			gangPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [-3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
				// _event:{
				// 	playGang: function( off )
				// 	{
				// 		// 播放开杠的动画
				// 		// mylog(" == playGang == left ");
				// 		if (off == 3) {
				// 			// this.visible = true;
				// 			this.runAction(
				// 				cc.sequence(cc.Show(),cc.scaleTo(0.3, 2.0), cc.scaleTo(0.1, 1.8),
				// 					cc.delayTime(0.8),cc.Hide()));
				// 			this.setScale(0.07);
				// 		}
				// 	}
				// }
			},
			pengPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [-3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
			},
			tingPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
			},
			huPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [-3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
				_event:{
					playHu: function( dir )
					{
						console.log("ok");

						// 播放开杠的动画
						if (dir.pos == "left") {
							// this.visible = true;
							this.runAction(
								cc.sequence(cc.Show(),cc.scaleTo(0.3, 1.4), cc.scaleTo(0.1, 1.2), cc.scaleTo(0.1, 1.0),
									cc.delayTime(0.8),cc.Hide(),cc.callFunc(function () {
										sendEvent("roundEndUI",dir);
									})));
							this.setScale(0.07);
						}
					}
				}
			},
			moreWinPlay:{
				_layout:[[0.07, 0.07], [0.5, 0.5], [-3, 0]],
				_run:function() {
					this.visible = false;
					this.zIndex = 600;
				},
				_event:{
					playMoreWin: function( dir )
					{
						// 播放开杠的动画
						if (dir == "left") {
							// this.visible = true;
							this.runAction(
								cc.sequence(cc.Show(),cc.scaleTo(0.2, 1.0), cc.scaleTo(0.1, 0.8), cc.scaleTo(0.1, 0.7),
									cc.delayTime(0.8),cc.Hide(), cc.callFunc(function () {
										var sData = jsclient.data.sData;
										var tData = sData.tData;
										if ( tData.uiend == true )
										{
											jsclient.data.sData.tData.uiend = false;
											sendEvent("roundEndUI",false);
										}
										else
											return;
									})));
							this.setScale(0.07);
						}
					}
				}
			},
			head: {
				paonum:{
					_run:function () {
						this.visible = false;
					},
					_event:{
						DoneDownPao:function (eD) {
							initPaoNum(this, eD, 3);
						}
						,hidePaoNum:function(){
							this.visible = false;
						}
					}
				},
				tinglogo:{
					_run:function () {
						this.visible = false;
					},
					_event:{
						MJPut:function (eD) {
							initTingLogo(this, eD, 3);
						},
						resetTingLogo:function () {
							cc.log("== reset tinglogo 3");
							this.visible=false;
						}
					}
				},
				zhuang: {
					_run: function ()
					{
						this.visible = false;
					}, _event: {
						waitPut: function ()
						{
							showPlayerZhuangLogo(this, 3);
						}
						, initSceneData: function ()
						{
							if (CheckArrowVisible())
							{
								showPlayerZhuangLogo(this, 3);
							}
						}
					}
				}, chatbg: {
					_run: function ()
					{
						this.getParent().zIndex = 500;
					}, chattext: {
						_event: {

							MJChat: function (msg)
							{

								showchat(this, 3, msg);
							}, playVoice: function (voicePath)
							{
								jsclient.data._tempMessage.msg = voicePath;
								showchat(this, 3, jsclient.data._tempMessage);
							}
						}
					}
				}
				, _click: function (btn)
				{
					showPlayerInfo(3, btn);
				}
				, _event: {
					loadWxHead: function (d)
					{
						setWxHead(this, d, 3);
					}


				}
			},
			ready: {
				_layout: [[0.07, 0.07], [0.5, 0.5], [-2, 0]],
				_run: function ()
				{
					CheckReadyVisible(this, 3);
				},
				_event: {
					moveHead: function ()
					{
						CheckReadyVisible(this, -1);
					}
					, addPlayer: function ()
					{
						CheckReadyVisible(this, 3);
					}, removePlayer: function ()
					{
						CheckReadyVisible(this, 3);
					}
					, onlinePlayer: function ()
					{
						CheckReadyVisible(this, 3);
					}
					, downPao: function () {
						this.visible = false;
					}
				}
			},

			up: {_layout: [[0, 0.05], [0, 1], [3.6, -3.3]], _visible: false},
			down: {_layout: [[0, 0.05], [0, 1], [3.6, -3]], _visible: false},
			stand: {_layout: [[0, 0.08], [0, 0], [6.5, 3]], _visible: false},

			out0: {_layout: [[0, 0.05], [0, 0.5], [5.5, 3.7]], _visible: false},
			out1: {_layout: [[0, 0.05], [0, 0.5], [6.5, 3.7]], _visible: false},
			out1_0:{_visible:false},
			down_out0: {_layout: [[0, 0.05], [0, 0.5], [5.5, 3.7]], _visible: false},
			down_out1: {_layout: [[0, 0.05], [0, 0.5], [6.5, 3.7]], _visible: false},
			_event: {
				clearCardUI: function ()
				{
					clearCardUI(this, 3);
				},
				initSceneData: function (eD)
				{
					SetPlayerVisible(this, 3);
				},
				addPlayer: function (eD)
				{
					SetPlayerVisible(this, 3);
				}, removePlayer: function (eD)
				{
					SetPlayerVisible(this, 3);
				},
				mjhand: function (eD)
				{
					InitPlayerHandUI(this, 3);
				},
				roundEnd: function ()
				{
					InitPlayerNameAndCoin(this, 3);
				},
				waitPut: function (eD)
				{
					HandleWaitPut(this, eD, 3);
				},
				MJPut: function (eD)
				{
					HandleMJPut(this, eD, 3);
				},
				MJChi: function (eD)
				{
					HandleMJChi(this, eD, 3);
				},
				MJGang: function (eD)
				{
					HandleMJGang(this, eD, 3);
				},
				MJPeng: function (eD)
				{
					HandleMJPeng(this, eD, 3);
				},
				onlinePlayer: function (eD)
				{
					setOffline(this, 3);
				},
				MJTick: function (eD)
				{
					setOffline(this, 3);
				},
				MJRandCards: function (eD)
				{

					if(eD.off ==3)
					{
						console.log("--3333333333333333-----------------wei--------MJRandCards () ");
						HandleRandCards(eD,this);


					}
				}
			}
		},
		eat: {

			chi0: {
				_visible: false, _layout: [[0, 0.1], [0.5, 0], [1.3, 2.5]]
				, _touch: function (btn, eT)
				{
					if (eT == 2)
					{
						MJChichange(btn.tag);
					}
				}
				, bgimg: {
					_run: function ()
					{
						this.zIndex = -1;
					}
				}
				, bgground: {
					_run: function ()
					{
						this.zIndex = -1;
					}
				}
				, card1: {}
				, card2: {}
				, card3: {}
			}, chi1: {
				_visible: false, _layout: [[0, 0.1], [0.5, 0], [1.3, 3.8]]
				, _touch: function (btn, eT)
				{
					if (eT == 2)
					{
						MJChichange(btn.tag);
					}
				}
			}, chi2: {
				_visible: false, _layout: [[0, 0.1], [0.5, 0], [1.3, 5.1]]
				, _touch: function (btn, eT)
				{
					if (eT == 2)
					{
						MJChichange(btn.tag);
					}
				}

			}, peng: {
				_visible: false, _layout: [[0, 0.1], [0.5, 0], [0, 2.5]], _touch: function (btn, eT)
				{
					if (eT == 2)
					{
						MJPeng2Net();
					}
				}, bgimg: {
					_run: function ()
					{
						this.zIndex = -1;
					}
				}
			},
			gang0: {
				_visible: false, _layout: [[0, 0.1], [0.5, 0], [-1.7, 2.5]], card1: {},
				_touch: function (btn, eT)
				{
					if (eT == 2)
					{
						MJGangchange(btn.tag);
					}
				}, bgimg: {
					_run: function ()
					{
						this.zIndex = -1;
					}
				}
				, bgground: {
					_run: function ()
					{
						this.zIndex = -1;
					}
				}
			},
			gang1: {
				_visible: false, _layout: [[0, 0.1], [0.5, 0], [-1.7, 3.8]], card: {}, _touch: function (btn, eT)
				{
					if (eT == 2)
					{
						MJGangchange(btn.tag);
					}
				}
			},
			gang2: {
				_visible: false, _layout: [[0, 0.1], [0.5, 0], [-1.7, 5.1]], card: {}, _touch: function (btn, eT)
				{
					if (eT == 2)
					{
						MJGangchange(btn.tag);
					}
				}
			},
			guo: {
				_visible: false, _layout: [[0, 0.1], [0.5, 0], [4.6, 2.5]], _touch: function (btn, eT)
				{
					if (eT == 2)
					{
						jsclient.MJPass2Net();
					}
				}, bgimg: {
					_run: function ()
					{
						this.zIndex = -1;
					}
				}
			},
			hu: {
				_visible: false, _layout: [[0, 0.1], [0.5, 0], [-3, 2.5]], _touch: function (btn, eT)
				{
					if (eT == 2)
					{
						MJHu2Net();
					}
				}, bgimg: {
					_run: function ()
					{
						this.zIndex = -1;
					}
				}
			},
			ting:{
					_visible:false,
					_layout:[[0,0.1],[0.5,0],[-3,2.5]],
					_touch:function(btn,eT){
					if(eT==2)
					{
						// 首先隐藏对应的按钮，这里缺少了pass等按钮的隐藏，参考碰，杠等地方的代码
						// var down =jsclient.playui.jsBind.down._node;
						// HandleMJPut(down,{uid:SelfUid(), card:jsclient.tingCard},0);
						// jsclient.gamenet.request("pkroom.handler.tableMsg",{cmd:"MJTing",card:jsclient.tingCard,ting:1});
						// 设置不能被打出的牌
						hideRelativeBtn();
						tingClicked=true;
						cc.log("== 点击听牌 == tingClicked: " + tingClicked);
						MJTingCanNotPutCard();
					}}},
			changeui: {
				changeuibg: {
					_layout: [[0.2, 0.2], [0.5, 0], [0, 0]]
					, _run: function ()
					{
						this.y = this.getParent().getParent().getChildByName("chi0").y;
					}
					, card1: {
						_touch: function (btn, et)
						{
							if (et == 2)
							{
								MJChi2Net(0);
							}
						}
					}
					, card2: {
						_touch: function (btn, et)
						{
							if (et == 2)
							{
								MJChi2Net(0)
							}
						}
					}
					, card3: {
						_touch: function (btn, et)
						{
							if (et == 2)
							{
								MJChi2Net(0)
							}
						}
					}
					, card4: {
						_touch: function (btn, et)
						{
							if (et == 2)
							{
								MJChi2Net(1)
							}
						}
					}
					, card5: {
						_touch: function (btn, et)
						{
							if (et == 2)
							{
								if (btn.getParent().getChildByName("card4").visible)
								{
									MJChi2Net(1);
								}
								else
								{
									MJGang2Net(btn.tag);
								}
							}
						}
					}
					, card6: {
						_touch: function (btn, et)
						{
							if (et == 2)
							{
								MJChi2Net(1)
							}
						}
					}
					, card7: {
						_touch: function (btn, et)
						{
							if (et == 2)
							{
								if (btn.getParent().getChildByName("card8").visible)
								{
									MJChi2Net(2);
								}
								else
								{
									MJGang2Net(btn.tag);
								}
							}
						}
					}
					, card8: {
						_touch: function (btn, et)
						{
							if (et == 2)
							{
								MJChi2Net(2)
							}
						}
					}
					, card9: {
						_touch: function (btn, et)
						{
							if (et == 2)
							{
								if (btn.getParent().getChildByName("card8").visible)
								{
									MJChi2Net(2);
								}
								else
								{
									MJGang2Net(btn.tag);
								}

							}
						}
					}
					, guobg: {
						guo: {
							_touch: function (btn, eT)
							{
								if (eT == 2)
								{
									jsclient.MJPass2Net();
								}
							}
						}
						, fanhui: {
							_touch: function (btn, et)
							{
								if (et == 2)
								{
									btn.getParent().getParent().visible = false;
									CheckEatVisible(jsclient.playui.jsBind.eat);
								}
							}
						}
					}

				}
			}
			, _event: {
				mjhand: function (eD)
				{
					CheckEatVisible(jsclient.playui.jsBind.eat);
				},
				waitPut: function (eD)
				{
					CheckEatVisible(jsclient.playui.jsBind.eat);
				},
				MJPut: function (eD)
				{
					CheckEatVisible(jsclient.playui.jsBind.eat);
				},
				MJPeng: function (eD)
				{
					CheckEatVisible(jsclient.playui.jsBind.eat);
				},
				MJChi: function (eD)
				{
					CheckEatVisible(jsclient.playui.jsBind.eat);
				},
				MJGang: function (eD)
				{
					CheckEatVisible(jsclient.playui.jsBind.eat);
				},
				roundEnd: function (eD)
				{
					CheckEatVisible(jsclient.playui.jsBind.eat);
				},
				initSceneData: function (eD)
				{
					CheckEatVisible(jsclient.playui.jsBind.eat);
				}

			}
		}, chat_btn: {
			_layout: [[0.09, 0.09], [1, 1], [-1.8, -1.3]]
			, _click: function ()
			{
				var chatlayer = new ChatLayer();
				jsclient.Scene.addChild(chatlayer);
			}
		}, voice_btn: {
			_layout: [[0.1, 0.1], [1, 0], [-1.5, 3.5]],
			_run: function ()
			{
				initVData();

				if(jsclient.remoteCfg.voiceBtnShow)
				{
					this.visible = true;
					cc.eventManager.addListener(getTouchListener(), this);
				}else{
					this.visible = false;
				}

			}
			, _touch: function (btn, eT)
			{
				// 点击开始录音 松开结束录音,并且上传至服务器, 然后通知其他客户端去接受录音消息, 播放
				if (eT == 0)
				{
					startRecord();
				}
				else if (eT == 2)
				{
					endRecord();
				}
				else if (eT == 3)
				{
					cancelRecord();
				}
			}, _event: {
				cancelRecord: function ()
				{
					jsclient.native.HelloOC("cancelRecord !!!");
				},
				uploadRecord: function (filePath)
				{
					if (filePath)
					{
						jsclient.native.HelloOC("upload voice file");
						console.log("voiceUrl is : " + jsclient.remoteCfg.voiceUrl);
						jsclient.native.UploadFile(filePath, jsclient.remoteCfg.voiceUrl, "sendVoice");
					}
					else
					{
						jsclient.native.HelloOC("No voice file update");
					}
				}, sendVoice: function (fullFilePath)
				{
					if (!fullFilePath)
					{
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
				}, downAndPlayVoice: function (msg)
				{
					jsclient.native.HelloOC("downloadPlayVoice ok");
					jsclient.data._tempMessage = msg;
					jsclient.native.HelloOC("mas is" + JSON.stringify(msg));
					downAndPlayVoice(msg.uid, msg.msg);
				}
			}
		},
		backHomebtn: {
			_layout: [[0.09, 0.09], [0, 1], [2.4, -1.3]]
			, _click: function (btn)
			{
				var sData = jsclient.data.sData;
				if (sData)
				{
					if (IsRoomOwner())
					{
						jsclient.showMsg("返回大厅房间仍然保留\n赶快去邀请好友吧",
							function ()
							{
								jsclient.playui.visible = false;
								sendEvent("returnHome");
							}, function ()
							{
							});
					}
					else
					{
						jsclient.showMsg("返回大厅房间将退出游戏\n确定退出房间吗",
							function ()
							{
								jsclient.leaveGame();
							}, function ()
							{
							});
					}
				}

			}, _event: {
				returnPlayerLayer: function ()
				{
					jsclient.playui.visible = true;
				}, initSceneData: function (eD)
				{
					this.visible = CheckInviteVisible();
				}
				, addPlayer: function (eD)
				{
					this.visible = CheckInviteVisible();
				}
				, removePlayer: function (eD)
				{
					this.visible = CheckInviteVisible();
				}
			}
		},
		huangPlay:{
			_layout: [[0.15, 0.15], [0.5, 0.5], [0, 0]],
			_run:function()
			{

				this.visible = false;
			},
			_event:{
				playHuang: function () {
					console.log("----------------------------huangPlay");
					this.runAction( cc.sequence(cc.Show(),cc.scaleTo(0.3, 1.4), cc.scaleTo(0.1, 1.0),
						cc.delayTime(0.8),cc.Hide(),cc.callFunc(function () {
							sendEvent("roundEndUI",false);
						})));
					this.setScale(0.07);
					// mylog("pos = ", JSON.stringify(this.getPosition()));
				}
			}
		},
		pao:{
			_run:function () {
				this.visible = false;
			},
			_event:{
				downPao:function () {
					this.visible = true;
					jsclient.playui.jsBind.wxinvite.visible = false;
					jsclient.playui.jsBind.delroom.visible = false;
				}
				,initSceneData:function (eD) {
					this.visible = CheckDonePaoVisible();
				}
			},
			title:{
				_layout:[[0.1, 0.1],[0.5, 0.6],[0,0]],
				_run:function () { this.visible = true; },
			},
			pao_no:{
				_layout:[[0.1, 0.1],[0.26, 0.5],[0,0]],
				_run:function () { this.visible = true; },
				_click:function (btn, eT) {
					if ( eT == 2 )
					{
						btn.getParent().visible = false;
						downPao2Net(0);
					}
				}
			},
			pao_one:{
				_layout:[[0.1, 0.1], [0.38, 0.5], [0, 0]],
				_run:function () { this.visible = true; },
				_click:function (btn, eT) {
					if ( eT == 2 )
					{
						btn.getParent().visible = false;
						downPao2Net(1);
					}
				}
			},
			pao_two:{
				_layout:[[0.1,0.1],[0.5,0.5],[0,0]],
				_run:function () { this.visible = true; },
				_click:function (btn, eT) {
					if ( eT == 2 )
					{
						btn.getParent().visible = false;
						downPao2Net(2);
					}
				}
			},
			pao_three:{
				_layout:[[0.1, 0.1],[0.62, 0.5], [0,0]],
				_run:function () { this.visible = true; },
				_click:function (btn, eT) {
					if ( eT == 2 )
					{
						btn.getParent().visible = false;
						downPao2Net(3);
					}
				}
			},
			pao_four:{
				_layout:[[0.1,0.1],[0.74, 0.5], [0, 0]],
				_run:function () { this.visible = true; },
				_click:function (btn, eT) {
					if ( eT == 2 )
					{
						btn.getParent().visible = false;
						downPao2Net(4);
					}
				}
			},
		}
	},
	ctor: function ()
	{
		this._super();
		cc.log("=============play.js ctor=========");
		var playui = ccs.load(res.Play_json);
		playMusic("bgFight");
		ConnectUI2Logic(playui.node, this.jsBind);
		this.addChild(playui.node);
		jsclient.lastMJTick = Date.now();
		this.runAction(cc.repeatForever(cc.sequence(cc.callFunc(function ()
		{
			if (jsclient.game_on_show)
			{
				jsclient.tickGame(0);
			}
		}), cc.delayTime(7))));
		jsclient.playui = this;
		this.addRecordStatusLayer();
		return true;
	},
	addRecordStatusLayer: function ()
	{
		// 添加录音动画界面
		var voiceLayer = new VoiceRecordLayer();
		voiceLayer.setVisible(false);
		this.addChild(voiceLayer);
	}

});