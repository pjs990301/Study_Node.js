var user =require('./user3');

console.dir(user);

function showUser(){
    return user.getUser().name + ', '+ user.group.name;
}

console.log("%s",showUser());