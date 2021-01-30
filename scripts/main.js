var table          = document.querySelector("table");                   //文献のリストを表示するテーブル
var addButton      = document.querySelector("#addButton");              //文献の追加ボタン
var filterCategory = document.querySelector("#filter");                 //フィルターの選択肢(デフォルト値：「すべて」)
var filterButton   = document.querySelector("#filterButton");           //フィルターの絞り込むボタン
var biblioInfo     = document.querySelectorAll("input[type = text]");   //文献情報入力フォーム

main();

//フォームすべてに入力があるときにのみ「追加」ボタンを有効化する
function setupInputForm(input) {
    for (const elem of input) {
        elem.addEventListener("input", function() {
            if (isAllInput(input)) {
                addButton.setAttribute("class", "button");
            } else {
                addButton.setAttribute("class", "disabled");
            }
        });
    }
}

function isAllInput(input) {
    for (const elem of input) {
        if (elem.value.length === 0) {
            return false;
        }
    }
    return true;
}

function displayBiblio(db, category) {
    //文献リストをクリアする
    while (table.firstChild) {
        table.removeChild(table.firstChild);
    }

    var row = document.createElement("tr");
    table.appendChild(row);

    var rowTitle    = document.createElement("th");
    var rowAuthor   = document.createElement("td");
    var rowCategory = document.createElement("td");
    var rowIsbn     = document.createElement("td");

    rowTitle.textContent    = "タイトル";
    rowAuthor.textContent   = "著者";
    rowCategory.textContent = "カテゴリ";
    rowIsbn.textContent     = "ISBN";

    row.appendChild(rowTitle);
    row.appendChild(rowAuthor);
    row.appendChild(rowCategory);
    row.appendChild(rowIsbn);

    select(db, category);
    console.log("Biblio all displayed");
}

function select(db, category) {
  var objectStore = db.transaction("biblio", "readwrite").objectStore("biblio");
  objectStore.openCursor().onsuccess = function (e) {
  };
}

function main() {
    setupInputForm(biblioInfo);
    console.log("setupInputForm succeeded");

    var db;
    window.onload = function() {
        if (!window.indexedDB) {
            window.alert(
                "このブラウザーは安定版の IndexedDB をサポートしていません。"
            );
            return;
        }

        biblioInfo[0].focus();

        var request = window.indexedDB.open("Biblio", 1);
        request.onerror = function() {
            console.log("Database failed to open");
            return;
        };

        //DBのスキーマの設定
        request.onupgradeneeded = function(e) {
            var db = e.target.result;
            var objectStore = db.createObjectStore("biblio", {
                keyPath:       "id",
                autoIncrement: true,
            });
            objectStore.createIndex("title"   , "title"   , { unique: false });
            objectStore.createIndex("author"  , "author"  , { unique: false });
            objectStore.createIndex("category", "category", { unique: false });
            objectStore.createIndex("isbn"    , "isbn"    , { unique: false });
            console.log("Database setup complete");
        };

        request.onsuccess = function() {
            console.log("Databse opened successfully");
            db = request.result;
            displayBiblio(db, "すべて");
        };
    };
}