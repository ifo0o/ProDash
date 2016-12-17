var selTask = -1; //currently selected task on screen
var current = []; //Array with all tasks currently on screen

var main = function() {

    //Build cache
    $.when(initLists).done(function() {
        initTasks();
        for(i = 0; i < listCache.length; i++) {
            if(listCache[i].title !== "inbox") {
                $('#list-choice').append('<option value="' + listCache[i].title + '">' + listCache[i].title + '</option>')
            }
            //$('#list-choice').append('<button class="btn btn-primary type=button">'+listCache[i].title+'</button>')
        }
    });

    //Switch list displays
    $(document).on("click", "#persubject-button", function(e) {
        clearTasks();
        $("#persubject-button").removeClass('btn-default').addClass('btn-primary')
        $("#permainlist-button").removeClass('btn-primary').addClass('btn-default')
        displayLists('subs');
    });
    $(document).on("click", "#permainlist-button", function(e) {
        clearTasks();
        $("#persubject-button").removeClass('btn-primary').addClass('btn-default')
        $("#permainlist-button").removeClass('btn-default').addClass('btn-primary')
        displayLists('lists');
    });

    //Newtask button and form
    $(document).on("click", "#newtask-button", function(e) {
        addTask({
            "list_id": getListid("Snelle taken"),
            "title": $("#newtask-input").val()
        });
        $("#newtask-input").val("");
    });
    $(document).on("submit", "#newtask", function(e) {
        e.preventDefault();
        addTask({
            "list_id": getListid("Snelle taken"),
            "title": $("#newtask-input").val()
        });
        $("#newtask-input").val("");
    });

    //Selecting tasks
    $(document).on("click", ".taskitem", function(e) {
        selectTask($(this).attr('rel'))
    });

    //Keyboard functions
    $(document).on("keydown", function(e) {
        if(e.which == 13 && e.shiftKey) {
            if($('.selected').attr('rel') !== undefined) {
                modTask($('.selected').attr('rel'), {
                    'completed': true
                });
            }
        } else if(e.shiftKey && e.which == 39) { //shift+right
            moveToNextList()
        } else if(e.shiftKey && e.which == 37) { //shift+left
            moveToPrevList()
        } else if(e.altKey && e.which == 78) { //ctlr+n
            if(!$("#newtask-input").is(":focus")) {
                e.preventDefault();
                $("#newtask-input").focus();
            };
        } else if(e.which == 37) { //left
            selectPrevList()
        } else if(e.which == 38) { //up
            selectPrevTask()
        } else if(e.which == 39) { //right
            selectNextList()
        } else if(e.which == 40) { //down
            selectNextTask()
        } else if(e.which == 27) { //esc
            deselectTask()
            $("#newtask-input").blur();
        } else if(e.which == 68 && e.shiftKey) { //shift+d
            if(!current[selTask].hasOwnProperty('due_date')) {
                doToday();
            } else {
                removeDate();
            };
        } else if(e.which == 70 && e.shiftKey) { //shift+f
            if(!current[selTask].starred) {
                crossTask(true);
            } else {
                crossTask(false);
            };
        };
    });

    //Open task modals
    /*
    $(document).on("click", ".taskitem", function(e) {
        $('#task-details').modal('toggle')
        var id = $(this).attr('rel')
        var task = getTaskObject(id)

        $('#task-title').val(task.title)
        $('#list-choice').val(getListName(task.list_id))

        if(task.due_date === toDateString(new Date())) {
            $("#task-today").removeClass('btn-default').addClass('btn-primary')
        } else {
            $("#task-today").addClass('btn-default').removeClass('btn-primary')
        }

        if(task.starred === true) {
            $("#task-check").removeClass('btn-default').addClass('btn-primary')
        } else {
            $("#task-check").addClass('btn-default').removeClass('btn-primary')
        }

        $('#task-details').on("click", "#done-button", function(e) {
            modTask(id,{
                'title' : $('#task-title').val(),
                'list_id' : getListid($('#list-choice').val())
            })
            $('#task-details').modal('toggle')
        })

        $('#task-details').on("click", ".modal-closer", function(e) {
            $('#task-details').modal('toggle')
        });
    });
*/
    $('.modal').on('show.bs.modal', function (event) {
        var button_task = $(event.relatedTarget)
        var id = button_task.data('id')

        var task = getTaskObject(id)

        $('#task-id').text(task.id).hide()
        $('#task-title').val(task.title)
        $('#list-choice').val(getListName(task.list_id))

        if(task.due_date === toDateString(new Date())) {
            $("#task-today").removeClass('btn-default').addClass('btn-primary')
        } else {
            $("#task-today").addClass('btn-default').removeClass('btn-primary')
        }

        if(task.starred === true) {
            $("#task-check").removeClass('btn-default').addClass('btn-primary')
        } else {
            $("#task-check").addClass('btn-default').removeClass('btn-primary')
        }

        console.log(id)

    });

    $(document).on('click', "#task-check", function(e){
        $("#task-check").toggleClass("btn-primary")
        $("#task-check").toggleClass("btn-default")
    })
    $(document).on('click', "#task-today", function(e){
        $("#task-today").toggleClass("btn-primary")
        $("#task-today").toggleClass("btn-default")
    })

    $('#task-details').on("click", "#done-button", function(e) {

        if($('#task-today').hasClass('btn-primary')){
            date = new Date()
        }else{
            date = ''
        }

        modTask($('#task-id').text(),{
            'title' : $('#task-title').val(),
            'list_id' : getListid($('#list-choice').val()),
            'starred' : $('#task-check').hasClass('btn-primary'),
            'due_date' : date,
            'completed' : true
        })
        $('#task-details').modal('toggle')
    })
    $('#task-details').on("click", "#send-button", function(e) {
        if($('#task-today').hasClass('btn-primary')){
            date = new Date()
        }else{
            date = ''
        }
        console.log(date)
        modTask($('#task-id').text(),{
            'title' : $('#task-title').val(),
            'list_id' : getListid($('#list-choice').val()),
            'starred' : $('#task-check').hasClass('btn-primary'),
            'due_date' : date,
        })
        $('#task-details').modal('toggle')
    })

};

