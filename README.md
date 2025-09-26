# gnome-shell-extension-transparent-window
## Summary
A GNOME Shell extension that allows you to toggle window transparency with a single click. Click the panel icon to make the currently focused window transparent or restore its opacity.

## Usage
1. Click the window icon in the GNOME Shell panel
2. The currently focused window will become transparent (or restore its opacity if already transparent)
3. Configure the transparency level in the extension preferences
4. Enable debug mode in preferences for troubleshooting 

## Environment
**Supported GNOME Shell versions:**
- GNOME Shell 44, 45, 46, 47, 48, 49
- Compatible with both X11 and Wayland

## Motivation
Transparent window is a very useful feature that can improve work effeciency. It is implemented by software on multiple platforms. Even other Linux desktops like Ubuntu Unity can use Compiz to achieve this goal. There is no reason Gnome doesn't have this feature.

## Design
The extension uses a simple panel indicator approach:
- Creates a panel button with a window icon
- Uses `global.display.get_focus_window()` to get the currently focused window
- Toggles window opacity by modifying the `windowActor.opacity` property
- Stores original opacity to restore it when toggling back

## Features
- **Simple Click Interface**: One-click transparency toggle
- **Configurable Opacity**: Adjust transparency level (0-100%) in preferences
- **Debug Mode**: Optional debug logging for troubleshooting
- **Cross-Platform**: Works on both X11 and Wayland
- **Memory Efficient**: No global event listeners or overlays

## Background knowledge
### Gjs
Gjs is a JavaScript binding for GNOME and can be used to interact with Gtk
### GTK
GTK is a widget toolkit for creating GUI on top of GDK.
### GDK
The wrapper library of low-level window/graphics functions.
### Clutter
#### Overview
Clutter is a GObject-based **graphics library** for creating user interfaces.
#### Actor
Actor is a basic element of Clutter. It encapsulates the postion/size/event of a node in the scene graph. In short, it is the abstraction of a window.
### Mutter
Mutter is the default **window manager** of GNOME3 which uses Clutter as library.
#### Tips
Mutter is a portmanteau of "Metacity"(The deprecated window manger of GNOME2) and "Clutter".

### GNOME Shell
GNOME Shell itself is a plugin of Mutter. This means when devloping shell extension, we are building plugin on plugin lol.
Project location: [https://gitlab.gnome.org/GNOME/gnome-shell/](https://gitlab.gnome.org/GNOME/gnome-shell/)
#### ST(Shell Toolkit)
This is Gnome-shell's Clutter-based toolkit that defines useful actors. Examples are StBin, StButton, etc.

## Major Upgrade to GNOME 48

This extension has been completely rewritten to support modern GNOME versions (44-48) with the following improvements:

### What's New
- **ES6 Module Support**: Converted from legacy `imports.gi` to modern ES6 modules
- **GTK4 Compatibility**: Updated preferences panel to use GTK4 widgets
- **Modern APIs**: Updated to use current GNOME Shell extension APIs
- **Better Performance**: Optimized for GNOME 48's performance improvements
- **Future-Proof**: Compatible with GNOME 44, 45, 46, 47, and 48

### Technical Changes
- Converted all JavaScript files to ES6 modules
- Updated import statements to use `gi://` and `resource://` protocols
- Modernized GTK widgets in preferences panel
- Improved error handling and logging
- Enhanced compatibility with Wayland

## Development Workflow
1. Use `make test-deploy` to deploy changes locally
2. Enable `dev-transparent-window` extension, disable production extension
3. **Reload GNOME Shell** (see reload instructions below)
4. Test transparency changes
5. Test preferences panel functionality
6. Test extension enable/disable operations
7. Check logs for errors: `journalctl -f | grep -i transparent`

### Reloading GNOME Shell
**For X11:**
- Press `Alt+F2`, type `r`, then press Enter

**For Wayland:**
- Restart GDM: `sudo systemctl restart gdm`
- Or logout and login again

## Debugging
After extension is installed, source code is located under `~/.local/share/gnome-shell/extensions`. The extension can be modified and tested there.

### Looking Glass
Looking Glass is GNOME Shell's integrated debugger and inspector tool. It would be helpful to debug any issue of the extension.
#### Usage
Press Alt-F2, type **lg**, then hit Enter.
### Logs
Gnome shell extensions log to the standard location of Linux logs: ```/var/log/syslog```

Use ```journalctl -b0  /usr/bin/gnome-shell |grep -i transparent.*window``` to inspect logs.
#### Logging Level
Different logging levels can be configured. Set "Log Verbose Level" to "Debug" to get detailed log. 

### Debug Mode
The extension includes a built-in debug mode that can be enabled in preferences:
1. Right-click the extension in GNOME Extensions
2. Select "Preferences"
3. Enable "Debug Mode" in the Debug Settings section
4. Debug messages will now appear in the console logs


## Reference
1. https://wiki.gnome.org/Projects/GnomeShell/LookingGlass

## LICENSE
MIT
