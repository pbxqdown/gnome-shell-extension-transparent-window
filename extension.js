import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import St from 'gi://St';
import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import {scrollOpacity, pickWindowAt} from './lib/transparency.js';

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

        // Make sure button-press-event is propagated correctly on gnome 49 and 50        
        this._indicator.clear_actions()
        
        // Initialize state
        this._originalOpacity = null;
        
        // Connect toggle signal
        this._toggleId = this._indicator.connect('toggle-transparency', () => {
            this._toggleWindowTransparency();
        });

        // Alt+scroll transparency state
        this._altHeld = false;
        this._overlays = [];
        // Cache the trigger modifier mask; refresh it when the setting changes.
        this._modMask = this._modifierMask();
        this._modifierChangedId = this._settings.connect('changed::modifier-key', () => {
            this._modMask = this._modifierMask();
            this._exitScrollMode(); // avoid getting stuck if changed mid-gesture
            this._altHeld = false;
        });
        this._startModifierWatch();

        this._debug('TransparentWindow: Extension enabled successfully');
    }

    disable() {
        this._debug('TransparentWindow: Disabling extension');

        // Tear down Alt+scroll machinery
        if (this._pollId) {
            GLib.source_remove(this._pollId);
            this._pollId = null;
        }
        if (this._modifierChangedId) {
            this._settings.disconnect(this._modifierChangedId);
            this._modifierChangedId = null;
        }
        this._exitScrollMode();
        this._altHeld = false;

        if (this._indicator) {
            if (this._toggleId) {
                this._indicator.disconnect(this._toggleId);
                this._toggleId = null;
            }
            this._indicator.destroy();
            this._indicator = null;
        }
        
        this._settings = null;
        
        this._debug('TransparentWindow: Extension disabled successfully');
    }

    // --- Alt+scroll transparency ---

    _modifierMask() {
        // Map the configured modifier name to its Clutter mask bit. Multiple
        // options are offered so users on non-US keyboards can pick one that
        // actually maps to a usable modifier on their layout.
        switch (this._settings.get_string('modifier-key')) {
            case 'ctrl':
                return Clutter.ModifierType.CONTROL_MASK;
            case 'super':
                // Super shows up as MOD4 on most setups; accept SUPER too.
                return Clutter.ModifierType.MOD4_MASK | Clutter.ModifierType.SUPER_MASK;
            case 'shift':
                return Clutter.ModifierType.SHIFT_MASK;
            case 'altgr':
                // AltGr / right Alt (ISO_Level3_Shift) is MOD5 on most layouts.
                return Clutter.ModifierType.MOD5_MASK;
            case 'alt':
            default:
                return Clutter.ModifierType.MOD1_MASK;
        }
    }

    _startModifierWatch() {
        // No global "modifier pressed" event exists on GNOME 45+, so poll the
        // live modifier state from the cursor tracker instead (cheap C call).
        // 100ms keeps wakeups low while staying responsive.
        if (this._pollId) {
            GLib.source_remove(this._pollId);
        }
        this._pollId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 100, () => {
            const [, , mods] = global.get_pointer();
            const held = !!(mods & this._modMask);
            if (held && !this._altHeld) {
                this._enterScrollMode();
            } else if (!held && this._altHeld) {
                this._exitScrollMode();
            }
            this._altHeld = held;
            return GLib.SOURCE_CONTINUE;
        });
    }

    _enterScrollMode() {
        if (this._overlays.length > 0) {
            return; // already active
        }
        this._debug('TransparentWindow: Alt held, capturing scroll');
        for (const monitor of Main.layoutManager.monitors) {
            const overlay = new St.Widget({reactive: true});
            overlay.set_size(monitor.width, monitor.height);
            overlay.set_position(monitor.x, monitor.y);
            const sigId = overlay.connect('scroll-event', (actor, event) => {
                return this._onScroll(actor, event);
            });
            Main.layoutManager.addChrome(overlay);
            this._overlays.push([overlay, sigId]);
        }
    }

    _exitScrollMode() {
        if (!this._overlays || this._overlays.length === 0) {
            return;
        }
        this._debug('TransparentWindow: releasing scroll capture');
        for (const [overlay, sigId] of this._overlays) {
            overlay.disconnect(sigId);
            Main.layoutManager.removeChrome(overlay);
            overlay.destroy();
        }
        this._overlays = [];
    }

    _getWindowActorAtPointer() {
        const [px, py] = global.get_pointer();
        // Build plain rects (bottom-to-top) and delegate hit-testing to pure logic.
        const rects = global.get_window_actors().map(actor => {
            const [x, y] = actor.get_position();
            const [width, height] = actor.get_size();
            return {x, y, width, height, visible: actor.visible, actor};
        });
        const hit = pickWindowAt(px, py, rects);
        return hit ? hit.actor : null;
    }

    _onScroll(_actor, event) {
        const windowActor = this._getWindowActorAtPointer();
        if (!windowActor) {
            return Clutter.EVENT_PROPAGATE;
        }

        const step = this._settings.get_int('opacity-step');
        const minOpacity = this._settings.get_int('min-opacity');

        let direction = null;
        let smoothDy = 0;
        switch (event.get_scroll_direction()) {
            case Clutter.ScrollDirection.UP:
                direction = 'up';
                break;
            case Clutter.ScrollDirection.DOWN:
                direction = 'down';
                break;
            case Clutter.ScrollDirection.SMOOTH:
                direction = 'smooth';
                smoothDy = event.get_scroll_delta()[1];
                break;
        }

        const next = scrollOpacity(windowActor.opacity, direction, step, minOpacity, smoothDy);
        if (next === null) {
            return Clutter.EVENT_PROPAGATE;
        }

        windowActor.opacity = next;
        this._debug('TransparentWindow: Alt+scroll opacity ->', next);
        return Clutter.EVENT_STOP;
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