module.exports = function(app,server,gameid){return {

   info:{   round4:2, round8:3, round16:5, iosiap:{"com.happyplay.sxmj15":15,"com.happyplay.sxmj60":60,"com.happyplay.sxmj150":150,"com.happyplay.sxmj320":320}  },

   rooms:
   {
	   symj1:{name:"symj1",scene:"", full:4,type:"symj",removeLess:true,reconnect:true,vip:true},
	   symj2:{name:"symj2",scene:"", full:4,type:"symj",removeLess:true,reconnect:true,vip:false},
	   scmj1:{name:"scmj1",scene:"", full:4,type:"scmj"}
   },
   viptable:
   {
	   round4:{round:4, money:2 },
       round8:{round:8, money:3 },
       round16:{round:16, money:5 },
       round104:{round:4, money:0},
       round108:{round:8, money:0},
       round116:{round:16, money:0}
   },
   initData:
   {
	   coin:5000,
	   money:9
   },
   full4create:function(para)// para是创建房间的参数
   {
      return 4;
   }
}}
