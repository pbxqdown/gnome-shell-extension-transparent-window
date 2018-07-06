# gnome-shell-extension-transparent-window
## Summary
The extension will change the opacity of window by hovering over the window, hold Alt key and scroll. 
## Motivation
Transparent window is a very useful feature that can improve work effeciency. It is implemented by software in multiple platforms. Even other Linux desktop like Ubuntu Unity can use Compiz to achieve this goal. There is no reason Gnome doesn't have this feature.

## Method
Use GdkKeymap to monitor the hotkeys. When the Alt key is pressed, create an overlay actor that will monitor the scroll event. Once the scroll event is detected, modify the opacity of the mouse hovered window.

## Limits
In gnome-shell I didn't find a way to monitor the scroll event for each window actor, so I can only create an overlay that is on top of all windows. Thus Alt+drag won't work if you toggle on this extension. Feel free to contact me or make a commit if you have a better idea to fix this.
