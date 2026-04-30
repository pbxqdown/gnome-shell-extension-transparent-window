import Shell from 'gi://Shell';
import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';
import Meta from 'gi://Meta';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const Indicator = GObject.registerClass({
    Signals: {
        'toggle-transparency': {},
    },
}, class Indicator extends PanelMenu.Button {
    _init(metadataPath) {
        super._init(0.0, 'Transparent Window');
        
        // Create icon using custom asset
        this._icon = new St.Icon({
            gicon: Gio.icon_new_for_string(metadataPath + '/icon.png'),
            style_class: 'system-status-icon',
        });
        this.add_child(this._icon);

        // Connect left-click to toggle transparency
        this.connect('button-press-event', (actor, event) => {
            if (event.get_button() === 1) { // Left click
                this.emit('toggle-transparency');
                return Clutter.EVENT_STOP;
            }
            return Clutter.EVENT_PROPAGATE;
        });
    }
    
});

export default class TransparentWindowExtension extends Extension {
    enable() {
        // Load GSettings first
        this._settings = this.getSettings();
        
        this._debug('TransparentWindow: Enabling extension');
        
        // Create and add panel indicator
        this._indicator = new Indicator(this.metadata.path);
        Main.panel.addToStatusArea(this.uuid, this._indicator);

        // Make sure button-press-event is propagated correctly on gnome 49 and 50        
        this._indicator.clear_actions()
        
        // Initialize state
        this._originalOpacity = null;
        
        // Connect toggle signal
        this._indicator.connect('toggle-transparency', () => {
            this._toggleWindowTransparency();
        });
        // initialize state variables
        this._originalOpacity = null;
        // used to toggle the cycleState variable when the toggle-hotkey is pressed
        this._cycleState = false;
        // used to increment the opacity value, default is 255
        this._counter = 255;
        this._STEP = 10;
        // added a slight buffer over 255 to allow a longer time to release at full opacity
        this._MAX = 300;
        // used to set the range for the modulo operation, which enabled the transparency pinp-pong effect in conjunction with the modulo division when used with a ternary operator
        this._RANGE = this._MAX * 2;
        // used to set the delta between window opacity changes, default is 10
        this._cycleRate = this._settings.get_int('cycle-rate');

        // Create global ticker. The _useGlobaclTicker function accesses this variable to manipulate a ticker "singleton" the preserves state across windows
        this._globalTicker = null;

        // Register keybinding (must be declared in your gschema)
        try {
            Main.wm.addKeybinding(
                'toggle-hotkey',           // key name in your schema
                this._settings,            // Gio.Settings instance
                Meta.KeyBindingFlags.IGNORE_AUTOREPEAT | Meta.KeyBindingFlags.TRIGGER_RELEASE,
                Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
                this._cycleWindowOpacity.bind(this)
            );

            Main.wm.addKeybinding("increase-window-opacity",
              this._settings,
              Meta.KeyBindingFlags.NONE,
              Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
              this._increaseWindowOpacity.bind(this));

            Main.wm.addKeybinding("decrease-window-opacity",
              this._settings,
              Meta.KeyBindingFlags.NONE,
              Shell.ActionMode.NORMAL | Shell.ActionMode.OVERVIEW,
              this._decreaseWindowOpacity.bind(this));

            this._debug('TransparentWindow: Keybindings registered (toggle-hotkey, increase-window-opacity, decrease-window-opacity)');
        } catch (e) {
            this._debug('TransparentWindow: Failed to add keybinding for (toggle-hotkey, increase-window-opacity, decrease-window-opacity)', e);
        }
        
        this._debug('TransparentWindow: Extension enabled successfully');
    }

    disable() {
        this._debug('TransparentWindow: Disabling extension');
        
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        
        this._settings = null;
        this._cycleState = null;
        this._cycleRate = null;
        this._globalTicker = null;
        this._counter = null;
        this._STEP = null;
        this._MAX = null;
        this._RANGE = null;
        
        this._debug('TransparentWindow: Extension disabled successfully');
    }

