const client = require("./Database.js");

class Courseinfo {
    constructor (cid) {
        this.cid = cid;
    }

    async getCurrCourses() {

        const result = await client.query(`with info1 as (select course_id, building, room_number from section),
        info2 as (select course.course_id, title, credits, building, room_number from info1 inner join course on course.course_id = info1.course_id),
        info3 as (select info2.course_id, title, credits, building, room_number, prereq_id from info2 left join prereq on info2.course_id = prereq.course_id),
        info4 as (select course_id as prereq_id, title as prereq_title from course),
        info5 as (select course_id, title, credits, building, room_number, info3.prereq_id, prereq_title from info3 left join info4 on info3.prereq_id = info4.prereq_id),
        info6 as (select distinct instructor.ID as inst_id, name as inst_name, course_id from instructor inner join teaches on instructor.ID = teaches.ID),
        info7 as (select info5.course_id, title, credits, building, room_number, prereq_id, prereq_title, info6.inst_id, info6.inst_name from info5 left join info6 on info5.course_id = info6.course_id)
        select * from info7 where info7.course_id = $1`, [this.cid]);

        return result.rows;
    }

    async getPrereqs() {

        const result = await client.query("select * from prereq where course_id = $1", [this.cid]);

        return result.rows;
    }

    async getSlot(sec_id, sem, year) {

        const result = await client.query(`select time_slot_id from section 
        where course_id = $1 and sec_id = $2 and semester = $3 and year = $4`, [this.cid, sec_id, sem, year]);

        return result.rows[0]["time_slot_id"];
    }
}

module.exports = Courseinfo;
