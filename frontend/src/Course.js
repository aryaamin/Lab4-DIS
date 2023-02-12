import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Template.css";

const Course = () => {
  const navigate = useNavigate();

  let path = document.location.pathname.split("/");
  const cid = path[path.length - 1];

  const displayCourses = () => {
    fetch("http://localhost:3001/courses", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cid }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.active) {
          navigate("/login");
        } else {
          let courseinfo = data.info;
          let main = document.getElementById("courseinfo");
          let title = document.createElement("h2");
          if (courseinfo.length === 0) {
            title.innerText = "NO DATA AVAILABLE";
            main.appendChild(title);
          } else {
            let course = courseinfo[0];
            let inst = [],
              preq = [],
              creds = [];

            courseinfo.forEach((item) => {
              inst.push({
                inst_name: item.inst_name,
                inst_id: item.inst_id,
              });
              preq.push({
                prereq_title: item.prereq_title,
                prereq_id: item.prereq_id,
              });
              creds.push({
                credits: item.credits,
              });
            });

            inst = inst.filter(
              (value, index, self) =>
                index === self.findIndex((t) => t.inst_id === value.inst_id)
            );
            preq = preq.filter(
              (value, index, self) =>
                index === self.findIndex((t) => t.prereq_id === value.prereq_id)
            );
            creds = creds.filter(
              (value, index, self) =>
                index === self.findIndex((t) => t.credits === value.credits)
            );

            title.innerText = course.course_id + " " + course.title;
            main.appendChild(title);

            let credits = document.createElement("h3");
            credits.innerText = "Credits:";

            main.append(credits);

            creds.forEach((item) => {
              if (item.credits !== null) {
                let li = document.createElement("li");
                li.innerText = item.credits;
                main.appendChild(li);
              }
            });

            let prereqs = document.createElement("h3");
            prereqs.innerText = "Pre-Requisites:";

            main.append(prereqs);

            preq.forEach((item) => {
              if (item.prereq_id !== null) {
                let li = document.createElement("li");
                let link = document.createElement("a");

                link.innerText = item.prereq_title;
                link.setAttribute(
                  "href",
                  "http://localhost:3000/course/" + item.prereq_id
                );
                li.appendChild(link);
                main.appendChild(li);
              }
            });

            let instructors = document.createElement("h3");
            instructors.innerText = "Instructors:";

            main.append(instructors);

            inst.forEach((item) => {
              if (item.inst_id !== null) {
                let li = document.createElement("li");
                let link = document.createElement("a");

                link.innerText = item.inst_name;
                link.setAttribute(
                  "href",
                  "http://localhost:3000/instructor/" + item.inst_id
                );
                li.appendChild(link);
                main.appendChild(li);
              }
            });
          }
        }
      });
  };

  useEffect(() => {
    displayCourses();
  });

  return (<div id="courseinfo"></div>);
};

export default Course;
