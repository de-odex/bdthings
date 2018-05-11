//META{"name":"discypher", "source": "https://cdn.rawgit.com/de-odex/bdthings/4f936dde/discord%20crypt/discypher.plugin.js"}*//

var CustomSettings = {}
CustomSettings.TextArea = class TextArea {
    /**
     * @constructor
     * @param {string} name - title for the setting
     * @param {string} helptext - description/help text to show
     * @param {object} inputData - props to set up the input field
     * @param {PluginSettings~settingsChanged} callback - callback fired when the input field is changed
     */
    constructor(name, helptext, inputData, callback) {
        this.name = name;
        this.helptext = helptext;
        this.row = $("<div>").addClass("ui-flex flex-vertical flex-justify-start flex-align-stretch flex-nowrap ui-switch-item").css("margin-top", 0);
        this.top = $("<div>").addClass("ui-flex flex-horizontal flex-justify-start flex-align-stretch flex-nowrap plugin-setting-input-row");
        this.settingLabel = $("<h3>").attr("class", "ui-form-title h3 margin-reset margin-reset ui-flex-child").text(name);
        
        this.help = $("<div>").addClass("ui-form-text style-description margin-top-4").css("flex", "1 1 auto").text(helptext);
        
        this.top.append(this.settingLabel);
        this.inputWrapper = $("<div>", {class: "input-wrapper"});
        this.top.append(this.inputWrapper);
        this.row.append(this.top, this.help);
        
        this.input = $("<TextArea>", inputData);
        this.input.val(inputData.value)
        this.input.addClass('plugin-input');
        this.getValue = () => {return this.input.val();};
        this.processValue = (value) => {return value;};
        this.input.on("keyup change", () => {
            if (typeof callback != 'undefined') {
                var returnVal = this.getValue();
                callback(returnVal);
            }
        });

        this.setInputElement(this.input);
    }
    
    /**
     * Performing this will prevent the default callbacks from working!
     * @param {(HTMLElement|jQuery)} node - node to override the default input with.
     */
    setInputElement(node) {
        this.inputWrapper.empty();
        this.inputWrapper.append(node);
    }
    
    /** @returns {jQuery} jQuery node for the group. */
    getElement() { return this.row; }
};

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

class discypher {
    getName() {return "discypher";}
    getDescription() {return "Automatically decrypt and encrypt messages via RSA";}
    getVersion() {return "0.1.0";} // angery! give me my numerical versions! xd
    getWordVersion() {return "one";} // not required, i just prefer it.
    getAuthor() {return "de/odex";}

    //__init__: tales of a python programmer
    constructor(){
        this.default_settings = {priv_key: null, pub_key: {}, encrypt: false, decrypt: false}
        this.settings = this.default_settings  // almost typed None there
        this.modalHTML = `<div id="\${id}" class="theme-dark">
                            <div class="backdrop backdrop-1ocfXc" style="background-color: rgb(0, 0, 0); opacity: 0.85;"></div>
                            <div class="modal modal-1UGdnR" style="opacity: 1;">
                                <div class="inner-1JeGVc">
                                    <div class="modal-3HD5ck sizeMedium-1fwIF2" style="overflow: hidden;">
                                        <div class="flex-1xMQg5 flex-1O1GKY horizontal-1ae9ci horizontal-2EEEnY flex-1O1GKY directionRow-3v3tfG justifyStart-2NDFzi alignCenter-1dQNNs noWrap-3jynv6 header-1R_AjF">
                                            <h4 class="title h4-AQvcAz title-3sZWYQ size16-14cGz5 height20-mO2eIN weightSemiBold-NJexzi defaultColor-1_ajX0 defaultMarginh4-2vWMG5 marginReset-236NPn">\${modalTitle}</h4>
                                            <svg viewBox="0 0 12 12" name="Close" width="18" height="18" class="close-button close-18n9bP flexChild-faoVW3"><g fill="none" fill-rule="evenodd"><path d="M0 0h12v12H0"></path><path class="fill" fill="currentColor" d="M9.5 3.205L8.795 2.5 6 5.295 3.205 2.5l-.705.705L5.295 6 2.5 8.795l.705.705L6 6.705 8.795 9.5l.705-.705L6.705 6"></path></g></svg>
                                        </div>
                                        <div class="scrollerWrap-2lJEkd content-2BXhLs scrollerThemed-2oenus themeGhostHairline-DBD-2d">
                                            <div class="scroller-2FKFPG inner-3wn6Q5 selectable" style="">
                    
                                            </div>
                                        </div>
                                        <div class="flex-1xMQg5 flex-1O1GKY horizontalReverse-2eTKWD horizontalReverse-3tRjY7 flex-1O1GKY directionRowReverse-m8IjIq justifyStart-2NDFzi alignStretch-DpGPf3 noWrap-3jynv6 footer-2yfCgX" style="flex: 0 0 auto;"><button type="button" class="done-button button-38aScr lookFilled-1Gx00P colorBrand-3pXr91 sizeMedium-1AC_Sl grow-q77ONN"><div class="contents-18-Yxp">Done</div></button></div>
                                    </div>
                                </div>
                            </div>
                        </div>`;

        this.msg_parse = InternalUtilities.WebpackModules.findByUniqueProperties(["createBotMessage"])
        this.msg_send = InternalUtilities.WebpackModules.findByUniqueProperties(["sendClydeError"])
    }


