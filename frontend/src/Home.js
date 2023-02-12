import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

const Home = () => {
  var name, id, dept_name, tot_cred;

  const navigate = useNavigate();

  const gotoRegsiter = () => {
    navigate("/home/registration");
  };

  const gotoRunning = () => {
    navigate("/course/running");
  };

  const handleLogout = () => {
    fetch("http://localhost:3001/logout", {
      method: "GET",
      mode: "cors",
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        navigate("/login");
      });
  };

  const getHomeInfo = () => {
    fetch("http://localhost:3001/gethomeinfo", {
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
          name = data.info.name;
          id = data.info.id;
          dept_name = data.info.dept_name;
          tot_cred = data.info.tot_cred;

          document.getElementById("name").innerHTML = name;
          document.getElementById("id").innerHTML = id;
          document.getElementById("dept").innerHTML = dept_name;
          document.getElementById("creds").innerHTML = tot_cred;

          let current = data.current;
          let past = data.past;
          let year = data.currsem.year;
          let semester = data.currsem.semester;

          function dropCourse(course_id) {
            fetch("http://localhost:3001/dropcourse", {
              method: "POST",
              mode: "cors",
              credentials: "include",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ id, course_id, year, semester }),
            });
          }
          
          function createTable(courses) {
            let tables = document.getElementById("tables");
            let table = document.createElement("table");
            let thead = document.createElement("thead");
            let tr = document.createElement("tr");
            let cid_th = document.createElement("th");
            let secid_th = document.createElement("th");
            let title_th = document.createElement("th");
            cid_th.innerText = "Course ID";
            secid_th.innerText = "Section";
            title_th.innerText = "Title";

            tr.appendChild(cid_th);
            tr.appendChild(secid_th);
            tr.appendChild(title_th);

            if (courses === current) {
              let action = document.createElement("th");
              action.innerText = "Drop Course";
              tr.appendChild(action);
            }

            thead.appendChild(tr);
            table.appendChild(thead);

            let tbody = document.createElement("tbody");

            let currentYearSemester = "";
            for (let course of courses) {
              if (course.year + course.semester !== currentYearSemester) {
                let tr = document.createElement("tr");
                let td = document.createElement("td");
                tr.setAttribute("id", "sem");
                td.colSpan = 4;
                td.innerText = course.year + " " + course.semester;
                tr.appendChild(td);
                tbody.appendChild(tr);
                currentYearSemester = course.year + course.semester;
              }

              let tr = document.createElement("tr");
              let cid_td = document.createElement("td");
              let secid_td = document.createElement("td");
              let title_td = document.createElement("td");
              cid_td.innerText = course.course_id;
              secid_td.innerText = course.sec_id;
              title_td.innerText = course.title;

              tr.appendChild(cid_td);
              tr.appendChild(secid_td);
              tr.appendChild(title_td);

              if (courses === current) {
                let drop_td = document.createElement("td");
                let drop_btn = document.createElement("button");
                drop_btn.setAttribute("id", "btn_" + course.course_id);
                drop_btn.setAttribute("class", "dropcourse");
                drop_btn.innerText = "Drop Course";
                drop_td.appendChild(drop_btn);
                tr.append(drop_td);
              }

              tbody.appendChild(tr);
            }

            table.appendChild(tbody);
            tables.appendChild(table);
          }

          createTable(current);
          createTable(past);
          for (let course of current) {
            document
              .getElementById("btn_" + course.course_id)
              .addEventListener("click", function () {
                dropCourse(course.course_id);
                window.location.reload(false);
              });
          }
        }
      });
  };

  useEffect(() => {
    getHomeInfo();
  });

  return (
    <div>
      <title>Home Page</title>
      <table>
        <tbody>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department Name</th>
            <th>Credits</th>
          </tr>
          <tr>
            <td id="id"></td>
            <td id="name"></td>
            <td id="dept"></td>
            <td id="creds"></td>
          </tr>
        </tbody>
      </table>
      <div id="tables"></div>
      <div id="buttons">
        <button
          type="button"
          id="logout"
          data-inline="true"
          onClick={handleLogout}
        >
          Logout
        </button>
        <button
          type="button"
          id="register"
          data-inline="true"
          onClick={gotoRegsiter}
        >
          Register
        </button>
        <button
          type="button"
          id="running_btn"
          data-inline="true"
          onClick={gotoRunning}
        >
          Running Courses
        </button>
      </div>
    </div>
  );
};

export default Home;
