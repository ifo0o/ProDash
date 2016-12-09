var main = function() {
    $.getJSON("/tex", function(data) {
        $('#tex').val(data[0].tex)
    });

    $('#tex').css("font-family","monospace")

    $(document).on("click", "#sendtex", function(e){
        var d = {"tex": $('#tex').val()}
        console.log(d)
        $.ajax({
          type: 'PUT',
          data: d,
          url: '/tex/mod',
          //dataType: 'JSON'
        }).done(function( response ){
          //Check if succesful (then reponse will be empty string)
          if (response.msg === ''){

          }else{
            alert('Error: ' + response.msg); //If there is an error then alert with error message
          }
        });
    })

};

$(document).ready(main);
