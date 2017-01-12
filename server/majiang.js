
(function()
{
	//// 吃 碰 杠 胡 左移 0-3 条万筒
	var mjcards=[
//条
1,2,3,4,5,6,7,8,9,
1,2,3,4,5,6,7,8,9,
1,2,3,4,5,6,7,8,9,
1,2,3,4,5,6,7,8,9,
//万
11,12,13,14,15,16,17,18,19,
11,12,13,14,15,16,17,18,19,
11,12,13,14,15,16,17,18,19,
11,12,13,14,15,16,17,18,19,
//筒
21,22,23,24,25,26,27,28,29,
21,22,23,24,25,26,27,28,29,
21,22,23,24,25,26,27,28,29,
21,22,23,24,25,26,27,28,29,


31,41,51,61,71,81,91,
31,41,51,61,71,81,91,
31,41,51,61,71,81,91,
31,41,51,61,71,81,91

]
var ylCanNotWinList=[1,2,11,12,21,22]
var ylCanNotEatWinList=[1,2,3,4,5,11,12,13,14,15,21,22,23,24,25]
var ylWinList=[1,2,3,4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,21,22,23,24,25,26,27,28,29,31,41,51,61,71,81,91];

	var cardHun=72;
//13张牌形 条  万   筒    中 发 白 梅兰竹菊  春夏秋冬
var s13=[1,9,11,19,21,29,31,41,51,61,71,81,91];
//判断能不能连 
function canLink(a,b)
{
  return (a+1==b||a==b);
}
//碰
function canMath3(cds,i)
{
   if(i+2<cds.length)
   {
	   // i i+1 i+2
	   // 花牌碰
	   if(cds[i]  ==cds[i+1] && cds[i]  ==cds[i+2] ) return true;
	   //字牌碰
	   if(cds[i]+1==cds[i+1] && cds[i]+2==cds[i+2] ) return true;
   }
   return false;
}
//连六：222 234 223344  顺子 将
function canMath6(cds,i)
{ 
	//cards  0 1 2 3 4 5 6
	if( i+5>=cds.length) return false;
	var pat=[[0,0,1,1,2,2],[0,1,1,2,2,3],[0,1,1,1,1,2]];
	for(var j=0;j<pat.length;j++)
	{
		var pj=pat[j];
		for(var k=0;k<pj.length;k++)
		{
			if(pj[k]+cds[i]!=cds[k+i]) break;
			if(k==pj.length-1) return true;
		}
	}
    return false;
}
var majiang={};

	///zys add
	var myObject;
	majiang.init = function (object)
	{
		console.log("majiang init-----------------------------");
		myObject = object;
	}
var nextTest=-1;
//测试牌
var testCds=
[
 [6,7,14,15,15,16,16,16,17,17,18,26,26,
1,2,3,4,5,6,7,8,9,11,12,13,21,
1,2,3,4,5,6,7,8,9,11,12,13,21,
1,2,3,4,5,6,7,8,9,11,12,13,23,
8,22,22]
,
 [1,2,3,4,5,6,7,8,9,11,12,13,21,
1,2,3,4,5,6,7,8,9,11,12,13,21,
1,2,3,4,5,6,7,8,9,11,12,13,21,
1,2,3,4,5,6,7,8,9,11,12,13,23,
21,22,22]
,
[1,2,3,4,5,6,7,8,9,2,29,1,9,
11,12,13,14,15,16,17,18,19,91,91,91,21,
11,12,13,14,15,16,17,18,19,81,81,81,21,
11,12,13,14,15,16,17,18,19,71,71,71,3,
3,29,29,29, 9],

 [1,1,2,2,3,3,11,11,12,12,13,13,14,
22,22,22,23,23,23,24,24,24,25,25,25,26,
11,11,11,12,12,12,13,13,13,14,14,14, 16,
31,31,31,41,41,41,51,51,51,61,61,61,71,
14],



[1,1,9,2,2,2,3,3,3,11,12,13,15,
1,15,19,18,18,18,17,17,17,16,16,16,12,
19,19,19,18,18,18,17,17,17,16,16,16,12,
11,11,2,2,3,3,4,4,5,5,6,6,7,
9,9,21,21,21,1,15]
,[1,1,1,2,2,2,3,3,3,11,12,13,15,
1,15,19,18,18,18,17,17,17,16,16,16,12,
19,19,19,18,18,18,17,17,17,16,16,16,12,
1,1,2,2,3,3,4,4,5,5,6,6,7,
9,9,15]
,  [1,1,1,2,2,2,3,3,3,11,12,13,15,
14,14,14,1,29,29,29,27,27,27,26,26,26,
14,19,19,18,18,18,17,17,17,16,16,16,12,
11,11,2,2,3,3,4,4,5,5,6,6,7,
1,15,91,91]
, [1,2,3,4,5,6,11,11,11,12,13,23,23,
14,14,14,24,29,29,29,27,27,27,26,26,26,
14,19,19,18,18,18,17,17,17,16,16,16,12,
1,1,2,2,3,3,4,4,5,5,6,6,7,
9,9,12,9]
,  [1,2,3,4,5,6,11,11,11,12,13,23,23,
14,14,13,24,29,29,29,27,27,27,26,26,26,
14,19,19,18,18,18,17,17,17,16,16,16,12,
1,1,2,2,3,3,4,4,5,5,6,6,7,
9,9,12,9,9,8,14,5]
,  [1,1,2,3,4,11,12,13,15,15,15,23,23,
14,14,14,1,29,29,29,27,27,27,26,26,26,
14,19,19,18,18,18,17,17,17,16,16,16,12,
1,1,2,2,3,3,4,4,5,5,6,6,7,
9,9,19,9,5]
,[1,2,3,4,5,6,11,11,11,21,22,23,9,
14,14,13,24,29,29,29,27,27,27,26,26,9,
14,12,12,12,12,15,17,17,17,16,16,16,12,
1,1,2,2,3,3,4,4,5,5,6,6,7,
19,19,12,19,19,18,14,5]
,[1,2,3,4,5,6,11,11,11,7,8,25,25,
14,14,14,24,29,29,29,27,27,27,26,26,9,
19,19,19,18,18,18,17,17,17,16,16,16,12,
1,1,2,2,3,3,4,4,5,5,6,6,7,
29,14,29,29,5]
, [1,2,3,4,5,6,11,12,13,14,15,16,21,
1,2,3,4,5,6,11,12,13,14,15,16,21,
31,31,31,41,41,41,51,51,51,61,61,61,21,
1,1,2,2,3,3,4,4,5,5,6,6,21,
31,9,9,9,5]
, [1,2,3,4,5,6,11,12,13,14,15,16,21,
1,2,3,4,5,6,11,12,13,14,15,16,21,
1,2,3,4,5,6,11,12,13,14,15,16,21,
1,1,2,2,3,3,4,4,5,5,6,6,21,
31,9,9,9,5]
,[2,3,11,12,13,14,15,16,5,5,5,23,23,
1,1,1,24,29,29,29,27,27,27,26,26,26,
1,19,19,18,18,18,17,17,17,16,16,16,12,
1,1,2,2,3,3,4,4,5,5,6,6,21,
9,1,15,6]
,

 [1,2,3,4,5,6,7,8,9,11,12,13,21,
1,2,3,4,5,6,7,8,9,11,12,13,21,
1,2,3,4,5,6,7,8,9,11,12,13,21,
1,2,3,4,5,6,7,8,9,11,12,13,23,
41,41,41,41,21]
, [1,2,3,4,5,6,7,8,9,2,61,1,9,
11,12,13,14,15,16,17,18,19,91,91,91,21,
11,12,13,14,15,16,17,18,19,81,81,81,21,
11,12,13,14,15,16,17,18,19,71,71,71,3,
41,41,41,41,31,31,31,9]
, [1,1,2,2,3,3,11,11,12,12,13,13,14,
22,22,22,23,23,23,24,24,24,25,25,25,26,
11,11,11,12,12,12,13,13,13,14,14,14, 16,
31,31,31,41,41,41,51,51,51,61,61,61,71,
29,29,29,29,14]
, [1,1,2,2,3,3,11,11,12,12,13,13,13,
22,22,22,23,23,23,24,24,24,25,25,25,26,
11,11,11,12,12,12,19,19,19,14,14,14, 16,
31,31,31,41,41,41,51,51,51,61,61,61,71,
29,29,29,29,13]
, [1,1,1,2,2,2,11,11,11,12,12,81,13,
19,19,19,18,18,18,17,17,17,16,16,16,12,
29,29,29,28,28,28,27,27,27,26,26,26,25,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,91,91,91,81,13]
,  [31,31,31,41,41,41,51,51,51,61,61,9,71
,1,1,1,2,2,2,11,11,11,12,12,81,61,
19,19,19,18,18,18,17,17,17,16,16,16,12,
29,29,29,28,28,28,27,27,27,26,26,26,25, 
91,91,91,91,81,71]
, [1,9,11,19,21,29,31,41,51,61,71,81,91,
15,19,19,18,18,18,17,17,17,16,16,16,12,
25,29,29,28,28,28,27,27,27,26,26,26,25,
31,31,15,41,41,41,51,51,51,61,61,61,71,
2,2,3,2,91]
,  [1,2,3,4,5,6,7,8,9,1,2,3,9,
19,19,19,18,18,18,17,17,17,16,16,16,12,
29,29,29,28,28,28,27,27,27,26,26,26,25,
31,31,15,41,41,41,51,51,51,61,61,61,71,
91,91,91,91,9]
,  [1,1,2,2,3,3,11,11,12,12,13,13,14,
22,22,22,23,23,23,24,24,24,25,25,25,26,
11,11,11,12,12,12,13,13,13,14,14,14, 16,
31,31,31,41,41,41,51,51,51,61,61,61,71,
29,29,29,29,14]
, [1,1,2,2,3,3,11,11,12,12,13,13,13,
22,22,22,23,23,23,24,24,24,25,25,25,26,
11,11,11,12,12,12,19,19,19,14,14,14, 16,
31,31,31,41,41,41,51,51,51,61,61,61,71,
29,29,29,29,13]
,  [1,1,1,2,2,2,11,11,11,12,12,12,13,
19,19,19,18,18,18,17,17,17,16,16,16,15,
29,29,29,28,28,28,27,27,27,26,26,26,25,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,91,91,91,13]
,  [31,31,31,41,41,41,51,51,51,61,61,61,71
,1,1,1,2,2,2,11,11,11,12,12,81,61,
19,19,19,18,18,18,17,17,17,16,16,16,12,
29,29,29,28,28,28,27,27,27,26,26,26,25, 
91,91,91,91,71]
, [1,9,11,19,21,29,31,41,51,61,71,81,91,
15,19,19,18,18,18,17,17,17,16,16,16,12,
25,29,29,28,28,28,27,27,27,26,26,26,25,
31,31,31,41,41,41,51,51,51,61,61,61,71,
2,2,3,2,91]
, [1,1,2,2,3,3,4,4,5,5,6,6,7,
22,22,22,23,23,23,24,24,24,25,25,25,26,
11,11,11,12,12,12,13,13,13,14,14,14, 16,
31,31,31,41,41,41,51,51,51,61,61,61,71,
29,29,29,29,7]
,  [1,1,2,2,3,3,4,4,5,5,6,6,6,
22,22,22,23,23,23,24,24,24,25,25,25,26,
11,11,11,12,12,12,13,13,13,14,14,14 ,16,
31,31,31,41,41,41,51,51,51,61,61,61,71,
29,29,29,29,6]
, [1,1,1,2,2,2,3,3,3,4,4,81,9,
19,19,19,18,18,18,17,17,17,16,16,16,4,
29,29,29,28,28,28,27,27,27,26,26,26,25,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,91,91,91,81,9]
,   [1,1,2,2,3,3,4,4,5,5,6,6,7,
22,22,22,23,23,23,24,24,24,25,25,25,26,
11,11,11,12,12,12,13,13,13,14,14,14, 16,
31,31,31,41,41,41,51,51,51,61,61,61,71,
29,29,29,29,7]
,  [1,1,2,2,3,3,4,4,5,5,6,6,7,
22,22,22,23,23,23,24,24,24,25,25,25,26,
11,11,11,12,12,12,13,13,13,14,14,14, 16,
31,31,31,41,41,41,51,51,51,61,61,61,71,
29,29,29,29,7]
,   [1,1,1,2,2,2,3,3,3,4,4,4,9,
19,19,19,18,18,18,17,17,17,16,16,16,15,
29,29,29,28,28,28,27,27,27,26,26,26,25,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,91,91,91,9]
,[1,1,71,2,2,2,3,3,3,11,12,13,15,
1,19,19,18,18,18,17,17,17,16,16,16,12,
29,29,29,28,28,28,27,27,27,26,26,26,25,
31,31,31,41,41,41,51,51,51,61,61,61,71,
81,81,21,21,21,1,15]
,[1,1,1,2,2,2,3,3,3,11,12,13,15,
1,19,19,18,18,18,17,17,17,16,16,16,12,
29,29,29,28,28,28,27,27,27,26,26,26,25,
31,31,31,41,41,41,51,51,51,61,61,61,71,
81,81,15]
,[1,1,1,2,2,2,3,3,3,11,12,13,15,
1,19,19,18,18,18,17,17,17,16,16,16,12,
29,29,29,28,28,28,27,27,27,26,26,26,25,
31,31,31,41,41,41,51,51,51,61,61,61,71,
1,15,91,91]
,[1,2,3,4,5,6,11,11,11,12,13,23,23,
14,14,14,24,29,29,29,27,27,27,26,26,26,
14,19,19,18,18,18,17,17,17,16,16,16,12,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,91,12,91]
,[1,2,3,4,5,6,11,11,11,12,13,23,23,
14,14,13,24,29,29,29,27,27,27,26,26,26,
14,19,19,18,18,18,17,17,17,16,16,16,12,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,91,12,91,91,81,14,5]
,[81,9,11,19,21,29,31,41,51,61,71,81,91,
1,1,1,24,29,29,29,27,27,27,26,26,26,
1,19,19,18,18,18,17,17,17,16,16,16,12,
31,31,31,41,41,41,51,51,51,61,61,61,71,
5,1,5]
,[1,1,2,3,4,11,12,13,15,15,15,23,23,
14,14,14,1,29,29,29,27,27,27,26,26,26,
14,19,19,18,18,18,17,17,17,16,16,16,12,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,91,19,91,5]
,[1,2,3,4,5,6,11,11,11,21,22,23,9,
14,14,13,24,29,29,29,27,27,27,26,26,9,
14,19,19,18,18,18,17,17,17,16,16,16,12,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,91,12,91,91,81,14,5]
,[1,2,3,4,5,6,11,11,11,7,8,25,25,
14,14,14,24,29,29,29,27,27,27,26,26,9,
19,19,19,18,18,18,17,17,17,16,16,16,12,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,14,91,91,5]
,[1,2,3,4,5,6,11,11,11,7,8,25,25,
14,14,14,24,29,29,29,27,27,27,26,26,9,
19,19,19,18,18,18,17,17,17,16,16,16,12,
31,31,31,41,41,41,51,51,51,61,61,61,71,
6,14,91,91,5]
, [1,2,3,4,5,6,11,11,11,7,8,25,25,
14,14,14,29,29,29,27,27,27,25,26,24,9,
19,19,19,18,18,18,17,17,17,16,16,16,12,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,9,91,91,5]
, 
[1,2,3,4,5,6,11,12,13,14,15,16,21,
1,2,3,4,5,6,11,12,13,14,15,16,21,
31,31,31,41,41,41,51,51,51,61,61,61,21,
14,19,19,18,18,18,17,17,17,16,16,16,12,
31,91,91,91,5]
, [1,2,3,4,5,6,11,12,13,14,15,16,21,
1,2,3,4,5,6,11,12,13,14,15,16,21,
1,2,3,4,5,6,11,12,13,14,15,16,21,
31,31,31,41,41,41,51,51,51,61,61,61,21,
31,91,91,91,5]
,[2,3,11,12,13,14,15,16,5,5,5,23,23,
1,1,1,24,29,29,29,27,27,27,26,26,26,
1,19,19,18,18,18,17,17,17,16,16,16,12,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,1,15,6]
,[1,1,1,2,3,4,12,13,14,15,16,22,22,
17,12,13,24,29,29,29,27,27,27,26,26,26,
14,19,19,18,18,18,15,15,15,16,16,16,17,
31,31,31,41,41,41,51,51,51,61,61,61,17,
81,29,81,18,81,31,81,91,91,91]
,[1,1,1,2,3,4,12,13,14,15,16,22,22,
17,12,13,24,29,29,29,27,27,27,26,26,26,
14,19,19,18,18,18,15,15,15,16,16,16,17,
31,31,31,41,41,41,51,51,51,61,61,61,17,
81, 81, 81, 81,91,91,91]
,[1,2,3,4,5,6,11,12,13,14,15,16,17,
22,23,21,1, 1,41,51,51,51,61,25,25,8,
21,21,24,29,29,28,28,28,27,27,27,25,1,
21, 7,6,1,18,17,17,16,15,14,23,22,23,
91,91,81,81,71,71]
,[1,2,3,4,5,6,11,12,13,14,15,16,17,
22,23,21,1, 1,41,51,51,51,61,25,25,8,
21,21,21,29,29,28,28,28,27,27,27,25,1,
8, 7,6,1,18,17,17,16,15,14,23,22,23,
91,91,91,81,81,81]
,[1,2,3,4,5,6,11,12,13,14,14,14,91,
91,91,91,11,13,15,17,19,21,1,3,5,6,
23,24,26,6,8,9,16,18,19,26,28,29,4,
31,31,31,41,41,41,51,51,51,61,61,61,21,
25,25,81,81,81]
, [1,2,3,4,5,6,11,12,13,14,14,14,91,
91,91,91,11,13,15,17,19,21,1,3,5,6,
23,24,26,6,8,9,16,18,19,26,28,29,4,
31,31,31,41,41,41,51,51,51,61,61,25,25,
25,25,81,81,81]
, [1,2,3,4,5,6,11,12,13,12,23,24,12,
31,31,31,41,41,41,51,51,8,61,25,25,25,
8,8,8,29,29,29,28,28,28,27,27,27,25,
7,6,19,18,17,17,16,15,14,23,22,23,24,
91,81,91,91,71]  ,
[31,31,31,41,41,41,51,51,8,61,25,25,25,
1,2,3,4,5,6,11,12,13,12,23,24,12,
8,8,8,29,29,29,28,28,28,27,27,27,25,
7,6,19,18,17,17,16,15,14,23,22,23,24,
91,81,91,91,71]   
, [1,2,3,4,5,6,11,12,13,22,23,24,25,
31,31,31,41,41,41,51,51,51,61,25,25,8,
8,8,8,29,29,29,28,28,28,27,27,27,25,
7,6,19,18,17,17,16,15,14,23,22,23,24,
91,81,91,91,71]  
,[2,3,11,12,13,14,15,16,5,5,5,23,23,
1,1,1,24,29,29,29,27,27,27,26,26,26,
1,19,19,18,18,18,17,17,17,16,16,16,12,
31,31,31,41,41,41,51,51,51,61,61,61,71,
91,1,15,6]

,[3,4,4,5,5,6,6,7,11,12,13,18,18,
22,22,22,23,23,23,24,24,24,25,25,25,26,
11,11,11,12,12,12,19,19,19,14,14,14, 16,
31,31,31,41,41,41,51,51,51,61,61,61,71,
2,91,91,91,5,81,81,81,8,71,71,71
]


  
];
majiang.randomCards=function(withWind,withZhong)
{
	//return testCds[(++nextTest)%testCds.length ];
	//风  中 
	var rtn=[]; rtn.length=withWind?mjcards.length:(mjcards.length-28);
	for(var i=0;i<rtn.length;i++) rtn[i]=mjcards[i];
	if(withZhong ){
		if(!withWind){
			for(var i = 0;i < 4;i++){
				rtn.push(71);
			}
		}

	}
	for(var i=0;i<rtn.length;i++)
	{
		var ci=rtn[i];
		var j=Math.floor( Math.random() *  rtn.length );
		rtn[i]=rtn[j];
		rtn[j]=ci;
	}
	return rtn;
}
//333 234 333 333 333 333
function canMath9(cds,i)
{
	if( i+8>=cds.length) return false;
	var pat=[[0,1,1,2,2,2,3,3,4],[0,1,1,1,2,2,2,3,3],[0,0,1,1,1,2,2,2,3]];
	for(var j=0;j<pat.length;j++)
	{
		var pj=pat[j];
		for(var k=0;k<pj.length;k++)
		{
			if(pj[k]+cds[i]!=cds[k+i]) break;
			if(k==pj.length-1) return true;
		}
	}
    return false;
}
//如果想胡牌必然是三扑一将（正常胡牌）。
//其中扑指的是顺子或者三重牌（比如 一饼二饼三饼  或者东风东风东风）。将指的是两个重牌
	function canMath12(cds,i)
	{   
		//1 1 1 1 1 6 7 8 9 10 11 12 13
		//1 2 3 4 5 6 7 8 9 10 11 12 13
		//1 1 
		if( i+11>=cds.length) return false;
	    var pat = [[0, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5],[0,1,1,2,2,2,2,3,3,3,4,4],[0,0,1,1,1,2,2,2,2,3,3,4]];

		for(var j=0;j<pat.length;j++)
		{
			var pj=pat[j];
			for(var k=0;k<pj.length;k++)
			{
				if(pj[k]+cds[i]!=cds[k+i]) break;
				if(k==pj.length-1) return true;
			}
		}
		return false;
	}
	//判断是否是 258 做将
	function isCard258(card) {
		switch (card){
			case 2:
			case 12:
			case 22:
			case 5:
			case 15:
			case 25:
			case 8:
			case 18:
			case 28:
				return true;
		}
		return false;
	}
	var cardType={//分牌类型
		tiao:0,
		tong:1,
		wan:2,
		feng:3,
		hun:4
	};
	//最小胡牌
	var MJPAI_HUNMAX=4;
	var needMinHunNum=MJPAI_HUNMAX;
	//麻将胡算法
	function calNeedHunNumToBePu(typeVec,needNum){
		var p1,p2,p3;
		if (needMinHunNum == 0) return;
		if (needNum >= needMinHunNum)return;
        //当前牌长度
		var vSize = typeVec.length;
		if (vSize == 0)
		{
			needMinHunNum = needNum>needMinHunNum ? needMinHunNum:needNum;
			return;
		}
		else if (vSize == 1)
		{
			needMinHunNum = (needNum+2)>needMinHunNum ? needMinHunNum:(needNum+2);
			return;
		}
		else if (vSize == 2)
		{
			p1 = typeVec[0];
			p2 = typeVec[1];
             //缺 1 张 胡  123
			if (p2 - p1 < 3)
			{
				needMinHunNum = (needNum+1)>needMinHunNum ? needMinHunNum:(needNum+1);
			}
			return;
		}
		//大于等于3张牌
		p1 = typeVec[0];
		p2 = typeVec[1];
		p3 = typeVec[2];
		var k2=1;
		var k3=2;

		//第一个自己一扑
		if (needNum + 2<needMinHunNum)
		{   //去掉1张牌 
			typeVec.splice(0,1);
			//递归检测
			calNeedHunNumToBePu(typeVec, needNum + 2);
			//添加回来
			typeVec.splice(0,0,p1);
		}
		//第一个跟其它的一个一扑
		if (needNum + 1<needMinHunNum)
		{
			for (var i = 1; i < typeVec.length; i++)
			{
				if (needNum + 1 >= needMinHunNum) break;
				p2 = typeVec[i];
				k2=i;
				//455567这里可结合的可能为 45 46 否则是45 45 45 46
				//如果当前的value不等于下一个value则和下一个结合避免重复
				if (i + 1 != typeVec.length)
				{
					p3 = typeVec[i + 1];
					k3=i+1;
					if (p3 == p2) continue;
				}
				if (p2 - p1 < 3)
				{
					typeVec.splice(0,1);
					typeVec.splice(k2-1,1);

					calNeedHunNumToBePu(typeVec, needNum + 1);

					typeVec.splice(k2-1,0,p2);
					typeVec.splice(0,0,p1);
				}
				else break;
			}

		}
		//第一个和其它两个一扑 扑 顺子 连或者3张一样的
		//后面间隔两张张不跟前面一张相同222234
		//可能性为222 234
		for (var ii = 1; ii < typeVec.length; ii++)
		{
			if (needNum >= needMinHunNum) break;
			p2 = typeVec[ii];
			k2=ii;
			if (ii + 2 < typeVec.length)
			{
				if (typeVec[ii + 2] == p2) continue;
			}
			for (var j = ii + 1; j < typeVec.length; j++)
			{
				if (needNum >= needMinHunNum) break;
				p3 = typeVec[j];
				k3=j;

				if (p1 == p3)
				{
				}
				if (j + 1 < typeVec.length)
				{
					if (p3 == typeVec[j + 1]) continue;
				}

				var tempSeg = [p1,p2,p3];
				if (canMatchSeq(tempSeg))
				{
					typeVec.splice(0,1);
					typeVec.splice(k2-1,1);
					typeVec.splice(k3-2,1);

					calNeedHunNumToBePu(typeVec, needNum);
					typeVec.splice(k3-2,0,p3);
					typeVec.splice(k2-1,0,p2);
					typeVec.splice(0,0,p1);
				}
				//4556
			}
		}
	}
	//判断混胡
	function isCanHunHu(hunNum,m_HuPaiVec,with258){
		var huSize = m_HuPaiVec.length;
		if (huSize <= 0)
		{
			if(hunNum >= 2){
				return true;
			}else{
				return false;
			}
		}
		var firstPai = m_HuPaiVec[0];
		var huPaiCopy=[];
		for(var i=0;i<m_HuPaiVec.length;i++){
			huPaiCopy.push(m_HuPaiVec[i]);
		}
		for (var it=0; it < huPaiCopy.length; it++)
		{
			if (it == huPaiCopy.length - 1)
			{
				if (hunNum > 0)
				{
					hunNum = hunNum - 1;
					var pairCard = huPaiCopy[it];
					m_HuPaiVec.splice(it,1);
					needMinHunNum = MJPAI_HUNMAX;
					calNeedHunNumToBePu(m_HuPaiVec, 0);
					if (needMinHunNum <= hunNum)
					{
						if(with258){
							if(isCard258(pairCard))
								return true;
						}else
							return true;
					}
					hunNum = hunNum + 1;
					m_HuPaiVec.splice(it,0,pairCard);
				}
			}
			else
			{
				if ((it + 2 == huPaiCopy.length) || (huPaiCopy[it]!= huPaiCopy[it + 2]))
				{
					if (huPaiCopy[it] == huPaiCopy[it+1])
					{
						var pair1 = m_HuPaiVec[it];
						var pair2 = m_HuPaiVec[it+1];
						m_HuPaiVec.splice(it,1);
						m_HuPaiVec.splice(it,1);

						needMinHunNum = MJPAI_HUNMAX;
						calNeedHunNumToBePu(m_HuPaiVec, 0);
						if (needMinHunNum <= hunNum)
						{
							if(with258){
								if(isCard258(pair1))
									return true;
							}else
								return true;
						}
						m_HuPaiVec.splice(it,0,pair2);
						m_HuPaiVec.splice(it,0,pair1);
					}
				}
				if (hunNum>0 && (huPaiCopy[it] != huPaiCopy[it+1]))
				{
					hunNum = hunNum - 1;
					var pair3 = m_HuPaiVec[it];
					m_HuPaiVec.splice(it,1);
					needMinHunNum = MJPAI_HUNMAX;
					calNeedHunNumToBePu(m_HuPaiVec, 0);
					if (needMinHunNum <= hunNum)
					{
						if(with258){
							if(isCard258(pair3))
								return true;
						}else
							return true;
					}
					hunNum = hunNum + 1;
					m_HuPaiVec.splice(it,0,pair3);
				}
			}
		}
		return false;
	}
	//判断顺子 胡牌
	function canMatchSeq(seg) {
		var matchOK=true;
		for(var m=0;m<seg.length;)
		{
			if(canMath12(seg,m))      m+=12;
			else if(canMath9(seg,m))  m+=9;
			else if(canMath6(seg,m))  m+=6;
			else if(canMath3(seg,m))  m+=3;
			else { matchOK=false; break; }
		}
		return matchOK;
	}
	function isTiao(card){
		if(card>=1&&card<=9){
			return true;
		}
		return false;
	}
	function isTong(card){
		if(card>=11&&card<=19){
			return true;
		}
		return false;
	}
	function isWan(card){
		if(card>=21&&card<=29){
			return true;
		}
		return false;
	}
	function isFeng(card){
		if(card>=31&&card<=91){
			return true;
		}
		return false;
	}
	function isHun(card,withFeng){
		if(card==71&&!withFeng){
			return true;
		} else if (card==cardHun&&withFeng) {
			return true;
		}
		return false;
	}
	function can_7_Hu(cds,cd,with258,withHun){
		var tmp=[];   for(var i=0;i<cds.length;i++) tmp.push(cds[i]);
		if(cd) tmp.push(cd); cds=tmp;
		cds.sort(function(a,b){return a-b});

		if(cds.length!=14){
			return false;
		}
		var oddCards=[];
		var pairs=[];
		var hunCards=[];
		var isodd258 = false;
		var ispair258 = false;
		for(i=0;i<cds.length;i++){
			if(withHun){
				if(isHun(cds[i])){
					hunCards.push(cds[i]);
					continue;
				}
			}
			if(i==cds.length-1){
				oddCards.push(cds[i]);
			}else if(cds[i]!=cds[i+1]){
				oddCards.push(cds[i]);
				if(with258&&isCard258(cds[i])){
					isodd258 = true;
				}
			}else{
				if(with258&&isCard258(cds[i])){
					ispair258 = true;
				}
				pairs.push(cds[i]);
				i++;
			}
		}
		if(oddCards.length>0){//有单牌
			if(withHun){
				if(hunCards.length>=oddCards.length&&((hunCards.length-oddCards.length)%2)==0){//单牌数==红中数
					if(with258&&(ispair258||isodd258)){
						return true;
					}else
						return true;
				}
			}
		}else{
			if(hunCards.length==2||hunCards.length==4){
				return true;
			}else if(with258){
				if(ispair258)
					return true;
			}else{
				return true;
			}
		}
		return false;
	}
	//癞子胡法
	function canHunHu (no7,cds,cd,with258,withHun,withFeng) {

		try{

			GLog("majiang------000withZhong "+withZhong);
			GLog("majiang------000");
			console.log("majiang------111");
		}catch (e){
			JSON.stringify(e);
		}

		//首先执行能否胡7对
		if(!no7){
			var isHu7 = can_7_Hu(cds,cd,with258,withHun);
			if(isHu7)
				return 7;
		}
		//分牌，按类型：条，筒，万，红中，1,2,3,5
		//1.初始化
		var allCards=[];
		allCards[cardType.tiao]=[];
		allCards[cardType.tong]=[];
		allCards[cardType.wan]=[];
		allCards[cardType.feng]=[];// 暂时没用到
		allCards[cardType.hun]=[];
		var tmp=[];
		for(var i=0;i<cds.length;i++){
			tmp.push(cds[i]);
		}
		if(cd){
			tmp.push(cd);
		}
		cds=tmp;
		cds.sort(function(a,b){return a-b});

		for(i=0;i<cds.length;i++){
			if (isHun(cds[i],withFeng)) {
				allCards[cardType.hun].push(cds[i]);
			} else if(isTiao(cds[i])){
				allCards[cardType.tiao].push(cds[i]);
			}else if(isTong(cds[i])){
				allCards[cardType.tong].push(cds[i]);
			}else if(isWan(cds[i])){
				allCards[cardType.wan].push(cds[i]);
			}else if(isFeng(cds[i])){
				allCards[cardType.feng].push(cds[i]);
			}
		}
		var needHunNum = 0;
		var jiangNeedNum = 0;
		needMinHunNum = MJPAI_HUNMAX;
		calNeedHunNumToBePu(allCards[cardType.wan], 0);
		var wanToPuNeedNum = needMinHunNum;

		needMinHunNum = MJPAI_HUNMAX;
		calNeedHunNumToBePu(allCards[cardType.tong], 0);
		var tongToPuNeedNum = needMinHunNum;

		needMinHunNum = MJPAI_HUNMAX;
		calNeedHunNumToBePu(allCards[cardType.tiao], 0);
		var tiaoToPuNeedNum = needMinHunNum;

		//支持风
		needMinHunNum = MJPAI_HUNMAX;
		calNeedHunNumToBePu(allCards[cardType.feng], 0);
		var fengToPuNeedNum = needMinHunNum;

		var hasNum = 0;
		var vecSize =0;
		var isHu = false;
		var hunHuType = 100;//混胡的类型定义
		var curHunNum = allCards[cardType.hun].length;
		// console.info("hun:"+curHunNum);
		// console.info("tongToPuNeedNum:"+tongToPuNeedNum);
		// console.info("tiaoToPuNeedNum:"+tiaoToPuNeedNum);
		// console.info("wanToPuNeedNum:"+wanToPuNeedNum);

		//将在万中
		//如果需要的混小于等于当前的则计算将在将在万中需要的混的个数
		needHunNum = tongToPuNeedNum + tiaoToPuNeedNum + fengToPuNeedNum;
		if (needHunNum <= curHunNum)
		{
			vecSize = allCards[cardType.wan].length;
			hasNum = curHunNum - needHunNum;
			//
			isHu= isCanHunHu(hasNum,allCards[cardType.wan],with258);
			if (isHu)  return hunHuType;
		}
		//将在饼中
		needHunNum = wanToPuNeedNum + tiaoToPuNeedNum + fengToPuNeedNum;
		if (needHunNum <= curHunNum)
		{
			vecSize = allCards[cardType.tong].length;
			hasNum = curHunNum - needHunNum;
			//
			isHu= isCanHunHu(hasNum,allCards[cardType.tong],with258);
			if (isHu)  return hunHuType;
		}
		//将在条中
		needHunNum = wanToPuNeedNum + tongToPuNeedNum + fengToPuNeedNum;
		if (needHunNum <= curHunNum)
		{
			vecSize = allCards[cardType.tiao].length;
			hasNum = curHunNum - needHunNum;
			//
			isHu= isCanHunHu(hasNum,allCards[cardType.tiao],with258);
			if (isHu)  return hunHuType;
		}
		//将在风中,支持
		needHunNum = wanToPuNeedNum + tongToPuNeedNum + tiaoToPuNeedNum;
		if (needHunNum <= curHunNum) {
			vecSize = allCards[cardType.feng].length;
			hasNum = curHunNum - needHunNum;
			//
			isHu = isCanHunHu(hasNum, allCards[cardType.feng], with258);
			if (isHu)  return hunHuType;
		}
		return 0;
	}
	majiang.canHu = function (no7, cds, cd,with258,withZhong) {

		try{

			GLog("majiang------000withZhong "+withZhong);
			GLog("majiang------000");
			console.log("majiang------111");
		}catch (e){
			JSON.stringify(e);
		}

		if(withZhong){
			return canHunHu(no7, cds, cd, with258,withZhong);
		}
		else {
			return canHuNoZhong(no7, cds, cd,with258);
		}
	}

	majiang.canTing=function (no7, cds, with258) {
		var tempcards = cds.slice();
		var isTing = false;
		var willPutCard;
		var canNotPutList=[],canPutList=[];

		for(var i=0;i<tempcards.length;i++){
			willPutCard = tempcards[i];
			tempcards.splice(i,1);
			isTing = canHunHu(no7,tempcards,cardHun,with258,true,true);
			tempcards.splice(i,0,willPutCard);
			if (isTing) {
				canPutList.push(willPutCard);
			} else {
				canNotPutList.push(willPutCard);
			}
		}

		return canNotPutList;
	}
	majiang.tingWinList=function (no7,cds,with258) {
		var tempcards = cds.slice();
		var winList = [];
		for(var i=0;i < ylWinList.length; i++)
		{
			if(canHunHu(no7,tempcards,ylWinList[i],with258,true,true))
			{
				winList.push(ylWinList[i]);
			}
		}
		return winList;
	}
	function canHuNoZhong(no7, cds, cd,with258) {
		var tmp=[];   for(var i=0;i<cds.length;i++) tmp.push(cds[i]);
		if(cd) tmp.push(cd); cds=tmp;

		cds.sort(function(a,b){return a-b});
		var pair={};
		//做将
		var isWith258 = false;
		if(with258){
			for(var i=0;i<cds.length;i++) {
				if (i < cds.length - 1 && cds[i] == cds[i + 1]) {
					switch (cds[i]){
						case 2:
						case 12:
						case 22:
						case 5:
						case 15:
						case 25:
						case 8:
						case 18:
						case 28:
							pair[cds[i]] = cds[i];
							isWith258 = true;
							break;
					}
				}
			}
		}
		else {
			for(var i=0;i<cds.length;i++) {
				if(i<cds.length-1 && cds[i]==cds[i+1]){
					pair[cds[i]] = cds[i];
				}
			}
		}
		if(Object.keys(pair).length==0) return -1;
		for(var pairKey in pair) {
			var pcd=pair[pairKey];
			var left=[];
			var pnum=0;
			for(var i=0;i<cds.length;i++)
			{
				if(cds[i]==pcd&&pnum<2)
					pnum++;
				else   left.push(cds[i]);
			}
			if(left.length==0) return 1;
			if(left.length==12)
			{
				var is13=true,off13=0;
				for(var i=0;i+off13<s13.length;i++)
				{
					if(pcd==s13[i]) off13++;
					if(left[i]!=s13[i+off13])
					{
						is13=false;
						break;
					}
				}
				if(off13==1&&is13) return 13;
				var is7=true;
				if(no7){
					is7=false;
				}
				else {
					for(var i=0;i<left.length;i+=2){
						if(left[i]!=left[i+1]) {
							is7=false;
							break;
						}
					}
				}
				if(is7){
					if(with258){
						if(isWith258){
							return 7;
						}
						else {
							return 0;
						}
					}
					else {
						return 7;
					}
				}
			}
			var segs=[];
			var seg=[left[0]];
			for(var i=1;i<left.length;i++)
			{
				if(canLink(left[i-1],left[i])) seg.push(left[i]);
				else
				{
					segs.push(seg);
					seg=[left[i]];
				}
			}
			if(seg.length>0) segs.push(seg);
			var matchOK=true;
			for(var i=0;i<segs.length;i++)
			{
				seg=segs[i];
				if(seg.length%3!=0){ matchOK=false; break; }
				for(var m=0;m<seg.length;)
				{
					if(canMath12(seg,m))      m+=12;
					else if(canMath9(seg,m))  m+=9;
					else if(canMath6(seg,m))  m+=6;
					else if(canMath3(seg,m))  m+=3;
					else { matchOK=false; break; }
				}
			}
			if(matchOK) return 1;
		}
		return 0;
	}

majiang.canGang1=function(peng,hand,peng4)
{
    var rtn=[];
	for(var i=0;i<peng.length;i++)
	{
		if(hand.indexOf(peng[i])>=0&&peng4.indexOf(peng[i])<0)
		{
			rtn.push(peng[i]);
		}
	}
	var cnum={};
	for(var i=0;i<hand.length;i++)
	{
		var cd=hand[i];
		var num=cnum[cd];
		if(!num) num=0;
		num++;
	    cnum[cd]=num;
		if(num==4) rtn.push(cd);
	}
	return rtn;
}
majiang.canGang0=function(hand,cd)
{
	var num=0;
	for(var i=0;i<hand.length;i++)
	{
		if(hand[i]==cd) num++;
	}
	return num==3;
}
majiang.canTingGang0=function (hand,cd) {
	var num = 0;
	var startPos;
	for (var i=0;i<hand.length;i++) {
		if(hand[i] == cd) num++;
		if(num==1) startPos=i;
	}
	if (num == 3) {
		var tempCards = hand.slice();
		tempCards.sort(function (a,b) {
			return a-b;
		});
		tempCards.splice(tempCards.indexOf(cd),3);
		if(canHunHu(true,tempCards,cardHun,false,true,true)) {
			return num==3;
		} else {
			return false;
		}
	}
	return false;
}
majiang.canPeng=function(hand,cd)
{
	var num=0;
	for(var i=0;i<hand.length;i++)
	{
		if(hand[i]==cd) num++;
	}
	return num>=2;
}
majiang.canChi=function(hand,cd)
{
	var num=[0,0,0,0,0];
	var rtn=[];
	for(var i=0;i<hand.length;i++)
	{
		var dif=hand[i]-cd ;
		switch(dif)
		{
			case -2:
			case -1:
			case 1:
			case 2:
			   num[dif+2]++;
			break;
		}
	}
	if(num[3]>0&&num[4]>0) rtn.push(0);
	if(num[1]>0&&num[3]>0) rtn.push(1);
	if(num[0]>0&&num[1]>0) rtn.push(2);
	return rtn;
}

majiang.OnlyHand=function(pl)
{
	return   pl.mjpeng.length==0 && pl.mjgang0.length==0&&pl.mjchi.length==0;
}
majiang.SameColor=function(pl)
{
	var test=[  pl.mjhand,  pl.mjpeng,  pl.mjgang0,  pl.mjgang1,  pl.mjchi	];
	var color=-1;
	for(var i=0;i<test.length;i++)
	{
		var cds=test[i];
		for(var j=0;j<cds.length;j++)
		{
			var cd=cds[j];
			if(color==-1) color=Math.floor(cd/10);
			else if(color!=Math.floor(cd/10)) return false;
		}
	}
	return true;
}
majiang.All3=function(pl)
{
	if(pl.mjchi.length>0) return 0;
	var hnum={};
	var mjhand=pl.mjhand;
	for(var i=0;i<mjhand.length;i++)
	{
		var cd=mjhand[i];
		var cnum=hnum[cd];
		if(!cnum) cnum=0;
		cnum++;
		hnum[cd]=cnum;
	}
	var smallNum=0;
	var num2=0;
	for(var cd in hnum)
	{
		var cnum=hnum[cd];
		if(cnum!=3) num2++;
		else if(cd<30) smallNum++;
	}
	if(num2>1) return 0;
	if(smallNum>0) return 1;
	var test=[   pl.mjpeng,  pl.mjgang0,  pl.mjgang1];
	for(var i=0;i<test.length;i++)
	{
		var cds=test[i];
		for(var j=0;j<cds.length;j++)
		{
			if(cds[j]<30) return 1;
		}
	}
	return 2;
}
majiang.CardCount=function(pl)
{
	var rtn=(pl.mjpeng.length+ pl.mjgang0.length+ pl.mjgang1.length)*3+pl.mjchi.length;
	if(pl.mjhand) rtn+=pl.mjhand.length;
	return rtn;
}
majiang.NumOK=function(pl)
{
	return pl.mjhand.length+(pl.mjpeng.length+pl.mjgang0.length+pl.mjgang1.length)*3+pl.mjchi.length==14;
}

	function TestRandomCards()
	{
		var cards=majiang.randomCards();
		var nums={};
		for(var i=0;i<cards.length;i++)
		{
			var cd=cards[i];
			if(!nums[cd]) nums[cd]=1;
			else nums[cd]=nums[cd]+1;
		}
		for(var c in nums)
		{
			if(nums[c]!=4) console.error("not 4");
		}
		if(Object.keys(nums).length!=34) console.error("not 34");
	}
	function TestHu()
	{
		var hu=[
/*		   
		   [19,5,8,16,2,23,11,6,31,13,26,1,28,81]
		   ,[1,9,11,19,21,29,31,41,51,61,71,81,91,71]
		   ,[1,1, 2,2, 3,3, 4,4, 5,5, 6,6, 7,7]
		   ,[1,2,3,4,4]
		   ,[1,1,2,2,3,3,4,4]
		   ,[8,5,15,14,16,81,6,27,21,22,17,13,12,91]
		   ,*/
		   //[15,17,23,18,16,23,15,15]
		   [6,7,14,15,15,16,16,16,17,17,18,26,26,8]
		];
		for(var i=0;i<hu.length;i++)
		{
			console.info( majiang.canHu(false,hu[i])+" "+hu[i]);
		}
	}
	function TestcanGang1()
	{
		var gang=[
		  [[1],[1,2,2,2,2]],
		  [[1],[2,3]],
		];
		for(var i=0;i<gang.length;i++)
			console.info(majiang.canGang1(gang[i][0],gang[i][1] ));
	}
	function TestChi()
	{
		
		var chi=[
		  
		  [1,2,4,5],3
		  
		  ];
		  console.info(majiang.canChi(chi,3));
	}
	function TestCardType()
	{
		var tests=
		[
		    {name:"", mjpeng:[2,18],mjgang0:[],mjgang1:[],mjchi:[],mjhand:[4,4,4,5,5,5,5,6],mjdesc:[],baseWin:0 }	
		   ,{name:"", mjpeng:[],mjgang0:[],mjgang1:[],mjchi:[],mjhand:[],mjdesc:[],baseWin:0 }	
		   ,{name:"", mjpeng:[],mjgang0:[],mjgang1:[],mjchi:[],mjhand:[],mjdesc:[],baseWin:0 }	
		   ,{name:"", mjpeng:[],mjgang0:[],mjgang1:[],mjchi:[],mjhand:[],mjdesc:[],baseWin:0 }	
		   ,{name:"", mjpeng:[],mjgang0:[],mjgang1:[],mjchi:[],mjhand:[],mjdesc:[],baseWin:0 }	
		];
		for(var i=0;i<tests.length;i++)
		{
			var pl=tests[i];
			if(!majiang.NumOK(pl))
			{
 				pl.mjdesc.push("牌数不对"); 
				pl.huType=-1;
		    }
			else {
				try{
					GLog("majiang------000");
					console.log("majiang------111");
				}catch (e){
					JSON.stringify(e);
				}
				pl.huType=majiang.canHu(false,pl.mjhand);
				try{
					GLog("majiang------222");
					console.log("majiang------333");
				}catch (e){
					JSON.stringify(e);
				}
			}
            if(pl.huType==0)
			{
				pl.mjdesc.push("不胡");
			}
			else if(pl.huType>0)
			{
				var is13=pl.huType==13;
				var allHand=majiang.OnlyHand(pl);
				var num2=pl.huType==7?1:0;	if(num2==1&&majiang.canGang1([],pl.mjhand).length>0) num2=2;
				var num3=(num2>0||is13)?0:majiang.All3(pl);
				var sameColor=is13?false:majiang.SameColor(pl);
				var baseWin=1;
				if(allHand) //门清
				{
					baseWin*=4;	pl.mjdesc.push("门清");
				} 
				if(sameColor)//清一色
				{ 
				   baseWin*=8;  pl.mjdesc.push("清一色");
				} 
				if(is13) 
				{	
				   baseWin*=24; pl.mjdesc.push("十三幺");
				}
				if(num2>0)
				{
					baseWin*=num2>1?16:8;  pl.mjdesc.push(num2>1?"龙七对":"七巧对");
				}
				if(num3>0)
				{
					baseWin*=num3>1?16:8;  pl.mjdesc.push(num3>1?"风一色":"大对碰");
				}
				if(pl.mjdesc.length==0) pl.mjdesc.push("平胡");
				pl.baseWin=baseWin;
			}
			console.info(pl.name+" "+pl.mjdesc+"  "+pl.baseWin);
		}
	}
	
	
	function DoTest()
	{
		//TestCardType();
		//TestRandomCards();
		//TestHu();
		//TestcanGang1();
		//TestChi();
		//console.info(majiang.canGang0([2,3,4,3,3],3));
		//console.info(majiang.canPeng([2,3,4,3,3],3));
		
	}
	
	if (typeof(jsclient) != "undefined")
	{
	   jsclient.majiang=majiang;
	}
	else
	{
	   module.exports=majiang;
	   DoTest();
	}
	
	
})();







