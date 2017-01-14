#include "AppDelegate.h"

#include "audio/include/SimpleAudioEngine.h"
#include "scripting/js-bindings/auto/jsb_cocos2dx_3d_auto.hpp"
#include "scripting/js-bindings/auto/jsb_cocos2dx_3d_extension_auto.hpp"
#include "scripting/js-bindings/auto/jsb_cocos2dx_auto.hpp"
#include "scripting/js-bindings/auto/jsb_cocos2dx_builder_auto.hpp"
#include "scripting/js-bindings/auto/jsb_cocos2dx_extension_auto.hpp"
#include "scripting/js-bindings/auto/jsb_cocos2dx_navmesh_auto.hpp"
#include "scripting/js-bindings/auto/jsb_cocos2dx_physics3d_auto.hpp"
#include "scripting/js-bindings/auto/jsb_cocos2dx_spine_auto.hpp"
#include "scripting/js-bindings/auto/jsb_cocos2dx_studio_auto.hpp"
#include "scripting/js-bindings/auto/jsb_cocos2dx_ui_auto.hpp"
#include "scripting/js-bindings/manual/3d/jsb_cocos2dx_3d_manual.h"
#include "scripting/js-bindings/manual/chipmunk/js_bindings_chipmunk_registration.h"
#include "scripting/js-bindings/manual/cocosbuilder/js_bindings_ccbreader.h"
#include "scripting/js-bindings/manual/cocostudio/jsb_cocos2dx_studio_manual.h"
#include "scripting/js-bindings/manual/extension/jsb_cocos2dx_extension_manual.h"
#include "scripting/js-bindings/manual/jsb_opengl_registration.h"
#include "scripting/js-bindings/manual/localstorage/js_bindings_system_registration.h"
#include "scripting/js-bindings/manual/navmesh/jsb_cocos2dx_navmesh_manual.h"
#include "scripting/js-bindings/manual/network/XMLHTTPRequest.h"
#include "scripting/js-bindings/manual/network/jsb_socketio.h"
#include "scripting/js-bindings/manual/network/jsb_websocket.h"
#include "scripting/js-bindings/manual/physics3d/jsb_cocos2dx_physics3d_manual.h"
#include "scripting/js-bindings/manual/spine/jsb_cocos2dx_spine_manual.h"
#include "scripting/js-bindings/manual/ui/jsb_cocos2dx_ui_manual.h"
#include <json/document.h>

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
#include "scripting/js-bindings/auto/jsb_cocos2dx_experimental_video_auto.hpp"
#include "scripting/js-bindings/auto/jsb_cocos2dx_experimental_webView_auto.hpp"
#include "scripting/js-bindings/manual/experimental/jsb_cocos2dx_experimental_video_manual.h"
#include "scripting/js-bindings/manual/experimental/jsb_cocos2dx_experimental_webView_manual.h"
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT || CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC || CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
#include "scripting/js-bindings/auto/jsb_cocos2dx_audioengine_auto.hpp"
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
#include "cocos/scripting/js-bindings/manual/platform/android/CCJavascriptJavaBridge.h"
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
#include "cocos/scripting/js-bindings/manual/platform/ios/JavaScriptObjCBridge.h"
#include "IosTools.h"
#endif

USING_NS_CC;
using namespace CocosDenshion;

AppDelegate::AppDelegate()
{
}

AppDelegate::~AppDelegate()
{
    ScriptEngineManager::destroyInstance();
}

void AppDelegate::initGLContextAttrs()
{
    GLContextAttrs glContextAttrs = {8, 8, 8, 8, 24, 8};
    
    GLView::setGLContextAttrs(glContextAttrs);
}

