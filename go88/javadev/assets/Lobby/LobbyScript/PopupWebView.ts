// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html
import Configs from "../../Loading/src/Configs";
import Tween from "./Script/common/Tween";
import App from "./Script/common/App";
import BroadcastReceiver from "./Script/common/BroadcastReceiver";
import SPUtils from "./Script/common/SPUtils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class PopupWebView extends cc.Component {

    @property(cc.WebView)
    webView: cc.WebView = null;

    @property(cc.Node)
    boxNode:cc.Node = null;
    private url = "";
    private cache = "";
    show(url,cache = ""){
        this.cache = cache;
        this.url = url;
        
        if(this.cache == "AG"){
            console.log("popupWebView:"+Configs.Login.CACHE_AG);
            SPUtils.setMusicVolumn(0);
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
            // cc.audioEngine.pauseAll();
            if(Configs.Login.CACHE_AG == false){
                
                this.webView.url = url;
            }
            Configs.Login.CACHE_AG = true;
        }
        else if(this.cache == "IBC"){
            SPUtils.setMusicVolumn(0);
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
            if(Configs.Login.CACHE_IBC == false){
                
                this.webView.url = url;
            }
            Configs.Login.CACHE_IBC = true;
        }
        else if(this.cache == "WM"){
            SPUtils.setMusicVolumn(0);
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
            if(Configs.Login.CACHE_WM == false){
                
                this.webView.url = url;
            }
            Configs.Login.CACHE_WM = true;
        }
        else{
            this.webView.url = url;

        }
        
        this.boxNode.parent.active = true;
        // Tween.showPopup(this.boxNode,this.boxNode.parent);
    }

    hide(){
        if(this.cache == "AG"){
            SPUtils.setMusicVolumn(1);
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
            Configs.Login.CACHE_AG = false;
            App.instance.buttonMiniGame.buttonAG.active = false;
        }
        else if(this.cache == "IBC"){
            cc.audioEngine.setMusicVolume(1);
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
            Configs.Login.CACHE_IBC = false;
            App.instance.buttonMiniGame.buttonIBC.active = false;
        }
        else if(this.cache == "WM"){
            cc.audioEngine.setMusicVolume(1);
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
            Configs.Login.CACHE_WM = false;
            App.instance.buttonMiniGame.buttonWM.active = false;
        }
        this.node.destroy();
        //Tween.hidePopup(this.boxNode,this.boxNode.parent,false);
    }

    onBtnThuNho(){
        if(this.cache == "AG"){
            SPUtils.setMusicVolumn(1);
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
            App.instance.buttonMiniGame.buttonAG.active = true;
        }
        else if(this.cache == "IBC"){
            cc.audioEngine.setMusicVolume(1);
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
            App.instance.buttonMiniGame.buttonIBC.active = true;
        }
        else if(this.cache == "WM"){
            cc.audioEngine.setMusicVolume(1);
            BroadcastReceiver.send(BroadcastReceiver.ON_AUDIO_CHANGED);
            App.instance.buttonMiniGame.buttonWM.active = true;
        }
        this.boxNode.parent.position = cc.v3(-5000,0,0);
    }
}
