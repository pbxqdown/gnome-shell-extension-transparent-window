//Gnome version check
function isVersionGreaterOrEqual(major, minor) {
    let lis = imports.misc.config.PACKAGE_VERSION.split('.');
    if (parseInt(lis[0]) > major) return true;
    if (parseInt(lis[0]) < major) return false;
    if (parseInt(lis[1]) > minor) return true;
    if (parseInt(lis[1]) < minor) return false;
    return true;
}

function getMultiKeysCode(keymap) {
    return keymap.get_modifier_state() & (~(2 | 16));
}
