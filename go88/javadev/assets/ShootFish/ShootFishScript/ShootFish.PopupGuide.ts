import Dialog from "../../Lobby/LobbyScript/Script/common/Dialog";
import Play from "./ShootFish.Play";

const { ccclass, property } = cc._decorator;

@ccclass
export default class PopupGuide extends Dialog {
    @property(cc.Node)
    grid: cc.Node = null;
    @property(cc.Node)
    itemTemplate: cc.Node = null;

    private items: Array<cc.Node> = [];

    private mapFishType = {
                    0: ["Cuttle", 1],
                    1: ["GoldFish", 1],
                    2: ["LightenFish", 1],
                    3: ["Mermaid", 0.7],
                    4: ["Octopus", 0.7],
                    5: ["PufferFish", 1],
                    6: ["SeaFish", 0.6],
                    7: ["Shark", 0.7],
                    8: ["Stringray", 0.8],
                    9: ["Turtle", 0.5],
                    10: ["CaThanTai", 0.5],
                    11: ["FlyingFish", 0.5],
                    12: ["GoldenFrog", 0.2],
                    13: ["SeaTurtle", 1],
                    14: ["MerMan", 0.8],
                    15: ["Phoenix", 0.7],
                    16: ["MermaidBig", 0.5],
                    17: ["MermaidSmall", 0.6],
                    18: ["BombFish", 0.5],
                    19: ["Fish19", 0.6],
                    20: ["Fish20", 0.5],
                    21: ["Fish21", 0.6],
                    22: ["Fish22", 0.5],
                    23: ["Fish23", 0.5],
                    24: ["Fish24", 0.4]
                }

    show(){
        super.show();
        this.itemTemplate.active = false;
    }

    _onShowed() {
        super._onShowed();
        if(Play.SERVER_CONFIG == null) return;
        for (let fishId in this.mapFishType) {
            let fishName = this.mapFishType[fishId][0];
            let scale = this.mapFishType[fishId][1];
            let dataConfig = Play.SERVER_CONFIG["FishPhysicalData"][fishName];

            let node = cc.instantiate(this.itemTemplate);
            node.parent = this.grid;
            node.active = true;

            let fish = cc.instantiate(Play.instance.getFishAnimByType(Number(fishId)));
            fish.parent = node.getChildByName("fishParent");
            fish.scale = scale;
            fish.angle = 35;

            node.getChildByName("lblFactor").getComponent(cc.Label).string = (dataConfig["Health"] / 100).toString();
            this.items.push(node);
        }
    }

    dismiss() {
        this.items.forEach(x => {
            x.removeFromParent();
        });
        super.dismiss();
    }
}
