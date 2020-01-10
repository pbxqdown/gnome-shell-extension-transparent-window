# gnome-shell-extension-transparent-window
## Summary
The extension will change the opacity of window through simple mouse/keyboard operation.

## Usage
Move mouse cursor into the window you want to change, hover over the window, hold Alt key(or customized modifier key) and scroll to make the window transparent. 

## Environment
Tested on Ubuntu 18.04 Gnome 3.28.

## Motivation
Transparent window is a very useful feature that can improve work effeciency. It is implemented by software on multiple platforms. Even other Linux desktops like Ubuntu Unity can use Compiz to achieve this goal. There is no reason Gnome doesn't have this feature.

## Method
Use GdkKeymap to monitor the hotkeys. When the modifier key is pressed, create an overlay actor that will monitor the scroll event. Once the scroll event is detected, modify the opacity of the mouse hovered window.

## Limits
In gnome-shell I didn't find a way to monitor the scroll event for each window actor, so I can only create an overlay that is on top of all windows. Thus Alt+drag won't work if you toggle on this extension. Feel free to contact me or make a commit if you have a better idea to fix this.
