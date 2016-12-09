/*Get the id of a list by passing the name*/
function getListid(name){
    var id = $.grep(listCache,function(e){
        return e.title === name;
    });
    return id[0].id;
    //temporary line
};

/*Get the name of a list by passing the id*/
function getListName(id){
    var n = $.grep(listCache,function(e){
        return e.id === id;
    });
    return n[0].title;
};
/*Get the number (as in the screen) of a list by passing the id*/
function getListNumber(id){
    lists = ["Snelle taken","Privé", "School", "Werk", "Lange termijn", "Nog in te leveren"]
    listnumbers = [];
    $.each(lists, function(index,value){
        n = {'name':value, 'number':index, 'id':getListid(value)}
        listnumbers.push(n)
    })
    var n = $.grep(listnumbers, function(value,index){
        return value.id === id;
    });
    return n[0].number;
};


function clearTasks(){
    $("#tasks").children().remove();
};

/*Get the task object passing the id from cache*/
/*function getTaskObject(id){
    var t = $.grep(cache,function(e){
        return e.id == id;
    });
    return t[0];
};
*/
