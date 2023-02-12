const client = require("./Database.js");

class Register {
    constructor (cid, sec) {
        this.cid = cid;
        this.sec = sec;
    }


async getAllRunningCourses() {
    
    const sem = await client.query(`SELECT year, semester
                                     FROM reg_dates 
                                     WHERE start_time <= current_timestamp 
                                     ORDER BY start_time DESC 
                                     LIMIT 1`);

    const result = await client.query(`select section.course_id, course.title, section.sec_id from section
    inner join course on course.course_id = section.course_id
    where semester = $1 and year = $2`, [sem.rows[0].semester, sem.rows[0].year]);

    return result.rows;
}

}

module.exports = Register;
