const client = require("./Database.js");

class Deptinfo {
    constructor (deptname) {
        this.deptname = deptname;
    }


    async getRunningDepts() {

        const sem = await client.query(`SELECT year, semester
                                         FROM reg_dates 
                                         WHERE start_time <= current_timestamp 
                                         ORDER BY start_time DESC 
                                         LIMIT 1`);

        const result = await client.query(`select distinct course.dept_name from section
        inner join course on course.course_id = section.course_id
        where semester = $1 and year = $2`, [sem.rows[0].semester, sem.rows[0].year]);

        return result.rows;
    }

async getRunningCourses() {

    const sem = await client.query(`SELECT year, semester
                                     FROM reg_dates 
                                     WHERE start_time <= current_timestamp 
                                     ORDER BY start_time DESC 
                                     LIMIT 1`);

    const result = await client.query(`select section.course_id, course.title from section
    inner join course on course.course_id = section.course_id
    where semester = $1 and year = $2 and dept_name = $3`, [sem.rows[0].semester, sem.rows[0].year, this.deptname]);

    return result.rows;
}

}

module.exports = Deptinfo;
