# Transparent Window GNOME Shell Extension Makefile

# Run unit tests (pure logic, no GNOME Shell required)
test:
	@echo "Running unit tests..."
	@node --test

# Build extension package (runs unit tests first)
build: test
	@echo "Building extension package..."
	@rm -f transparent-window.zip
	@glib-compile-schemas schemas/
	@zip -r transparent-window.zip schemas/*.xml extension.js prefs.js icon.jpg metadata.json lib/*.js
	@echo "Package built: transparent-window.zip"

# Deploy to shell extension folder for testing (runs unit tests first)
test-deploy: test
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

.PHONY: test build test-deploy test-clean
