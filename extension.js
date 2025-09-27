import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import St from 'gi://St';
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
            gicon: Gio.icon_new_for_string(metadataPath + '/icon.jpg'),
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
        
        // Initialize state
        this._originalOpacity = null;
        
        // Connect toggle signal
        this._indicator.connect('toggle-transparency', () => {
            this._toggleWindowTransparency();
        });
        
        this._debug('TransparentWindow: Extension enabled successfully');
    }

    disable() {
        this._debug('TransparentWindow: Disabling extension');
        
        if (this._indicator) {
            this._indicator.destroy();
            this._indicator = null;
        }
        
        this._settings = null;
        
        this._debug('TransparentWindow: Extension disabled successfully');
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
    
    _debug(...args) {
        if (this._settings && this._settings.get_boolean('debug-mode')) {
            console.log(...args);
        }
    }
}