bool AppDelegate::applicationDidFinishLaunching()
{

	
	// initialize director
    auto director = Director::getInstance();
    auto glview = director->getOpenGLView();
    if(!glview) {
#if(CC_TARGET_PLATFORM == CC_PLATFORM_WP8) || (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT)
        glview = cocos2d::GLViewImpl::create("mjclient");
#else
		int width=720,height=480;
		char myexeName[15]="symj";
		#ifdef WIN32
		char exeName[512];  
		GetModuleFileNameA(NULL,exeName,512);
		int len=strlen(exeName)-1;
		printf("machaoexeName",exeName);
		
		myexeName[11]=0;
		for(int i = 0;i<10;i++)
		{
			myexeName[i] = exeName[len-10+i];
		}


		bool found=false;
		while(len>0)
		{
			if(exeName[len]=='.') exeName[len]=0;
			else if(exeName[len]=='@')
			{
				exeName[len]=0;
				height=atoi(exeName+len+1);
				found=true;
			}
			else if(exeName[len]=='_')
			{
				if(found) width=atoi(exeName+len+1); 
				break;
			}
			len--;
		}
        #endif
        glview = cocos2d::GLViewImpl::createWithRect(myexeName, Rect(0,0,width,height));

#endif
        director->setOpenGLView(glview);
}

    // set FPS. the default value is 1.0/60 if you don't call this
    director->setAnimationInterval(1.0 / 60);

	std::string updatePath=CCFileUtils::getInstance()->getWritablePath()+"update";
	std::vector<std::string> sPath=CCFileUtils::getInstance()->getSearchPaths();
	if(sPath.size()>0&&sPath[0].compare(updatePath)==0)
	{
		sPath.erase(sPath.begin());
		CCFileUtils::getInstance()->setSearchPaths(sPath);

	}
	 
	//if( CCFileUtils::getInstance()->isFileExist(updatePath+"/project.manifest"))
	//{
	//	rapidjson::Document d;
	//	rapidjson::Document r;
	//	auto  str1 = CCFileUtils::getInstance()->getStringFromFile(updatePath+"/project.manifest");
	//	auto  str2 =CCFileUtils::getInstance()->getStringFromFile("res/project.manifest");
	//	auto  cstr1 = str1.c_str();
	//	auto  cstr2 = str2.c_str();
	//	d.Parse<rapidjson::kParseDefaultFlags>(cstr1); // 0±Ì æƒ¨»œµƒΩ‚Œˆ∑Ω Ω£ª
	//	std::string   up_version =	d["version"].GetString();
	//	r.Parse<rapidjson::kParseDefaultFlags>(cstr2); // 0±Ì æƒ¨»œµƒΩ‚Œˆ∑Ω Ω£ª
	//	std::string res_version = r["version"].GetString();
	//
	//	auto num =	res_version.compare(up_version);
	//	if(num>0)
	//	{
	//		CCFileUtils::getInstance()->removeDirectory(updatePath);
	//	}
	//	
	//}
		CCFileUtils::getInstance()->createDirectory(updatePath);
		CCFileUtils::getInstance()->addSearchPath(updatePath,true);
	
    
    std::string fullVersion = "majiang";
#if (CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
    fullVersion = IosTools::getFullVersion();
#endif
    CCLOG("fullVersion is : %s", fullVersion.c_str());
	//«¯∑÷ «∑ÒŒ™∆Û“µ∞Êªπ «appstore∞Ê±æ
	CCFileUtils::getInstance()->writeStringToFile(fullVersion.c_str(),CCFileUtils::getInstance()->getWritablePath()+"majiangios.txt");
	//CCFileUtils::getInstance()->removeFile(CCFileUtils::getInstance()->getWritablePath()+"majiangios.txt");

	
	Director::getInstance()->getEventDispatcher()->addEventListenerWithFixedPriority(EventListenerCustom::create("capture_screen",[=](EventCustom*event){
		utils::captureScreen([=](bool capOK,const std::string& pt){
			if(capOK)
			{
				Director::getInstance()->getEventDispatcher()->dispatchCustomEvent("captureScreen_OK",this);
			}else
			{
				Director::getInstance()->getEventDispatcher()->dispatchCustomEvent("captureScreen_False",this);
			}

		},CCFileUtils::getInstance()->getWritablePath()+"wxcapture_screen.png");
	}),1);


	Director::getInstance()->getEventDispatcher()->addEventListenerWithFixedPriority(EventListenerCustom::create("restartGame",[=](EventCustom*event){

		if(CCDirector::getInstance()->getRunningScene()!=NULL) CCDirector::getInstance()->popToRootScene();
		CCScene* sce=CCScene::create();
		Sprite * bgSp = Sprite::create("res/login/z_loading.png");
		Size winSize = Director::getInstance()->getWinSize();
		float scaleX = winSize.width / bgSp->getContentSize().width;
		float scaleY = winSize.height / bgSp->getContentSize().height;
		scaleX > scaleY ? bgSp->setScale(scaleX) : bgSp->setScale(scaleY);
		bgSp->setPosition(winSize / 2);
		sce->addChild(bgSp);
		CCDirector::getInstance()->replaceScene(sce);
		sce->scheduleOnce([=](float dt){
			CCDirector::getInstance()->purgeCachedData();
	        ScriptingCore::getInstance()->restartVM();
		},0.02,"restartGame");

	}),1);









    
    ScriptingCore* sc = ScriptingCore::getInstance();
    sc->addRegisterCallback(register_all_cocos2dx);
    sc->addRegisterCallback(register_cocos2dx_js_core);
    sc->addRegisterCallback(jsb_register_system);

    // extension can be commented out to reduce the package
    sc->addRegisterCallback(register_all_cocos2dx_extension);
    sc->addRegisterCallback(register_all_cocos2dx_extension_manual);

    // chipmunk can be commented out to reduce the package
    sc->addRegisterCallback(jsb_register_chipmunk);
    // opengl can be commented out to reduce the package
    sc->addRegisterCallback(JSB_register_opengl);
    
    // builder can be commented out to reduce the package
    sc->addRegisterCallback(register_all_cocos2dx_builder);
    sc->addRegisterCallback(register_CCBuilderReader);
    
    // ui can be commented out to reduce the package, attension studio need ui module
    sc->addRegisterCallback(register_all_cocos2dx_ui);
    sc->addRegisterCallback(register_all_cocos2dx_ui_manual);

    // studio can be commented out to reduce the package, 
    sc->addRegisterCallback(register_all_cocos2dx_studio);
    sc->addRegisterCallback(register_all_cocos2dx_studio_manual);
    
    // spine can be commented out to reduce the package
    sc->addRegisterCallback(register_all_cocos2dx_spine);
    sc->addRegisterCallback(register_all_cocos2dx_spine_manual);
    
    // XmlHttpRequest can be commented out to reduce the package
    sc->addRegisterCallback(MinXmlHttpRequest::_js_register);
    // websocket can be commented out to reduce the package
    sc->addRegisterCallback(register_jsb_websocket);
    // sokcet io can be commented out to reduce the package
    sc->addRegisterCallback(register_jsb_socketio);

    // 3d can be commented out to reduce the package
    sc->addRegisterCallback(register_all_cocos2dx_3d);
    sc->addRegisterCallback(register_all_cocos2dx_3d_manual);
    
    // 3d extension can be commented out to reduce the package
    sc->addRegisterCallback(register_all_cocos2dx_3d_extension);
    
#if CC_USE_3D_PHYSICS && CC_ENABLE_BULLET_INTEGRATION
    // Physics 3d can be commented out to reduce the package
    sc->addRegisterCallback(register_all_cocos2dx_physics3d);
    sc->addRegisterCallback(register_all_cocos2dx_physics3d_manual);
#endif

#if CC_USE_NAVMESH
    sc->addRegisterCallback(register_all_cocos2dx_navmesh);
    sc->addRegisterCallback(register_all_cocos2dx_navmesh_manual);
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS)
    sc->addRegisterCallback(register_all_cocos2dx_experimental_video);
    sc->addRegisterCallback(register_all_cocos2dx_experimental_video_manual);
    sc->addRegisterCallback(register_all_cocos2dx_experimental_webView);
    sc->addRegisterCallback(register_all_cocos2dx_experimental_webView_manual);
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_WINRT || CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID || CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC || CC_TARGET_PLATFORM == CC_PLATFORM_WIN32)
    sc->addRegisterCallback(register_all_cocos2dx_audioengine);
