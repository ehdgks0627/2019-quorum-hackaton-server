import mysql from 'mysql'

export default class Database {
    constructor() {
        this.connection = mysql.createConnection({
            host     : '127.0.0.1',
            user     : 'sprout',
            password : '1234',
            database : 'qels'
        })

        this.connection.connect(function(err) {
            if (err) throw err
        })

        this.interval = setInterval(() => {
            this.query("SELECT 1")
        }, 5000)
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.connection.query( sql, args, ( err, result ) => {
                if ( err ) {
                    console.log(sql, args)
                    return reject( err )
                }
                resolve( result )
            } )
        } )
    }
}
