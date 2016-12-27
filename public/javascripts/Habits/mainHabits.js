var main = function() {
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
        $.each(data, function(index){
            /*
            dayslist = '<ul>';
            $.each(this.days,function(){
                dayslist += '<li>'+new Date(this).toDateString()+'</li>'
            })
            dayslist += '<ul>'
            */
            var button = '<div class="btn-group">'+
            '<a rel=' + this._id + ' class="btn btn-success btn-done"><span class="glyphicon glyphicon-ok"></span></a>'+
            '<a rel=' + this._id + ' class="btn btn-default btn-edit"><span class="glyphicon glyphicon-pencil"></span></a>'+
            '</div>'

            var streak = '<div class="streak">'+this.streak+'</div>'

            $("#main").append(columnarray[index] + unit + this.name +
                '</h1>'+button+streak+
                '</div></div></div>')
        });
    });

    $(document).on("click", ".btn-done", function(e) {
        $.ajax({
          type: 'PUT',
          data: {'_id':$(this).attr('rel')},
          url: '/habits/today'
        }).done(function( response ){
        });
    });

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



};

$(document).ready(main);

/*
d1 = new Date('2014-12-10 00:00:00')
d2 = new Date('2014-12-11 00:00:00')
d5 = new Date('2014-12-12 00:00:00')
d3 = new Date('2014-12-9 00:00:00')
d4 = new Date('2014-12-3 00:00:00')

d = [d1,d2,d3,d4,d5]
*/
