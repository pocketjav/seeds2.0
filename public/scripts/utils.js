function deleteCookie(cookie) {
    document.cookie = cookie+"=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
}

function getCurrentYear(){
    var d = new Date();
    var currentYear = d.getFullYear();
    return currentYear;
}

function getCurrentDateJson() {
    var d = new Date();
    var n = d.toJSON();

    return n;
}