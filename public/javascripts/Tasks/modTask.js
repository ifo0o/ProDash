function addTask(taskData) {
    var settings = {
        "async": true,
        "crossDomain": true,
        "url": "https://a.wunderlist.com/api/v1/tasks",
        "method": "POST",
        "headers": headers,
        contentType: 'application/json', //important
        "data": JSON.stringify(taskData)
    };
    $.ajax(settings).done(function(response) {
        updateCache(response);
    });
};

function modTask(taskid, changes) {
    var settings1 = {
        "async": true,
        "crossDomain": true,
        "url": "https://a.wunderlist.com/api/v1/tasks/" + taskid,
        "method": "GET",
        "headers": headers
    };
    //first GET revision number of task
    $.ajax(settings1).success(function(response) {
        var data = {
            "revision": response.revision //get revision number from response of first ajax call
        };
        $.extend(data, changes) //add changes object values to the data to be sent
        var settings2 = {
            "async": true,
            "crossDomain": true,
            "url": "https://a.wunderlist.com/api/v1/tasks/" + taskid,
            "method": "PATCH",
            "headers": headers,
            contentType: 'application/json', //important
            "data": JSON.stringify(data)
        };
        //next PATCH all modifications described in var data
        $.ajax(settings2).done(function(response) {
            var settings3 = {
                "async": true,
                "crossDomain": true,
                "url": "https://a.wunderlist.com/api/v1/tasks/" + taskid,
                "method": "GET",
                "headers": headers
            };
            //finaly GET new task and update in cache
            $.ajax(settings3).done(function(response) {
                updateCache(response);
            });
        });
    });
};
