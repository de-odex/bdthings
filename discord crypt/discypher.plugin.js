//META{"name":"discypher", "source": "https://github.com/de-odex/bdthings/blob/master/discord%20crypt/discypher.plugin.js"}*//

let CustomSettings = {}
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
                let returnVal = this.getValue();
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
  let rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

String.prototype.replaceBetween = function(start, end, what) {
    return this.substring(0, start) + what + this.substring(end);
};

function stringToUTF8Array(str) {
    let utf8 = [];
    for (let i=0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push(charcode);
        else if (charcode < 0x800) {
            utf8.push(0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f));
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push(0xe0 | (charcode >> 12),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push(0xf0 | (charcode >>18),
                      0x80 | ((charcode>>12) & 0x3f),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f));
        }
    }
    return utf8;
}

//*
function stringtoUTF8CharArray(str) {
    let utf8 = [];
    for (let i=0; i < str.length; i++) {
        let charcode = str.charCodeAt(i);
        if (charcode < 0x80) utf8.push([charcode]);
        else if (charcode < 0x800) {
            utf8.push([0xc0 | (charcode >> 6),
                      0x80 | (charcode & 0x3f)]);
        }
        else if (charcode < 0xd800 || charcode >= 0xe000) {
            utf8.push([0xe0 | (charcode >> 12),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f)]);
        }
        // surrogate pair
        else {
            i++;
            // UTF-16 encodes 0x10000-0x10FFFF by
            // subtracting 0x10000 and splitting the
            // 20 bits of 0x0-0xFFFFF into two halves
            charcode = 0x10000 + (((charcode & 0x3ff)<<10)
                      | (str.charCodeAt(i) & 0x3ff));
            utf8.push([0xf0 | (charcode >>18),
                      0x80 | ((charcode>>12) & 0x3f),
                      0x80 | ((charcode>>6) & 0x3f),
                      0x80 | (charcode & 0x3f)]);
        }
    }
    return utf8;
}//*/

function stringFromUTF8Array(data) {
    const extraByteMap = [ 1, 1, 1, 1, 2, 2, 3, 0 ];
    let count = data.length;
    let str = "";

    for (let index = 0; index < count;) {
        let ch = data[index++];
        if (ch & 0x80) {
            let extra = extraByteMap[(ch >> 3) & 0x07];
            if (!(ch & 0x40) || !extra || ((index + extra) > count))
                return null;
            ch = ch & (0x3F >> extra);
            for (;extra > 0;extra -= 1) {
                let chx = data[index++];
                if ((chx & 0xC0) != 0x80)
                    return null;

                ch = (ch << 6) | (chx & 0x3F);
            }
        }
        str += String.fromCharCode(ch);
    }
    return str;
}

function stringFromByteArray(bytes) {
    let chars = [];
    for(let i = 0, n = bytes.length; i < n;) {
        chars.push(bytes[i++]);
    }
    let s = "";
    for(let i=0,l=chars.length; i<l; i++)
        s += String.fromCharCode(chars[i]);
    return s;
}

function stringToByteArray(str) {
    let bytes = [];
    for(let i = 0, n = str.length; i < n; i++) {
        let char = str.charCodeAt(i);
        bytes.push(char);
    }
    return bytes;
}

class discypher {
    getName() {return "discypher";}
    getShortName() { return "dcyphr"; }
    getDescription() {return "Automatically decrypt and encrypt messages via RSA";}
    getVersion() {return "0.14.0";} // angery! give me my numerical versions! xd
    getWordVersion() {return "fourteen";} // not required, i just prefer it.
    getAuthor() {return "de/odex";}
    getSource() {return "https://cdn.rawgit.com/de-odex/bdthings/4f936dde/discord%20crypt/discypher.plugin.js"}

    //__init__: tales of a python programmer
    constructor() {
        this.default_settings = {dev_mode: false,
                                 priv_key: null,
                                 pub_key: {},
                                 encrypt: {},
                                 decrypt: false,
                                 prefix: "e{",
                                 suffix: "}",
                                 color: "#6aab8e"}
        this.settings = this.default_settings
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
    }


