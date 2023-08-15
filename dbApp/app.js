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
  database: "postgres",
  user: "apple", 
  password: "postgres", 
  host: "localhost",
  port: 5432
});

//stocksページの表示
app.get("/stocks/", (req, res, next) => {
  res.render("stocks.ejs", {
    responseName: '商品名',
    responseQuantity: 0,
    checkName: "商品名",
    checkQuantity: 0,
    message:"データを消去できます",
    checkAll:"商品名を入力しない場合、全てのデータを表示します"
  });
});

//⑤在庫と売上のデータを全削除 
app.post('/cleanData/', (req, res) => {
  pool.query('DELETE FROM stocks', function (error1, result1) {
    if (error1) {
      console.error(error1);
      res.status(500).json({ error: 'エラーが発生しました' });
      return;
    }
    pool.query('DELETE FROM sales', function (error2, result2) {
      if (error2) {
        console.error(error2);
        res.status(500).json({ error: 'エラーが発生しました' });
        return;
      }
      res.render("stocks.ejs",{
        responseName: '商品名',
        responseQuantity: 0,
        checkName: "商品名",
        checkQuantity: 0,
        message:"データを全て削除しました",
        checkAll:"商品名を入力しない場合、全てのデータを表示します"
      });
    });
  });
});

//①在庫の更新・作成
app.post("/stocksUpdate/", (req, res, next) => {
  console.log(req.body);
  const updateName = req.body.name;
  const updateQuantity = Number(req.body.amount);
  // ユーザーが入力した商品について既存の在庫を取得する
  const existingStockQuery = {
    text: "SELECT * FROM stocks WHERE productName = $1",
    values: [updateName]
  };
  // 新しい在庫情報を挿入する
  const insertQuery = {
    text: "INSERT INTO stocks (productName, productQuantity) VALUES($1, $2)",
    values: [updateName, updateQuantity]
  };
  pool.connect((err, client) => {
    if (err) {
      console.log(err);
    } else {
      // 同商品の在庫を取得
      client
        .query(existingStockQuery)
        .then(result => {
          if (result.rows.length > 0) {
            const existingQuantity = result.rows[0].productquantity;
            const newQuantity = Number(existingQuantity) + updateQuantity;
            // 在庫を更新する
            const updateQuery = {
              text: "UPDATE stocks SET productQuantity = $1 WHERE productName = $2",
              values: [newQuantity, updateName ]
            };
            client
            // ＜同商品の在庫がある場合＞
              .query(updateQuery)
              .then(() => {
                res.render("stocks.ejs",{
                  responseName:updateName,
                  responseQuantity:updateQuantity,
                  checkName: "商品名",
                  checkQuantity: 0,
                  message:"データを消去できます",
                  checkAll:"商品名を入力しない場合、全てのデータを表示します"
                }
                ) 
              })
              .catch(e => {
                console.error(e.stack);
                res.status(500).send("エラーが発生しました");
              });
          } else {
            // ＜同商品の在庫がない場合＞
            client
              .query(insertQuery)
              .then(() => {
                res.render("stocks.ejs",{
                message:"データを消去できます",
                responseName:updateName,
                responseQuantity:updateQuantity,
                checkName: "商品名",
                checkQuantity: 0,
                checkAll:"商品名を入力しない場合、全てのデータを表示します"
              });
              })
              .catch(e => {
                console.error(e.stack);
                res.status(500).send("エラーが発生しました");
              });
          }
        })
        .catch(e => {
          console.error(e.stack);
          res.status(500).send("エラーが発生しました");
        });
    }
  });
});


