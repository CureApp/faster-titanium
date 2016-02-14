// create base UI tab and root window
//
module.exports = function(title) {
    return Titanium.UI.createWindow({
        title: title,
        backgroundColor:'#fff'
    });
}
