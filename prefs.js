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
        opacityRow.set_activatable_widget(slider);

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
