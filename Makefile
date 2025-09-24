# Build extension package
build:
	zip -r transparent-window.zip schemas convenience.js extension.js icon.jpg logger.js metadata.json prefs.js utils.js

# Deploy to shell extension folder and modify metadata file to get a local test extension. Press Alt+F2 then type 'r' to restart gnome shell to enable this test extension
test-deploy:
	rsync -a --info=progress2 --delete . ~/.local/share/gnome-shell/extensions/dev-transparent-window@pbxqdown.github.com
	sed -i 's/transparent-window@pbxqdown.github.com/dev-transparent-window@pbxqdown.github.com/g;s/Transparent Window/Dev Transparent Window/g' ~/.local/share/gnome-shell/extensions/dev-transparent-window@pbxqdown.github.com/metadata.json

# Clean test deployment
test-deploy-clean:
	rm -rf ~/.local/share/gnome-shell/extensions/dev-transparent-window@pbxqdown.github.com
