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

let text, button, settings, win_actor, overlayContainer, overlay, sig_scroll, sig_keymap;
let step = 5;
let min_opacity = 20;
let overlayExists = false; //ensure only one overlay is created


//TODO: Add a simple option dialog to customize the hotkey and other options
function init() {

}

function getMouseHoveredWindowActor() {
  let [mouse_x, mouse_y, mask] = global.get_pointer();
  //log(mouse_x + "," + mouse_y);
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
  //log("on scroll");

  win_actor = getMouseHoveredWindowActor();
  let opacity = win_actor.get_opacity();

  let dir = event.get_scroll_direction();
  //log(dir);
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
  //log("opacity: " + opacity);
  win_actor.set_opacity(Math.max(min_opacity, Math.min(opacity, 255)));
  return Clutter.EVENT_STOP;
}


function createOverlay() {
  if(overlayExists) return;
  //log("overlay created");
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
  //log("overlay destroyed");
  if(overlayContainer) Main.layoutManager.removeChrome(overlayContainer);
  if(overlay) Main.layoutManager.untrackChrome(overlay);
  if(overlay && sig_scroll) overlay.disconnect(sig_scroll);
  sig_scroll = null;
  if(overlay) overlay.destroy();
  if(overlayContainer) overlayContainer.destroy();
  overlayExists = false;
}

function onHotkeyPressed() {
  //log("Hot key pressed");
  let multiKeysCode = Keymap.get_modifier_state();
  //log(multiKeysCode);
  switch(multiKeysCode) {
    case Clutter.ModifierType.MOD1_MASK:
      //log("alt pressed, listening to scroll");
      createOverlay();
      break;
    default:
      destroyOverlay();
      return;
  }
  return;

  let workspace = global.screen.get_active_workspace();
  //current_window = get_focus_window();
  let windows = workspace.list_windows();
  for ( let i = 0; i < windows.length; ++i ) {
    if (windows[i].has_focus()) {

    }
  }
  let window_actors = global.get_window_actors();
  window_actors.forEach(function(actor) {
    let win = actor.get_meta_window();
    if(win.has_focus()) {
      actor.set_opacity(100);
    }
  });
}

function enable() {
  sig_keymap = Keymap.connect('state_changed', onHotkeyPressed);
}

function disable() {
  Keymap.disconnect(sig_keymap);
  sig_keymap = null;
}
