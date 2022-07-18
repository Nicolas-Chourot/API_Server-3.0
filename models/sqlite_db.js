const sqlite = require('sqlite3').verbose();
const fs = require('fs');
const dbFile = "./data/server.db";
module.exports =
    class Sqlite_db {
        static createDbFile() {
            fs.writeFileSync(dbFile, "");
            return true;
        }
        static makeCreateTableSql(model) {
            let tableName = model.getClassName() + "s";
            let sql = 'CREATE TABLE IF NOT EXISTS ' + tableName + "(";
            for (const key in model) {
                if (key == "Id")
                    sql = sql + "Id INTEGER PRIMARY KEY, ";
                else
                    if (key != "validator" && key != "key")
                        sql = sql + key + ",";
            }
            // patch the end sql query
            sql = sql.substring(0, sql.lastIndexOf(',')) + ")";
            return sql;
        }
        static makeInsertSql(model) {
            let tableName = model.getClassName() + "s";
            let sql = 'INSERT INTO ' + tableName + "(";
            let fieldCount = 0;
            for (const key in model) {
                if (key != "Id" && key != "validator" && key != "key") {
                    sql = sql + key + ",";
                    fieldCount++;
                }
            }
            // patch the end sql query
            sql = sql.substring(0, sql.lastIndexOf(',')) + ") VALUES (?";
            for (let f = 1; f < fieldCount; f++) {
                sql = sql + ",?";
            }
            sql = sql + ")";
            return sql;
        }
        static makeUpdateSql(model) {
            let tableName = model.getClassName() + "s";
            let sql = "UPDATE " + tableName + " SET ";
            let first_field = true;
            for (const key in model) {
                if (key != "Id" && key != "validator" && key != "key") {
                    if (first_field) {
                        sql = sql + key + " = ? ";
                        first_field = false
                    } else {
                        sql = sql + ", " + key + " = ? ";
                    }
                }
            }
            sql = sql + " WHERE Id = ?";
            return sql;
        }
        static makeDeleteSql(model) {
            let tableName = model.getClassName() + "s";
            let sql = 'DELETE FROM ' + tableName + " WHERE Id=(?)";
            return sql;
        }
        static groupValues(data, includeId = false) {
            if (!includeId) delete data.Id;
            let values = [];
            for (const key in data) {
                if (key != "Id")
                    values.push(data[key]);
            }
            if (includeId)
                values.push(data.Id);
            return values;
        }
        static makeSelectSql(model, id = null) {
            let tableName = model.getClassName() + "s";
            let sql = "SELECT * FROM " + tableName;
            if (id) sql = sql + " WHERE Id=" + id;
            return sql;
        }
        static async db_open() {
            return new Promise(resolve => {
                let db = new sqlite.Database(dbFile, sqlite.OPEN_READWRITE, err => {
                    if (err) {
                        if (err.code == 'SQLITE_CANTOPEN') {
                            if (Sqlite_db.createDbFile()) {
                                db = new sqlite.Database(dbFile, sqlite.OPEN_READWRITE, err => {
                                    if (err) {
                                        console.log(err.message);
                                        resolve(null);
                                    }
                                });
                            }
                        }
                        else {
                            console.log(err.message);
                            resolve(null);
                        }
                    }
                    resolve(db);
                });
            });
        }
        static async createTable(model) {
            return new Promise(async resolve => {
                let db = await Sqlite_db.db_open();
                if (db) {
                    db.run(Sqlite_db.makeCreateTableSql(model), (error) => {
                        if (error) {
                            console.log(error.message);
                            resolve(false);
                        }
                        else {
                            resolve(true);
                        }
                    });
                    db.close();
                } else
                    resolve(false);
            })
        }
        static async dropTable(model) {
            let db = await Sqlite_db.open();
            return new Promise(resolve => {
                if (db) {
                    let tableName = model.getClassName() + "s";
                    db.run("DROP TABLE " + tableName, (error) => {
                        if (error) {
                            console.log(error.message);
                            resolve(false);
                        }
                        else {
                            resolve(false);
                        }
                    });
                    db.close();
                } else
                    resolve(false);
            });
        }
        static async insert(model, data) {
            return new Promise(async resolve => {
                if (model.valid(data)) {
                    let db = await Sqlite_db.db_open();
                    if (db) {
                        db.serialize(() => {
                            db.run(Sqlite_db.makeCreateTableSql(model), (error) => {
                                if (error) {
                                    console.log(error.message);
                                    resolve(null);
                                }
                            });
                            db.run(Sqlite_db.makeInsertSql(model), Sqlite_db.groupValues(data, false),
                                function (error) { // don't use ES6 arrow function otherwise this.lastID won't be available
                                    if (error) {
                                        console.log(error.message);
                                        resolve(null);
                                    } else {
                                        data.Id = this.lastID;
                                        resolve(data);
                                    }
                                });
                        });
                        db.close();
                    } else
                        resolve(null);
                } else
                    resolve(null);
            });
        }
        static async update(model, data) {
            return new Promise(async resolve => {
                if (model.valid(data)) {
                    let db = await Sqlite_db.db_open();
                    if (db) {
                        db.run(Sqlite_db.makeUpdateSql(model), Sqlite_db.groupValues(data, true),
                            function (error) {
                                if (error) {
                                    console.log(error.message);
                                    resolve(false);
                                } else
                                    resolve(true);
                            });
                        db.close();
                    } else
                        resolve(false);
                } else
                    resolve(false);
            });
        }
        static async delete(model, id) {
            return new Promise(async resolve => {
                let db = await Sqlite_db.db_open();
                if (db) {
                    db.run(this.makeDeleteSql(model), id, function (error) {
                        if (error) {
                            console.log(error.message);
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    })
                } else
                    resolve(false);
            })
        }
        static async db_query(sql) {
            return await new Promise(async resolve => {
                let db = await Sqlite_db.db_open();
                if (db) {
                    db.all(sql, (err, rows) => {
                        if (err) {
                            console.log(err.message);
                            return resolve(null);
                        } else
                            resolve(rows);
                        db.close();
                    });
                } else
                    resolve(null);
            });
        }
        static async get(model, id = null) {
            let rows = await Sqlite_db.db_query(Sqlite_db.makeSelectSql(model, id));
            if (rows == null) rows = [];
            if (id && rows.length == 1)
                rows = rows[0];
            return rows;
        }
    }
