module.exports = {
    server_port: 3000,
    db_url: 'mongodb://localhost:27017/local',
    db_schemas: [
        {
            file: './user_schema',
            collection: 'users6',
            schemaName: 'UserSchema',
            modelName: 'UserModel'
        },
        {
            file: './coffeeshop_schema',
            collection: 'coffeeshop',
            schemaName: 'CoffeeShopSchema',
            modelName: 'CoffeeShopMdodel'
        }

    ],
    route_info: [
        {file: './coffeeshop', path: '/process/addcoffeeshop', method: 'add', type: 'post'},
        {file: './coffeeshop', path: '/process/listcoffeeshop', method: 'list', type: 'post' }
    ],
    facebook: {		// passport facebook
        clientID: 'id',
        clientSecret: 'pw',
        callbackURL: 'http://localhost:3000/auth/facebook/callback'
    },
    twitter: {		// passport twitter
        clientID: 'id',
        clientSecret: 'secret',
        callbackURL: '/auth/twitter/callback'
    },
    google: {		// passport google
        clientID: 'id',
        clientSecret: 'secret',
        callbackURL: '/auth/google/callback'
    }
}
