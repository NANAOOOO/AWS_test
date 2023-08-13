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

// // 在庫DBに接続
// var pool = new pg.Pool({
//   database: "在庫",
//   user: "postgrel", //ユーザー名はデフォルト以外を利用した人は適宜変更すること
//   password: "postgrel", //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
//   host: "localhost",
//   port: 5432
// });

// // 売上DBに接続
// var pool = new pg.Pool({
//   database: "売上",
//   user: "postgrel", //ユーザー名はデフォルト以外を利用した人は適宜変更すること
//   password: "postgrel", //PASSWORDにはPostgreSQLをインストールした際に設定したパスワードを記述。
//   host: "localhost",
//   port: 5432
// });

// //⑤在庫と売上のデータを全削除 --ここは時間ができてから
// app.post('/deleteAll', async (req, res) => {
//   try {
//     await pool.query('DELETE FROM stock');
//     await pool.query('DELETE FROM sales');
//     res.json({ message: '在庫と売上を削除しました' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'エラーが発生しました' });
//   }
// });

//stocksページの表示
app.get("/stocks/", (req, res, next) => {
  res.render("stocks.ejs")
})

//①在庫の更新・作成
// app.post("/stocksUpdate/", (req, res, next) => {
//   console.log(req.body);
//   // ユーザーが入力した商品についてy既存の在庫を取得する
//   var existingStockQuery = {
//     text: "SELECT * FROM stocks WHERE productName = $1",
//     values: [req.body.name]
//   };
//   // 新しい在庫情報を挿入する
//   var insertQuery = {
//     text:
//       "INSERT INTO stocks (productName, productQuantity, productPrice) VALUES($1, $2, $3)",
//     values: [req.body.name, req.body.quantity, req.body.price]
//   };
//   pool.connect((err, client) => {
//     if (err) {
//       console.log(err);
//     } else {
//       // 同商品の在庫を取得
//       client
//         .query(existingStockQuery)
//         //＜同商品の在庫がある場合＞
//         .then(result => {
//           if (result.rows.length > 0) {            
//             // 例: 在庫を増やす
//             const existingQuantity = result.rows[0].productquantity;
//             const newQuantity = existingQuantity + req.body.quantity;
//             // 在庫を更新する
//             var updateQuery = {
//               text: "UPDATE stocks SET productQuantity = $1 WHERE productName = $2",
//               values: [newQuantity, req.body.name]
//             };
//             client
//               .query(updateQuery)
//               .then(() => {
//                 res.send("Stock Updated.");
//               })
//               .catch(e => {
//                 console.error(e.stack);
//               });
//           } else {
//             // ＜同商品の在庫がない場合＞
//             client
//              //在庫を追加する
//               .query(insertQuery)
//               .then(() => {
//                 res.send("Data Added.");
//               })
//               .catch(e => {
//                 console.error(e.stack);
//               });
//           }
//         })
//         .catch(e => {
//           console.error(e.stack);
//         });
//     }
//   });
// });

// // ②在庫チェック
// app.post("/checkStocks/", (req, res, next) => {
//   const productName = req.body.productName; // ユーザーが入力した商品名
//   pool.connect((err, client) => {
//     if (err) {
//       console.log(err);
//     } else {
//       // 商品名入力の有無によって異なるSELECT文をqueryに格納する
//       let query; 
//       if (productName) {
//         // 商品名が指定された場合に在庫数を取得する
//         query = {
//           text: "SELECT productQuantity FROM stocks WHERE productName = $1",
//           values: [productName]
//         };
//       } else {
//         // 商品名が指定されなかった場合に全ての商品名と在庫数を取得する
//         query = {
//           text: "SELECT productName, productQuantity FROM stocks",
//         };
//       }
//       // queryを実行
//       client.query(query, (error, results) => {
//         if (error) {
//           console.error(error.stack);
//         } else {
//           // 商品名が指定された場合は在庫数のみを返す
//           if (productName) {
//             if (results.rows.length > 0) {
//               res.send(`Product: ${productName}, Stock Quantity: ${results.rows[0].productquantity}`);
//             } else {
//               res.send(`Product "${productName}" not found in stock.`);
//             }
//           } 
//           // 商品名が指定されなかった場合は全商品の在庫情報を返す
//           else {
//             res.send(results.rows);
//           }
//         }
//       });
//     }
//   });
// });

