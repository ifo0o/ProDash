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
    selectTask(current[selTask].id);
};

function selectNextTask() {
    if(selTask == -1) { //if none selected
        selTask = 0;
        selectTask(current[selTask].id);
    } else {
        if(selTask == current.length - 1) {
            selTask = 0;
        } else {
            selTask++;
        };
        selectTask(current[selTask].id);
    };
};

function selectPrevTask() {
    if(selTask == -1) { //if none selected
        selTask = 0;
        selectTask(current[selTask].id);
    } else {
        if(selTask == 0) {
            selTask = current.length - 1; //start over
        } else {
            selTask--;
        };
        selectTask(current[selTask].id);
    };
};

function selectNextList() {
    if(selTask == -1) { //if none selected
        selTask = 0;
        selectTask(current[selTask].id);
    } else {
        var currentList = current[selTask].list_number
        selTask = current.findIndex(function(e) {
            return e.list_number > currentList; //> since very next list could be empty
        })
        if(selTask === -1) { //returned -1 if couldnt find next task, then start at beginning
            selTask = 0;
        };
        selectTask(current[selTask].id);
    };
};

function selectPrevList() {
    if(selTask == -1) { //if none selected
        selTask = 0;
        selectTask(current[selTask].id);
    } else {
        var currentList = current[selTask].list_number;

        var current_filtered = current.filter(function(x) {
            return x.list_number < currentList
        });

        if(current_filtered.length == 0){ //if nothing was found before, then start at the end
            currentList = listCache.length;
            current_filtered = current.filter(function(x) {
                return x.list_number < currentList
            });
        }
        var selList = Math.max.apply(Math, current_filtered.map(function(o) {
            return o.list_number;
        }));
        selTask = current.findIndex(function(e) {
            return e.list_number == selList;
        });

        selectTask(current[selTask].id);
    };
};

function moveToNextList() {
    if(selTask == -1) { //if none selected
        //do nothing
    } else {
        var currentList = current[selTask].list_number;
        var newlist = currentList + 1 % listCache.length;

        modTask(current[selTask].id, {
            "list_id": getListidByNumber(newlist)
        });
        selectTask(current[selTask].id);
    };
};

function moveToPrevList() {
    if(selTask == -1) { //if none selected
        //do nothing
    } else {
        var currentList = current[selTask].list_number;
        var prevlist = currentList - 1 % listCache.length;

        modTask(current[selTask].id, {
            "list_id": getListidByNumber(prevlist)
        });

    };
};

function doToday() {
    modTask(current[selTask].id, {
        "due_date": toDateString(new Date())
    });
};
function removeDate(){
    modTask(current[selTask].id, {
        "remove": ['due_date']
    });
};

function crossTask(b){
    modTask(current[selTask].id, {
        "starred": b
    });
};