$(document).ready(main);

// --------------------today stuff-------------------------------------------




//$(document).on("click", "#today-button", clearTasks)
//$(document).on("click", "#today-button", displayToday)

//$(document).on("click", ".task-today-button", doToday)




/*
function displayToday() {
    var today = new Date(); //today
    var todayString = toDateString(today);
    var todayTasks = [];

    $.each(cache, function() {
        if(this.due_date === todayString) {
            todayTasks.push(this);
        };
    });

    $(".row .col-lg-2:nth-child(2)").append(returnGenericListDiv(todayTasks, "Vandaag"));
};
*/



/*
function addTaskToToday(taskid) {
    var today = new Date();
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://a.wunderlist.com/api/v1/tasks/" + taskid,
        "method": "GET",
        "headers": headers
    };
    var datt = {}

    $.ajax(settings).success(function(response) {
        datt = {
            "due_date": toDateString(today),
            "revision": response.revision //get revision number from response of first ajax call
        };
        var settings2 = {
            "async": true,
            "crossDomain": true,
            "url": "https://a.wunderlist.com/api/v1/tasks/" + taskid,
            "method": "PATCH",
            "headers": headers,
            contentType: 'application/json',
            "data": JSON.stringify(datt)
        };
        $.ajax(settings2).done(function(response) {
            /*Remove this task
            //removeTask(taskid);

            //Get updated task
            var settings3 = {
                "async": true,
                "crossDomain": true,
                "url": "https://a.wunderlist.com/api/v1/tasks/" + taskid,
                "method": "GET",
                "headers": headers,
            };
            $.ajax(settings3).done(function(response) {
                cache.push(response);
            });
        });
    });
};
*/

/*
function displayDefault(){
    //var mainLists = ["Snelle taken","Privé", "School", "Werk", "Lange termijn", "Nog in te leveren"];

    $.each(mainLists,function(index,value){
        var listid = getListid(value);
        $("#tasks").append(columnarray[index]+returnListDiv(listid)+'</div>')
    });
};

function displayPerSubject(){
    //var tags = ["STO","STA","PRO"]

    $.each(tags,function(index,value){
        $("#tasks").append(columnarray[index]+returnTagListDiv(value)+'</div>')
    });
};*/

/*
function returnTagListDiv(tag){
    var cont = "";

    cont += '<div class="panel panel-info">'
    cont += '<div class="panel-heading">'+tag+'</div>'
    cont += '<div class="list-group">'

    cont += "</div></div>"

    return cont;
};*/









//---------------------mimic done stuff----------------------------------

/*function mimicDone(){
    if($(this).hasClass("mimic-done")){
        $(this).removeClass("mimic-done");
    }else{
        $(this).addClass("mimic-done");
    };
};*/



//--------------------------------------------------------------------------------

//function displayLists(task){
/*
divHead = "TEST";
wrapid = "#schoolWrap"

div =
"<div class=\"panel panel-default\"><div class=\"panel-heading\">"
+divHead+"</div><ul class=\"list-group\">"

    var task = "";
    task += "<li rel=\""+this.id+"\" class=\"list-group-item\">"+this.title+"</li>";
    div += task;

div += "</ul></div>";
$(wrapid).append(div)
*/
//    $(".test").append(task.title)
//    $(".test").append("<br>")
//};

/*Returns all list objects in an array*/
/*
function getLists(){
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://a.wunderlist.com/api/v1/lists",
        "method": "GET",
        "headers": {
            "x-access-token": "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a",
            "x-client-id": "6b6bfca8e9a100b98a48",
        }
    };

    var schoolID, snelleTakenID

    $.ajax(settings).done(function (response) {
        //alert(JSON.stringify(response,null,4));
        $.each(response, function(){
            switch (this.title) {
                case "School":
                    displayMainTasks(this.id,"school")
                    break;
                case "Snelle taken":
                    displayMainTasks(this.id,"snelleTaken")
                default:
            }
        });
    });
};
*/

