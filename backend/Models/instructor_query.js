const client = require("./Database.js");

class Instinfo {
  constructor(inst_id) {
    this.inst_id = inst_id;
  }

  async getInstInfo() {
    const result = await client.query(
      `SELECT name, dept_name FROM instructor where id = $1`,
      [this.inst_id]
    );
    return result.rows[0];
  }

  async getInstCurrCourses() {
    const sem = await client.query(`SELECT year, semester
                                         FROM reg_dates 
                                         WHERE start_time <= current_timestamp 
                                         ORDER BY start_time DESC 
                                         LIMIT 1`);

    const result = await client.query(
      `WITH info0 AS (select course.course_id, course.title FROM section
            INNER JOIN course ON course.course_id = section.course_id
            WHERE semester = $1 AND year = $2) SELECT info0.course_id, info0.title FROM info0 
            INNER JOIN teaches ON info0.course_id = teaches.course_id WHERE teaches.id = $3`,
      [sem.rows[0].semester, sem.rows[0].year, this.inst_id]
    );

    return result.rows;
  }

  async getInstPastCourses() {
    const sem = await client.query(`SELECT year, semester
                                         FROM reg_dates 
                                         WHERE start_time <= current_timestamp 
                                         ORDER BY start_time DESC 
                                         LIMIT 1`);

    const result = await client.query(
      `with info0 as (select course.course_id, course.title from section
            inner join course on course.course_id = section.course_id
            where semester != $1 and year != $2) select info0.course_id, info0.title from info0 inner join
            teaches on info0.course_id = teaches.course_id where teaches.id = $3`,
      [sem.rows[0].semester, sem.rows[0].year, this.inst_id]
    );

    return result.rows;
  }

}

module.exports = Instinfo;
