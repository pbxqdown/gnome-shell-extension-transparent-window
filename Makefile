# Transparent Window GNOME Shell Extension Makefile

# Build extension package
build:
	@echo "Building extension package..."
	@rm -f transparent-window.zip
	@glib-compile-schemas schemas/
	@zip -r transparent-window.zip schemas/*.xml extension.js prefs.js icon.jpg metadata.json
	@echo "Package built: transparent-window.zip"

# Deploy to shell extension folder for testing
test-deploy:
	@echo "Deploying extension for testing..."
	@glib-compile-schemas schemas/
	@rsync -a --info=progress2 --delete . ~/.local/share/gnome-shell/extensions/dev-transparent-window@pbxqdown.github.com
	@sed -i 's/transparent-window@pbxqdown.github.com/dev-transparent-window@pbxqdown.github.com/g;s/Transparent Window/Dev Transparent Window/g' ~/.local/share/gnome-shell/extensions/dev-transparent-window@pbxqdown.github.com/metadata.json
	@echo "Extension deployed. Restart gnome shell to make it take effect."

# Clean test deployment
test-clean:
	@echo "Cleaning test deployment..."
	@rm -rf ~/.local/share/gnome-shell/extensions/dev-transparent-window@pbxqdown.github.com
	@echo "Test deployment cleaned."

.PHONY: build test-deploy test-clean