/*
function displayMainTasks(id,name) {
    var div = ""
    var wrapid, divHead = "";

    if(name==="school"){
        divHead = "School";
        wrapid = "#schoolWrap"
    }else if(name==="snelleTaken"){
        divHead = "Snelle Taken";
        wrapid = "#quickTaskWrap"
    }

    div =
    "<div class=\"panel panel-default\"><div class=\"panel-heading\">"
    +divHead+"</div><ul class=\"list-group\">"

    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://a.wunderlist.com/api/v1/tasks?list_id="+id,
        "method": "GET",
        "headers": {
            "x-access-token": "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a",
            "x-client-id": "6b6bfca8e9a100b98a48",
        }
    };

    $.ajax(settings).done(function (response) {
        $.each(response, function(){
            var task = "";
            task += "<li rel=\""+this.id+"\" class=\"list-group-item\">"+this.title+"</li>";
            div += task;
        });
        div += "</ul></div>";
        $(wrapid).append(div)
    });
};

function getTasks(listid){
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://a.wunderlist.com/api/v1/tasks?list_id="+listid,
      "method": "GET",
      "headers": {
        "x-access-token": "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a",
        "x-client-id": "6b6bfca8e9a100b98a48",
        }
    };

      $.ajax(settings).done(function (response) {
        $.each(response, function(){
            div = "";
            div = "<div rel=\""+this.id+"\" class=\"task\">"+this.title+"</div>"
            $(".list").append(div);
        });
      });
}

function changeTask(taskid,newTitle,completed,listid){
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://a.wunderlist.com/api/v1/tasks/" + taskid,
      "method": "GET",
      "headers": {
        "x-access-token": "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a",
        "x-client-id": "6b6bfca8e9a100b98a48",
        }
    };
    var datt = {}


    $.ajax(settings).success(function (response) {
        datt = {
            "revision" : response.revision,
            "title" : newTitle,
            "completed" : completed,
            "list_id": listid
        }
        var settings2 = {
            "async": true,
            "crossDomain": true,
            "url": "https://a.wunderlist.com/api/v1/tasks/" + taskid,
            "method": "PATCH",
            "headers": {
                "x-access-token": "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a",
                "x-client-id": "6b6bfca8e9a100b98a48",
            },
            contentType: 'application/json',
            "data": JSON.stringify(datt)
        };
        $.ajax(settings2).done(function (response) {

        });
    });
}

function getInbox(response){
    inbox = $.grep(response,function(e){
        return e.title==="inbox";
    });

    $(".list").append(inbox[0].id)
}

function displayTaskWithTagg(tag){

    var result = $.grep(listsid, function(e){ return e.title == "Lange termijn"; });
    //alert(JSON.stringify(result[0],null,4))
    //alert(result[0].id)

    $.each(cache, function(){
        if(this.title.substring(0,3)===tag){
            if(this.list_id===result[0].id){
                $(".test").append("Taak voor de lange termijn:")
            }
            $(".test").append(this.title)
            $(".test").append("<br>")
        };
    });
}
*/

/*Returns all list objects in an array*/
/*function getLists(){
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://a.wunderlist.com/api/v1/lists",
      "method": "GET",
      "headers": {
        "x-access-token": "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a",
        "x-client-id": "6b6bfca8e9a100b98a48",
        }
    };

      $.ajax(settings).done(function (response) {
        //alert(JSON.stringify(response,null,4));
        $.each(response, function(){
            $(".list").append(this.id);
            getTasks(this.id);
        });
      });
}*/


/*
    header('Content-Type': 'application/json';'charset=UTF-8');
    header('Access-Control-Allow-Origin': '*');
    header('Access-Control-Allow-Methods': "DELETE", "HEAD", "GET", "OPTIONS", "POST", "PUT");
    header('Access-Control-Allow-Headers': 'Content-Type', 'Content-Range', 'Content-Disposition', 'Content-Description');
    header('Access-Control-Max-Age': '1728000'); */
/*
    $.ajax({
              dataType: "json",
      url: "a.wunderlist.com/api/v1/lists"+"&callback=?",
      headers: { 'X-Access-Token': '7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a',
      'X-Client-ID': '6b6bfca8e9a100b98a48'},
success: success});

};*/
/*
var settings = {
  "async": true,
  "crossDomain": true,
  "url": "https://a.wunderlist.com/api/v1/lists?callback=jQuery111305825689279008657_1451943156370&_=1451943156371",
  "method": "GET",
  "headers": {
    "x-access-token": "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a",
    "x-client-id": "6b6bfca8e9a100b98a48",
  }
}
*/
//getLists();
//changeTask(1564347656,"hulahop",false,129108805)
/*$("body").on("click",'.task',function(){
    changeTask($(this).attr('rel'),"tester",false,129108805);
    alert($(this).attr('rel'))
});*/
