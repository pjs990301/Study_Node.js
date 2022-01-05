function User(id,name){
    this.id = id;
    this.name = name;
}

User.prototype.getUser = function (){
    return {id : this.id, name : this.name};
}

User.prototype.group = {id : "group1", name : "친구"};

User.prototype.printUser = function(){
    console.log('user %s group %s',this.name,this.group.name);
}

module.exports = new User('test01','hello');
