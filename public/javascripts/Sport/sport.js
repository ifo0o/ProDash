var main = function() {
    sportCache = [];

    $(".panel-body").on("click",".ex1", function(){
        var today = new Date();
        var ex = {
            type:"ex1",
            date: today
        }
        sportCache.push(ex);
        console.log(JSON.stringify(sportCache,4,null));
        displayEx(ex)
        //$("#sportlist").

    })
};

function displayEx(ex){
    console.log(ex.date.getDay())
    var day = ex.date.getDay();
    if(day === 0){
        day = 7;
    };
    $("#sportlist:nth-child("+day+")").append("<td>ola</td>")
}

$(document).ready(main);
