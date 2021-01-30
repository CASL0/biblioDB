
var table          = document.querySelector('table');                   //文献のリストを表示するテーブル
var addButton      = document.querySelector('#addButton');              //文献の追加ボタン
var filterCategory = document.querySelector('#filter');                 //フィルターの選択肢(デフォルト値：「すべて」)
var filterButton   = document.querySelector('#filterButton');           //フィルターの絞り込むボタン
var biblioInfo     = document.querySelectorAll('input[type = text]');   //文献情報入力フォーム

setupInputForm(biblioInfo);


//フォームすべてに入力があるときにのみ「追加」ボタンを有効化する
function setupInputForm(input)
{
    for(const elem of input)
    {
        elem.addEventListener('input', function()
        {
            if(isAllInput(input))
            {
                addButton.setAttribute('class','button');
            }
            else
            {
                addButton.setAttribute('class','disabled');
            }
        });
    }
}

function isAllInput(input)
{
    for(const elem of input)
    {
        if(elem.value.length === 0)
        {
            return false;
        }
    }
    return true;
}