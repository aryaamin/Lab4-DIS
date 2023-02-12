const bodyParser = require("body-parser");
const express = require("express");
const cookieParser = require("cookie-parser");
const sessions = require("express-session");
const app = express();
const cors = require("cors");
// const userController = require("./Controllers/userController");
const port = 3001;
const UserPass = require("./Models/user_query");
const Student = require("./Models/student_query");
const Courseinfo = require("./Models/course_query");
const Deptinfo = require("./Models/department_query");
const Instinfo = require("./Models/instructor_query");
const RegisterInfo = require("./Models/register_query");

const oneDay = 1000 * 60 * 60 * 24;
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

//session middleware
app.use(
  sessions({
    secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    resave: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//serving public file
app.use(express.static(__dirname));

app.use(cookieParser());

app.get("/check-session", (req, res) => {
  if (req.session.userid) {
    return res.json({ active: true });
  } else {
    return res.json({ active: false });
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  return res.json({});
});

app.post("/dropcourse", async (req, res) => {
  const user = new Student(req.body.id);
  user.dropCourse(
    req.body.id,
    req.body.course_id,
    req.body.semester,
    req.body.year
  );
});

app.post("/register_course", async (req, res) => {
  const user = new Student(req.session.userid);
  const result = await user.registerCourse(req.body.cid, req.body.sid);
  if (result.status == 1) {
    return res.json({ error: "Pre-Requisites not fulfilled" });
  } else if (result.status == 2) {
    return res.json({ error: "Slot Clash" });
  }
  return res.json({ msg: "Registered Successfully" });
});

app.post("/gethomeinfo", async (req, res) => {
  if (req.session.userid) {
    const userid = req.session.userid;
    const user = new Student(userid);
    let info = await user.getInfo();
    let currSem = await user.getCurrentSem();
    let courses = await user.getCourses();
    res.json({
      active: true,
      info: info,
      currsem: currSem,
      past: courses["past"],
      current: courses["current"],
    });
  } else {
    return res.json({ active: false });
  }
});

app.post("/courses", async (req, res) => {
  if (req.session.userid) {
    const cid = req.body.cid;
    const user = new Courseinfo(cid);
    let coinfo = await user.getCurrCourses();
    return res.json({ active: true, info: coinfo });
  } else {
    return res.json({ active: false });
  }
});

app.post("/depts", async (req, res) => {
  if (req.session.userid) {
    const user = new Deptinfo();
    let runningDepts = await user.getRunningDepts();
    return res.json({ active: true, info: runningDepts });
  } else {
    return res.json({ active: false });
  }
});

app.post("/running", async (req, res) => {
  if (req.session.userid) {
    const user = new Deptinfo(req.body.deptname);
    let coinfo = await user.getRunningCourses();
    return res.json({ active: true, info: coinfo });
  } else {
    return res.json({ active: false, msg: "non-active" });
  }
});

app.post("/allrunning", async (req, res) => {
  if (req.session.userid) {
    const user = new RegisterInfo(req.body.deptname);
    let reginfo = await user.getAllRunningCourses();
    return res.json({ active: true, info: reginfo });
  } else {
    return res.json({ active: false });
  }
});

app.post("/instructor", async (req, res) => {
  if (req.session.userid) {
    const user = new Instinfo(req.body.inst_id);
    let instinfo = await user.getInstInfo();
    let instcurr = await user.getInstCurrCourses();
    let instpast = await user.getInstPastCourses();
    return res.json({
      active: true,
      info: instinfo,
      currentCourses: instcurr,
      pastCourses: instpast,
    });
  } else {
    return res.json({ active: false });
  }
});

app.post("/login", async (req, res) => {
  if (req.session.userid) {
    //do nothing
  } else {
    const { username, password } = req.body;
    const user = new UserPass(username);
    const result = await user.verifyPassword(password);

    if (result) {
      req.session.userid = username;
      req.session.save();

      res.send({});
      console.log("HELLO", req.session.id);
      console.log("LOGIN SUCCESSFULL");
    } else {
      return res.status(401).json({ error: "Incorrect username or password" });
    }
  }
});

app.listen(port, () => {
  console.log(`App running on port ${port}.`);
});
