const St = imports.gi.St;
const Main = imports.ui.main;
const Tweener = imports.ui.tweener;
const Shell = imports.gi.Shell;
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Meta = imports.gi.Meta;
const Clutter = imports.gi.Clutter;
const Layout = imports.ui.layout;

const Gdk = imports.gi.Gdk;
const Keymap = Gdk.Keymap.get_default();

//logger
const currentExtension = ExtensionUtils.getCurrentExtension();
const Logger = currentExtension.imports.logger.Logger;

//setting
const Convenience = currentExtension.imports.convenience;
let setting = Convenience.getSettings();

//Gnome version check
function isVersionGreaterOrEqual(major, minor) {
    lis = imports.misc.config.PACKAGE_VERSION.split('.');
    if (parseInt(lis[0]) > major) return true;
    if (parseInt(lis[0]) < major) return false;
    if (parseInt(lis[1]) > minor) return true;
    if (parseInt(lis[1]) < minor) return false;
    return true;
}

let text, button, settings, win_actor, overlayContainer, overlay, sig_scroll, sig_keymap;
let step = 5;
let min_opacity = 20;
let overlayExists = false; //ensure only one overlay is created

let Log;

let sig_verbose_level;
let sig_modifier_key;
let modifier_key;

//TODO: Add "About" page. Add config for minimum opacity and step.
function init() {
  Log = new Logger("TransparentWindow", setting.get_int('verbose-level'));
  modifier_key = setting.get_int('modifier-key');
  Log.debug("Gnome version:" + imports.misc.config.PACKAGE_VERSION);
  gnome_at_least_3_34 = isVersionGreaterOrEqual(3, 34);
}

function getMouseHoveredWindowActor() {
  let [mouse_x, mouse_y, mask] = global.get_pointer();
  Log.debug(mouse_x + "," + mouse_y);
  let window_actors = global.get_window_actors();
  let result = null;
  window_actors.forEach(function(actor) {
    let xmin = actor.get_position()[0];
    let ymin = actor.get_position()[1];
    let xmax = xmin + actor.get_size()[0];
    let ymax = ymin + actor.get_size()[1];
    if(xmin < mouse_x && mouse_x < xmax && ymin < mouse_y && mouse_y < ymax) {
      result = actor;
    }
  });
  return result;
}

function onScroll(actor, event) {
  Log.debug("on scroll");
  win_actor = getMouseHoveredWindowActor();
  //Gnome 3.34 and above introduced MetaSurfaceActor. We need to get this actor below MetaWindowActor and apply opacity-change on it.
  if (gnome_at_least_3_34) win_actor = win_actor.get_children()[0];
  let opacity = win_actor.get_opacity();

  let dir = event.get_scroll_direction();
  Log.debug(dir);
  switch(dir) {
    case Clutter.ScrollDirection.UP:
      opacity += step;
      break;
    case Clutter.ScrollDirection.DOWN:
      opacity -= step;
      break;
    default:
      return Clutter.EVENT_PROPAGATE;
  }
  Log.debug("opacity: " + opacity);
  win_actor.set_opacity(Math.max(min_opacity, Math.min(opacity, 255)));
  return Clutter.EVENT_STOP;
}


function createOverlay() {
  if(overlayExists) return;
  Log.debug("overlay created");
  overlayContainer = new St.Widget({
    clip_to_allocation: true,
    layout_manager: new Clutter.BinLayout()
  });
  overlayContainer.add_constraint(new Layout.MonitorConstraint({primary: true, work_area: true}));
  Main.layoutManager.addChrome(overlayContainer, {affectsInputRegion: false});

  overlay = new St.Bin({ style_class: '',
    reactive: true,
    can_focus: true,
    x_fill: true,
    y_fill: false,
    track_hover: true });
  //TODO:support multi-monitor
  let monitor = Main.layoutManager.primaryMonitor;
  overlay.set_size(monitor.width, monitor.height);
  overlay.set_position(0, 0);
  sig_scroll = overlay.connect("scroll-event", onScroll);
  overlayContainer.add_actor(overlay);
  Main.layoutManager.trackChrome(overlay, {affectsInputRegion: true});

  overlayExists = true;
}

function destroyOverlay() {
  if(!overlayExists) return;
  Log.debug("overlay destroyed");
  if(overlayContainer) Main.layoutManager.removeChrome(overlayContainer);
  if(overlay) Main.layoutManager.untrackChrome(overlay);
  if(overlay && sig_scroll) overlay.disconnect(sig_scroll);
  sig_scroll = null;
  if(overlay) overlay.destroy();
  if(overlayContainer) overlayContainer.destroy();
  overlayExists = false;
}

function onHotkeyPressed() {
  Log.debug("Hot key pressed");
  //Clear the lock bit so the status of Caps_Lock won't affect the functionality
  let multiKeysCode = Keymap.get_modifier_state() & (~2);
  Log.debug(multiKeysCode);
  switch(multiKeysCode) {
    case modifier_key:
      Log.debug("Modifier key pressed, listening to scroll");
      createOverlay();
      break;
    default:
      destroyOverlay();
      return;
  }
  return;
}

function enable() {
  sig_keymap = Keymap.connect('state_changed', onHotkeyPressed);

  sig_verbose_level = setting.connect('changed::verbose-level', ()=>{Log.setLevel(setting.get_int('verbose-level'))});
  sig_modifier_key = setting.connect('changed::modifier-key', ()=> {modifier_key = setting.get_int('modifier-key');});
}

function disable() {
  Keymap.disconnect(sig_keymap);
  sig_keymap = null;
  setting.disconnect(sig_verbose_level);
  sig_verbose_level = null;
  setting.disconnect(sig_modifier_key);
  sig_modifier_key = null;
}
