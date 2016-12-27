var main = function() {
    $.getJSON("/text/tex", function(data) {
        $('#tex').val(data[0].tex)
    });

    $('#tex').css("font-family","monospace")

    $(document).on("click", "#sendtex", function(e){
        var d = {"tex": $('#tex').val()}

        $('#sendtex').text("Sending...")
        console.log(d)
        $.ajax({
          type: 'PUT',
          data: d,
          url: '/tex/mod',
          //dataType: 'JSON'
        }).done(function( response ){
          //Check if succesful (then reponse will be empty string)
          if (response.msg === ''){
              $('#sendtex').text('');
                      $('#sendtex').append('<span class="glyphicon glyphicon-send"></span>')
              var now = new Date();
              $('.update').remove()
              $('#tex-container-well').append('<p class="update"> Laatste update om ' + now.toLocaleTimeString() + '</p>')
            //$('#tex-container-well').append('<div class="alert alert-success">Laatste update om ' + now.getHours() + ':'+ now.getMinutes() + ':'+ now.getSeconds() + '</div>')
          }else{
            alert('Error: ' + response.msg); //If there is an error then alert with error message
          }
        });
    })

};

$(document).ready(main);
