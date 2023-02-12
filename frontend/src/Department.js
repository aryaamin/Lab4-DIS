import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Template.css";

const Department = () => {
  const navigate = useNavigate();

  let path = document.location.pathname.split("/");
  const deptname = path[path.length - 1];

  const runningCourses = () => {
    fetch("http://localhost:3001/running", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ deptname }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.active) {
          navigate("/login");
        } else {
          let list = document.getElementById("runningcourses");
          let ul = document.createElement("ul");

          data.info.forEach((item) => {
            let li = document.createElement("li");
            let link = document.createElement("a");

            link.innerText = item.title;
            link.setAttribute(
              "href",
              "http://localhost:3000/course/" + item.course_id
            );
            li.appendChild(link);
            ul.appendChild(li);
          });
          list.appendChild(ul);
        }
      });
  };

  useEffect(() => {
    runningCourses();
  });

  return (
    <div id="runningcourses">
      <h2>Running Courses in {deptname}</h2>
    </div>
  );
};

export default Department;
