import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Template.css";

const Running = () => {
  const navigate = useNavigate();

  const runningDepts = () => {
    fetch("http://localhost:3001/depts", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.active) {
          navigate("/login");
        } else {
          let list = document.getElementById("running");
          let ul = document.createElement("ul");

          data.info.forEach((item) => {
            let li = document.createElement("li");
            let link = document.createElement("a");

            link.innerText = item.dept_name;
            link.setAttribute(
              "href",
              "http://localhost:3000/course/running/" + item.dept_name
            );
            li.appendChild(link);
            ul.appendChild(li);
          });

          list.appendChild(ul);
        }
      });
  };

  useEffect(() => {
    runningDepts();
  });

  return (
    <div id="running">
      <h2>RUNNING DEPARTMENTS</h2>
    </div>
  );
};

export default Running;
