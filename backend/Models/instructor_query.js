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
            INNER JOIN teaches ON info0.course_id = teaches.course_id WHERE teaches.id = $3 order by info0.course_id`,
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
            where semester != $1 or year != $2) select info0.course_id, info0.title from info0 inner join
            teaches on info0.course_id = teaches.course_id where teaches.id = $3 order by teaches.year DESC`,
      [sem.rows[0].semester, sem.rows[0].year, this.inst_id]
    );

    return result.rows;
  }

  // for instructor to access courses taken by any student
  async getCourses(sid) {
    const sem = await this.getCurrentSem();

    var current = await client.query(
      `SELECT t.course_id, t.sec_id, t.year, t.semester, c.title 
                                         FROM takes t
                                         JOIN course c
                                         ON (c.course_id = t.course_id)
                                         WHERE id = $3 and t.semester = $1 and t.year = $2`,
      [sem.semester, sem.year, sid]
    );
   
    var past = await client.query(
      `SELECT t.course_id, t.sec_id, t.year, t.semester, c.title 
                                         FROM takes t 
                                         JOIN course c
                                         ON (c.course_id = t.course_id)
                                         WHERE id = $1 
                                         order by t.year desc`,
      [sid]
    );

    current = current.rows.filter(
      (c) => c.semester === sem.semester && c.year === sem.year
    );
    past = past.rows.filter(
      (c) => c.semester != sem.semester || c.year != sem.year
    );

    return { sem: sem, current: current, past: past };
  }
}

module.exports = Instinfo;
