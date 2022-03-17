const http = require("http");
const createCommit = require("./lib/createCommit");

require("dotenv").config();

const SECRET_PATH = process.env.SECRET_PATH;

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");

  if (req.url == "/" + SECRET_PATH) {
    createCommit()
      .then((data) => {
        res.writeHead(200);
        res.end(
          JSON.stringify({
            data,
          })
        );
      })
      .catch((error) => {
        res.writeHead(500);
        res.end(
          JSON.stringify({
            error,
          })
        );
      });
  } else {
    res.writeHead(403);
    res.end(JSON.stringify({ error: "Forbidden, wrong path" }));
  }
});

const port = process.env.PORT || 3001;

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
