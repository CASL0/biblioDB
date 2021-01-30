var table          = document.querySelector("table");                   //文献のリストを表示するテーブル
var addButton      = document.querySelector("#addButton");              //文献の追加ボタン
var filterCategory = document.querySelector("#filter");                 //フィルターの選択肢(デフォルト値：「すべて」)
var filterButton   = document.querySelector("#filterButton");           //フィルターの絞り込むボタン
var biblioInfo     = document.querySelectorAll("input[type = text]");   //文献情報入力フォーム
var db;

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

function displayBiblio(category) {
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

    select(category);
    console.log("Biblio all displayed");
}

function select(category) {
    var objectStore = db.transaction("biblio", "readwrite").objectStore("biblio");
    objectStore.openCursor().onsuccess = function (e) {
        var cursor = e.target.result;
        if (cursor) {
            addNewCategory(cursor.value.category);

            //カーソルを当てているエントリーが、表示の対象外の場合はスキップ
            if (category !== "すべて" && cursor.value.category !== category) {
                cursor.continue();
            }

            var tr = document.createElement("tr");
            table.appendChild(tr);
            var thTitle    = document.createElement("th");
            var tdAuthor   = document.createElement("td");
            var tdCategory = document.createElement("td");
            var tdIsbn     = document.createElement("td");

            tr.appendChild(thTitle);
            tr.appendChild(tdAuthor);
            tr.appendChild(tdCategory);
            tr.appendChild(tdIsbn);
            tr.setAttribute("biblio-id", cursor.value.id);

            thTitle.textContent    = cursor.value.title;
            tdAuthor.textContent   = cursor.value.author;
            tdCategory.textContent = cursor.value.category;
            tdIsbn.textContent     = cursor.value.isbn;
            
            createBtnColumn(tr, removeBiblio , "削除");
            createBtnColumn(tr, displayDetail, "詳細");

            cursor.continue();
        }
    };
}

function createBtnColumn(parentRow, eventHandler, btnText) {
    var removeButton = document.createElement("button");
    removeButton.textContent = btnText;
    removeButton.setAttribute("class", "button");
    removeButton.onclick = eventHandler;
    var rowRemoveButton = document.createElement("td");
    rowRemoveButton.appendChild(removeButton);
    rowRemoveButton.setAttribute("class", "buttonTd");
    parentRow.appendChild(rowRemoveButton);
}

function addNewCategory(newCategory) {
    var categories = filterCategory.children;
    for (const elem of categories) {
      if (elem.textContent === newCategory) {
        return;
      }
    }

    //新規カテゴリを追加する
    var option = document.createElement("option");
    option.textContent = newCategory;
    filterCategory.appendChild(option);
}

function showMsg(msgStr) {
    var msg = document.querySelector("#msgAdd");
    msg.textContent = msgStr;
    msg.style.display = "block";
    setTimeout(hideMsg, 2000);
}

function hideMsg() {
    var msg = document.querySelector("#msgAdd");
    msg.style.display = "none";
}

function removeBiblio(event) {
    var row = event.target.parentNode.parentNode;
    var id = Number(row.getAttribute('biblio-id'));
    var transaction = db.transaction('biblio', 'readwrite');
    var objectStore = transaction.objectStore('biblio');
    var request = objectStore.delete(id);
    var index = objectStore.index('category');

    //DBから削除したカテゴリーのアイテムが無くなった場合は、フィルターオプションからも削除する
    index.get(row.children[2].textContent).onsuccess = function (e) {
        if (!(e.target.result)) {
            removeCategory(row);
        }
    }

    transaction.oncomplete = function () {
        row.parentNode.removeChild(row);
    };
}

function removeCategory(row) {
    var category = row.children[2].textContent;
    var categories = filterCategory.children;
    for (var i = 0; i < categories.length; i++) {
        if (categories[i].textContent === category) {
            filterCategory.removeChild(filterCategory.children[i]);
        }
    }
}

function displayDetail(event) {
    
}

function main() {
    setupInputForm(biblioInfo);
    console.log("setupInputForm succeeded");

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

        addButton.addEventListener("click", function () {
          if (addButton.getAttribute("class") === "disabled") {
            return;
          }
          var titleInput    = document.querySelector("#title");
          var authorInput   = document.querySelector("#author");
          var categoryInput = document.querySelector("#category");
          var isbnInput     = document.querySelector("#isbn");

          var newItem = {
            title:    titleInput.value,
            author:   authorInput.value,
            category: categoryInput.value,
            isbn:     isbnInput.value,
          };

          var transaction = db.transaction("biblio", "readwrite");
          var objectStore = transaction.objectStore("biblio");

          var request = objectStore.put(newItem);
          request.onsuccess = function () {
            displayBiblio("すべて");
            titleInput.value = authorInput.value = categoryInput.value = isbnInput.value = "";
            showMsg("追加しました");
            addButton.setAttribute("class", "disabled");
          };
          transaction.oncomplete = function () {
            console.log(
              "Transaction completed: database modification finished"
            );
          };
          transaction.onerror = function () {
            console.log("Transaction not opened due to error");
          };
        });

        filterButton.onclick = function () {
            var category = filter.options[filter.selectedIndex].textContent;
            displayBiblio(category);
        };
    };
}