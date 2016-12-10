function selectTask(id) {
    $(".taskitem").removeClass('selected');
    $('li[rel="' + id + '"]').addClass('selected');
};

function deselectTask() {
    $(".taskitem").removeClass('selected');
    selTask = -1;
};

function selectFirstTask() {
    selTask = 0;
    selectTask(cache[selTask].id);
};

function selectNextTask() {
    if(selTask == -1) { //if none selected
        selTask = 0;
        selectTask(cache[selTask].id);
    } else {
        if(selTask == cache.length - 1) {
            selTask = 0;
        } else {
            selTask++;
        };
        selectTask(cache[selTask].id);
    };
};

function selectPrevTask() {
    if(selTask == -1) { //if none selected
        selTask = 0;
        selectTask(cache[selTask].id);
    } else {
        if(selTask == 0) {
            selTask = cache.length - 1; //start over
        } else {
            selTask--;
        };
        selectTask(cache[selTask].id);
    };
};

function selectNextList() {
    if(selTask == -1) { //if none selected
        selTask = 0;
        selectTask(cache[selTask].id);
    } else {
        var currentList = cache[selTask].list_number
        selTask = cache.findIndex(function(e) {
            return e.list_number > currentList; //> since very next list could be empty
        })
        if(selTask === -1) { //returned -1 if couldnt find next task, then start at beginning
            selTask = 0;
        };
        selectTask(cache[selTask].id);
    };
};

function selectPrevList() {
    if(selTask == -1) { //if none selected
        selTask = 0;
        selectTask(cache[selTask].id);
    } else {
        var currentList = cache[selTask].list_number;

        var cache_filtered = cache.filter(function(x) {
            return x.list_number < currentList
        });

        if(cache_filtered.length == 0){ //if nothing was found before, then start at the end
            currentList = listCache.length;
            cache_filtered = cache.filter(function(x) {
                return x.list_number < currentList
            });
        }
        var selList = Math.max.apply(Math, cache_filtered.map(function(o) {
            return o.list_number;
        }));
        selTask = cache.findIndex(function(e) {
            return e.list_number == selList;
        });

        selectTask(cache[selTask].id);
    };
};

function moveToNextList() {
    if(selTask == -1) { //if none selected
        //do nothing
    } else {
        var currentList = cache[selTask].list_number;
        var newlist = currentList + 1 % listCache.length;

        modTask(cache[selTask].id, {
            "list_id": getListidByNumber(newlist)
        });
        selectTask(cache[selTask].id);
    };
};

function moveToPrevList() {
    if(selTask == -1) { //if none selected
        //do nothing
    } else {
        var currentList = cache[selTask].list_number;
        var newlist = currentList - 1 % listCache.length;

        modTask(cache[selTask].id, {
            "list_id": getListidByNumber(newlist)
        });

    };
};