    load() {

    } //depr

    start() {
        let libraryScript = document.getElementById('zeresLibraryScript');
        if (!libraryScript || (window.ZeresLibrary && window.ZeresLibrary.isOutdated)) {
            if (libraryScript) libraryScript.parentElement.removeChild(libraryScript);
            libraryScript = document.createElement("script");
            libraryScript.setAttribute("type", "text/javascript");
            libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
            libraryScript.setAttribute("id", "zeresLibraryScript");
            document.head.appendChild(libraryScript);
        }

        // this is me being lazy
        {
            let jsbn = document.createElement("script");
            jsbn.setAttribute("type", "text/javascript");
            jsbn.setAttribute("src", "https://cdn.rawgit.com/de-odex/bdthings/518d7e2e/discord%20crypt/deps/jsbn.js");
            jsbn.setAttribute("id", "jsbnLib");
            document.head.appendChild(jsbn);

            let rsa = document.createElement("script");
            rsa.setAttribute("type", "text/javascript");
            rsa.setAttribute("src", "https://cdn.rawgit.com/de-odex/bdthings/518d7e2e/discord%20crypt/deps/rsa.js");
            rsa.setAttribute("id", "rsaLib");
            document.head.appendChild(rsa);

            let rsa2 = document.createElement("script");
            rsa.setAttribute("type", "text/javascript");
            rsa.setAttribute("src", "https://cdn.rawgit.com/de-odex/bdthings/518d7e2e/discord%20crypt/deps/rsa2.js");
            rsa.setAttribute("id", "rsa2Lib");
            document.head.appendChild(rsa2);
        
        }

        if (window.ZeresLibrary) this.initialize()
        else libraryScript.addEventListener("load", () => { this.initialize(); })
    } //ac
    
    initialize() {
        this.init()
        this.update()
    } //load

    stop() {
        this.deinit()
    } //deac

