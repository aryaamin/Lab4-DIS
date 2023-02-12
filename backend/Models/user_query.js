const client = require("./Database");
const bcrypt = require("bcrypt");

class UserPass {
    constructor (id) {
        this.id = id;
    }

    getId() {
        return id;
    }

    async getPassHash() {
        const result = await client.query(`SELECT hashed_password 
                                         FROM user_password 
                                         WHERE id = $1`, [this.id]);

        return result;
    }

    async verifyPassword(password) {
        const hash = await this.getPassHash();

        if (!hash.rows.length) {
            return false;
        } 

        const res = await bcrypt.compare(password, hash.rows[0]["hashed_password"]);

        return res;
    }

}

module.exports = UserPass;
