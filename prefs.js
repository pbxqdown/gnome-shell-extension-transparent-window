const GLib = imports.gi.GLib;
const GObject = imports.gi.GObject;
const Gio = imports.gi.Gio;
const Gtk = imports.gi.Gtk;
const Lang = imports.lang;

const Gettext = imports.gettext.domain('transparent-window');
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Convenience = Me.imports.convenience;

const setting = Convenience.getSettings();

const Gdk = imports.gi.Gdk;
const Keymap = Gdk.Keymap.get_default();

let ModifierKeyWidget;
let startTime = 0;
let maxKeysCode = 0;

function init(){
  Convenience.initTranslations('transparent-window');
  sig_keymap = Keymap.connect('state_changed', onHotkeyPressed);
}

function onHotkeyPressed() {
  let multiKeysCode = Keymap.get_modifier_state() & (~2);
  //new keystroke series coming out, reset startTime and max keyscode
  if(Date.now() - startTime > 500) {
    startTime = Date.now();
    maxKeysCode = 0;
  }
  maxKeysCode = Math.max(maxKeysCode, multiKeysCode);
  ModifierKeyWidget.set_value(maxKeysCode);
  return;
}

const TransparentWindowPrefsWidget = new GObject.Class({
  Name: 'TransparentWindow.Prefs.Widget',
  GTypeName: 'TransparentWindowPrefsWidget',
  Extends: Gtk.Box,

  _init: function(params) {
    this.parent(params);
    this.set_orientation(Gtk.Orientation.VERTICAL);

    //Modifier key code setting
    let ModifierKeyBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin:10});
    let ModifierKeyLabel = new Gtk.Label({label:_("Modifier Key Code:"), xalign:0});
    ModifierKeyLabel.set_line_wrap(true);
    ModifierKeyLabel.set_markup("Modifier Key Code:\n<small>Press the key(combination of Ctrl, Alt, Shift and Super key only) you want to use with scroll to change window transparency. Default key code(Alt) is 8.</small>");
    ModifierKeyWidget = new Gtk.SpinButton();
    ModifierKeyWidget.set_sensitive(true);
    ModifierKeyWidget.set_range(0,65535);
    ModifierKeyWidget.set_value(setting.get_int('modifier-key'));
    ModifierKeyWidget.set_increments(1,2);
    ModifierKeyWidget.connect('value-changed', function(w) {
      setting.set_int('modifier-key', w.get_value_as_int());
    });
    ModifierKeyBox.pack_start(ModifierKeyLabel, true, true, 0);
    ModifierKeyBox.add(ModifierKeyWidget);
    this.add(ModifierKeyBox);

    //Log verbose level setting
    let LogLevelBox = new Gtk.Box({orientation: Gtk.Orientation.HORIZONTAL, margin: 10});
    let LogLevelLabel = new Gtk.Label({label:_("Log Verbose Level:"), xalign:0});
    let LogLevelWidget = new Gtk.ComboBoxText();
    let levels = {0:_("Debug"), 1:_("Info"), 2:_("Warn"), 3:_("Error")};
    for (id in levels) {
      LogLevelWidget.append(id, levels[id]);
    }
    LogLevelWidget.set_active(setting.get_int('verbose-level'));
    LogLevelWidget.connect('changed', function(comboWidget) {
      setting.set_int('verbose-level', comboWidget.get_active());
    });
    LogLevelBox.pack_start(LogLevelLabel, true, true, 0);
    LogLevelBox.add(LogLevelWidget);
    this.add(LogLevelBox);
  },
});


function buildPrefsWidget(){
  let widget = new TransparentWindowPrefsWidget();

  widget.show_all();

  return widget;
}
