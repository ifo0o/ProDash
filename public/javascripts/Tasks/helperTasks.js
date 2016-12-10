/*Get the id of a list by passing the name*/
function getListid(name) {
    var id = $.grep(listCache, function(e) {
        return e.title === name;
    });
    return id[0].id;
};

/*Get the name of a list by passing the id*/
function getListName(id) {
    var n = $.grep(listCache, function(e) {
        return e.id === id;
    });
    return n[0].title;
};

/*Get the number (as in the screen) of a list by passing the id*/
function getListNumber(id) {
    lists = ["Snelle taken", "Privé", "School", "Werk", "Lange termijn", "Nog in te leveren"];
    listnumbers = [];
    $.each(lists, function(index, value) {
        n = {
            'name': value,
            'number': index,
            'id': getListid(value)
        }
        listnumbers.push(n);
    });
    var n = $.grep(listnumbers, function(value, index) {
        return value.id === id;
    });
    if(n.length !== 0) { //to prevent error when task is in different list
        return n[0].number;
    };
};

/*Get the list id of a list by number*/
function getListidByNumber(number) {
    lists = ["Snelle taken", "Privé", "School", "Werk", "Lange termijn", "Nog in te leveren"];
    return getListid(lists[number]);
};

/*Remove all tasks from the sreen*/
function clearTasks() {
    $("#tasks").children().remove();
};

/*Get the task object from cache passing the id from cache*/
function getTaskObject(id) {
    var t = $.grep(cache, function(e) {
        return e.id == id;
    });
    return t[0];
};

/*Sorter*/
var sort_by;

(function() {
    // utility functions
    var default_cmp = function(a, b) {
            if(a == b) return 0;
            return a < b ? -1 : 1;
        },
        getCmpFunc = function(primer, reverse) {
            var dfc = default_cmp, // closer in scope
                cmp = default_cmp;
            if(primer) {
                cmp = function(a, b) {
                    return dfc(primer(a), primer(b));
                };
            }
            if(reverse) {
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
        for(var i = 0; i < n_fields; i++) {
            field = arguments[i];
            if(typeof field === 'string') {
                name = field;
                cmp = default_cmp;
            } else {
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
            for(var i = 0; i < n_fields; i++) {
                result = 0;
                field = fields[i];
                name = field.name;

                result = field.cmp(A[name], B[name]);
                if(result !== 0) break;
            }
            return result;
        }
    }
}());




//-----------------------------------------------------------------------------
