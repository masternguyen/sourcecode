import Dialog from "../Script/common/Dialog";
import cmd from "../Lobby.Cmd";
import InPacket from "../Script/networks/Network.InPacket";
import MiniGameNetworkClient from "../Script/networks/MiniGameNetworkClient";
//import Dropdown from "../Script/common/Dropdown";
import Configs from "../../../Loading/src/Configs";
import App from "../Script/common/App";
import Utils from "../Script/common/Utils";
//import Http from "../Script/common/Http";
import BroadcastReceiver from "../Script/common/BroadcastReceiver";
//import VersionConfig from "../Script/common/VersionConfig";
//import ShootFishNetworkClient from "../../scripts/networks/ShootFishNetworkClient";

const { ccclass, property } = cc._decorator;


@ccclass("Lobby.PopupShop.TabTransfer")
export class TabTransfer {
    @property(cc.Node)
    panelContent: cc.Node = null;
    @property(cc.Node)
    panelContinue: cc.Node = null;

    @property(cc.Label)
    lblBalance: cc.Label = null;
    @property(cc.Label)
    lblFee: cc.Label = null;
    @property(cc.Label)
    lblReceive: cc.Label = null;
    @property(cc.Label)
    lblDaiLy: cc.Label = null;
    @property(cc.Label)
    lblNote: cc.Label = null;
    @property(cc.EditBox)
    edbNickname: cc.EditBox = null;
    @property(cc.EditBox)
    edbReNickname: cc.EditBox = null;
    @property(cc.EditBox)
    edbCoinTransfer: cc.EditBox = null;
    @property(cc.EditBox)
    edbNote: cc.EditBox = null;

    @property(cc.EditBox)
    edbOTP: cc.EditBox = null;

    ratioTransfer = Configs.App.SERVER_CONFIG.ratioTransfer;
    
    receiverAgent: boolean= false;

    start() {
        this.edbCoinTransfer.node.on("editing-did-ended", () => {
            let number = Utils.stringToInt(this.edbCoinTransfer.string);
            this.edbCoinTransfer.string = Utils.formatNumber(number);
            this.lblReceive.string = Utils.formatNumber(Math.round(this.ratioTransfer * number));
        });
        this.edbNickname.node.on("editing-did-ended", () => {
            let nickname = this.edbNickname.string.trim();
            if (nickname != "") {
               App.instance.showLoading(true);
               MiniGameNetworkClient.getInstance().send(new cmd.ReqCheckNicknameTransfer(nickname));
            }
        });
    }

    reset() {
        this.panelContent.active = true;
     //   this.panelContinue.active = false;
        this.lblDaiLy.node.active = false;
        this.lblFee.string = "0";
        this.lblBalance.string = Utils.formatNumber(Configs.Login.Coin);
        this.lblReceive.string = "0";
        this.edbNickname.string = "";
        this.edbReNickname.string = "";
        this.edbNote.string = "";
        this.edbCoinTransfer.string = "";
        this.lblNote.string = this.lblNote.string.replace("%s", Math.round((1 - this.ratioTransfer) * 100) + "%");
        this.lblFee.string = Math.round((1 - this.ratioTransfer) * 100) + "%";
    }

    continue() {
        let nickname = this.edbNickname.string.trim();
        let reNickname = this.edbReNickname.string.trim();
        let coin = Utils.stringToInt(this.edbCoinTransfer.string);
        let note = this.edbNote.string.trim();
        if (nickname == "") {
            App.instance.alertDialog.showMsg("Nickname kh??ng ???????c ????? tr???ng.");
            return;
        }
        if (nickname != reNickname) {
            App.instance.alertDialog.showMsg("Hai nickname kh??ng gi???ng nhau.");
            return;
        }
        if (note == "") {
            App.instance.alertDialog.showMsg("L?? do chuy???n kho???n kh??ng ???????c ????? tr???ng.");
            return;
        }
        if (coin < 10000) {
            App.instance.alertDialog.showMsg("S??? ti???n giao d???ch t???i thi???u b???ng 200.000.");
            return;
        }
        if (coin > Configs.Login.Coin) {
            App.instance.alertDialog.showMsg("S??? d?? kh??ng ?????.");
            return;
        }

        App.instance.confirmDialog.show2("B???n c?? ch???c ch???n mu???n chuy???n cho\nT??i kho???n: \"" + nickname + "\" (Kh??ng ph???i ??.L??)\nS??? ti???n: " + this.edbCoinTransfer.string + "\nL?? do: " + note, (isConfirm) => {
            if (isConfirm) {
                App.instance.showLoading(true);
                MiniGameNetworkClient.getInstance().send(new cmd.ReqTransferCoin(nickname, coin, note));
            }
        });
    }
}


