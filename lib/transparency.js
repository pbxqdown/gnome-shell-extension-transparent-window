// Pure transparency logic — NO gi:// imports, so it runs under both GNOME Shell
// (gjs) and plain Node for unit testing. Keep this file free of Clutter/St/GLib.

export const OPACITY_MAX = 255;

// Clamp an opacity value into [minOpacity, OPACITY_MAX], rounded to an integer.
export function clampOpacity(value, minOpacity) {
    return Math.max(minOpacity, Math.min(OPACITY_MAX, Math.round(value)));
}

// Compute the new opacity from a scroll gesture.
//   current:    current actor opacity (0-255)
//   direction:  'up' | 'down' | 'smooth'
//   step:       opacity units per tick (0-255 scale)
//   minOpacity: lower clamp bound
//   smoothDy:   vertical delta for 'smooth' (positive = scroll down = more transparent)
// Returns the clamped integer opacity, or null if the direction is not handled
// (the caller should then propagate the event unchanged).
export function scrollOpacity(current, direction, step, minOpacity, smoothDy = 0) {
    let opacity = current;
    switch (direction) {
        case 'up':
            opacity += step; // scroll up -> more opaque
            break;
        case 'down':
            opacity -= step; // scroll down -> more transparent
            break;
        case 'smooth':
            opacity -= step * smoothDy;
            break;
        default:
            return null;
    }
    return clampOpacity(opacity, minOpacity);
}

// Pick the top-most visible rect that contains the point (px, py).
//   rects: array in bottom-to-top stacking order (as global.get_window_actors()
//          returns); each item is {x, y, width, height, visible} plus any extra
//          fields the caller wants echoed back (e.g. a reference to the actor).
// Returns the matching rect object, or null if none contains the point.
export function pickWindowAt(px, py, rects) {
    for (let i = rects.length - 1; i >= 0; i--) {
        const r = rects[i];
        if (r.visible === false) {
            continue;
        }
        if (px >= r.x && px < r.x + r.width && py >= r.y && py < r.y + r.height) {
            return r;
        }
    }
    return null;
}
