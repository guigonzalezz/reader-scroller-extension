.PHONY: build package clean

# Build the extension for local testing
build:
	npm run build

# Build and package the extension as a ZIP for Chrome Web Store
package: build
	powershell -Command "Compress-Archive -Path 'dist/*' -DestinationPath 'reader-scroller-extension.zip' -Force"
	@echo "Package created: reader-scroller-extension.zip"

# Clean build artifacts
clean:
	powershell -Command "Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue"
	powershell -Command "Remove-Item -Force reader-scroller-extension.zip -ErrorAction SilentlyContinue"
	@echo "Cleaned build artifacts"