// ②在庫チェック
app.post("/checkStocks/", (req, res, next) => {
  const productName = req.body.checkName; // ユーザーが入力した商品名
  pool.connect((err, client) => {
    if (err) {
      console.log(err);
    } else {
      // 商品名入力の有無によって異なるSELECT文をqueryに格納する
      let query; 
      if (productName) {
        // 商品名が指定された場合に在庫数を取得する
        query = {
          text: "SELECT productQuantity FROM stocks WHERE productName = $1",
          values: [productName]
        };
      } else {
        // 商品名が指定されなかった場合に全ての商品名と在庫数を取得する
        query = {
          text: "SELECT productName, productQuantity FROM stocks",
        };
      }
      // queryを実行
      client.query(query, (error, results) => {
        if (error) {
          console.error(error.stack);
        } else {
          // 商品名が指定された場合は在庫数のみを返す
          if (productName) {
            if (results.rows.length > 0) {
              console.log(results.rows[0].productquantity)
              res.render("stocks.ejs",{ 
                message:"データを消去できます",
                responseName: '商品名',
                responseQuantity: 0,
                checkName:productName,
                checkQuantity:results.rows[0].productquantity,
                checkAll:"商品名を入力しない場合、全てのデータを表示します"});
            } else {
              res.render("stocks.ejs",{
                message:"データを消去できます",
                responseName: '商品名',
                responseQuantity: 0,
                checkQuantity: 0,
                checkName:productName,
                checkAll:"商品名を入力しない場合、全てのデータを表示します"
              });
            }
          } 
          // 商品名が指定されなかった場合は全商品の在庫情報を返す
          else {
            console.log(results.rows)
            res.render("stocks.ejs",{
              message:"データを消去できます",
              responseName: '商品名',
              responseQuantity: 0,
              checkName: "商品名",
              checkQuantity: 0,
              checkAll:results.rows});
          }
         }
        }
      );
    }
  })
}
)

//salesページの表示
app.get("/sales/", (req, res, next) => {
  res.render("sales.ejs",{
      responseName: '商品名',
      responseQuantity: 0,
      checkName: "商品名",
      checkQuantity: 0,
      totalAmount:0
    });
  })


// ③販売
app.post("/sellProduct/", (req, res, next) => {
  const productName = req.body.name;
  const quantity = req.body.amount;
  const price = req.body.price; // 商品価格はユーザーの言い値と仮定する
  console.log(productName);
  console.log(quantity);
  console.log(price);
  pool.connect((err, client) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      // stocksから商品情報を取得する
      const getProductQuery = {
        text: "SELECT productId, productQuantity FROM stocks WHERE productName = $1", 
        values: [productName]
      };
      // stocksで在庫を更新する
      const updateStockQuery = {
        text: "UPDATE stocks SET productQuantity = productQuantity - $1 WHERE productName = $2",
        values: [quantity, productName]
      };
      // salesに売上を追加する
      client.query(getProductQuery, (error, result) => {
        if (error) {
          console.error(error.stack);
          res.status(500).send("Internal Server Error");
        } else {
          if (result.rows.length > 0) {
            const productId = result.rows[0].productId;
            const totalAmount = price * quantity; // 言い値の商品価格と数量から計算
            const addSalesQuery = {
              text: "INSERT INTO sales (productid, salesQuantity, salesTotal) VALUES ($1, $2, $3)",
              values: [productId, quantity, totalAmount]
            };
            // 売上テーブルに売上を追加
            client.query(addSalesQuery, (error) => {
              if (error) {
                console.error(error.stack);
                res.status(500).send("Internal Server Error");
              } else {
                // 在庫テーブルの在庫を減少
                client.query(updateStockQuery, (error) => {
                  if (error) {
                    console.error(error.stack);
                    res.status(500).send("Internal Server Error");
                  } else {
                    res.render("sales.ejs", {
                      responseName: '商品名',
                      responseQuantity: 0,
                      checkName: "商品名",
                      checkQuantity: 0,
                      totalAmount: 0
                    });
                  }
                });
              }
            });
          } else {
            res.status(404).send(`"${productName}"は在庫にありません`);
          }
        }
      });
    }
  });
});


//res.send(`Sold ${quantity} ${productName}(s) for a total of ${totalAmount}`);

// ④売上合計確認
app.get("/totalSalesAmount/", (req, res, next) => {
  pool.connect((err, client) => {
    if (err) {
      console.log(err);
      res.status(500).send("Internal Server Error");
    } else {
      // 売上金額の合計を計算する
      const totalSalesQuery = {
        text: "SELECT SUM(salesTotal) as totalAmount FROM sales"
      };
      client.query(totalSalesQuery, (error, result) => {
        if (error) {
          console.error(error.stack);
          res.status(500).send("Internal Server Error");
        } else {
          const totalAmount = result.rows[0].totalamount;
          res.render("sales.ejs", { 
            responseName: '商品名',
            responseQuantity: 0,
            checkName: "商品名",
            checkQuantity: 0,
            totalAmount: totalAmount });
        }
      });
    }
  });
});


app.listen(PORT, function(err) {
  if (err) console.log(err);
  console.log("Start Server!");
});


/////////////////////境界線/////////////////////////


