var main = function() {
    rebuildhabits();

    $(document).on("click", ".btn-done", function(e) {
        var rel = $(this).attr('rel');
        $.ajax({
            type: 'PUT',
            data: {
                '_id': $(this).attr('rel')
            },
            url: '/habits/today'
        }).done(function(response) {
            if(!$('.btn-done[rel="'+rel+'"]').hasClass('btn-success')){ //only increment streak if actually not already incremented today
                $('.btn-done[rel="'+rel+'"]').removeClass('btn-default').addClass('btn-success');
                $('.streak[rel="'+rel+'"]').removeClass('streak-not-today');
                var streaknew = parseInt($('[rel="'+rel+'"]').text()) + 1;
                $('.streak[rel="'+rel+'"]').text(streaknew);
            };
        });
    });

    $(document).on("click", ".btn-edit", function(e) {
        $('#habit-details').modal('toggle')
        $('.btn-undo-today').attr('rel',$(this).attr('rel'));
        console.log($(this).attr('rel'))
    });

    $(document).on("click", ".btn-undo-today", function(e) {
        var today = new Date();
        var rel = $(this).attr('rel');
        $.ajax({
            type: 'PUT',
            data: {
                '_id' : rel,
                'date': today
            },
            url: '/habits/removedate'
        }).done(function(response) {
        });
    });

    $('.modal').on('show.bs.modal', function (event) {

    });
};

$(document).ready(main);

function rebuildhabits(){
    $("#main").children().remove();

    var unit = '<div class="thumbnail"><div class="caption"><h1>'

    var stdcol = '<div class="col-sm-3 col-md-3 col-lg-2 ' //space
    var columnarray = [
        stdcol + 'col-sm-offset-3 col-md-offset-3 col-lg-offset-2">',
        stdcol + '">',
        stdcol + '">',
        stdcol + 'col-sm-offset-3 col-md-offset-3 col-lg-offset-0">',
        stdcol + '">',
        stdcol + 'col-sm-offset-0 col-md-offset-0 col-lg-offset-10">' //float last one to right
    ];

    $.getJSON("/habits/h", function(data) {
        $.each(data, function(index) {
            if(this.doneToday){
                var streak = '<div rel='+this._id+' class="streak">' + this.streak + '</div>'
                var button = '<div class="btn-group">' +
                    '<a rel=' + this._id + ' class="btn btn-success btn-done"><span class="glyphicon glyphicon-ok"></span></a>' +
                    '<a rel=' + this._id + ' class="btn btn-default btn-edit"><span class="glyphicon glyphicon-pencil"></span></a>' +
                    '</div>'
            }else{
                var streak = '<div rel='+this._id+' class="streak streak-not-today">' + this.streak + '</div>'
                var button = '<div class="btn-group">' +
                    '<a rel=' + this._id + ' class="btn btn-default btn-done"><span class="glyphicon glyphicon-ok"></span></a>' +
                    '<a rel=' + this._id + ' class="btn btn-default btn-edit"><span class="glyphicon glyphicon-pencil"></span></a>' +
                    '</div>'
            }
            $("#main").append(columnarray[index] + unit + this.name +
                '</h1>' + button + streak +
                '</div></div></div>')
        });
    });
};


/*
d1 = new Date('2017-1-10 00:00:00')
d2 = new Date('2017-1-11 00:00:00')
d3 = new Date('2017-1-12 00:00:00')
d4 = new Date('2017-1-13 00:00:00')
d5 = new Date('2017-1-14 00:00:00')

d = [d1, d2, d3, d4]

g = [d1, d2, d3, d4, d5]

h = [d1, d2, d3]

f = [d1, d2, d3, d5]

w = [d1, d2, d4, d5]
*/








/*----------------------------
/*
function getDate(){
    $.getJSON("/habits/h", function(data) {
        $.each(data, function(index) {
            console.log(new Date(this.days))
        });
    });
}
*/


    /*
            day = new Date('2016-12-26')
            console.log(day.toDateString())
            $.ajax({
              type: 'PUT',
              data: {'_id':$(this).attr('rel'),'date':day.toDateString()},
              url: '/habits/date',
              //dataType: 'JSON'
            }).done(function( response ){
            });
            */


    /*
            $.ajax({
              type: 'GET',
              data: {'_id':$(this).attr('rel')},
              url: '/habits/h',
              //dataType: 'JSON'
            }).done(function( response ){
                console.log(response)
            });
            */
