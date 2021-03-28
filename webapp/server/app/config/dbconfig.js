// module.exports = {
//   HOST: "localhost",
//   USER: "webapp_connection",
//   PASSWORD: "password",
//   DB: "csye6225"
// };

// module.exports = {
//   HOST: "csye6225-su2020.co71qf13hzls.us-east-1.rds.amazonaws.com",
//   USER: "csye6225_su2020",
//   PASSWORD: "StrongPassword5!",
//   DB: "csye6225"
// };

var hostnameTemp = process.env.DBhostname;
var hostname = hostnameTemp.split(":")[0];

module.exports = {
  HOST: hostname,
  USER: process.env.DBusername,
  PASSWORD: process.env.DBpassword,
  DB: process.env.DBname
};