# gnome-shell-extension-transparent-window
## Summary
The extension will change the opacity of window through simple mouse/keyboard operation.

## Usage
Move mouse cursor into the window you want to change, hover over the window, hold Alt key(or customized modifier key) and scroll to make the window transparent. 

## Environment
Tested on:
1. Ubuntu 18.04 Gnome 3.28.
2. Ubuntu 20.04 Gnome 3.36.

## Motivation
Transparent window is a very useful feature that can improve work effeciency. It is implemented by software on multiple platforms. Even other Linux desktops like Ubuntu Unity can use Compiz to achieve this goal. There is no reason Gnome doesn't have this feature.

## Design
Use GdkKeymap to monitor the hotkeys. When the modifier key is pressed, create an overlay actor that will monitor the scroll event. Once the scroll event is detected, modify the opacity of the mouse hovered window.

## Limits
An overlay on top of all windows has to be created in order to monitor scroll event. Thus Alt+drag operation won't work anymore. Feel free to contact me or make a commit if you have a better idea to solve the problem.

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

## Testing
### Testing Steps
1. Use `make test-deploy` command to deploy changes locally.
2. Enable dev-transparent-window extension, disable production extension.
3. Test transparency changes.
4. Test prefs panel and shortcut key functionality.
5. Test extension enable/disable operations.
6. Check logs for errors: `sudo journalctl -f /usr/bin/gnome-shell`

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

### Reload Gnome shell
You may need to reload gnome shell to test and debug extension changes.
Press Alt-F2, type **r**, then hit Enter to reload gnome shell.


## Reference
1. https://wiki.gnome.org/Projects/GnomeShell/LookingGlass

## LICENSE
MIT
