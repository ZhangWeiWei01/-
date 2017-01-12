/****************************************************************************
Copyright (c) 2008-2010 Ricardo Quesada
Copyright (c) 2010-2012 cocos2d-x.org
Copyright (c) 2011      Zynga Inc.
Copyright (c) 2013-2014 Chukong Technologies Inc.
 
http://www.cocos2d-x.org

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
 ****************************************************************************/
package org.cocos2dx.javascript;

import java.io.BufferedOutputStream;
import java.io.ByteArrayOutputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;

import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.cocos2dx.lib.Cocos2dxHelper;
import org.json.JSONObject;

import android.app.Activity;
import android.app.Service;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.Bitmap.CompressFormat;
import android.graphics.BitmapFactory;
import android.media.AudioFormat;
import android.media.AudioRecord;
import android.media.MediaRecorder;
import android.os.Bundle;
import android.os.Environment;
import android.os.Vibrator;
import android.util.Log;
import android.view.WindowManager;
import android.widget.Toast;
import com.happyplay.pop.popAlert;

import com.happyplay.httpClient.httpClient;
import com.happyplay.nxmj.R;
import com.pocketdigi.utils.FLameUtils;
import com.tencent.mm.sdk.modelmsg.SendAuth;
import com.tencent.mm.sdk.modelmsg.SendMessageToWX;
import com.tencent.mm.sdk.modelmsg.WXImageObject;
import com.tencent.mm.sdk.modelmsg.WXMediaMessage;
import com.tencent.mm.sdk.modelmsg.WXTextObject;
import com.tencent.mm.sdk.modelmsg.WXWebpageObject;
import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.WXAPIFactory;

