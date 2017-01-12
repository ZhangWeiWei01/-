(function(){
	
var buyConfirmUI, dc,item,btnclick,product
function onClickBuyBTN(item_num) {
    cc.log("== item_num: " + item_num);
	item =item_num;
}


BuyConfirmLayer = cc.Layer.extend({
	jsBind:{
        block:{
			_layout:[[1,1],[0.5,0.5],[0,0], true]
        },
        back:{
            _layout:[[0.402,0.508],[0.5, 0.5],[0,0]]
        },
        cancel:{
            _layout:[[0.137,0.072],[0.415,0.34],[0,0]],
            _click:function () {
                buyConfirmUI.removeFromParent(true);
            }
        },
        confirm:{
            _layout:[[0.137,0.072],[0.583,0.34],[0,0]],
			_click:function () {

                btnclick=1;
                buyConfirmUI.onClickBuyiap();
            },_event: {
                iosiapFinish: function () {
                    if(btnclick ==1) {
                        jsclient.unblock();
                        buyConfirmUI.removeFromParent(true);
                    }
                    buyConfirmUI.PluginIAP.callFuncWithParam("finishTransaction", new plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, product));
                }

            }
        },
        content:{
        },
        number:{
            _text:function(){ cc.log(" number _text : "); return ""+dc+"个";},
        },
        diamond:{
        }
	},
    ctor:function (dct,coin) {
        this._super();
        dc = dct;


        buyConfirmUI = this;
        var jsonui = ccs.load(res.BuyConfirm_json);
		ConnectUI2Logic(jsonui.node,this.jsBind);
       

      //  cc.log(" dct " + dc);
		if(  cc.sys.OS_IOS == cc.sys.os )
		{
		   this.initPlugin();
		}
		btnclick=0;
        jsonui.node.getChildByName("back").getChildByName("number").setString(""+coin+"个")
        this.addChild(jsonui.node);
        return true;
    },initPlugin: function () {
        var pluginManager = plugin.PluginManager.getInstance();
        this.PluginIAP = pluginManager.loadPlugin("IOSIAP");
                                      
    
        this.PluginIAP.callFuncWithParam("setServerMode");
        this.PluginIAP.setListener(this);
                                      
     
    },onClickBuyiap:function (){
    if(  cc.sys.OS_IOS == cc.sys.os )
	{
	


			jsclient.block();
			var pidList = [];
			cc.log(jsclient.iaparray);
			product=jsclient.iaparray[dc-1];
			pidList.push(product);
			cc.log(pidList);
			if(pidList.length < 0)
			{
				jsclient.unblock();
			}else{
             this.PluginIAP.callFuncWithParam("requestProducts", plugin.PluginParam(plugin.PluginParam.ParamType.TypeString, pidList.toString()));
			}

	
	}


},onPayResult: function (ret, msg, productInfo) {
 
                               
       var str = "";
       if (ret == plugin.ProtocolIAP.PayResultCode.PaySuccess)
       {
 
		   //if you use server mode get the receive message and post to your server
		    if ( msg)
			{
	 
	 
			 this.postServerData(msg);
			 }
		     } else if (ret == plugin.ProtocolIAP.PayResultCode.PayFail)
		    {
				 str = "payment fail";
				  btnclick=0;
				jsclient.unblock();
		    }
      },onRequestProductResult: function (ret, productInfo)
       {
            var msgStr = "";
            if (ret == plugin.ProtocolIAP.RequestProductCode.RequestFail) {
 
					btnclick=0;
					jsclient.unblock();
	        } else if (ret == plugin.ProtocolIAP.RequestProductCode.RequestSuccess)
            {
               
               this.product = productInfo;
                msgStr = "list: [";
                   for (var i = 0; i < productInfo.length; i++)
                   {
                    var product = productInfo[i];
                    msgStr += product.productName + " ";
                    }
                 msgStr += " ]";
           }
          this.PluginIAP.payForProduct(this.product[0]);
        },postServerData: function (data) {
           
          
         
           jsclient.gamenet.request("pkplayer.handler.iosiap",{transactionReceipt:data},
				function(rtn)
				{


				    

					
					
				});

           
          
			  
              
          
          
		}
});
	
	
	
})();

