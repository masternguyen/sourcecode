import Configs from "../../../Loading/src/Configs";
import Http from "../../../Loading/src/Http";
import App from "../../../Lobby/LobbyScript/Script/common/App";
import Dialog from "../../../Lobby/LobbyScript/Script/common/Dialog";
import ScrollViewControl from "../../../Lobby/LobbyScript/Script/common/ScrollViewControl";
import Utils from "../../../Lobby/LobbyScript/Script/common/Utils";


const { ccclass, property } = cc._decorator;

namespace taixiumini {
    @ccclass
    export class PopupHonors extends Dialog {
        @property(cc.Node)
        itemTemplate: cc.Node = null;
        @property([cc.SpriteFrame])
        sprRank: cc.SpriteFrame[] = [];
        private items = new Array<cc.Node>();
        @property(ScrollViewControl)
        scrView: ScrollViewControl = null;
        private dataList = [];

        show() {
            super.show();
            App.instance.showBgMiniGame("TaiXiu");
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].active = false;
            }
            if (this.itemTemplate != null) this.itemTemplate.active = false;


        }

        dismiss() {
            super.dismiss();
            for (let i = 0; i < this.items.length; i++) {
                this.items[i].active = false;
            }
        }

        _onShowed() {
            super._onShowed();
            this.loadData();
        }

        private loadData() {
            App.instance.showLoading(true);
            Http.get(Configs.App.API, { "c": 101, "mt": Configs.App.MONEY_TYPE, "txType": 1 }, (err, res) => {
                App.instance.showLoading(false);
                if (err != null) return;
                if (res["success"]) {
                    //  cc.log("VINH DANH TAI XIU:", res);
                    this.dataList = res["topTX"].slice();
                    // if (this.items.length == 0) {
                    //     for (var i = 0; i < 20; i++) {
                    //         let item = cc.instantiate(this.itemTemplate);
                    //         item.parent = this.itemTemplate.parent;
                    //         this.items.push(item);
                    //     }
                    //     this.itemTemplate.destroy();
                    //     this.itemTemplate = null;
                    // }
                    let cb = (item, itemData) => {
                        item.getChildByName("bg").opacity = item['itemID'] % 2 == 0 ? 255 : 0;

                        item.getChildByName("lblRank").getComponent(cc.Label).string = (item['itemID'] + 1).toString();
                        item.getChildByName("lblAccount").getComponent(cc.Label).string = itemData["username"];
                        item.getChildByName("lblWin").getComponent(cc.Label).string = Utils.formatNumber(itemData["money"]);
                        if (item['itemID'] < 3) {
                            item.getChildByName("ic_rank").active = true;
                            item.getChildByName("lblRank").active = false;
                            item.getChildByName("ic_rank").getComponent(cc.Sprite).spriteFrame = this.sprRank[itemData['index']];
                        } else {
                            item.getChildByName("ic_rank").active = false;
                            item.getChildByName("lblRank").active = true;
                        }
                        item.active = true;
                    };
                    this.scrView.setDataList(cb, this.dataList);
                    // for (let i = 0; i < this.items.length; i++) {
                    //     let item = this.items[i];
                    //     if (i < res["topTX"].length) {
                    //         let itemData = res["topTX"][i];
                    //         item.getChildByName("bg").opacity = i % 2 == 0 ? 255 : 0;
                    //         item.getChildByName("lblRank").getComponent(cc.Label).string = (i + 1).toString();
                    //         item.getChildByName("lblAccount").getComponent(cc.Label).string = itemData["username"];
                    //         item.getChildByName("lblWin").getComponent(cc.Label).string = Utils.formatNumber(itemData["money"]);
                    //         if (i < 3) {
                    //             item.getChildByName("ic_rank").active = true;
                    //             item.getChildByName("lblRank").active = false;
                    //             item.getChildByName("ic_rank").getComponent(cc.Sprite).spriteFrame = this.sprRank[i];
                    //         } else {
                    //             item.getChildByName("ic_rank").active = false;
                    //             item.getChildByName("lblRank").active = true;
                    //         }
                    //         item.active = true;
                    //     } else {
                    //         item.active = false;
                    //     }
                    // }
                }
            });
        }
    }

}

export default taixiumini.PopupHonors;