public class AppActivity extends Cocos2dxActivity  // implements
// IWXAPIEventHandler
{

	public static String AppID = "wx1413681cdd56b1a6";
	public static String AppSecret = "abff0de40e05fff42f581be6840079a4";
	public static String deepshareAppID = "569f065e87c5822";
	private BatteryReceiver receiver = null;
	private VibratorUtil vibrato = null;
	public IWXAPI api;

	// ----------------褰曢煶------------
	private static short[] mBuffer;
	private static AudioRecord mRecorder;
	static String tempFile;
	static String mp3Path;
	static boolean isRecording = false;
	static boolean isStartRecording = false;
	static boolean canSend = true;

	// ----------------褰曢煶------------

	public class BatteryReceiver extends BroadcastReceiver {

		@Override
		public void onReceive(Context arg0, Intent arg1) {
			// TODO Auto-generated method stub
			int current = arg1.getExtras().getInt("level");// 闁跨喐鏋婚幏椋庡缚闁跨喕顫楃敮顔藉闁跨喐鏋婚幏鐑芥晸閿燂拷
			int total = arg1.getExtras().getInt("scale");// 闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归懝鍧楁晸閺傘倖瀚归柨鐕傛嫹
			int percent = current * 100 / total;
			Log.i("battery", "闁跨喐鏋婚幏鐑芥晸閼哄倻娈戠喊澶嬪闁跨喐鏋婚幏鐑芥晸閺傘倖瀚�" + percent
					+ "%闁跨喐鏋婚幏锟�");
			RunJS("nativePower", percent + "");
			unregisterReceiver(receiver);
		}

	}

	/**
	 * 閹靛婧�闂囧洤濮╁銉ュ徔缁拷
	 * 
	 * @author Administrator
	 * 
	 */
	public class VibratorUtil {

		/**
		 * final Activity activity 閿涙俺鐨熼悽銊嚉閺傝纭堕惃鍑檆tivity鐎圭偘绶� long
		 * milliseconds 閿涙岸娓块崝銊ф畱閺冨爼鏆遍敍灞藉礋娴ｅ秵妲稿В顐ゎ潡 long[] pattern
		 * 閿涙俺鍤滅�规矮绠熼棁鍥уЗ濡�崇础
		 * 閵嗗倹鏆熺紒鍕厬閺佹澘鐡ч惃鍕儓娑斿绶峰▎鈩冩Ц[闂堟瑦顒涢弮鍫曟毐閿涘矂娓块崝銊︽闂�鍖＄礉闂堟瑦顒涢弮鍫曟毐閿涘矂娓块崝銊
		 * ︽闂�瑁わ拷鍌橈拷鍌橈拷淇旈弮鍫曟毐閻ㄥ嫬宕熸担宥嗘Ц濮ｎ偆顫� boolean isRepeat 閿涳拷
		 * 閺勵垰鎯侀崣宥咁槻闂囧洤濮╅敍灞筋洤閺嬫粍妲竧rue閿涘苯寮芥径宥夋缚閸旑煉绱濇俊鍌涚亯閺勭棞alse閿涘苯褰ч棁鍥уЗ娑擄拷濞嗭拷
		 */

		public void Vibrate(final Activity activity, long milliseconds) {
			Vibrator vib = (Vibrator) activity
					.getSystemService(Service.VIBRATOR_SERVICE);
			vib.vibrate(milliseconds);
		}

		public void Vibrate(final Activity activity, long[] pattern,
				boolean isRepeat) {
			Vibrator vib = (Vibrator) activity
					.getSystemService(Service.VIBRATOR_SERVICE);
			vib.vibrate(pattern, isRepeat ? 1 : -1);
		}

	}

	public void RunJS(String name, String param) {

		Cocos2dxHelper.runOnGLThread((new Runnable() {

			String js;
			String para;

			@Override
			public void run() {
				// TODO Auto-generated method stub
				Log.i("weixin", "js:" + js);
				Log.i("weixin", "para:" + para);
				String command = "cc.eventManager.dispatchCustomEvent('" + js
						+ "','" + para + "' )";
				Log.i("command", command);
				org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge
						.evalString(command);
			}

			public Runnable setjs(String js, String pa) {
				this.js = js;
				this.para = pa;
				return this;
			}

		}).setjs(name, param));
	}

	public void getBatteryCount() {
		receiver = new BatteryReceiver();
		IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
		registerReceiver(receiver, filter);
	}

	public void onNativeVibrato(long[] pattern, boolean isRepeat) {

		if (isRepeat) {
			Log.i("vib", "3");
		} else {
			Log.i("vib", "4");
		}
		vibrato.Vibrate(ccActivity, pattern, isRepeat);
	}

	public static void NativeBattery() {
		ccActivity.getBatteryCount();
	}

	public static void NativeVibrato(String pattern, String isRepeat) {
		Log.i("vib", "1");

		boolean isRepeat_b = false;
		if (isRepeat.equals("true")) {
			isRepeat_b = true;
		}

		String[] strArry = pattern.split(",");
		long[] arry = new long[strArry.length];
		for (int i = 0; i < strArry.length; i++) {
			arry[i] = Long.valueOf(strArry[i]);
		}

		Log.i("vib", "3");

		ccActivity.onNativeVibrato(arry, isRepeat_b);
		Log.i("vib", "4");
	}

	public void regToWx() {

		api = WXAPIFactory.createWXAPI(this, AppID, true);
		api.registerApp(AppID);

	}

	public void wxLogin() {
		// send oauth request
		Log.i("weixin", "wxlogin");
		SendAuth.Req req = new SendAuth.Req();
		req.scope = "snsapi_userinfo";
		req.state = "wechat_sdk_demo_test";
		api.sendReq(req);
		Log.i("weixin", "wxlogin");
	}

	public void wxShareText(String path) {

		// 闁跨喐鏋婚幏宄邦潗闁跨喐鏋婚幏鐑芥晸閿燂拷?闁跨喍鑼庨幉瀣闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹风兘鏁撻敓锟�
		Log.i("weixin", "wxShareText" + path);
		WXTextObject textObj = new WXTextObject();
		textObj.text = path;

		// 闁跨喐鏋婚幏绋篨TextObject闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔虹哺绾攱瀚归柨鐔稿疆娴兼瑦瀚归柨鐔虹スXMediaMessage闁跨喐鏋婚幏鐑芥晸閺傘倖瀚�
		WXMediaMessage msg = new WXMediaMessage();
		msg.mediaObject = textObj;

		// 闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔惰寧閹插瀚归柨鐔告灮閹风兘鏁撻柊鐢殿暜閹风兘鏁撻弬銈嗗閹垱妞傞柨鐔告灮閹风itle闁跨喕顢滃▓浣冾嚋閹风兘鏁撻弬銈嗗闁跨喐鏋婚幏鐑芥晸閺傘倖瀚�
		// msg.title = "Will be ignored";
		msg.title = "闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹风兘鏁撶悰妤佸敾閹风兘鏁撻弬銈嗗";
		msg.description = path;

		// 闁跨喐鏋婚幏鐑芥晸閺傘倖瀚规稉锟介柨鐔告灮閹风úeq
		SendMessageToWX.Req req = new SendMessageToWX.Req();
		req.transaction = buildTransaction("text"); // transaction闁跨喕顢滅拋瑙勫闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归崬顖欑闁跨喐鏋婚幏鐤槕娑擄拷闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹凤拷
		req.message = msg;
		req.scene = SendMessageToWX.Req.WXSceneSession;// 闁跨喐鏋婚幏椋庛仛闁跨喐鏋婚幏鐑芥晸闁扮數顒查幏鐑芥晸閺傘倖瀚规稉娲晸閺傘倖瀚归柨鐔告灮閹峰嘲婀�闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹风兘鏁撻弬銈嗗闁跨喐鏋婚幏锟�?闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归崷锟�
		// req.scene =
		// SendMessageToWX.Req.WXSceneSession;//闁跨喐鏋婚幏椋庛仛闁跨喐鏋婚幏鐑芥晸闁扮數顒查幏鐑芥晸閺傘倖瀚规稉娲晸閺傘倖瀚归柨鐔虹崵鐎甸�涚串閹风兘鏁撻弬銈嗗闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹风兘鏁撻弬銈嗗闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐕傛嫹
		// req.scene = SendMessageToWX.Req.WXSceneTimeline;//
		// 闁跨喐鏋婚幏椋庛仛闁跨喐鏋婚幏鐑芥晸闁扮數顒查幏鐑芥晸閺傘倖瀚规稉娲晸缁夋瓕妫岄敐蹇斿闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹风兘鏁撻弬銈嗗閹枫儵鏁撴潪娆炬緛閹风兘鏁撻弬銈嗗鐟綊鏁撻敓锟�
		// 闁跨喐鏋婚幏鐑芥晸閺傘倖瀚筧pi闁跨喐甯撮崣锝呭殩閹风兘鏁撻弬銈嗗闁跨喐鏋婚幏鐤箰闁跨喕濞囬～顔藉闁跨噦鎷�
		api.sendReq(req);
		Log.i("weixin", "wxShareText1" + path);
	}

	public void wxShareWebView(String url, String title, String description) {

		// 闁跨喐鏋婚幏宄邦潗闁跨喐鏋婚幏鐑芥晸閺傘倖瀚箄rl闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹风兘鏁撻敓锟�

		Log.i("weixin", "wxShareutl" + url);
		WXWebpageObject webpage = new WXWebpageObject();
		webpage.webpageUrl = url;

		// 闁跨喐鏋婚幏绋篨TextObject闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔虹哺绾攱瀚归柨鐔稿疆娴兼瑦瀚归柨鐔虹スXMediaMessage闁跨喐鏋婚幏鐑芥晸閺傘倖瀚�
		WXMediaMessage msg = new WXMediaMessage(webpage);
		msg.title = title;
		msg.description = description;
		// 闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔惰寧閹插瀚归柨鐔告灮閹风兘鏁撻柊鐢殿暜閹风兘鏁撻弬銈嗗閹垱妞傞柨鐔告灮閹风itle闁跨喕顢滃▓浣冾嚋閹风兘鏁撻弬銈嗗闁跨喐鏋婚幏鐑芥晸閺傘倖瀚�
		// msg.title = "Will be ignored";
		Bitmap thumb = BitmapFactory.decodeResource(getResources(),
				R.drawable.icon);
		msg.thumbData = bmpToByteArray(thumb, true);
		// 闁跨喐鏋婚幏鐑芥晸閺傘倖瀚规稉锟介柨鐔告灮閹风úeq
		SendMessageToWX.Req req = new SendMessageToWX.Req();
		req.transaction = buildTransaction("webpage"); // transaction闁跨喕顢滅拋瑙勫闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归崬顖欑闁跨喐鏋婚幏鐤槕娑擄拷闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹凤拷
		req.message = msg;
		req.scene = SendMessageToWX.Req.WXSceneSession;// 闁跨喐鏋婚幏椋庛仛闁跨喐鏋婚幏鐑芥晸闁扮數顒查幏鐑芥晸閺傘倖瀚规稉娲晸閺傘倖瀚归柨鐔告灮閹峰嘲婀�闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹风兘鏁撻弬銈嗗闁跨喐鏋婚幏锟�?闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归崷锟�
		// req.scene =
		// SendMessageToWX.Req.WXSceneSession;//闁跨喐鏋婚幏椋庛仛闁跨喐鏋婚幏鐑芥晸闁扮數顒查幏鐑芥晸閺傘倖瀚规稉娲晸閺傘倖瀚归柨鐔虹崵鐎甸�涚串閹风兘鏁撻弬銈嗗闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹风兘鏁撻弬銈嗗闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐕傛嫹
		// req.scene = SendMessageToWX.Req.WXSceneTimeline;//
		// 闁跨喐鏋婚幏椋庛仛闁跨喐鏋婚幏鐑芥晸闁扮數顒查幏鐑芥晸閺傘倖瀚规稉娲晸缁夋瓕妫岄敐蹇斿闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹风兘鏁撻弬銈嗗閹枫儵鏁撴潪娆炬緛閹风兘鏁撻弬銈嗗鐟綊鏁撻敓锟�
		// 闁跨喐鏋婚幏鐑芥晸閺傘倖瀚筧pi闁跨喐甯撮崣锝呭殩閹风兘鏁撻弬銈嗗闁跨喐鏋婚幏鐤箰闁跨喕濞囬～顔藉闁跨噦鎷�
		api.sendReq(req);
		Log.i("weixin", "wxShareurl");
	}

	public void wxShareTexture(String path) {
		/*
		 * 瀵邦噣鏁撻懘姘殩閹风兘鏁撻弬銈嗗
		 */
		Log.i("weixin", "wxShareTexture");
		Bitmap bmp = BitmapFactory.decodeFile(path);
		float scaleNumeber = bmp.getWidth() / 120f;
		float scaleHeight = bmp.getHeight() / scaleNumeber;
		// WXImageObject imgObj = new WXImageObject(bmp);

		WXMediaMessage msg = new WXMediaMessage();
		// msg.mediaObject = imgObj;
		msg.mediaObject = new WXImageObject(Bitmap.createScaledBitmap(bmp, 800,
				(int) (bmp.getHeight() / (bmp.getWidth() / 800)), true));

		Log.i("weixin", "wxShareTexture" + scaleNumeber);
		Bitmap thumbBmp = Bitmap.createScaledBitmap(bmp, 120,
				(int) scaleHeight, true);
		bmp.recycle();
		msg.thumbData = bmpToByteArray(thumbBmp, true); // 闁跨喐鏋婚幏鐑芥晸閺傘倖瀚归柨鐔告灮閹风兘鏁撻弬銈嗗閸ワ拷
		// msg.thumbData =thumbBmp;
		SendMessageToWX.Req req = new SendMessageToWX.Req();
		req.transaction = buildTransaction("img");
		req.message = msg;
		req.scene = SendMessageToWX.Req.WXSceneSession;
		api.sendReq(req);
		Log.i("weixin", "wxShareTexture");

	}

	public static byte[] bmpToByteArray(final Bitmap bmp,
			final boolean needRecycle) {
		ByteArrayOutputStream output = new ByteArrayOutputStream();
		bmp.compress(CompressFormat.JPEG, 80, output);
		if (needRecycle) {
			bmp.recycle();
		}

		byte[] result = output.toByteArray();
		try {
			output.close();
		} catch (Exception e) {
			e.printStackTrace();
		}

		return result;
	}

	public static AppActivity ccActivity;

	private String buildTransaction(final String type) {
		return (type == null) ? String.valueOf(System.currentTimeMillis())
				: type + System.currentTimeMillis();
	}

	public static void StartWxLogin() {
		if (ccActivity != null) {
			ccActivity.wxLogin();
		}
	}

	public static void StartShareTextWxSceneSession(String path) {
		Log.i("weixin", "share");
		if (ccActivity != null) {

			ccActivity.wxShareText(path);
		}
	}

	public static void StartShareWebViewWxSceneSession(String url,
			String title, String description) {
		if (ccActivity != null) {
			ccActivity.wxShareWebView(url, title, description);
		}
	}

	public static void StartShareTextureWxSceneSession(String path) {
		if (ccActivity != null) {
			ccActivity.wxShareTexture(path);
		}
	}

	/**
	 * 涓婁紶鏂囦欢
	 * 
	 * @param fileName
	 *            {String} 鏂囦欢鍚�
	 * @param url
	 *            {String} 缃戝潃
	 * @param eventName
	 *            {String} 浜嬩欢鍚嶇О
	 * */
	public static void uploadFile(final String fileName, final String url,
			final String eventName) {
		new Thread() {
			public void run() {
				httpClient http = new httpClient(fileName, url);
				http.uploadFile();
				Log.i("send:", "send successful");
				if (http.ok == 1) {
					ccActivity.RunJS(eventName, http.filePath);
				}
			}
		}.start();
	}

	public static void StartShareWebViewWxTimeline(String url, String title,
			String description) {
		if (ccActivity != null) {
			ccActivity.wxShareWebView(url, title, description, true);
		}
	}

	public void wxShareWebView(String url, String title, String description,
			boolean isTimeline) {
		Log.i("weixin", "wxShareutl" + url);
		WXWebpageObject webpage = new WXWebpageObject();
		webpage.webpageUrl = url;

		WXMediaMessage msg = new WXMediaMessage(webpage);
		msg.title = title;
		msg.description = description;

		Bitmap thumb = BitmapFactory.decodeResource(getResources(),
				R.drawable.icon);
		msg.thumbData = bmpToByteArray(thumb, true);
		SendMessageToWX.Req req = new SendMessageToWX.Req();
		req.transaction = buildTransaction("webpage");
		req.message = msg;

		if (isTimeline) {
			req.scene = SendMessageToWX.Req.WXSceneTimeline;
		} else {
			req.scene = SendMessageToWX.Req.WXSceneSession;
		}

		api.sendReq(req);
		Log.i("weixin", "wxShareurl");
	}

	/**
	 * 涓嬭浇鏂囦欢
	 * 
	 * @param fileName
	 *            {String} 鏂囦欢鍚�
	 * @param url
	 *            {String} 缃戝潃
	 * @param eventName
	 *            {String} 浜嬩欢鍚嶇О
	 * */
	public static void downLoadFile(final String filePath,
			final String fileName, final String url, final String eventName) {
		new Thread() {
			public void run() {
				httpClient http = new httpClient(filePath, fileName, url);
				http.downLoadFile();
				Log.i("download:", "download successful");
				if (http.ok == 1) {
					ccActivity.RunJS(eventName, http.filePath);
				}
			}
		}.start();
	}

	public static String startRecord(String filePath, String nameString) {
		if (isStartRecording) {
			return "";
		}
		// 瀹氫箟涓存椂褰曢煶鏂囦欢鍜宮p3鏂囦欢
		// String basePath = getFilesDir(ccActivity.getApplicationContext());
		String basePath = filePath; // 璺緞鏀逛负涓婂眰浼犺緭

		tempFile = basePath + "." + "temp.raw";
		mp3Path = basePath + nameString + ".mp3";
		// 鍒濆鍖栧綍闊�
		initRecorder();
		// 褰曢煶鏍囪
		isRecording = true;
		isStartRecording = true;
		canSend = true;
		// 寮�濮嬪綍闊�
		try {
			mRecorder.startRecording();
		} catch (Exception e) {
			canSend = false;
			popAlert.showToast("鎮ㄥ皻鏈紑鍚闊虫潈闄�", ccActivity);
			e.printStackTrace();
		}
		// 鑾峰彇涓存椂褰曢煶鏂囦欢File瀵硅薄锛屽宸插瓨鍦ㄧ殑鏂囦欢鍋氬垹闄ゅ鐞�
		File rawFile = new File(tempFile);
		if (rawFile.exists()) {
			rawFile.delete();
			try {
				rawFile.createNewFile();
			} catch (IOException e) {
				rawFile = null;
				e.printStackTrace();
			}
		}
		// 褰曢煶鏁版嵁璇诲啓
		ccActivity.startBufferedWrite(rawFile == null ? new File(tempFile)
				: rawFile);

		Log.i("fanjiaheTest", "startRecord" + tempFile + "||" + mp3Path);
		return mp3Path;
	}

	/**
	 * 鍏抽棴褰曢煶 js璋冪敤
	 */
	public static void endRecord(final String eventName) {

		if (!isStartRecording || !isRecording) {
			return;
		}
		// 鍋滄褰曢煶
		try {
			isRecording = false;
			mRecorder.stop();
			mRecorder.release();
			mRecorder = null;
		} catch (IllegalStateException e) {
			e.printStackTrace();
		}

		// 灏唕aw杞崲鎴恗p3鏍煎紡
		new Thread() {
			public void run() {
				FLameUtils lameUtils = new FLameUtils(1, 16000, 96);
				lameUtils.raw2mp3(tempFile, mp3Path);
				Log.i("record", "stopRecord" + tempFile + "||" + mp3Path);
				// 杩欓噷搴旇鍥炶皟缁檍s灞� 缁撴潫杞崲浜�
				ccActivity.RunJS(eventName, canSend ? mp3Path : null);
				isStartRecording = false;
			}
		}.start();
	}

	/**
	 * 鑾峰彇|璁剧疆鏂囦欢瀛樺偍鐩綍
	 * 
	 * @param context
	 * @return
	 */
	public static String getFilesDir(Context context) {

		File targetDir = null;

		// sd鍗″垽鏂�
		if (Environment.getExternalStorageState().equals(
				Environment.MEDIA_MOUNTED)) {
			// targetDir = context.getExternalFilesDir(null); // not support
			// android 2.1
			targetDir = new File(Environment.getExternalStorageDirectory(),
					"Android/data/" + context.getApplicationInfo().packageName
							+ "/files");
			if (!targetDir.exists()) {
				targetDir.mkdirs();
			}
		}

		if (targetDir == null || !targetDir.exists()) {
			targetDir = context.getFilesDir();
		}

		return targetDir.getPath();
	}

	/**
	 * 鍒濆鍖朅udioRecorder
	 */
	public static void initRecorder() {
		int bufferSize = AudioRecord.getMinBufferSize(16000,
				AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT);
		mBuffer = new short[bufferSize];
		mRecorder = new AudioRecord(MediaRecorder.AudioSource.MIC, 16000,
				AudioFormat.CHANNEL_IN_MONO, AudioFormat.ENCODING_PCM_16BIT,
				bufferSize);
	}

	/**
	 * 鍚戝綍闊虫枃浠朵腑鍐欏叆鏁版嵁
	 * 
	 * @param file
	 */
	private void startBufferedWrite(final File file) {
		new Thread(new Runnable() {
			@Override
			public void run() {
				DataOutputStream output = null;
				try {
					output = new DataOutputStream(new BufferedOutputStream(
							new FileOutputStream(file)));
					while (isRecording) {
						int readSize = mRecorder.read(mBuffer, 0,
								mBuffer.length);

						// for (int i = 0; i < readSize; i++) {
						// mBuffer[i] = (short)(mBuffer[i] * 2); //
						// 鏇存敼褰曢煶鏃剁殑澹伴煶澶у皬
						// }
						for (int i = 0; i < readSize; i++) {
							output.writeShort(mBuffer[i]);
						}
					}
				} catch (IOException e) {
					Toast.makeText(AppActivity.this, e.getMessage(),
							Toast.LENGTH_SHORT).show();
				} finally {
					if (output != null) {
						try {
							output.flush();
						} catch (IOException e) {
							Toast.makeText(AppActivity.this, e.getMessage(),
									Toast.LENGTH_SHORT).show();
						} finally {
							try {
								output.close();
							} catch (IOException e) {
								Toast.makeText(AppActivity.this,
										e.getMessage(), Toast.LENGTH_SHORT)
										.show();
							}
						}
					}
				}
			}
		}).start();
	}

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		ccActivity = this;
		// http://stackoverflow.com/questions/8325395/avoiding-resuming-app-at-lock-screen

		// getWindow().setFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED,
		// WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
		// getWindow().addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
		// | WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
		vibrato = new VibratorUtil();
		getWindow().setFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON,
				WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
		regToWx();
	}

	@Override
	public void onStart() {
		super.onStart();
		// DeepShare.init(this, deepshareAppID, this);
		//Log.i("deepshare", "onStart");
	}

	@Override
	public void onStop() {
		super.onStop();
		// DeepShare.onStop();
		//Log.i("deepshare", "onStop");
	}

	@Override
	public void onNewIntent(Intent intent) {
		this.setIntent(intent);
		//Log.i("deepshare", "onNewIntent");
	}

	//@Override
/*	public void onFailed(String arg0) {
		// TODO Auto-generated method stub
		//Log.d("deepshare", "onFailed");
	}*/

	//@Override
/*	public void onInappDataReturned(JSONObject params) {
		// TODO Auto-generated method stub
		if (params == null)
			return;
		Log.d("deepshare", "params : " + params);
		if (params.length() == 0) {
			return;
		}
		// RunJS("deepshare", params.toString());
	}*/

	//@Override
	public Cocos2dxGLSurfaceView onCreateView() {

		Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
		// TestCpp should create stencil buffer
		glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

		return glSurfaceView;
	}

}
