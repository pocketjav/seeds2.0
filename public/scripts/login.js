$(document).ready(function () {

    $('.login-tab').on('click touchstart', function (e) {
        e.preventDefault();
        // console.log(e);
        var $this=$(this);
        var $target = $this.data('target');
        //console.log($target);

        $('.login-tab.active').removeClass('active');
        $this.addClass('active');
        $('.container').addClass('hidden');

        $($target).removeClass('hidden');
    });


    //clear cookies
    deleteCookie('isLogged');
    deleteCookie('izloggedzat');

    let form = {};

    $('#login-submit-button').on('click', function (e) {

        e.preventDefault();

        /**
         * TODO POST date
         * POST the current date to /loginrequest
         *
         * getCurrentDateJson()
         *
         */


        form = {
            "email" : $('#login-email-input').val(),
            "pass" : $('#login-password-input').val()
        };

        login(form);
    });

    $('#signup-submit-button').on('click', function (e) {
        e.preventDefault();
        form = {
            email : $('#signup-email').val(),
            password : $('#signup-password').val(),
            date : getCurrentDateJson()
        };
        // console.log(form);

        $.ajax({
            type: "POST",
            data: JSON.stringify(form),
            contentType: 'application/json',
            url: '/signup',
            success: function(data){
                var loginForm = {
                    "email" : form.email,
                    "pass" : form.password
                };

                if(data.success === 'true'){
                    alert(data.message);
                    login(loginForm);
                }
            },
            error:function() {
                console.log('error');
            }
        });

    });
});


function login(form) {
    $.ajax({
        type: "POST",
        data: JSON.stringify(form),
        contentType: 'application/json',
        url: '/loginrequest',
        success: function(data){

            console.log(data);

            if(data.success==='true'){
                alert('login');

                document.cookie = "isLogged=true";
                document.cookie = "izloggedzat="+data.sat+"";
                location.reload();

            } else {
                console.log('login failed');
            }
        },
        error:function() {
            console.log('error');
        }
    });
}

