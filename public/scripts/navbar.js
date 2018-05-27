$(document).ready(function () {
    $('#logout-button').on('click touchstart', function (e) {
        e.preventDefault();
        deleteCookie('isLogged');
        deleteCookie('izloggedzat');
        location.reload();
    });
});