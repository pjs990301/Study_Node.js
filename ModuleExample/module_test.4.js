var user = require('./user4');

function showUser(){
    return user().name + ", " + 'No Group';
}

console.log("%s",showUser());