var user1 = require('./user1.js');

function showUser(){
    return user1.getUser().name + ', '+ user1.group.name;
}

console.log("%s",showUser());