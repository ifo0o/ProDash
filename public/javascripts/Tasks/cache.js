var cache = []; //Array with all tasks
var listCache = []; //Array with all lists

//Global tokens
var token = "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a"
var client_id = "6b6bfca8e9a100b98a48"
var headers = {
    "x-access-token": token,
    "x-client-id": client_id,
}
var settings = {
    "async": true,
    "crossDomain": true,
    "url": "",
    "method": "GET",
    "headers": headers
};

/*Initializes lists and builds listcache*/
var initLists = $.ajax({
    "async": true,
    "crossDomain": true,
    "url": "https://a.wunderlist.com/api/v1/lists",
    "method": "GET",
    "headers": headers,
    success: function(response) {
        $.each(response, function() {
            listCache.push(this);
        });
    }
});

/*Initializes tasks and builds cache*/
function initTasks() {
    var count = 0;
    var total = listCache.length;
    var tempCache = [];

    $.each(listCache, function() {
        url = "https://a.wunderlist.com/api/v1/tasks?list_id=" + this.id
        $.ajax({
            "async": true,
            "crossDomain": true,
            "url": url,
            "method": "GET",
            "headers": headers,
            success: function(response) {
                $.each(response, function() {
                    tempCache.push(this)
                });
                count++;
                if(count === total) {
                    cache = tempCache;
                    $.each(cache, function() { //add list number to teach task
                        $.extend(this, {
                            'list_number': getListNumber(this.list_id)
                        });
                    });
                    cache.sort(sort_by('list_number', {name:'title'})); //sort by list number
                    displayLists("lists");
                    current = cache;
                };
            }
        });
    });
};

/*Update cache with newly changed task*/
function updateCache(changedTask) {
    //Remove old entry from cache
    cache = $.grep(cache, function(value, index) {
        return(value.id != changedTask.id);
    });
    //Add updated entry back only if it is not completed
    if(changedTask.completed === false) {
        $.extend(changedTask, {
            'list_number': getListNumber(changedTask.list_id) //add list number
        });
        cache.push(changedTask);
        cache.sort(sort_by('list_number', {name:'title'})); //sort by list number //sort list
    }

    clearTasks();
    displayLists("lists");
    current = cache;

    if(changedTask.completed === false) {
        //Select task that was changed
        selectTask(changedTask.id);
        selTask = cache.findIndex(function(e) {
            return e.id == changedTask.id
        });
    }else{
        selectTask(cache[selTask].id)
    }
};

//-----------------------------------------------------------------------------------

//function appendfromcache(){
/*$.each(cache, function(){
    $(".test").append(this.title)
    $(".test").append("<br>")
});*/
//    displayTaskWithTag("WEB")
//}

/*
var buildTaskCache = $.ajax({
        "async": true,
        "crossDomain": true,
        "url": "https://a.wunderlist.com/api/v1/tasks?list_id="+globalListid,
        "method": "GET",
        "headers": {
            "x-access-token": "7f2375c1a0fa641564cbd45f53bd5c91c4475c61b19f6f423457b89acd5a",
            "x-client-id": "6b6bfca8e9a100b98a48",
        },
        success: function (response) {
            $.each(response, function(){
                cache.push(this);
            });
        }
    });*/

/*
function initLists(){
    settings["url"] = "https://a.wunderlist.com/api/v1/lists";

    $.ajax(settings).success(function (response) {
        $.each(response, function(){
            listCache.push({id: this.id, title: this.title});

            settings["url"] = "https://a.wunderlist.com/api/v1/tasks?list_id="+this.id
            $.ajax(settings).success(function (response) {
                $.each(response, function(){
                    cache.push(this);

                });
            });
        });
    });
};*/