@ccclass
export default class PopupShop extends Dialog {

    @property(cc.ToggleContainer)
    tabs: cc.ToggleContainer = null;
    @property(cc.Node)
    tabContents: cc.Node = null;

    
    @property(TabTransfer)
    tabTransfer: TabTransfer = null;
    
    

    @property([cc.Label])
    lblContainsBotOTPs: cc.Label[] = [];


    



    private tabSelectedIdx = 0;

    start() {
		this.tabTransfer.reset();
        /* switch (VersionConfig.CPName) {
            case VersionConfig.CP_NAME_F69:
                this.tabs.toggleItems[2].node.active = false;//inactive momo tab
                this.tabs.toggleItems[5].node.active = true;//active bitcoin tab
                break;
            default:
                this.tabs.toggleItems[2].node.active = true;//active momo tab
                this.tabs.toggleItems[5].node.active = false;//inactive bitcoin tab
                break;
        } */

        for (let i = 0; i < this.lblContainsBotOTPs.length; i++) {
            let lbl = this.lblContainsBotOTPs[i];
            lbl.string = lbl.string.replace("$bot_otp", "@" + Configs.App.getLinkTelegram());
        }

        for (let i = 0; i < this.tabs.toggleItems.length; i++) {
            this.tabs.toggleItems[i].node.on("toggle", () => {
                this.tabSelectedIdx = i;
                this.onTabChanged();
            });
        }

        MiniGameNetworkClient.getInstance().addListener((data) => {
            let inpacket = new InPacket(data);
            console.log(inpacket.getCmdId());
            switch (inpacket.getCmdId()) {
                case cmd.Code.DEPOSIT_CARD: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResDepositCard(data);
                    switch (res.error) {
                        case 0:
                            App.instance.alertDialog.showMsg("N???p th??? th??nh c??ng.");
                            Configs.Login.Coin = res.currentMoney;
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                            break;
                        case 30:
                            this.tabNapThe.resetForm();
                            App.instance.alertDialog.showMsg("H??? th???ng ???? ghi nh???n giao d???ch, vui l??ng ch??? h??? th???ng x??? l??.");
                            break;
                        case 31:
                            App.instance.alertDialog.showMsg("Th??? ???? ???????c s??? d???ng.");
                            break;
                        case 32:
                            App.instance.alertDialog.showMsg("Th??? ???? b??? kh??a.");
                            break;
                        case 33:
                            App.instance.alertDialog.showMsg("Th??? ch??a ???????c k??ch ho???t.");
                            break;
                        case 34:
                            App.instance.alertDialog.showMsg("Th??? ???? h???t h???n s??? d???ng.");
                            break;
                        case 35:
                            App.instance.alertDialog.showMsg("M?? th??? kh??ng ????ng.");
                            break;
                        case 36:
                            App.instance.alertDialog.showMsg("S??? serial kh??ng ????ng.");
                            break;
                        case 8:
                            App.instance.alertDialog.showMsg("T??i kho???n ???? b??? kh??a n???p th??? do n???p sai qu?? nhi???u l???n! Th???i gian kh??a n???p th??? c??n l???i: " + this.longToTime(res.timeFail));
                            break;
                        default:
                            App.instance.alertDialog.showMsg("L???i " + res.error + ". Kh??ng x??c ?????nh.");
                            break;
                    }
                    break;
                }
                case cmd.Code.CHECK_NICKNAME_TRANSFER: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResCheckNicknameTransfer(data);
                    // console.log(res);
                    if (res.error == 0) {
                        this.tabTransfer.edbNickname.string = this.tabTransfer.edbReNickname.string = "";
                        App.instance.alertDialog.showMsg("T??i kho???n kh??ng t???n t???i.");
                        break;
                    }
                    this.tabTransfer.receiverAgent=res.type == 1 || res.type == 2;
                    if(!this.tabTransfer.receiverAgent)
                //    {
                //        this.tabTransfer.edbNickname.string ="";
                //        App.instance.alertDialog.showMsg("T??i kho???n "+this.tabTransfer.edbNickname.string+" Kh??ng ph???i l?? t??i kho???n ?????i l??.");
                //        break;
                //    }
                    this.tabTransfer.lblDaiLy.node.active = res.type == 1 || res.type == 2;
                    this.tabTransfer.lblFee.string = res.fee + "%";
                    this.tabTransfer.ratioTransfer = (100 - res.fee) / 100;
                    break;
                }
                case cmd.Code.TRANSFER_COIN: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResTransferCoin(data);
                     console.log(res);
                    switch (res.error) {
                        case 0:
                            this.tabTransfer.panelContent.active = true;
                         //   this.tabTransfer.panelContinue.active = true;
                        //    this.tabTransfer.edbOTP.string = "";
                            App.instance.alertDialog.showMsg("Chuy???n kho???n th??nh c??ng");
                            break;
                        case 2:
                            App.instance.alertDialog.showMsg("S??? ti???n t???i thi???u l?? 200.000.");
                            break;
                        case 3:
                            App.instance.alertDialog.showMsg("Ch???c n??ng ch??? d??nh cho nh???ng t??i kho???n ????ng k?? b???o m???t SMS PLUS.");
                            break;
                        case 4:
                            App.instance.alertDialog.showMsg("S??? d?? kh??ng ?????.");
                            break;
                        case 5:
                            App.instance.alertDialog.showMsg("T??i kho???n b??? c???m chuy???n ti???n.");
                            break;
                        case 6:
                            App.instance.alertDialog.showMsg("Nickname nh???n kh??ng t???n t???i.");
                            break;
                        case 10:
                            App.instance.alertDialog.showMsg("Ch???c n??ng b???o m???t s??? t??? ?????ng k??ch ho???t sau 24h k??? t??? th???i ??i???m ????ng k?? th??nh c??ng!");
                            break;
                        case 11:
                            App.instance.alertDialog.showMsg("B???n ch??? ???????c chuy???n cho ?????i l?? t???ng trong kho???ng ti???n quy ?????nh!");
                            break;
                        case 22:
                            App.instance.alertDialog.showMsg("T??i kho???n ch??a ????? ??i???u ki???n ????? chuy???n ti???n.");
                            break;
                        default:
                            App.instance.alertDialog.showMsg("L???i " + res.error + ". vui l??ng th??? l???i sau.");
                            break;
                    }
                    break;
                }
                case cmd.Code.GET_OTP: {
                    if (!this.node.active) return;
                    App.instance.showLoading(false);
                    let res = new cmd.ResGetOTP(data);
                    // console.log(res);
                    if (res.error == 0) {
                        App.instance.alertDialog.showMsg("M?? OTP ???? ???????c g???i ??i!");
                    } else if (res.error == 30) {
                        App.instance.alertDialog.showMsg("M???i thao t??c l???y SMS OTP ph???i c??ch nhau ??t nh???t 5 ph??t!");
                    } else {
                        App.instance.alertDialog.showMsg("Thao t??c kh??ng th??nh c??ng vui l??ng th??? l???i sau!");
                    }
                    break;
                }
                case cmd.Code.SEND_OTP: {
                    let res = new cmd.ResSendOTP(data);
                    // console.log(res);
                    if (res.error != 0) {
                        App.instance.showLoading(false);
                        switch (res.error) {
                            case 1:
                            case 2:
                                App.instance.alertDialog.showMsg("Giao d???ch th???t b???i!");
                                break;
                            case 3:
                                App.instance.alertDialog.showMsg("M?? x??c th???c kh??ng ch??nh x??c, vui l??ng th??? l???i!");
                                break;
                            case 4:
                                App.instance.alertDialog.showMsg("M?? OTP ???? h???t h???n!");
                                break;
                            default:
                                App.instance.alertDialog.showMsg("L???i " + res.error + ". Kh??ng x??c ?????nh.");
                                break;
                        }
                        return;
                    }
                    App.instance.showLoading(true);
                    break;
                }
                case cmd.Code.RESULT_TRANSFER_COIN: {
                    if (!this.node.active) return;
                    App.instance.showLoading(false);
                    let res = new cmd.ResResultTransferCoin(data);
                    // console.log(res);
                    switch (res.error) {
                        case 0:
                            Configs.Login.Coin = res.currentMoney;
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                            App.instance.alertDialog.showMsg("Giao d???ch chuy???n kho???n th??nh c??ng!");
                            break;
                        default:
                            App.instance.alertDialog.showMsg("L???i " + res.error + ". vui l??ng th??? l???i sau.");
                            break;
                    }
                    this.tabTransfer.reset();
                    break;
                }
                case cmd.Code.INSERT_GIFTCODE: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResInsertGiftcode(data);
                    switch (res.error) {
                        case 0:
                            App.instance.alertDialog.showMsg("M?? th??? kh??ng ch??nh x??c. Vui l??ng ki???m tra l???i!");
                            break;
                        case 1:
                            App.instance.alertDialog.showMsg("M?? th??? ???? ???????c s??? d???ng.");
                            break;
                        case 3:
                            App.instance.alertDialog.showMsg("????? s??? d???ng t??nh n??ng n??y vui l??ng ????ng k?? b???o m???t.");
                            break;
                        case 4:
                        case 5:
                        case 6:
                            App.instance.alertDialog.showMsg("M?? th??? ???? nh???p kh??ng h???p l???.");
                            break;
                        case 2:
                            Configs.Login.Coin = res.currentMoneyVin;
                            BroadcastReceiver.send(BroadcastReceiver.USER_UPDATE_COIN);
                            App.instance.alertDialog.showMsg("N???p th??? th??nh c??ng.");
                            break;
                    }
                    break;
                }
                case cmd.Code.DEPOSIT_BANK: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResDepositBank(data);
                    switch(res.error){
                        case 0:
                            App.instance.alertDialog.showMsg("H??? th???ng ???? ghi nh???n giao d???ch c???a b???n, vui l??ng ch??? trong gi??y l??t ????? ch??ng t??i x??? l??");
                            break;
                        case 3:
                            App.instance.alertDialog.showMsg("B???n ??ang c?? giao d???ch ch??? x??? l??, vui l??ng ch??? ?????n khi giao d???ch ???????c ho??n t???t");
                            break;
                        case 2:
                        case 1:
                            App.instance.alertDialog.showMsg("D??? li???u l???i, vui l??ng th??? l???i!");
                            break;
                        default:
                            App.instance.alertDialog.showMsg("D??? li???u l???i, vui l??ng th??? l???i!");
                    }
                    console.log(res.error);
                    break;
                }
                case cmd.Code.DEPOSIT_MOMO: {
                    App.instance.showLoading(false);
                    let res = new cmd.ResDepositMomo(data);
                    switch(res.error){
                        case 0:
                            App.instance.alertDialog.showMsg("H??? th???ng ???? ghi nh???n giao d???ch c???a b???n, vui l??ng ch??? trong gi??y l??t ????? ch??ng t??i x??? l??");
                            break;
                        case 3:
                            App.instance.alertDialog.showMsg("B???n ??ang c?? giao d???ch ch??? x??? l??, vui l??ng ch??? ?????n khi giao d???ch ???????c ho??n t???t");
                            break;
                        case 2:
                        case 1:
                            App.instance.alertDialog.showMsg("D??? li???u l???i, vui l??ng th??? l???i!");
                            break;
                        default:
                            App.instance.alertDialog.showMsg("D??? li???u l???i, vui l??ng th??? l???i!");
                    }
                    console.log(res.error);
                    break;
                }
            }
        }, this);

        
        this.tabTransfer.start();
        
    }

    private onTabChanged() {
        for (let i = 0; i < this.tabContents.childrenCount; i++) {
            this.tabContents.children[i].active = i == this.tabSelectedIdx;
        }
        for (let j = 0; j < this.tabs.toggleItems.length; j++) {
            this.tabs.toggleItems[j].node.getComponentInChildren(cc.Label).node.color = j == this.tabSelectedIdx ? cc.Color.YELLOW : cc.Color.WHITE;
        }
        switch (this.tabSelectedIdx) {
            case 0:
                this.tabNapThe.reset();
                break;
            case 1:
                this.tabTransfer.reset();
                break;
            case 2:
                break;
            case 3:
                break;
            case 4:
                this.tabCard.reset();
                break;
            case 5:
                this.tabBitCoin.start(this);
                break;
        }
    }

    private longToTime(l: number): string {
        return (l / 60) + " gi??? " + (l % 60) + " ph??t";
    }

    show() {
        super.show();
        this.tabSelectedIdx = 0;
        this.tabs.toggleItems[this.tabSelectedIdx].isChecked = true;
        this.onTabChanged();
    }

    showAndOpenTransfer(nickname: string = null) {
        super.show();
        this.tabSelectedIdx = 1;
        this.tabs.toggleItems[this.tabSelectedIdx].isChecked = true;
        this.onTabChanged();
        if (nickname != null) {
            this.tabTransfer.edbNickname.string = this.tabTransfer.edbReNickname.string = nickname;
          //  App.instance.showLoading(true);
          //  MiniGameNetworkClient.getInstance().send(new cmd.ReqCheckNicknameTransfer(nickname));
        }
    }

    

    actContinueTransfer() {
        
        this.tabTransfer.continue();
    }

    actGetOTP() {
        App.instance.showLoading(true);
        MiniGameNetworkClient.getInstance().send(new cmd.ReqGetOTP());
    }

    actSubmitTransfer() {
        let otp = this.tabTransfer.edbOTP.string.trim();
        if (otp.length == 0) {
            App.instance.alertDialog.showMsg("M?? x??c th???c kh??ng ???????c b??? tr???ng.");
            return;
        }
        App.instance.showLoading(true);
        MiniGameNetworkClient.getInstance().send(new cmd.ReqSendOTP(otp, 0));
    }

    actSubmitNapMomo() {
        this.tabMomo.submit();
    }

    actSubmitNapNganHang() {
        this.tabBank.submit();
    }

    actSubmitCard() {
        this.tabCard.submit();
    }
}
