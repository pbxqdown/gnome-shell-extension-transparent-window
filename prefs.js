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
            description: 'Click the panel icon to toggle the focused window between this opacity and fully opaque.',
        });
        page.add(opacityGroup);

        const opacityRow = new Adw.ActionRow({
            title: 'Opacity Level',
            subtitle: 'Opacity used when toggling via the panel icon (0% = fully transparent, 100% = fully opaque)',
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

        // Alt+Scroll Trigger Group
        const scrollGroup = new Adw.PreferencesGroup({
            title: 'Scroll Transparency',
            description: 'Hold this modifier and scroll over a window to change its opacity.',
        });
        page.add(scrollGroup);

        const modValues = ['alt', 'super', 'ctrl', 'shift', 'altgr'];
        const modLabels = ['Alt', 'Super', 'Ctrl', 'Shift', 'AltGr'];
        const modRow = new Adw.ComboRow({
            title: 'Modifier Key',
            subtitle: 'Modifier held while scrolling to adjust window transparency',
            model: Gtk.StringList.new(modLabels),
        });
        const currentMod = settings.get_string('modifier-key');
        modRow.set_selected(Math.max(0, modValues.indexOf(currentMod)));
        modRow.connect('notify::selected', () => {
            settings.set_string('modifier-key', modValues[modRow.get_selected()]);
        });
        scrollGroup.add(modRow);

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
