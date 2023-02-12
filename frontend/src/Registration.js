import React, { useState, useEffect } from "react";
import { ReactSearchAutocomplete } from "react-search-autocomplete";
import { useNavigate } from "react-router-dom";

const Registration = () => {
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");

  const runningCourses = () => {
    fetch("http://localhost:3001/allrunning", {
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
          const transformedCourses = data.info.map((course) => ({
            id: course.course_id,
            name: course.title,
            sections: course.sec_id,
          }));
          const combinedCourses = transformedCourses.reduce((acc, course) => {
            const existingCourse = acc.find(
              (c) => c.id === course.id && c.name === course.name
            );
            if (existingCourse) {
              existingCourse.sections = [
                ...existingCourse.sections,
                course.sections,
              ];
            } else {
              acc.push({ ...course, sections: [course.sections] });
            }
            return acc;
          }, []);
          setCourses(combinedCourses);
        }
      });
  };

  useEffect(() => {
    runningCourses();
  });

  const handleSearch = (string, results) => {

    setSearchResults(results);

  };

  const handleSectionSelect = (e, courseId) => {
    setSelectedSection({
      [courseId]: e.target.value,
    });
  };

  const handleRegister = async (cid, sid) => {
    if (!sid) {
      return alert("Select Section");
    }
    await fetch("http://localhost:3001/register_course", {
      method: "POST",
      mode: "cors",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ cid, sid }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
        } else {
          alert("Registered Sucessfully");
        }
      });
  };

  return (
    <div>
      <div
        style={{
          width: 400,
          margin: 20,
        }}
      >
        <ReactSearchAutocomplete
          placeholder="Search Courses"
          items={courses}
          fuseOptions={{
            ignoreLocation: true,
            keys: ["name", "id"],
            minMatchCharLength: 1,
            threshold: 0,
          }}
          onSearch={handleSearch}
        />
      </div>
      {searchResults.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Course ID</th>
              <th>Course Name</th>
              <th>Section</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {searchResults.map((course) => (
              <tr key={course.id}>
                <td>{course.id}</td>
                <td>{course.name}</td>
                <td>
                  <select
                    value={selectedSection[course.id] || ""}
                    onChange={(e) => handleSectionSelect(e, course.id)}
                  >
                    <option value=""> Select Section</option>
                    {course.sections.map((section) => (
                      <option key={section} value={section}>
                        {section}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <button
                    class="regbutton"
                    onClick={() =>
                      handleRegister(course.id, selectedSection[course.id])
                    }
                  >
                    Register
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Registration;
