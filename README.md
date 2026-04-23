 # Copy for AI — VS Code Extension

**Copy code with full context for ChatGPT, Claude and other AI assistants.**


## ✨ Features

- 📋 Copy selected code with **file path and line numbers**
- 📁 Copy entire folder contents as a single Markdown block
- 🌳 Copy project structure as a tree
- 🔢 See **token count** before pasting into AI
- ⚡ One-click buttons to open ChatGPT, Claude, or Perplexity
- 🎨 Choose output format: Markdown, Plain, or XML
- 🚫 Exclude files/folders by glob patterns (e.g., `node_modules`, `*.log`)

## 📥 Installation

### From VS Code Marketplace *(coming soon)*
1. Open VS Code
2. Go to Extensions (`Ctrl+Shift+X`)
3. Search for "Copy for AI"
4. Click Install

### Manual (.vsix)
1. Download the latest `.vsix` from [Releases](https://github.com/your-github-username/copy-for-ai/releases)
2. In VS Code: `Extensions` → `...` → `Install from VSIX...`
3. Select the downloaded file

## 🛠 Usage

- **Copy Code**: Select code → right-click → `Copy Code for AI`
- **Copy Folder**: Right-click a folder in Explorer → `Copy Folder for AI`
- **Copy Project Structure**: Right-click any folder → `Copy Project Structure`
- **Support**: Open Command Palette (`Ctrl+Shift+P`) → `Copy for AI: Support the Project`

## ⚙️ Configuration

Available settings (`File` → `Preferences` → `Settings` → `Copy for AI`):

- `copyForAI.excludePatterns`: Glob patterns to exclude (default: `["node_modules", ".git", "dist", "*.log", "*.vsix"]`)
- `copyForAI.outputFormat`: `"markdown"`, `"plain"`, or `"xml"`

## 💙 Support

This extension is **completely free**. If you find it useful, please consider supporting:

 - [DonationAlerts](donationalerts.com/r/notasandy)
 - [Full donation page with QR codes](https://notasandy.github.io/copy-for-ai/donate)

## 📄 License

MIT