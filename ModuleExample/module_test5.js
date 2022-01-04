var user = require('./user5.js');

function showUser(){
    return user.group.name + ", "+ user.group.id;
}

console.log(showUser());
