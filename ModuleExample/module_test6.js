var require = function (path){
    var exports = {
        getUser : function(){
            return { id: 'test01',name : 'hello'};
        },
        group : {
          id:'group01',name : '친구'
        }
    }
    return exports;
}

var user = require('...');
function showUser(){
    return user.getUser().id + ", "+ user.getUser().name;
}

console.log(showUser());
