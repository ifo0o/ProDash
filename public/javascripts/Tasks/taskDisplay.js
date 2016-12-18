function displayLists(type) {
    if(type === "lists") {
        var listnames = ["Snelle taken", "Privé", "School", "Werk", "Lange termijn", "Nog in te leveren"];
    } else if(type === "subs") {
        var listnames = ["STO", "STA", "PRO"];
    };

    var stdcol = '<div class="col-sm-3 col-md-3 col-lg-2 ' //space
    var columnarray = [
        stdcol + 'col-sm-offset-3 col-md-offset-3 col-lg-offset-2">',
        stdcol + '">',
        stdcol + '">',
        stdcol + 'col-sm-offset-3 col-md-offset-3 col-lg-offset-0">',
        stdcol + '">',
        stdcol + 'col-sm-offset-0 col-md-offset-0 col-lg-offset-10">' //float last one to right
    ];

    $.each(listnames, function(index, value) {
        if(type === "lists") {
            var listid = getListid(value);
        } else if(type === "subs") {
            var listid = value;
        };
        if(index === 3){
            $("#tasks").append('<div class="clearfix visible-md-block"></div>')
        }
        $("#tasks").append(columnarray[index] + returnListDiv(type, listid) + '</div>')

    });
}

function returnListDiv(type, id) {
    if(type === "lists") {
        var listname = getListName(id)
    } else if(type === "subs") {
        var listname = id;
    };

    var cont = "";
    cont += '<div class="panel panel-info" rel="' + id + '">';
    cont += '<div class="panel-heading">' + listname + '</div>';
    cont += '<div class="list-group">';

    if(type === "lists") {
        $.each(cache, function() {
            if(this.list_id === id) { //if belongs to this list
                cont += returnTaskDiv(this,
                    this.due_date === toDateString(new Date()),
                    this.starred === true);
            };
        });
    } else if(type === "subs") {
        $.each(cache, function() {
            if(this.title.substring(0, 3) === id) {
                cont += returnTaskDiv(this,
                    this.due_date === toDateString(new Date()),
                    this.starred === true);
            };
        });
    };
    cont += '</div></div>';
    return cont;
};

function returnTaskDiv(task, markToday, markCrossed) {
    var badge = '';
    if(markToday) {
        badge += '<span class="badge badge-primary"><span class="glyphicon glyphicon-arrow-down"></span></span>'
    }
    if(markCrossed) {
        badge += '<span class="badge badge-success"><span class="glyphicon glyphicon-check"></span></span>'
    }
    var task = '<li class="list-group-item taskitem clearfix" data-toggle="modal" data-target="#task-details" data-id="'+task.id+'" rel=' + task.id + '>' + task.title + badge + '</li>';
    return task;
};









//------------------------------------------------------------------Nog nodig?


/*Remove task from cache by id*/
/*
function removeTask(id){
    //var index = cache.indexOf(id);
    //console.log(index)
    //cache.splice(index,1);
    //console.log(id)
    console.log(JSON.stringify(getTaskObject(id),null,4));
    cache = jQuery.grep(cache, function(value) {
        return value != getTaskObject(id);
    });
    console.log(cache.length)
};
*/

/*
function returnGenericListDiv(tasks,title){
    var cont = "";

    cont += "<div class=\"list panel panel-default\">";
    cont += "<div class=\"panel-heading\">"+title+"</div>";
    cont += "<div class=\"panel-body\">";
    $.each(tasks, function(){
        cont += returnTaskDiv(this,false)
    });
    cont += "</div></div>"

    return cont;
};
*/

/*
function returnTaskWithTag(tag){
    $.each(cache, function(){
        if(this.title.substring(0,3)===tag){
            if(this.list_id===getListid("Lange termijn")){ //200884255
                $("."+tag).append(returnTaskDiv(this))
            }else{
                $("."+tag).prepend(returnTaskDiv(this))
            }
        };
    });
}
*/

/*
function displayTaskWithTag(tag){
    $.each(cache, function(){
        if(this.title.substring(0,3)===tag){
            if(this.list_id===getListid("Lange termijn")){ //200884255
                $("."+tag).append(returnTaskDiv(this))
            }else{
                $("."+tag).prepend(returnTaskDiv(this))
            }

        };
    });
}
*/
