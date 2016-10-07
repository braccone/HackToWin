module.exports = {
	rethinkdb:{
		host: process.env.DB_HOST || 'localhost',
    	port: process.env.DB_PORT || 28015,
    	db: process.env.DB_NAME || 'loginapp',
		authKey: '',
	},
	express:{
		port:3000
	}
}