    _cycleWindowOpacity() {
        const focusWindow = global.display.get_focus_window();
        if (!focusWindow) {
            this._debug('TransparentWindow: No focused window found');
            return;
        }
        
        let windowActor = focusWindow.get_compositor_private();
        if (!windowActor) {
            this._debug('TransparentWindow: No window actor found');
            return;
        }

        // Invert the cycleState variable to toggle the opacity cycler
        this.cycleState = !this.cycleState; 

        if (this.cycleState==true) {
           this._globalTicker = setInterval(() => {
            console.log("TransparentWindow: Cycling window opacity...");

            // The counter value is maintained in the original object
            this._counter += this._STEP;


              let relativeValue = this._counter % this._RANGE;

              // If relativeValue is 0-255, result is just relativeValue.
              // If relativeValue is 256-510, result is (510 - relativeValue).
              let finalValue = relativeValue > this._MAX
                ? this._RANGE - relativeValue 
                : relativeValue;


              windowActor.opacity = finalValue;
              

          }, this._cycleRate); // 1000ms = 1 second
        }else{
          console.log("TransparentWindow: Stopping window opacity cycler...");
          clearInterval(this._globalTicker);
          this._globalTicker = null;
        }

    }
    
    _toggleWindowTransparency() {
        // Get the currently focused window
        const focusWindow = global.display.get_focus_window();
        if (!focusWindow) {
            this._debug('TransparentWindow: No focused window found');
            return;
        }
        
        const windowActor = focusWindow.get_compositor_private();
        if (!windowActor) {
            this._debug('TransparentWindow: No window actor found');
            return;
        }
        
        // Toggle transparency based on current state
        if (windowActor.opacity < 255) {
            // Window is transparent, restore original opacity
            const opacity = this._originalOpacity || 255;
            windowActor.opacity = opacity;
            this._debug('TransparentWindow: Restored window opacity:', focusWindow.get_title());
            this._originalOpacity = null;
        } else {
            // Window is opaque, make it transparent
            if (!this._originalOpacity) {
                this._originalOpacity = windowActor.opacity;
            }
            const opacityPercent = this._settings.get_int('opacity-level');
            const opacityValue = Math.round((opacityPercent / 100) * 255);
            windowActor.opacity = opacityValue;
            this._debug('TransparentWindow: Made window transparent:', focusWindow.get_title(), 'opacity:', opacityValue, '(' + opacityPercent + '%)');
        }
    }

    _increaseWindowOpacity() {
        const focusWindow = global.display.get_focus_window();
        if (!focusWindow) {
            this._debug('TransparentWindow: No focused window found');
            return;
        }
        
        const windowActor = focusWindow.get_compositor_private();
        if (!windowActor) {
            this._debug('TransparentWindow: No window actor found');
            return;
        }
        let opacityValue = this._originalOpacity || windowActor.opacity;

        if (Math.min(opacityValue + 20, 255) == 255) {
          this._debug('TransparentWindow: Maximum opacity reached');
        }else{
          opacityValue = (opacityValue + 20) % 255;
          windowActor.opacity = opacityValue; 
        }
    }

    _decreaseWindowOpacity() {
        const focusWindow = global.display.get_focus_window();
        if (!focusWindow) {
            this._debug('TransparentWindow: No focused window found');
            return;
        }
        
        const windowActor = focusWindow.get_compositor_private();
        if (!windowActor) {
            this._debug('TransparentWindow: No window actor found');
            return;
        }
        let opacityValue = this._originalOpacity || windowActor.opacity;
        opacityValue = (opacityValue - 20) % 255;
        windowActor.opacity = opacityValue; 
    }
    
    _debug(...args) {
        if (this._settings && this._settings.get_boolean('debug-mode')) {
            console.log(...args);
        }
    }
}
