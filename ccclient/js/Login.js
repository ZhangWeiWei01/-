(function(){
	
	
function f_login(mail,code,isLocalGuest)
{
	var loginData=code?	{  mail: mail, code: code}:mail;
	
	loginData.resVersion=jsclient.resVersion;
	loginData.app={appid:"com.coolgamebox.nxmj",os:cc.sys.os};

	jsclient.gamenet.request("pkcon.handler.doLogin", loginData,
	function (rtn) 
	{
		cc.log("login "+rtn.result);
		var unblock=true;
		if (rtn.result==ZJHCode.Success) 
		{
			if(code) sys.localStorage.setItem("loginData", JSON.stringify(loginData));  
			sendEvent("loginOK",rtn);
		}
		else if(rtn.result==ZJHCode.playerNotFound)
		{
			if(isLocalGuest)
			{
				unblock=false;
				getGuest();
			}
		}
		else if(rtn.result==ZJHCode.serverFull)
		{
		}
		else if(rtn.result==ZJHCode.clientRestart)
		{
		}
		// else if(rtn.result==ZJHCode.clientUpdate)
		// {
		// }
		
		if(unblock) jsclient.unblock();
		
	});
}
function getGuest()
{
	  jsclient.gamenet.request("login.handler.reqGuestID", { app:"zjh"},function(rtn){
		  if(rtn.result==0)
		  {
			  sys.localStorage.setItem("guestData", JSON.stringify(rtn));    
			  f_login(rtn.mail,rtn.code,false);//getGuest
		  }
	  });
}
function LoginAsGuest()
{
	 // jsclient.block();
	 var guest=sys.localStorage.getItem('guestData');
	 if(guest) guest=JSON.parse(guest);
	 if(!guest) 
	 {
		getGuest();
	 }
	 else if(guest.mail&&guest.code)
	 {
		 f_login(guest.mail,guest.code,true);//guest login
	 }
	 else getGuest();
}
function LoginAsWeChat(wxInfo)
{
	jsclient.block();
	wxInfo.lType="wx";
	f_login(wxInfo);
}
        var uI=0;
		var users=[

		  [100002,"bxTwJx"],
          [31001,"EHGkmg"],
		  [14001,"OpCLnx"],
		  [20001,"RuvlVf"]
		];

jsclient.autoLogin=function()
{
	// jsclient.block();
	var WX_USER_LOGIN=sys.localStorage.getItem("WX_USER_LOGIN");
	if(WX_USER_LOGIN)
	{
		WX_USER_LOGIN=JSON.parse(WX_USER_LOGIN);
		LoginAsWeChat(WX_USER_LOGIN);
	}
	else
	{
		var loginData=sys.localStorage.getItem("loginData");
		if(loginData)
		{
			loginData=JSON.parse(loginData);
			f_login(loginData.mail,loginData.code);
		}
	}
}


var agreeNode;

LoginLayer = cc.Layer.extend({
	jsBind:{
		back:
		{	_layout:[[1,1],[0.5,0.5],[0,0],true]
		},
		wechatLogin:
		{
		    _layout:[[0.6,0.1],[0.5,0.5],[0,-3]],
			_click:function(btn,etype)
			{
				if(agreeNode.isSelected())
				{
					if(jsclient.native) jsclient.native.wxLogin();
					else LoginAsGuest();
				}
			},
			legal:{
				_click:function(){

					jsclient.openWeb({url:jsclient.remoteCfg.legalUrl,help:false});
				}
			},
			agree:{
				_run:function(){ agreeNode=this; }
			},
             _run:function()
             {
                 if(jsclient.remoteCfg.hideMoney)
                 {
                     this.touchEnabled=false;
                     this.setCascadeOpacityEnabled(false);
                     this.opacity=0;
                 }
				 cc.log("===== console.log =======");

				 if(jsclient.remoteCfg.hideWechat)
				 {
					 this.visible=false;
				 }
			 }

		},
		guestLogin:
		{
		    _visible:function()
			{
				return (cc.sys.OS_WINDOWS == cc.sys.os) || jsclient.remoteCfg.guestLogin;
			},
            _run:function()
              {
                  if(jsclient.remoteCfg.hideMoney||jsclient.remoteCfg.hideWechat)
                  {
                      doLayout(this,[0.6,0.1],[0.5,0.5],[0,-3]);
                  }
                  else 
                  {
                      doLayout(this,[0.6,0.1],[0.5,0.5],[1.2,-3]);
                  }
              }

		    ,_click:function()
			{

				if(agreeNode.isSelected())		LoginAsGuest();
			}
		}
		,
		_event:
		{
			WX_USER_LOGIN:function(para)
			{
				if(para.openid)
				{
					
					cc.loader.loadTxt(jsb.fileUtils.getWritablePath()+"nickname.txt",
					function(er,txt){
						if(txt)
						{
							para.nickname=escape(txt);
							sys.localStorage.setItem("WX_USER_LOGIN", JSON.stringify(para));  
							LoginAsWeChat(para);
						}
					}); 
				}
			},
			loginOK:function()
			{
				jsclient.loginui.removeFromParent(true);	
				delete jsclient.loginui;			  
			}
		},
		varsion:{
			_layout:[[0.1,0.1],[0.92,0.95],[0,0]],
			_run:function () {
				var ver = "ver:" + jsclient.resVersion;
				this.setString(ver);
			}
		}
		,slogan:{
			_layout:[[0.95, 0.95], [0.5, 0.035], [0, 0]]
		}
		,_keyboard:
		{
			onKeyPressed: function (key, event) {         },
			onKeyReleased: function (key, event) {
			   key-=96;
			   if(key==9&&uI>=0&&uI<users.length)
			   {
				   f_login(users[uI][0],users[uI][1]);
			   }
			   else if(key>=0&&key<users.length)
			   {
				   uI=key;
				   mylog(uI+" "+users[uI]);
			   }
			}
		}
	},
    ctor:function () {
        this._super();
        var loginui = ccs.load(res.Login_json);
		ConnectUI2Logic(loginui.node,this.jsBind);
        this.addChild(loginui.node);
		jsclient.loginui=this;
		
        jsclient.autoLogin();
	
		
		
        return true;
    },
});
	
	
	
	
	
	
})();


