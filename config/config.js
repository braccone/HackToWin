module.exports = {
	rethinkdb:{
		host: process.env.DB_HOST || 'localhost',
    	port: process.env.DB_PORT || 28015,
    	db: process.env.DB_NAME || 'HackToWin',
		authKey: '',
		user:'admin',
		password:'arp-a46TB'
	},
	express:{
		port:3000
	}
}
