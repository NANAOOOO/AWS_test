// Express Server インスタンスを作成
const express = require("express");
const app = express();
const pg = require("pg");
const path = require("path");
const PORT = 3000;

// POSTで、req.bodyでJSON受け取りを可能に
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true
  })
);

// テンプレートエンジンの設定
app.set("view engine", "ejs");

// htmlやcssファイルが保存されている publicフォルダ を指定
app.use("/static", express.static(path.join(__dirname, "public")));

// DBに接続
var pool = new pg.Pool({
  database: "comments",
  user: "ayana", //ユーザー名はデフォルト以外を利用した人は適宜変更すること
  password: "PASSWORD", //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
  host: "localhost",
  port: 5432
});

app.get("/", (req, res, next) => {
  // データベースからデータを読み込む
  pool.connect((err, client) => {
    if (err) {
      console.log(err);
    } else {
      // query関数の第一引数にSQL文をかく
      client.query("SELECT name FROM users", (err, result) => {
        res.render("index", {
          title: "Express",
          name: result.rows[0].name
        });

        //コンソール上での確認用
        console.log(result);
      });
    }
  });
});

app.post("/showComments/", (req, res, next) => {
  console.log(req.body);

  // (Challenge)すでにDBにあるコメントを表示
  res.send("<h1>Hello</h1>");
});

app.post("/submitComment/", (req, res, next) => {
  console.log(req.body);

  // 新規コメントをDBに追加
  // 一旦、簡易的にtoName, fromNameを同じに
  var query = {
    text:
      "INSERT INTO comments (toName, fromName, commentText) VALUES($1, $2, $3)",
    values: [req.body.name, req.body.name, req.body.comment]
  };

  pool.connect((err, client) => {
    if (err) {
      console.log(err);
    } else {
      // query関数の第一引数にSQL文をかく
      client
        .query(query)
        .then(() => {
          res.send("Data Added.");
        })
        .catch(e => {
          console.error(e.stack);
        });
    }
  });
});

app.listen(PORT, function(err) {
  if (err) console.log(err);
  console.log("Start Server!");
});
