(function(){
	
var createui,round4,round8,round16,price,canEatHu,withWind,canEat,noBigWin,yesBigWin,playinfotext,posXoffset,zimohu,playType;
var canHuWith258,canHu7,withZhong;
var sxMethod, xaMethod, bjMethod, ylMethod, hsMethod, withPao, noPao;
	//划水-玩家勾选玩法
	var hs_canHu7,hs_withZhong,hs_withWind,hs_withSixCards,fish_two,fish_fve,fish_eight,fishNum;
var methodArray = [];
	var PlayType={
		sxMethod:1,		// 陕西麻将
		xaMethod:2,		// 西安麻将
		bjMethod:3,		// 宝鸡麻将
		ylMethod:4,		// 榆林麻将
		hsMethod:5,     // 划水麻将
	}
	var methodDescArray = [
		"玩法简介：只有平胡，没有大牌，平胡的胡牌方式为放胡（点炮）和自摸（炸弹），放胡1分由放胡者承担，自摸2分三家承担。",
		"玩法简介：使用万条筒108张牌，只有平胡，没有大胡，特色下炮玩法，最多下4炮，杠随胡。点炮1分，自摸(摸炸弹)2分，明暗杠都是1分。",
		"玩法简介：使用万条筒108张牌，胡牌类型有平胡、七对、大对子、抢杠胡、杠后炸弹，明杠1分，暗杠2分，点杠包杠。",
		"玩法简介：使用万条筒风136张牌，一二不能胡三四五只能炸，六七八九风随便胡。按点数算分。",
		"玩法简介：使用万条筒风牌136张，有杠开、小七对、豪华小七对、跟庄、黄番特殊计番，自摸后，连抓6张牌，看159数量计分。"
	]
	function methodSelected(index) {
		for(var i=0;i<methodArray.length;i++){
			if (i == index)
			{
				methodArray[i].setSelected(true);
			} else {
				methodArray[i].setSelected(false);
			}
		}
		playinfotext.setString(methodDescArray[index]);
	}
	function playTypeComponentInit(index) {
		switch (index){
			case methodArray.indexOf(sxMethod):
				console.log("----1");
				canEatHu.visible=true;
				canHu7.visible=true;
				withZhong.visible=true;
				canHuWith258.visible=true;
				withPao.visible=false;
				noPao.visible=false;
				break;
			case methodArray.indexOf(xaMethod):
			case methodArray.indexOf(bjMethod):
				console.log("----2");
				withPao.visible=true;
				noPao.visible=true;
				canEatHu.visible=false;
				canHu7.visible=false;
				withZhong.visible=false;
				canHuWith258.visible=false;
				break;
			case methodArray.indexOf(ylMethod):
			case methodArray.indexOf(hsMethod):
				break;
		}
	}
	function initPlayType() {
		if (sxMethod.isSelected()) return PlayType.sxMethod;
		else if (xaMethod.isSelected()) return PlayType.xaMethod;
		else if (bjMethod.isSelected()) return PlayType.bjMethod;
		else if (ylMethod.isSelected()) return PlayType.ylMethod;
		else if (hsMethod.isSelected()) return PlayType.hsMethod;
		else cc.log("create.js yes _click === error ===");
		return -1;
	}

	function getFishNum(){
		fishNum = -1;
		if(fish_two.isSelected())
		{
			fishNum = 2;
		}else if(fish_fve.isSelected()){
			fishNum =5;
		}else if(fish_eight.isSelected()){
			fishNum = 8;
		}else if(fishNum == -1){
			fishNum = 1;
		}
	}
	function getRoundPrice(){
		if(round4.isSelected()){
			return jsclient.data.gameInfo.nxmj.round4;
		}else if(round8.isSelected()){
			return jsclient.data.gameInfo.nxmj.round8;
		}else if(round16.isSelected()){
			return jsclient.data.gameInfo.nxmj.round16;
		}else{
			return jsclient.data.gameInfo.nxmj.round4;
		}
	}
	function getRoundStr(){
		if(round4.isSelected()){
			return "round4";
		}else if(round8.isSelected()){
			return "round8";
		}else if(round16.isSelected()){
			return "round16";
		}else{
			return "round4";
		}
	}
	function clearRoundSelect(passUI){
		var arr = [round4, round8, round16];
		for (var idx in arr){
			if(arr[idx] != passUI){
				arr[idx].setSelected(false);
			}
		}
	}

CreateLayer = cc.Layer.extend({
	jsBind:{
		block:{
			_layout:[[1,1],[0.5,0.5],[0,0],true]
		},goHome:
		{
			_layout:[[0.08,0.08],[0,1],[1,-0.7]],
			_click:function(){
				  createui.removeFromParent(true);
			}
		},createRoom_tile:
		{
			_layout:[[0.15,0.15],[0.5,1],[0,-0.8]],
		},backimg:
		{
			_layout:[[0.95,0.8],[0.5,0.45],[0,0],2]
		}
		,back:
		{
			_layout:[[0.95,0.95],[0.5,0.45],[0,0]]
			,_run:function(){
				this.setCascadeOpacityEnabled(false);
				this.opacity = 0;
			}
			,play_method_text:{
				sxMethod:{
					_run:function () { methodArray[0]=sxMethod = this; },
					_check:function (sender, type) {
						switch (type){
							case ccui.CheckBox.EVENT_SELECTED:
								methodSelected(methodArray.indexOf(sxMethod));
								console.log("推倒户");
								playType.visible=true;
								playType_0.visible=false;
								console.log("---wei---methodArray.indexOf(sxMethod) = "+methodArray.indexOf(sxMethod));
								playTypeComponentInit(methodArray.indexOf(sxMethod));
								break;
							case ccui.CheckBox.EVENT_UNSELECTED:
								methodSelected(methodArray.indexOf(hsMethod));
								playType.visible=false;
								playType_0.visible=true;
								break;
						}
					}
				},
				xaMethod:{
					_run:function () { methodArray[1]=xaMethod = this; },
					_check:function (sender, type) {
						switch (type) {
							case ccui.CheckBox.EVENT_SELECTED:
								console.log("划水麻将");
								methodSelected(methodArray.indexOf(xaMethod));
								playType.visible=true;
								playTypeComponentInit(methodArray.indexOf(xaMethod));
								break;
							case ccui.CheckBox.EVENT_UNSELECTED:
								methodSelected(methodArray.indexOf(bjMethod));
								playType.visible=true;
								playTypeComponentInit(methodArray.indexOf(bjMethod));
								break;
						}
					}


				},
				bjMethod:{
					_run:function () { methodArray[2]=bjMethod = this; },
					_check:function (sender, type) {
						switch (type) {
							case ccui.CheckBox.EVENT_SELECTED:
								methodSelected(methodArray.indexOf(bjMethod));
								playType.visible=true;
								playTypeComponentInit(methodArray.indexOf(bjMethod));
								break;
							case ccui.CheckBox.EVENT_UNSELECTED:
								methodSelected(methodArray.indexOf(ylMethod));
								playType.visible=false;
								break;
						}
					}
				},
				ylMethod:{
					_run:function () { methodArray[3]=ylMethod = this; },
					_check:function (sender, type) {
						switch (type) {
							case ccui.CheckBox.EVENT_SELECTED:
								methodSelected(methodArray.indexOf(ylMethod));
								playType.visible=false;
								break;
							case ccui.CheckBox.EVENT_UNSELECTED:
								methodSelected(methodArray.indexOf(hsMethod));
								playType.visible=false;
								break;
						}
					}
				},
				hsMethod:{
					_run:function () { methodArray[4]=hsMethod = this; },
					_check:function (sender, type) {
						switch (type) {
							case ccui.CheckBox.EVENT_SELECTED:
								methodSelected(methodArray.indexOf(hsMethod));
								playType.visible=false;
								playType_0.visible=true;
								break;
							case ccui.CheckBox.EVENT_UNSELECTED:
								methodSelected(methodArray.indexOf(sxMethod));
								playType.visible=true;
								playType_0.visible=false;
								playTypeComponentInit(methodArray.indexOf(sxMethod));
								break;
						}
					}
				},
				noBigWin:{ 
					_run:function(){ noBigWin=this;},
					_check:function(sender, type)
						{
							switch (type) {
								case ccui.CheckBox.EVENT_SELECTED:
								     yesBigWin.setSelected(false);
								     // playinfotext1.visible =false;
								     // playinfotext2.visible =true;
								     withWind.visible = false;
								     canEat.visible =false;
								     canEatHu.visible = true;
									 canEatHu.x=withWind.x;
									break;
								case ccui.CheckBox.EVENT_UNSELECTED:
								     yesBigWin.setSelected(true);
								     // playinfotext1.visible =true;
								     // playinfotext2.visible =false;
								  	 withWind.visible = true;
								     canEat.visible =true;
									 canEatHu.visible = false;
									 canEatHu.x=posXoffset;
									break;
							}
						}
				 },
				yesBigWin:{
				 	_run:function(){ yesBigWin=this;},
				 	_check:function(sender, type)
						{
							switch (type) {
								case ccui.CheckBox.EVENT_SELECTED:
								     noBigWin.setSelected(false);
								     // playinfotext1.visible =true;
								     // playinfotext2.visible =false;
								     withWind.visible = true;
								     canEat.visible =true;
									 canEatHu.visible = false;
									 canEatHu.x=posXoffset;
									break;
								case ccui.CheckBox.EVENT_UNSELECTED:
								     noBigWin.setSelected(true);
								     // playinfotext1.visible =false;
								     // playinfotext2.visible =true;
								     withWind.visible = false;
								     canEat.visible =false;
									 canEatHu.visible = true;
									  canEatHu.x=withWind.x;
									break;
							}
						}
				 },
			playinfotext:{
				 		_run:function(){ playinfotext=this;},
				 }
			},
			no:{
				_click:function(btn,evt)
				{
					   createui.removeFromParent(true);
				}
			},
			yes:{
				_click:function(btn,evt)
				{
				    var majiang=jsclient.data.gameInfo.nxmj;
					var roundStr = getRoundStr();
				    var needMoney=getRoundPrice();
					console.log("...JJ... needMoney:" + roundStr + ", " + needMoney);
				    var haveMoney=jsclient.data.pinfo.money;
					var nPlayType=initPlayType();
					getFishNum();
					console.log("-----wei-----nPlayType = "+nPlayType);
					if (nPlayType==-1) {
						cc.log("=== create.js yes playType error ===");
						return;
					}
				    if(haveMoney>=needMoney)
				    {
				    	if(nPlayType == 1)
						{
							jsclient.createRoom(roundStr,
								canEatHu.isSelected(),
								withWind.isSelected(),
								hs_withSixCards.isSelected(),
								canEat.isSelected(),
								noBigWin.isSelected(),
								canHu7.isSelected(),
								canHuWith258.isSelected(),
								withZhong.isSelected(),
								nPlayType,
								withPao.isSelected(),
								fishNum
							);
						}else if(nPlayType == 5)
						{
							/*console.log("---wei---hs_canHu7 = "+hs_canHu7.isSelected());
							console.log("---wei---hs_withZhong = "+hs_withZhong.isSelected());
							console.log("---wei---fishNum = "+fishNum);*/
							console.log("-------------------------------hs_canHu7.isSelected() ="+hs_canHu7.isSelected());
							jsclient.createRoom(roundStr,
								canEatHu.isSelected(),
								hs_withWind.isSelected(),
								hs_withSixCards.isSelected(),
								canEat.isSelected(),
								noBigWin.isSelected(),
								hs_canHu7.isSelected(),
								canHuWith258.isSelected(),
								hs_withZhong.isSelected(),
								nPlayType,
								withPao.isSelected(),
								fishNum
							);
						}

				    }
			        else
				    {
					    jsclient.uiPara={lessMoney:true};
					    jsclient.Scene.addChild(new PayLayer());
				    }
				    createui.removeFromParent(true);
				}
			},
			money:{
				_visible:function(){
					return false;
					//!jsclient.remoteCfg.hideMoney;
				},
				price:{ _run:function(){ price=this; }	}				
			},
			playType:{
				_run:function () {
					playType=this;
				},
				withPao:{_run:function () { withPao = this; this.visible = false; },
				_check:function (sender, type) {
					switch (type) {
						case ccui.CheckBox.EVENT_SELECTED:
							withPao.setSelected(true);
							noPao.setSelected(false);
							break;
						case ccui.CheckBox.EVENT_UNSELECTED:
							withPao.setSelected(false);
							noPao.setSelected(true);
							break;
					}
				}},
				noPao:{ _run:function () { noPao = this; this.visible = false; },
				_check:function (sender, type) {
					switch (type){
						case ccui.CheckBox.EVENT_SELECTED:
							withPao.setSelected(false);
							noPao.setSelected(true);
							break;
						case ccui.CheckBox.EVENT_UNSELECTED:
							withPao.setSelected(true);
							noPao.setSelected(false);
							break;
					}
				}},
				 canEat:{   _run:function(){ canEat=this; canEat.visible=false; }  }
				,withWind:{ _run:function(){ withWind=this; withWind.visible=false;}   }
				,canEatHu:{ _run:function(){ 
					canEatHu=this;
					
					posXoffset = canEatHu.x;
				 },	_check:function(sender, type)
					{
						switch (type) {
							case ccui.CheckBox.EVENT_SELECTED:
								zimohu.setSelected(false);
								break;
							case ccui.CheckBox.EVENT_UNSELECTED:
								zimohu.setSelected(true);
								break;
						}
					}
				 },
				canHu7:{
					_run:function(){
						canHu7=this;
					}
				},
				canHuWith258:{
					_run:function(){
						canHuWith258=this;
					}
				},
				withZhong:{
					_run:function(){
						withZhong=this;
					}
				},
				zimohu:{
					 _run:function(){ zimohu =this; this.visible = false; }
					 ,_check:function(sender, type)
					{
						switch (type) {
							case ccui.CheckBox.EVENT_SELECTED:
								canEatHu.setSelected(false);
								break;
							case ccui.CheckBox.EVENT_UNSELECTED:
								canEatHu.setSelected(true);
								break;
						}
					}
					 
				 }
			},
			playType_0:{
				_run:function () {
					playType_0=this;
				},
				canHu7:{
					_run:function(){
						hs_canHu7=this;
					}
				},
				withZhong:{
					_run:function(){
						hs_withZhong=this;
					}
				},
				withWind:{
					_run:function(){
						hs_withWind=this;
					}
				},
				withSixCards:{
					_run:function(){
						hs_withSixCards = this;
					}
				},
				xiaYu_2:{
					_run:function(){
						fish_two=this;
					},
					_check:function (sender, type) {
						switch (type) {
							case ccui.CheckBox.EVENT_SELECTED:
								fish_fve.selected = false;
								fish_eight.selected = false;
								break;
							case ccui.CheckBox.EVENT_UNSELECTED:
								break;
						}
					},
				},
				xiaYu_5:{
					_run:function(){
						fish_fve=this;
					},
					_check:function (sender, type) {
						switch (type) {
							case ccui.CheckBox.EVENT_SELECTED:
								fish_two.selected = false;
								fish_eight.selected = false;
								break;
							case ccui.CheckBox.EVENT_UNSELECTED:
								break;
						}
					},
				},
				xiaYu_8:{
					_run:function(){
						fish_eight=this;
					},
					_check:function (sender, type) {
						switch (type) {
							case ccui.CheckBox.EVENT_SELECTED:
								fish_two.selected = false;
								fish_fve.selected = false;
								break;
							case ccui.CheckBox.EVENT_UNSELECTED:
								break;
						}
					},
				},
			},
			round:{

					round4:{
						 _run:function(){ round4=this;  }
						,_check:function(sender, type)
						{
							
							switch (type) {
								case ccui.CheckBox.EVENT_SELECTED:
									clearRoundSelect(round4);
								     price.setString(jsclient.data.gameInfo.nxmj.round4);
									break;
								case ccui.CheckBox.EVENT_UNSELECTED:
								     round8.setSelected(true);
								     price.setString(jsclient.data.gameInfo.nxmj.round8);
									break;
							}
						}
					},
					round8:{
						 _run:function(){ round8=this;  }
						,_check:function(sender, type){
							switch (type) {
								case ccui.CheckBox.EVENT_SELECTED:
									  clearRoundSelect(round8);
								      price.setString(jsclient.data.gameInfo.nxmj.round8);
									break;
								case ccui.CheckBox.EVENT_UNSELECTED:
								      round16.setSelected(true);
									  price.setString(jsclient.data.gameInfo.nxmj.round16);
									break;
							}
						}
					},
					round16:{
						_run:function(){ round16=this;  }
						,_check:function(sender, type){
							switch (type) {
								case ccui.CheckBox.EVENT_SELECTED:
									clearRoundSelect(round16);
									price.setString(jsclient.data.gameInfo.nxmj.round16);
									break;
								case ccui.CheckBox.EVENT_UNSELECTED:
									round4.setSelected(true);
									price.setString(jsclient.data.gameInfo.nxmj.round4);
									break;
							}
						}
					}
			}
		},
	},
    ctor:function () {
        this._super();
        var jsonui = ccs.load(res.Create_json);
		ConnectUI2Logic(jsonui.node,this.jsBind);

		price.setString(getRoundPrice());

        this.addChild(jsonui.node);
        createui=this;
		console.log("-----------sxMethod.isSelected() = "+sxMethod.isSelected());
		if (sxMethod.isSelected())
		{
			console.log("------------playType_0.visible=false;");
			playType_0.visible=false;
		}

        return true;
    }
});
	
	
	
})();

