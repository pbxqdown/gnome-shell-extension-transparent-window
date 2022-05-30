//Gnome version check
function isVersionGreaterOrEqual(major, minor) {
    let lis = imports.misc.config.PACKAGE_VERSION.split('.');
    if (parseInt(lis[0]) > major) return true;
    if (parseInt(lis[0]) < major) return false;
    if (parseInt(lis[1]) > minor) return true;
    if (parseInt(lis[1]) < minor) return false;
    return true;
}
