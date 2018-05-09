//META{"name":"DisCrypt"}*//

class DisCrypt {
    getName() {return "DisCrypt";} // Name of your plugin to show on the plugins page 
    getDescription() {return "Automatically decrypt and encrypt messages via RSA";} // Description to show on the plugins page 
    getVersion() {return "0.0.1";} // Current version. I recommend following semantic versioning <http://semver.org/> (e.g. 0.0.1)
    getAuthor() {return "de/odex";} // Your name

    load() {

    } // Called when the plugin is loaded in to memory

	// Called when the plugin is activated (including after reloads)
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

		console.log(rsa.linebrk("testtttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttttt", 64));

		if (window.ZeresLibrary) this.initialize();
		else libraryScript.addEventListener("load", () => { this.initialize(); });
	}
	
	// Called when the library is loaded
	initialize() {
        PluginUtilities.checkForUpdate(this.getName(), this.getVersion()), "https://cdn.rawgit.com/de-odex/bdthings/4f936dde/discord%20crypt/DisCrypt.plugin.js";
	} 
    stop() {

    } // Called when the plugin is deactivated

    observer(e) {

    } // Observer for the document. Better documentation than I can provide is found here: <https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver>


    // plugin stuff
    get_key(){

    }
}