    load() {} //depr

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
            let jsenc = document.createElement("script");
            jsenc.setAttribute("type", "text/javascript");
            jsenc.setAttribute("src", "https://cdn.rawgit.com/travist/jsencrypt/66792978/bin/jsencrypt.js");
            jsenc.setAttribute("id", "jsencLib");
            document.head.appendChild(jsenc);
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

        let elem = e.addedNodes[0];

        if (e.addedNodes[0].classList && this.has_init) {
            let channel = ReactUtilities.getOwnerInstance($("form")[0])
            if (!channel) return
            channel = channel.props.channel
            if (channel.type != 1) return

            let contextmenu = elem.classList.contains(DiscordClasses.ContextMenu.contextMenu) ? elem : elem.querySelector(DiscordSelectors.ContextMenu.contextMenu)
            if ((contextmenu) && (contextmenu.parentNode.id == "app-mount")) {
                let type = ReactUtilities.getReactProperty(contextmenu, "return.memoizedProps.type")
                if ((type == DiscordModules.DiscordConstants.ContextMenuTypes.USER_CHANNEL_TITLE) ||
                    (type == DiscordModules.DiscordConstants.ContextMenuTypes.USER_PRIVATE_CHANNELS) ||
                    (type == DiscordModules.DiscordConstants.ContextMenuTypes.USER_PRIVATE_CHANNELS_MESSAGE)) {

                    let user = ReactUtilities.getReactProperty(contextmenu, "return.stateNode.props.user")
                    if (user.bot) return
                    //new submenu
                    let subMenu = new PluginContextMenu.SubMenuItem("discypher", new PluginContextMenu.Menu().addItems(
                        new PluginContextMenu.TextItem("public key", {callback: () => {
                            let modal = $(PluginUtilities.formatString(this.modalHTML, {modalTitle: "public key", id: "pub-key"}))
                            let panel = $("<form>").addClass("form").css("width", "100%")
                            let pktextarea = new CustomSettings.TextArea("public key", "the user's public key. i'm no stylist so forgive the bad format",
                                {type: "text", placeholder: "-----BEGIN PUBLIC KEY-----...", value: this.settings.pub_key[user.id], rows: 10, cols: 64},
                                (val) => { this.settings.pub_key[user.id] = val; this.set_settings() })
                            panel.append(pktextarea.getElement())
                            modal.find(".selectable").append(panel)
                            modal.find(".backdrop, .close-button, .done-button").on("click", () => {modal.remove()})
                            modal.appendTo("#app-mount")
                        }}),
                        new PluginContextMenu.ToggleItem("encrypt", this.settings.encrypt[channel.recipients[0]], {onChange: cstate => {this.settings.encrypt[channel.recipients[0]] = cstate; this.set_settings()}})
                    ));
                    let pub_key_grp = new PluginContextMenu.ItemGroup().addItems(subMenu);
                    $(contextmenu).append(pub_key_grp.getElement());
                }
            }

            let textarea = elem.querySelector(DiscordSelectors.Textarea.textArea);
            if (textarea) {
                this.textarea_patch($(textarea));
            }

            e.addedNodes.forEach(element => {
                if (element && element.tagName && element.classList && element.classList.contains("messages-wrapper")) {
                    element.querySelectorAll(".message-group").forEach(group => {
                        group.querySelectorAll(".message").forEach(message => {
                            this.messageDecrypt(message)
                        })
                    })
                }
                else if (element && element.tagName && element.classList && element.classList.contains("message-group")) {
                    element.querySelectorAll(".message").forEach(message => {
                        this.messageDecrypt(message)
                    })
                }
                else if (element && element.tagName && element.classList && element.classList.contains("message")) {
                    this.messageDecrypt(element)
                }
            })

            //let messages = $.map(e.addedNodes, function(value, index) {return [value]}).filter(e => {return e.classList.contains("messages-wrapper") || e.classList.contains("message-group")})
            //if (messages[0]){
            //    Logger.debug("messages", messages)
            //    this.messageDecrypt(messages)
            //}
        }
    }

    textarea_patch(textarea) {
        textarea.on("keypress." + this.getName(), (e) => {this.sendEncrypt(e);})
    }

    sendEncrypt(e) {
        try {
            if (e.shiftKey || e.which != 13) return
            let channel = ReactUtilities.getOwnerInstance($("form")[0]).props.channel
            let textarea = $(e.currentTarget)[0]
            let org_msg = $(e.currentTarget).val()
            let parsed_msg = DiscordModules.MessageParser.parse(channel, org_msg).content
            //Logger.debug("", parsed_msg)

            let enc_block = new RegExp("enc:" + DiscordModules.UserInfoStore.getId() + "\n(.*)\nenc:end", "g")
            if (enc_block.exec(parsed_msg)) return

            let start_string = this.settings.prefix
            let end_string = this.settings.suffix

            let start = org_msg.indexOf(start_string)
            let content_start = start != -1 ? start + start_string.length : -1
            let content_end = org_msg.indexOf(end_string, start + start_string.length)
            let end = content_end != -1 ? content_end + end_string.length : -1

            if (!this.settings.encrypt[channel.recipients[0]] && !(start!=-1 || end!=-1)) return

            let pub_key = this.settings.pub_key[channel.recipients[0]]
            if (this.settings.dev_mode) {
                pub_key = this.settings.pub_key[DiscordModules.UserInfoStore.getId()]
            }

            if (pub_key === undefined || pub_key === "") {
                PluginUtilities.showToast("no public key given for this user", {type: "error"})
                e.preventDefault()
                e.stopPropagation()
                return
            }

            let to_encrypt = []

            if (start!=-1 || end!=-1) {
                to_encrypt = [parsed_msg.substring(content_start, content_end)]
            } else if (this.settings.encrypt[channel.recipients[0]]) {
                if (!parsed_msg.length || !org_msg.length) return
                to_encrypt = [parsed_msg]
                start = 0
                end = org_msg.length
            } else {
                return
            }

            let rsa = new JSEncrypt()
            rsa.setPublicKey(pub_key)

            let table = {124: 512, 128: 512, 216: 1024, 392: 2048, 736: 4096}
            let key_length = table[rsa.getPublicKeyB64().length] / 8 - 11
            let matches = encodeURIComponent(to_encrypt[0]).match(/%[89ABab]/g)
            let msg_utf8_length = to_encrypt[0].length + (matches ? matches.length : 0)

            ///*
            if (msg_utf8_length > key_length) {  // compares byte lengths

                let str_array = stringToUTF8Array(to_encrypt[0])
                let str_char_array = stringtoUTF8CharArray(to_encrypt[0])
                //Logger.debug("", str_array)
                //Logger.debug("", str_char_array)

                /*
                for (let i=0, lnh=Math.ceil(str_array.length/key_length); i < lnh; i++){
                    to_encrypt[i] = stringFromUTF8Array(str_array.slice(key_length*i, key_length*(i+1)))  // stringFromByteArray(str_array.slice(key_length*i, key_length*(i+1)))
                }

                to_encrypt.forEach(v => {
                    Logger.debug("to be encrypted", v)
                })
                //*/

                /*
                Logger.debug("to be encrypted", to_encrypt)

                // once decrypted...
                let test = ""
                to_encrypt.forEach(v => {
                    test += v
                })
                test = stringToByteArray(test)
                test = stringFromUTF8Array(test)
                Logger.debug("decrypted", test)
                */

                // chunker beta
                //*
                function chunk(to_process){
                    let byte_length = 0;
                    for (let i = 0, lnh = str_char_array.length; i < lnh; i++) {
                        byte_length += str_char_array[i].length
                        if (byte_length > key_length) {
                            //Logger.debug("char index", i)
                            let match = to_process.match(new RegExp(".{1," + (i) + "}", "g"))
                            return [match[0], to_process.substring(match[0].length)]
                        }
                    }
                }

                let beta_output = []
                let buffer = [0, to_encrypt[0]]
                while (buffer[1] != "") {
                    buffer = chunk(buffer[1])
                    beta_output.push(buffer[0])
                }
                to_encrypt = beta_output
                //Logger.debug("to be encrypted", to_encrypt)
                //*/

                /*
                PluginUtilities.showToast("message too long for key (string has " + msg_utf8_length + " bytes, key can accommodate for " + key_length + " bytes)", {type: "error"})
                e.preventDefault()
                e.stopPropagation()
                return
                //*/
            }
            //*/
            //use しまったしまったしまったしまったしまったしまったしまったしまったしまったしまったしまったしまった for testing UTF-8

            let to_send = []
            to_encrypt.forEach((v, i) => {
                let encrypted = ""
                try {
                    encrypted = rsa.encrypt(v)
                    if (encrypted == false) throw "rsa failed"
                } catch(error) {
                    Logger.err(this.getName(), error)
                    PluginUtilities.showToast("rsa encryption failed", {type: "error"})
                    e.preventDefault()
                    e.stopPropagation()
                    return
                }
                to_send[i] = encrypted
            })

            for (let i=0, lnh=to_send.length; i < lnh; i++){
                if (!to_send[i]) return
            }
            //Logger.debug("", JSON.stringify(to_send))
            to_send = "enc:" + (this.settings.dev_mode ? DiscordModules.UserInfoStore.getId() : channel.recipients[0]) + "\n" + JSON.stringify(to_send) + "\nenc:end"
            if (to_send.length > 2000) {
                PluginUtilities.showToast("overall message too long, please shorten your message", {type: "error"})
                e.preventDefault()
                e.stopPropagation()
                return
            }
            textarea.focus();
            textarea.selectionStart = start;
            textarea.selectionEnd = end;
            document.execCommand("insertText", false, to_send);
        } catch(error) {
            Logger.err(this.getName(), error)
            PluginUtilities.showToast("an error has occurred during encryption; message not sent", {type: "error"})
            e.preventDefault()
            e.stopPropagation()
            return
        }
    }

    messageDecrypt(message) {
        let this_plugin = this
        if (!this_plugin.settings.decrypt) return

        $(message).each(function(_, node){
            $(node).find(".markup").each(function(_, node2){
                let text = node2.innerText
                let enc_block = new RegExp("enc:" + DiscordModules.UserInfoStore.getId() + "\n(.*)\nenc:end", "g")
                let match = enc_block.exec(text)

                if (match && !message.classList.contains("message-sending")){
                    if (this_plugin.settings.priv_key === undefined) {PluginUtilities.showToast("no private key given for your account", {type: "error"}); return;}
                    //start = match.index, end = match.index + match[0].length

                    let rsa = new JSEncrypt()
                    rsa.setPrivateKey(this_plugin.settings.priv_key)
                    let decrypted = []
                    try {
                        let serialized = JSON.parse(match[1])
                        //Logger.debug("serialized", match[1])
                        serialized.forEach((v, i) => {
                            decrypted[i] = rsa.decrypt(v)
                            //Logger.debug("to decrypt v", v)
                            //Logger.debug("decrypted v", rsa.decrypt(v))
                        })
                        //Logger.debug("so far", decrypted)
                        decrypted = decrypted.join("")
                        //Logger.debug("full decrypt", decrypted)
                    } catch (error) {
                        // old system, no longer generated
                        Logger.warn(this_plugin.getName(), "Old system used, this method is deprecated")
                        decrypted = rsa.decrypt(match[1])
                    }

                    node2.innerText = text.replaceBetween(match.index, match.index + match[0].length, decrypted)
                    node2.style.color = this_plugin.settings.color
                }
                //node2.innerText = btoa(unescape(encodeURIComponent(node2.innerText)))
            })
        })



        /*
        let channel = ReactUtilities.getOwnerInstance($("form")[0]).props.channel
        let message_content = "";
        let message_node = null;
        for (let i=0, lnh=messages.length; i < lnh; i++){
            message_node = $(messages[i]).find(".markup")
            if (message_node == undefined) return
            // somewhat broken right now
            let message_contents = message_node.contents().filter(function(){ return this.nodeType == 3; })
            Logger.debug("", $(message_contents))
            for (let j=0, lnh2=message_contents.length; j < lnh2; j++) {
                let enc_block = new RegExp("enc:" + DiscordModules.UserInfoStore.getId() + "\n(.*)\nenc:end", "g")
                Logger.debug("", message_contents[j].text())
                message_contents[j].text("LOL")


                //.match(enc_block)
            }

            // message_content = message_node.contents().not(message_node.children()).text();
            //Logger.debug("", message_content)
        }
        //*/
    }

    getSettingsPanel() {
        let dms = DiscordModules.ChannelStore.getDMUserIds()
        let dms_u = []
        for (let i=0, lnh=dms.length; i < lnh; i++) {
            dms_u[i] = DiscordModules.UserStore.getUser(dms[i])
        }
        for (let i=0, lnh=dms_u.length; i < lnh; i++) {
            if (dms_u[i] === undefined) continue
            if (dms_u[i].bot) {dms_u.remove(i); i--}
        }

        let panel = $("<form>").addClass("form").css("width", "100%");

        let private_key = new CustomSettings.TextArea("private key", "input your private key here (may be unsafe but i'm using it anyway)", {type: "text", placeholder: "-----BEGIN RSA PRIVATE KEY-----...", value: this.settings.priv_key, rows: 10, cols: 85, style: "resize:none"}, (val) => { this.settings.priv_key = val; this.set_settings() })
        private_key.getElement().appendTo(panel)

        let decrypt = new PluginSettings.Checkbox("decrypt", "automatically decrypt?", this.settings.decrypt, val => { this.settings.decrypt = val; this.set_settings() }, {})
        decrypt.getElement().appendTo(panel)

        let prefix = new PluginSettings.Textbox("prefix", "set prefix for encryption", this.settings.prefix, "", val => { this.settings.prefix = val; this.set_settings() }, {})
        prefix.getElement().appendTo(panel)

        let suffix = new PluginSettings.Textbox("suffix", "set suffix for encryption", this.settings.suffix, "", val => { this.settings.suffix = val; this.set_settings() }, {})
        suffix.getElement().appendTo(panel)

        let color = new PluginSettings.ColorPicker("color", "color of the decrypted text", this.settings.color, val => { this.settings.color = val; this.set_settings() }, {})
        color.getElement().appendTo(panel)

        if (DiscordModules.UserInfoStore.getId() == 259277943275126785) {
            let dev_mode = new PluginSettings.Checkbox("dev_mode", "guaranteed to mess with your settings", this.settings.dev_mode, val => {this.settings.dev_mode = val;this.set_settings()}, {})
            dev_mode.getElement().appendTo(panel)
        }

        $("<p>there is a better way to add public keys in construction. just wait, please</p>").appendTo(panel)
        $("<p>for now you right click the user name at top of dms</p>").appendTo(panel)

        return panel[0];
    }

    // stolen from zere(tm)
    update() { PluginUtilities.checkForUpdate(this.getName(), this.getVersion(), this.getSource()); }

    // settings stuff
    set_settings() {
        PluginUtilities.saveSettings(this.getName(), this.settings)
    }

    get_settings() {
        this.settings = PluginUtilities.loadSettings(this.getName(), this.default_settings)
    }

    init(){
        this.update()
        this.has_init = true
        this.get_settings()

        let textarea = document.querySelector(DiscordSelectors.Textarea.textArea);
        if (textarea) {
            this.textarea_patch($(textarea));
        }

        Logger.info(this.getName(), "version " + this.getWordVersion() + " was initialized")
        PluginUtilities.showToast(this.getName() + " " + this.getWordVersion() + " was started.")
    }

    deinit(){
        this.has_init = false
        PluginUtilities.showToast(this.getName() + " " + this.getWordVersion() + " was stopped.")
    }
}

