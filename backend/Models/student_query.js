const client = require("./Database");
const Course = require("./course_query.js");

class Student {
  constructor(id) {
    this.id = id;
  }

  getId() {
    return this.id;
  }

  async getInfo() {
    const result = await client.query(
      `SELECT id, name, dept_name, tot_cred FROM student WHERE id = $1`,
      [this.id]
    );

    return result.rows[0];
  }

  async getCurrentSem() {
    const result = await client.query(`SELECT year, semester
                                         FROM reg_dates 
                                         WHERE start_time <= current_timestamp 
                                         ORDER BY start_time DESC 
                                         LIMIT 1`);
    return result.rows[0];
  }

  async getCourses() {
    const sem = await this.getCurrentSem();

    var current = await client.query(
      `SELECT t.course_id, t.sec_id, t.year, t.semester, c.title 
                                         FROM takes t
                                         JOIN course c
                                         ON (c.course_id = t.course_id)
                                         WHERE id = $3 and t.semester = $1 and t.year = $2`,
      [sem.semester, sem.year, this.id]
    );
   
    var past = await client.query(
      `SELECT t.course_id, t.sec_id, t.year, t.semester, c.title 
                                         FROM takes t 
                                         JOIN course c
                                         ON (c.course_id = t.course_id)
                                         WHERE id = $1 
                                         order by t.year desc`,
      [this.id]
    );

    current = current.rows.filter(
      (c) => c.semester === sem.semester && c.year === sem.year
    );
    past = past.rows.filter(
      (c) => c.semester != sem.semester || c.year != sem.year
    );

    return { sem: sem, current: current, past: past };
  }

  async dropCourse(id, course_id, sem, year) {
    const result = await client.query(
      `DELETE FROM takes 
        WHERE id = $1 AND 
        semester = $2 AND year = $3 
        AND course_id = $4`,
      [id, sem, year, course_id]
    );
  }

  async registerCourse(course_id, sec_id) {
    const courses = await this.getCourses();
    const sem = courses["sem"];
    const curr_courses = courses["current"];
    const past_courses = courses["past"];

    // check if same course was already taken in some semester
    if (curr_courses) {
      for (const c of curr_courses) {
        if (c["course_id"] == course_id) {
          return { status : -1};
        }
      }
    }

    if (past_courses) {
      for (const c of past_courses) {
        if (c["course_id"] == course_id) {
          return { status : -1};
        }
      }
    }

    const course = new Course(course_id);
    const prereqs = await course.getPrereqs();

    if (prereqs) {
      for (const prereq of prereqs) {
        let found = false;

        for (const past_course of past_courses) {
          if (past_course["course_id"] == prereq["course_id"]) {
            found = true;
            break;
          }
        }

        if (!found) {
          return { status: 1, value: prereq["course_id"] };
        }
      }
    }

    let slot = await course.getSlot(sec_id, sem.semester, sem.year);
    for (const course of curr_courses) {
      let course_obj = new Course(course["course_id"]);

      let course_slot = await course_obj.getSlot(
        course["sec_id"],
        sem.semester,
        sem.year
      );

      if (course_slot == slot) {
        return { status: 2, value: course["course_id"] };
      }
    }

    const result = await client.query(
      `INSERT INTO takes VALUES ($1, $2, $3, $4, $5, null)`,
      [this.id, course_id, sec_id, sem.semester, sem.year]
    );
    return { status: 0 };
  }
}

module.exports = Student;
