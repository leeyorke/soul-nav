# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## rule

Please reply in Chinese, concisely and to the point, without unnecessary words.

## Project Overview

Soul Nav is a minimalist browser new tab extension for Edge/Chrome that displays a large clock, search bar, random "Soul" quotes, and customizable navigation links. It uses Manifest V3 and is built with vanilla JavaScript (ES6+).

## Build Commands

```bash
# Build the extension for distribution
npm run build

# Development mode (uses extension CLI)
npm run dev
```

The build output goes to `dist/` directory, which contains browser-specific subdirectories (e.g., `dist/chromium/`).

## Architecture

### File Structure

- `manifest.json` - Extension configuration (Manifest V3)
- `newtab.html` - New tab page HTML structure
- `newtab.js` - Main entry point: clock, search, keyboard shortcuts, settings panel
- `soul.js` - `SoulQuotes` class: quote loading, parsing, storage management
- `style.css` - All styles including dark theme and animations
- `icons/` - Extension icons (16px, 48px, 128px)

### Key Components

**SoulQuotes Class (soul.js)**
- Manages quote data from multiple sources: default hardcoded quotes, localStorage persistence, user-uploaded files
- Supports Markdown/TXT file parsing
- Storage keys: `soul-nav-quotes` (data), `soul-nav-source` (source type)

**newtab.js Main Features**
- Clock with date display (updates every second)
- Search bar with URL detection and Bing search fallback
- Settings panel for: loading custom quotes (soul.md/JSON), custom background image, custom navigation links
- Keyboard shortcuts: Enter (search), Esc (clear search/close settings), Space (next quote), click quote (next quote)

**Data Storage**
- All user customizations stored in browser localStorage:
  - `soul-nav-quotes` - Custom quotes
  - `soul-nav-source` - Quote source tracking
  - `soul-nav-bg` - Background image (base64)
  - `soul-nav-links` - Navigation links array

### Development Notes

- Pure vanilla JavaScript, no build step required for development
- Extension CLI (`extension@latest`) handles packaging for distribution
- Icons must be PNG format, sizes: 16x16, 48x48, 128x128
- Test locally by loading unpacked extension from project root in `edge://extensions/` or `chrome://extensions/`
