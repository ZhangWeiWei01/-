(function(){
	
var createui,dc,shoplay
var dc = [60, 180, 300, 680]
function onClickBuyBTN(item_num) {
    jsclient.Scene.addChild(new BuyConfirmLayer(item_num,jsclient.coinarry[item_num-1]));
}

ShopLayer = cc.Layer.extend({
	jsBind:{
        block:{
			_layout:[[1,1],[0.5,0.5],[0,0], true]
        },
        back:{
            _layout:[[0.65,0.78],[0.5, 0.5],[0,0]]
        },
        item_back_1:{
            _layout:[[0.119,0.297],[0.297,0.492],[0,0]]
            , item_price:{
                _run:function () {
                   this.setString(jsclient.coinarry[0]);
                }
            }
            ,buy:{
                _click:function () {
                    onClickBuyBTN(1);
                },
                price:{
                    _run:function () {
                        this.setString(jsclient.moneyarray[0]);
                    }
                }
            }
        },
        item_back_2:{
            _layout:[[0.119,0.297],[0.428,0.492],[0,0]],
            item_price:{
                _run:function () {
                    this.setString(jsclient.coinarry[1]);
                }
            }
            ,buy:{
                _click:function () {
                    onClickBuyBTN(2);
                },
                price:{
                    _run:function () {
                        this.setString(jsclient.moneyarray[1]);
                    }
                }
            }
        },
        item_back_3:{
            _layout:[[0.119,0.297],[0.56,0.492],[0,0]],
            item_price:{
                _run:function () {
                    this.setString(jsclient.coinarry[2]);
                }
            }
            ,buy:{
                _click:function () {
                    onClickBuyBTN(3);
                },
                price:{
                    _run:function () {
                        this.setString(jsclient.moneyarray[2]);
                    }
                }
            }
        },
        item_back_4:{
            _layout:[[0.119,0.297],[0.693,0.492],[0,0]],
            item_price:{
                _run:function () {
                    this.setString(jsclient.coinarry[3]);
                }
            }
            ,buy:{
                _click:function () {
                    onClickBuyBTN(4);
                },
                price:{
                    _run:function () {
                        this.setString(jsclient.moneyarray[3]);
                    }
                }
            }
        },
        no:{
            _layout:[[0.043, 0.078],[0.773, 0.82],[0,0]]
            ,_click:function () {
                createui.removeFromParent(true);
            }
        }
	},
    ctor:function (dc) {
        this._super();
        shoplay=this;
        var jsonui = ccs.load(res.Shop_json);
		ConnectUI2Logic(jsonui.node,this.jsBind);


        this.addChild(jsonui.node);
        createui=this;
        dc = dc;
        return true;
    }
});
	
	
	
})();

