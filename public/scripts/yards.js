$(document).ready(function(){

    $('#add-yard').on('click',function(e){
        e.preventDefault();
        
        var f={ user:getCookieValue('izloggedzat').v,
         name:$('#new-yard-name').val(),
         crop:$('#new-crop').val(),
         type:$('#new-type').val(),
         location:$('#new-location').val(),
         description:$('#new-description').val(),
         area:$('#new-area').val(),
         unity:$('#new-unity').val()}
        
         $.ajax({
            url: "/addyard",
            method: "POST",
            data: f,
            success: function(data){
              console.log('success');
              alert('nuevo yard agregado');
              location.reload();
            }
          });
    });

    $('.history').on('click',function(e){
      e.preventDefault();
      document.cookie='yid='+$(this).data('id');
      window.location = '/historial'
    });

    $('.delete').on('click',function(e){
      var f= {yid: $(this).data('id')}
      $.ajax({
        url: "/deletey",
        method: "POST",
        data: f,
        success: function(data){
          console.log('success');
          alert('eliminado');
          location.reload();
        }
      });
    });

    $('.del').on('click',function(e){
      var f= {yid: $(this).data('del')}
      $.ajax({
        url: "/deleteya",
        method: "POST",
        data: f,
        success: function(data){
          console.log('success');
          alert('eliminado');
          location.reload();
        }
      });
    });

    $('#add-new-info').on('click',function(e){
      var f={ 
         yardid:$('#yard-id').text(),
         mes:$('#new-month').val(),
         year: parseInt($('#new-year').val()),
         produccion: parseFloat($('#new-production').val()),
         medida:$('#new-measure').val(),
         ganancia: parseFloat($('#new-income').val()),
         inversion: parseFloat($('#new-investment').val()),
         moneda:$('#new-currency').val()}

         console.log( f.year,typeof f.year)

         $.ajax({
          url: "/addyardinfo",
          method: "POST",
          data: f,
          success: function(data){
            console.log('success');
            
            location.reload();
          }
        });
    })
    
});



function getCookieValue(cookieName){
	 var cookiesArr = document.cookie.split(';');
  var currentCookie = '';
  var testCookie = ''; 
  for( var i = 0 ; i < cookiesArr.length ; i++ ){
      	currentCookie = cookiesArr[i];
     for( var j = 0 ; j < currentCookie.length ; j++ ){
    	 if(currentCookie[j] == '='){
      	testCookie = currentCookie.substring(0,j);
         if(testCookie.trim() == cookieName.trim()){
      return {n:testCookie, v:currentCookie.substring(j+1, currentCookie.length)};
        }
      }  
    }
    testCookie = '';
      }
   return false;	
}
