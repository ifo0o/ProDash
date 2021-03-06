cache = [];

var main = function() {
    rebuildhabits();



    $(document).on("click", ".btn-done", function(e) {
        sendDoneToday(this);
    });

    $(document).on("click", ".btn-edit", function(e) {
        var rel = $(this).attr('rel')
        $('#habit-details').modal('toggle');
        console.log(rel)
        $.each(cache, function(index,value){
            if(value._id === rel){
                var lastdays = value.days.slice(1,10);
                console.log(lastdays)
                //$('#date-remove-choice').append('<option value="' + listCache[i].title + '">' + listCache[i].title + '</option>')
            };
        });
        $('#btn-undo-today').attr('rel',$(this).attr('rel'));
        $('#btn-add-date').attr('rel',$(this).attr('rel'));
    });

    $(document).on("click", "#btn-undo-today", function(e) {
        removeDoneToday(this)
    });
    $(document).on("click", "#btn-add-date", function(e) {
        sendDoneDate(this)
    });

};

$(document).ready(main);

function sendDoneDate(e){
    var rel = $(e).attr('rel');
    console.log("call")
    console.log($('#add-date-form').val());
    $.ajax({
        type: 'PUT',
        data: {
            '_id': rel,
            'date':$('#add-date-form').val()
        },
        url: '/habits/date'
    }).done(function(response) {

    });
}

function sendDoneToday(e){
    var rel = $(e).attr('rel');
    $.ajax({
        type: 'PUT',
        data: {
            '_id': rel
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
};

function removeDoneToday(e){
    var today = new Date();
    var rel = $(e).attr('rel');
    $.ajax({
        type: 'PUT',
        data: {
            '_id' : rel,
            'date': today
        },
        url: '/habits/removedate'
    }).done(function(response) {
        if($('.btn-done[rel="'+rel+'"]').hasClass('btn-success')){ //only decrement streak if actually not already decremented today
            $('.btn-done[rel="'+rel+'"]').addClass('btn-default').removeClass('btn-success');
            $('.streak[rel="'+rel+'"]').addClass('streak-not-today');
            var streaknew = parseInt($('[rel="'+rel+'"]').text()) - 1;
            $('.streak[rel="'+rel+'"]').text(streaknew);
        };
    });
};

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
            cache = data;

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
            console.log(this)
            var progressLength = (this.streak/20)*100
            var progressbar = '<div class="progress"><div class="progress-bar progress-bar-success" style="width:'+progressLength+'%"</div></div>'
            $("#main").append(columnarray[index] + unit + this.name +
                '</h1>' + button + streak +
                progressbar+'</div></div></div>')
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
