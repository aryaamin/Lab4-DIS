import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Template.css";

const Instructor = () => {
  const navigate = useNavigate();

  let path = document.location.pathname.split("/");
  const inst_id = path[path.length - 1];

  const instructorInfo = () => {
    fetch("http://localhost:3001/instructor", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inst_id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.active) {
          navigate("/login");
        } else {
          let main = document.getElementById("instinfo");

          if (data.msg) {
            let inst_name = document.createElement("h2");
            inst_name.innerText = "No Such Instructor";
            main.append(inst_name);
          }

          else {

            let currentCourses = data.currentCourses;
            let pastCourses = data.pastCourses;
            let info = data.info;

            let inst_name = document.createElement("h2");
            inst_name.innerText = info.name;
            main.append(inst_name);

            let dept = document.createElement("h3");
            dept.innerText = "Department: " + info.dept_name;

            main.append(dept);

            let curr = document.createElement("h3");
            curr.innerText = "Current Courses";
            main.append(curr);

            currentCourses.forEach((item) => {
              let li = document.createElement("li");
              let link = document.createElement("a");

              link.innerText =
                "ID: " + item.course_id + " | Title: " + item.title;
              link.setAttribute(
                "href",
                "http://localhost:3000/course/" + item.course_id
              );
              li.appendChild(link);
              main.appendChild(li);
            });

            let past = document.createElement("h3");
            past.innerText = "Past Courses";
            main.append(past);

            pastCourses.forEach((item) => {
              let li = document.createElement("li");
              li.innerText = "ID: " + item.course_id + " | Title: " + item.title;
              main.appendChild(li);
            });
          }
        }
      });
  };

  useEffect(() => {
    instructorInfo();
  });

  return <div id="instinfo"></div>;
};

export default Instructor;