#endif

#if (CC_TARGET_PLATFORM == CC_PLATFORM_ANDROID)
    sc->addRegisterCallback(JavascriptJavaBridge::_js_register);
#elif (CC_TARGET_PLATFORM == CC_PLATFORM_IOS || CC_TARGET_PLATFORM == CC_PLATFORM_MAC)
    sc->addRegisterCallback(JavaScriptObjCBridge::_js_register);
#endif
    sc->start();    
    sc->runScript("script/jsb_boot.js");
#if defined(COCOS2D_DEBUG) && (COCOS2D_DEBUG > 0)
    sc->enableDebugger();
#endif
		


    ScriptEngineProtocol *engine = ScriptingCore::getInstance();
    ScriptEngineManager::getInstance()->setScriptEngine(engine);
    ScriptingCore::getInstance()->runScript("main.js");

	
    return true;
}

// This function will be called when the app is inactive. When comes a phone call,it's be invoked too
void AppDelegate::applicationDidEnterBackground()
{
    auto director = Director::getInstance();
    director->stopAnimation();
    director->getEventDispatcher()->dispatchCustomEvent("game_on_hide");
    SimpleAudioEngine::getInstance()->pauseBackgroundMusic();
    SimpleAudioEngine::getInstance()->pauseAllEffects();    
}

// this function will be called when the app is active again
void AppDelegate::applicationWillEnterForeground()
{
    auto director = Director::getInstance();
    director->startAnimation();
    director->getEventDispatcher()->dispatchCustomEvent("game_on_show");
    SimpleAudioEngine::getInstance()->resumeBackgroundMusic();
    SimpleAudioEngine::getInstance()->resumeAllEffects();
}
