import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';
import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TransparentWindowPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: 'Transparent Window Settings',
            icon_name: 'preferences-system-symbolic',
        });
        window.add(page);

        // Hotkey Settings Group ---
        const hotkeyGroup = new Adw.PreferencesGroup({
            title: 'Keyboard Shortcuts',
            description: 'Configure bindings to manipulate transparency.',
        });
        page.add(hotkeyGroup);

        const hotkeyRow = new Adw.EntryRow({
            title: 'Toggle Hotkey',
            text: settings.get_string('toggle-hotkey'),
        });

        const hotkeyRow2 = new Adw.EntryRow({
            title: 'Increase Opacity',
            text: settings.get_string('increase-window-opacity'),
        });

        const hotkeyRow3 = new Adw.EntryRow({
            title: 'Decrease Opacity',
            text: settings.get_string('decrease-window-opacity'),
        });

        hotkeyRow.connect('apply', () => {
            settings.set_string('toggle-hotkey', hotkeyRow.get_text());
        });

        hotkeyRow2.connect('apply', () => {
            settings.set_string('increase-window-opacity', hotkeyRow2.get_text());
        });

        hotkeyRow3.connect('apply', () => {
            settings.set_string('decrease-window-opacity', hotkeyRow3.get_text());
        });

        hotkeyGroup.add(hotkeyRow);
        hotkeyGroup.add(hotkeyRow2);
        hotkeyGroup.add(hotkeyRow3);
        // ----------------------------------

        // Opacity Settings Group
        const opacityGroup = new Adw.PreferencesGroup({
            title: 'Opacity Settings',
            description: 'Configure the transparency level for windows.',
        });
        page.add(opacityGroup);

        const opacityRow = new Adw.ActionRow({
            title: 'Opacity Level',
            subtitle: 'Set the default opacity for transparent windows (0% = fully transparent, 100% = fully opaque)',
        });
        opacityGroup.add(opacityRow);

        const slider = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, 0, 100, 1);
        slider.set_hexpand(true);
        slider.set_draw_value(true);
        slider.set_value(settings.get_int('opacity-level'));

        slider.connect('value-changed', () => {
            settings.set_int('opacity-level', slider.get_value());
        });

        opacityRow.add_suffix(slider);
        // ----------------------------------

        // Cycle Settings Group
        const cycleRow = new Adw.ActionRow({
            title: 'Cycle Rate',
            subtitle: 'Set the rate at which windows cycle through opacity levels (1 alpha level per millisecond * rate).',
        });
        // adding to opacityGroup for convenience
        opacityGroup.add(cycleRow);

        const cycleSlider = Gtk.Scale.new_with_range(Gtk.Orientation.HORIZONTAL, 0, 2000, 1);
        cycleSlider.set_hexpand(true);
        cycleSlider.set_draw_value(true);
        cycleSlider.set_value(settings.get_int('cycle-rate'));

        cycleSlider.connect('value-changed', () => {
            settings.set_int('cycle-rate', slider.get_value());
        });

        cycleRow.add_suffix(cycleSlider);       opacityRow.set_activatable_widget(slider);
        // ----------------------------------

        // Debug Settings Group
        const debugGroup = new Adw.PreferencesGroup({
            title: 'Debug Settings',
            description: 'Configure debugging options for troubleshooting.',
        });
        page.add(debugGroup);

        const debugRow = new Adw.ActionRow({
            title: 'Debug Mode',
            subtitle: 'Enable debug logging to console for troubleshooting issues',
        });
        debugGroup.add(debugRow);

        const debugSwitch = new Gtk.Switch();
        debugSwitch.set_active(settings.get_boolean('debug-mode'));
        debugSwitch.connect('notify::active', () => {
            settings.set_boolean('debug-mode', debugSwitch.get_active());
        });

        debugRow.add_suffix(debugSwitch);
        debugRow.set_activatable_widget(debugSwitch);
    }
}