    observer(e) {
        if (!e.addedNodes.length || !(e.addedNodes[0] instanceof Element) || !this.has_init) return;

        if (e.addedNodes[0].classList && this.has_init) {
            var elem = e.addedNodes[0]
            var contextmenu = elem.classList.contains(DiscordClasses.ContextMenu.contextMenu) ? elem : elem.querySelector(DiscordSelectors.ContextMenu.contextMenu)
            if (!contextmenu || !(contextmenu.parentNode.id == "app-mount")) return
            if (!(ReactUtilities.getReactProperty(contextmenu, "return.memoizedProps.type") == DiscordModules.DiscordConstants.ContextMenuTypes.USER_CHANNEL_TITLE) &&
                !(ReactUtilities.getReactProperty(contextmenu, "return.memoizedProps.type") == DiscordModules.DiscordConstants.ContextMenuTypes.USER_PRIVATE_CHANNELS) &&
                !(ReactUtilities.getReactProperty(contextmenu, "return.memoizedProps.type") == DiscordModules.DiscordConstants.ContextMenuTypes.USER_PRIVATE_CHANNELS_MESSAGE)) return

            let user = ReactUtilities.getReactProperty(contextmenu, "return.stateNode.props.user")
            if (user.bot) return
            Logger.debug("", user)


            //new submenu
            let subMenu = new PluginContextMenu.SubMenuItem("discypher", new PluginContextMenu.Menu().addItems(
                new PluginContextMenu.TextItem("public key", {callback: () => {
                    let modal = $(PluginUtilities.formatString(this.modalHTML, {modalTitle: "public key", id: "pub-key"}))
                    var panel = $("<form>").addClass("form").css("width", "100%")
                    var pktextarea = new CustomSettings.TextArea("public key", "the user's public key. i'm no stylist so forgive the bad format", 
                        {type: "text", placeholder: "-----BEGIN RSA PUBLIC KEY-----...", value: this.settings.pub_key[user.id], rows: 10, cols: 64}, 
                        (val) => { this.settings.pub_key[user.id] = val; this.set_settings() })
                    Logger.debug("", pktextarea)
                    panel.append(pktextarea.getElement())
                    modal.find(".selectable").append(panel)
                    modal.find(".backdrop, .close-button, .done-button").on("click", () => {modal.remove()})
                    modal.appendTo("#app-mount")
                }})
            ));
            let testGroup = new PluginContextMenu.ItemGroup().addItems(subMenu);
            $(contextmenu).append(testGroup.getElement()); 
            
        }

    }

    sendEncrypt(e) {
        let dm = ReactUtilities.getOwnerInstance($("form")[0]).props.channel
        if (dm.type != 1) return
        let msg = this.msg_parse.parse(dm, $(DiscordSelectors.Textarea.channelTextArea.toString() + ' textarea').val()).content
        if (!msg.contains("```encrypt\n")) return
        let start = msg.indexOf("```encrypt\n")
        let end = msg.indexOf("```", start + 3)

        ReactUtilities.getOwnerInstance($('form')[0]).setState({textValue: ''});
        e.preventDefault();
        e.stopPropagation();
        return;
    }

    getSettingsPanel() {
        var dms = DiscordModules.ChannelStore.getDMUserIds()
        var dms_u = []
        for (var i=0, lnh=dms.length; i < lnh; i++) {
            dms_u[i] = DiscordModules.UserStore.getUser(dms[i])
        }
        for (var i=0, lnh=dms_u.length; i < lnh; i++) {
            if (dms_u[i] === undefined) continue
            if (dms_u[i].bot) {dms_u.remove(i); i--}
        }
        Logger.debug("", dms_u)

        var panel = $("<form>").addClass("form").css("width", "100%");

        var private_key = new CustomSettings.TextArea("private key", "input your private key here (may be unsafe but i'm using it anyway)", {type: "text", placeholder: "-----BEGIN RSA PRIVATE KEY-----...", value: this.settings.priv_key, rows: 10, cols: 64}, (val) => { this.settings.priv_key = val; this.set_settings() })
        private_key.getElement().appendTo(panel)
        var encrypt = new PluginSettings.Checkbox("encrypt", "automatically encrypt?", this.settings.encrypt, val => { this.settings.encrypt = val; this.set_settings() }, {})
        encrypt.getElement().appendTo(panel)
        var decrypt = new PluginSettings.Checkbox("decrypt", "automatically decrypt?", this.settings.decrypt, val => { this.settings.decrypt = val; this.set_settings() }, {})
        decrypt.getElement().appendTo(panel)
        $("<p>there is a better way to add public keys in construction. just wait, please</p>").appendTo(panel)

        return panel[0];
    }
    

    // stolen from zere(tm)
    update() { PluginUtilities.checkForUpdate(this.getName(), this.getVersion()); }
    


    // settings stuff
    set_settings() {
        PluginUtilities.saveSettings(this.getName(), this.settings)
    }

    get_settings() {
        this.settings = PluginUtilities.loadSettings(this.getName(), this.default_settings)
    }


    // plugin stuff
    init(){
        this.has_init = true

        this.get_settings()

        Logger.info(this.getName(), "version " + this.getWordVersion() + " was initialized")

        PluginUtilities.showToast(this.getName() + " " + this.getWordVersion() + " has started.")
    }

    deinit(){
        this.has_init = false
    }

    get_key(){

    }
}