//salesページの表示
app.get("/sales/", (req, res, next) => {
  res.render("stocks.ejs")
})

//③販売
// app.post("/sellProduct/", (req, res, next) => {
//   const productName = req.body.productName;
//   const quantity = req.body.quantity;
//   pool.connect((err, client) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send("Internal Server Error");
//     } else {
//       // stocksデータベースから商品情報を取得する
//       const getProductQuery = {
//         text: "SELECT productId, productPrice, productQuantity FROM stocks WHERE productName = $1",
//         values: [productName]
//       };
//       // stocksデータベースで在庫を更新する
//       const updateStockQuery = {
//         text: "UPDATE stocks SET productQuantity = productQuantity - $1 WHERE productName = $2",
//         values: [quantity, productName]
//       };
//       // salesデータベースに売上を追加する
//       const addSalesQuery = {
//         text: "INSERT INTO sales (productId, productName, quantity, amount) VALUES ($1, $2, $3, $4)",
//         values: [null, productName, quantity, null] // productIdとamountは後で更新
//       };
//       client.query(getProductQuery, (error, result) => {
//         if (error) {
//           console.error(error.stack);
//           res.status(500).send("Internal Server Error");
//         } else {
//           if (result.rows.length > 0) {
//             const productId = result.rows[0].productid;
//             const productPrice = result.rows[0].productprice;
//             const totalAmount = productPrice * quantity;
//             // 売上テーブルに売上を追加
//             addSalesQuery.values[0] = productId;
//             addSalesQuery.values[3] = totalAmount;
//             client.query(addSalesQuery, (error) => {
//               if (error) {
//                 console.error(error.stack);
//                 res.status(500).send("Internal Server Error");
//               } else {
//                 // 在庫テーブルの在庫を減少
//                 client.query(updateStockQuery, (error) => {
//                   if (error) {
//                     console.error(error.stack);
//                     res.status(500).send("Internal Server Error");
//                   } else {
//                     res.send(`Sold ${quantity} ${productName}(s) for a total of ${totalAmount}`);
//                   }
//                 });
//               }
//             });
//           } else {
//             res.status(404).send(`Product "${productName}" not found.`);
//           }
//         }
//       });
//     }
//   });
// });

// //④売上合計確認
// app.get("/totalSalesAmount/", (req, res, next) => {
//   pool.connect((err, client) => {
//     if (err) {
//       console.log(err);
//       res.status(500).send("Internal Server Error");
//     } else {
//       // 売上金額の合計を計算するクエリ
//       const totalSalesQuery = {
//         text: "SELECT SUM(amount) as totalAmount FROM sales"
//       };
//       client.query(totalSalesQuery, (error, result) => {
//         if (error) {
//           console.error(error.stack);
//           res.status(500).send("Internal Server Error");
//         } else {
//           const totalAmount = result.rows[0].totalamount;
//           res.send(`Total Sales Amount: ${totalAmount}`);
//         }
//       });
//     }
//   });
// });

app.listen(PORT, function(err) {
  if (err) console.log(err);
  console.log("Start Server!");
});


/////////////////////境界線/////////////////////////


// app.get("/stocks", (req, res, next) => {
//   // データベースからデータを読み込む
//   pool.connect((err, client) => {
//     if (err) {
//       console.log(err);
//     } else {
//       // query関数の第一引数にSQL文をかく
//       client.query("SELECT  FROM 在庫", (err, result) => {
//         res.render("index", {
//           title: "Express",
//           name: result.rows[0].name
//         });

//         //コンソール上での確認用
//         console.log(result);
//       });
//     }
//   });
// });
// app.post("/submitComment/", (req, res, next) => {
//   console.log(req.body);

//   // 新規コメントをDBに追加
//   // 一旦、簡易的にtoName, fromNameを同じに
//   var query = {
//     text:
//       "INSERT INTO comments (toName, fromName, commentText) VALUES($1, $2, $3)",
//     values: [req.body.name, req.body.name, req.body.comment]
//   };

//   pool.connect((err, client) => {
//     if (err) {
//       console.log(err);
//     } else {
//       // query関数の第一引数にSQL文をかく
//       client
//         .query(query)
//         .then(() => {
//           res.send("Data Added.");
//         })
//         .catch(e => {
//           console.error(e.stack);
//         });
//     }
//   });
// });


