selTask = -1;

var main = function() {
    $.when(initLists).done(function(){ //build cache
        initTasks();
    });

    $(document).on("click", "#persubject-button", clearTasks)
    $(document).on("click", "#persubject-button", function(e){displayLists('subs')})

    $(document).on("click", "#permainlist-button", clearTasks)
    $(document).on("click", "#permainlist-button", function(e){displayLists('lists')})

    $(document).on("click", "#newtask-button", addTask);

    $(document).on("click", ".taskitem", function(e){selectTask($(this).attr('rel'))});
    //$(document).on("click", ".taskitem", function(e){modTask(this.rel,{            'completed' : true})});
    $(document).on( "keydown", function(e){
        if(e.which == 13){
            if($('.selected').attr('rel')!==undefined){
                modTask($('.selected').attr('rel'),{'completed' : true});
            }
        }else if(e.which==37){//left
            selectPrevList()
        }else if(e.which==38){//up
            selectPrevTask()
        }else if(e.which==39){//right
            selectNextList()
        }else if(e.which==40){//down
            selectNextTask()
        }
    });

};

$(document).ready(main);

function selectTask(id){
    $(".taskitem").removeClass('selected')
    $('li[rel="'+id+'"]').addClass('selected')
}
function selectFirstTask(){
    //first_task = $.grep(cache, function(value,index){return(value.list_id==getListid('Snelle taken'))})
    //selectTask(first_task[0].id)
    selTask = 0;
    selectTask(cache[selTask].id)
}
function selectNextTask(){
    if(selTask == -1){ //if none selected
        selTask = 0;
        selectTask(cache[selTask].id)
    }else{
        if(selTask == cache.length-1){
            selTask=0;
        }else{
            selTask++;
        }
        selectTask(cache[selTask].id)
    }
}
function selectPrevTask(){
    if(selTask == -1){ //if none selected
        selTask = 0;
        selectTask(cache[selTask].id)
    }else{
        if(selTask == 0){
            selTask=cache.length-1;
        }else{
            selTask--;
        }
        selectTask(cache[selTask].id)
    }
}
function selectNextList(){
    if(selTask == -1){ //if none selected
        selTask = 0;
        selectTask(cache[selTask].id)
    }else{
        var currentList = cache[selTask].list_number
        selTask = cache.findIndex(function(e){return e.list_number>currentList}) //> since very next list could be empty
        if(selTask === -1){selTask=0} //returned -1 if couldnt find next task, then start at beginning
        selectTask(cache[selTask].id)
    }
}
function selectPrevList(){
    if(selTask == -1){ //if none selected
        selTask = 0;
        selectTask(cache[selTask].id)
    }else{
        console.log(selTask)
        var currentList = cache[selTask].list_number
        if(currentList == 0){
            currentList = 7; //hardcoded length
        }
        var i = 1
        do{
            selTask = cache.findIndex(function(e){return e.list_number==currentList-i})
            console.log(selTask)
            i++
        }
        while(selTask == -1)
        selectTask(cache[selTask].id)
    }
}


//SORTER
var sort_by;

(function() {
    // utility functions
    var default_cmp = function(a, b) {
            if (a == b) return 0;
            return a < b ? -1 : 1;
        },
        getCmpFunc = function(primer, reverse) {
            var dfc = default_cmp, // closer in scope
                cmp = default_cmp;
            if (primer) {
                cmp = function(a, b) {
                    return dfc(primer(a), primer(b));
                };
            }
            if (reverse) {
                return function(a, b) {
                    return -1 * cmp(a, b);
                };
            }
            return cmp;
        };

    // actual implementation
    sort_by = function() {
        var fields = [],
            n_fields = arguments.length,
            field, name, reverse, cmp;

        // preprocess sorting options
        for (var i = 0; i < n_fields; i++) {
            field = arguments[i];
            if (typeof field === 'string') {
                name = field;
                cmp = default_cmp;
            }
            else {
                name = field.name;
                cmp = getCmpFunc(field.primer, field.reverse);
            }
            fields.push({
                name: name,
                cmp: cmp
            });
        }

        // final comparison function
        return function(A, B) {
            var a, b, name, result;
            for (var i = 0; i < n_fields; i++) {
                result = 0;
                field = fields[i];
                name = field.name;

                result = field.cmp(A[name], B[name]);
                if (result !== 0) break;
            }
            return result;
        }
    }
}());











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

// --------------------today stuff-------------------------------------------
//$(document).on("click", "#today-button", clearTasks)
//$(document).on("click", "#today-button", displayToday)

//$(document).on("click", ".task-today-button", doToday)
function doToday(){
    var taskid = $(this).parents(".task").attr("rel"); /*get rel attribute of parent class .task*/
    addTaskToToday(taskid);
};

function displayToday(){
    var today = new Date(); //today
    var todayString = toDateString(today);
    var todayTasks = [];

    $.each(cache,function(){
        if(this.due_date === todayString){
            todayTasks.push(this);
        };
    });

    $(".row .col-lg-2:nth-child(2)").append(returnGenericListDiv(todayTasks,"Vandaag"));
};

/*Returns a date string of format YYYY-MM-DD, input date object*/
function toDateString(date){
    var date = new Date(date);
    var dateString = "";
    var month, day = 0;

    month = date.getMonth() + 1; //Januari = 0
    if(month < 10){
        month = "0" + month;
    };
    day = date.getDate();
    if(day < 10){
        day = "0" + day;
    };
    dateString += date.getFullYear();
    dateString += "-";
    dateString += month;
    dateString += "-";
    dateString += day;

    return dateString;
};

function addTaskToToday(taskid){
    var today = new Date(); /*Today*/
    var settings = {
      "async": true,
      "crossDomain": true,
      "url": "https://a.wunderlist.com/api/v1/tasks/" + taskid,
      "method": "GET",
      "headers": headers
    };
    var datt = {}

    $.ajax(settings).success(function (response) {
        datt = {
            "due_date": toDateString(today),
            "revision" : response.revision /*get revision number from response of first ajax call*/
        };
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
            /*Remove this task*/
            removeTask(taskid);

            /*Get updated task*/
            var settings3 = {
                "async": true,
                "crossDomain": true,
                "url": "https://a.wunderlist.com/api/v1/tasks/"+taskid,
                "method": "GET",
                "headers": {
                    "x-access-token": "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a",
                    "x-client-id": "6b6bfca8e9a100b98a48",
                },
            };
            $.ajax(settings3).done(function (response) {
                cache.push(response);
            });
        });
    });
};

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
