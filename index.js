
// ================================ //
//// Firebase(Firestore)の接続の処理 ////
// ================================ //

// Firebaseのモジュールをインポート
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";

// Firestoreから取得したい要素をインポート
import { getFirestore, collection, updateDoc, getDoc, doc, getDocs, setDoc,  query, where } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Firebaseの設定 (Firebase Consoleで取得した値に置き換えてください)
const firebaseConfig = {
    apiKey: "AIzaSyA7kATZAWIf6SrL2pEhk-STMnmK3q3t-rE",
    authDomain: "bookindex-55f18.firebaseapp.com",
    databaseURL: "https://bookindex-55f18-default-rtdb.firebaseio.com",
    projectId: "bookindex-55f18",
    storageBucket: "bookindex-55f18.firebasestorage.app",
    messagingSenderId: "767766531773",
    appId: "1:767766531773:web:abb8494e48e50f70dcb1d4",
    measurementId: "G-8RH7W5Z7JP"
};

// Firebaseアプリを初期化
const app = initializeApp(firebaseConfig);

// Firestoreを初期化
const db = getFirestore(app);
console.log("Firestoreの初期化が完了しました！");


///////////////////////////////////////////////////////////////////////////////////////////////////

// =================================== //
//// 予測変換の処理を検索フォームに反映 ////
// =================================== //

// 入力フィールドのイベントを設定
document.getElementById("searchInput").addEventListener("input", handleInputEvent);

// ================= //
//// 予測変換の処理 ////
// ================= //

// Firestoreから候補を取得
async function fetchPredictions(inputText) {
    try {
        const colRef = collection(db, "booksArray");
        
        // 前方一致クエリを作成
        const q = query(
            colRef,
            where("title", ">=", inputText),
            where("title", "<=", inputText + "\uf8ff")
        );

        // Firestoreクエリを実行
        const querySnapshot = await getDocs(q);

        // 候補リストを作成
        const predictions = [];
        querySnapshot.forEach((doc) => {
            predictions.push(doc.data().title);
        });

        return predictions;
    } catch (error) {
        console.error("予測変換の取得中にエラーが発生しました:", error);
        return [];
    }
}

// 入力イベントに基づいて候補を表示
async function handleInputEvent(event) {
    const inputText = event.target.value.trim(); // 入力テキストを取得
    const suggestionsContainer = document.getElementById("suggestionsList");

    // 入力が空の場合、候補リストをクリア
    if (!inputText) {
        suggestionsContainer.innerHTML = "";
        return;
    }

    // 候補を取得
    const predictions = await fetchPredictions(inputText);

    // 候補を表示
    suggestionsContainer.innerHTML = ""; // 既存の候補をクリア
    predictions.forEach((title) => {
        const li = document.createElement("li");
        li.textContent = title;
        li.className = "suggestion-item";

        // 候補をクリックしたら入力ボックスに反映
        li.addEventListener("click", () => {
            document.getElementById("searchInput").value = title;
            suggestionsContainer.innerHTML = ""; // 候補リストをクリア
        });

        suggestionsContainer.appendChild(li);
    });
}

// ウィンドウ外をクリックした時に候補を非表示にする
window.addEventListener("click", (event) => {
    const suggestionsContainer = document.getElementById("suggestionsList");
    const searchInput = document.getElementById("searchInput");

    // クリックした場所が検索入力フィールドでも候補リストでもない場合
    if (!searchInput.contains(event.target) && !suggestionsContainer.contains(event.target)) {
        suggestionsContainer.innerHTML = ""; // 候補リストをクリア
    }
});


///////////////////////////////////////////////////////////////////////////////////////////////////

// ================= //
//// 「検索」ボタン ////
// ================= //

// 検索ボタンにイベントリスナーを追加
document.getElementById("searchBtn").addEventListener("click", () => {
    const searchTerm = document.getElementById("searchInput").value.trim();
    if (searchTerm) {
        searchBooks(searchTerm);
    } else {
        alert("検索キーワードを入力してください！");
    }
});

// ============================ //
//// 検索フォームのポップアップ ////
// ============================ //

// モーダル２関連の閉じる操作
const closeModalBtn2 = document.getElementById("closeModal2");

// モーダル２関連の操作
const modal_2 = document.getElementById("searchBookModal");
const searchBtn = document.getElementById("searchBtn");

// モーダル２を表示する
searchBtn.addEventListener("click", () => {
    modal_2.style.display = "block";
});

// モーダル２を閉じる
closeModalBtn2.addEventListener("click", () => {
    modal_2.style.display = "none";
});

// モーダル２外をクリックしたときに閉じる
window.addEventListener("click", (event) => {
    if (event.target === modal_2) {
        modal_2.style.display = "none";
    }
});

// ========================== //
//// 検索フォームボタンの処理 ////
// ========================== //

// 結果をHTMLに表示する
async function reflectionDeta(results) {
    try {
        const resultsContainer = document.getElementById("searchResults");
        resultsContainer.innerHTML = ""; // 既存の結果をクリア
        if (results.length > 0) {
            const ul = document.createElement("ul"); // リスト要素を作成
            ul.className = "results-list";

            results.forEach((book) => {
                const li = document.createElement("li");
                li.className = "result-item";

                // 在庫の状態をチェックして表示内容を決定
                const isAvailable = book.BorrowBook_Flag === true || book.BorrowBook_Flag === false;
                li.innerHTML = `
                <div class="book-info">
                    <div class="info-txt">
                        <span class="info-item info-No">No.${book.no}</span>
                        <span class="info-item info-title">${book.title}</span><br>
                        <span class="info-item ${isAvailable ? "available" : "unavailable"}">
                            ${isAvailable ? "在庫あり" : "在庫なし"}
                        </span>
                    </div>
                    <div class="info-btn">
                        <button class="borrow-button Borrowbookbtn" ${isAvailable ? "" : "disabled"}>本を借りる</button>
                    </div>
                </div>
                `;

                ul.appendChild(li);
            });
            resultsContainer.appendChild(ul);
            
            // ボタンにイベントを追加
            setBorrowButtonEvents();
        } else {
            resultsContainer.innerHTML = "<p>該当する本は見つかりませんでした。</p>";
        }
    } catch (error) {
        console.error("情報取得中にエラーが発生しました:", error);
        alert("情報取得中にエラーが発生しました");
    }
}

// Firestoreで部分一致検索
async function searchBooks(searchTerm) {
    try {
        // コレクション参照
        const colRef = collection(db, "booksArray");

        // 前方一致検索用クエリ（FirestoreはstartAt/endAtをサポート）
        const q = query(colRef, where("title", ">=", searchTerm), where("title", "<=", searchTerm + "\uf8ff"));

        // クエリを実行
        const querySnapshot = await getDocs(q);

        // 結果を保存する配列
        const results = [];

        // クエリ結果を処理
        querySnapshot.forEach((doc) => {
            results.push({
                id: doc.id,
                ...doc.data(),
            });
        });

        // 検索結果を表示して、結果をHTMLに反映させる
        reflectionDeta(results)
        console.log("検索結果:", results);

    } catch (error) {
        console.error("検索中にエラーが発生しました:", error);
        alert("検索中にエラーが発生しました。");
    }
}

// ======================== //
//// 本を借りるボタンの処理 ////
// ======================== //

// 日付を "yyyy/mm/dd" 形式でフォーマットする
function formatDate(date) {

    // 年、月、日にち、曜日を設定
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // 月は0から始まるため+1し、2桁に揃える
    const day = String(date.getDate()).padStart(2, '0'); // 日を2桁に揃える
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    const dayOfWeek = weekdays[date.getDay()]; // 曜日を取得

    // 戻り値として返す
    return `${year}/${month}/${day}(${dayOfWeek})`;
}

// 営業日の計算
function DaysLater(startDate, days) {

    let date = new Date(startDate); // 開始日を基準に新しいDateオブジェクトを作成
    let addedDays = 0;

    // 営業日を日数分カウントする
    while (addedDays < days) {
        date.setDate(date.getDate() + 1); // 日付を1日進める

        // 土日以外であれば営業日としてカウント
        if (date.getDay() !== 0 && date.getDay() !== 6) {
            addedDays++;
        }
    }

    // 戻り値として返す
    return date;
}

// Firebase内のデータを更新する関数
async function updateDates(docId, newBorrowedDate, newReturnDate) {
    try {
        // 更新対象のドキュメントを指定
        const docRef = doc(db, "booksArray", docId);

        // 更新内容を設定(ここでは『本を借りる日』と『本を返す日』を設定)
        await updateDoc(docRef, {
            borrowedDate: newBorrowedDate,
            returnDate: newReturnDate,
        });

        console.log("データを更新しました！");
    } catch (error) {
        console.error("データ更新中にエラーが発生しました:", error);
        alert("更新中にエラーが発生しました。もう一度試してください！");
    }
}

// Firestoreからデータを呼び出し、HTMLに反映する
async function getData(bookkey) {
    try {
        const docRef = doc(db, "booksArray", bookkey); // ドキュメントIDを指定
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            console.log("データを取得しました:", docSnap.data());

            // データをHTMLに追加
            const bookList = document.getElementById("bookList");
            const bookData = docSnap.data();
            
            // 新しい要素の作成
            const newItem = document.createElement("div");
            newItem.className = "list";
            newItem.innerHTML = `
                <div class="item-box box1">
                    <div class="items1">
                        <div class="item">${bookData.no || "N/A"}</div>
                    </div>
                    <div class="items2">
                        <div class="item">${bookData.title || "タイトル不明"}</div>
                    </div>
                    <div class="items2">
                        <div class="item">${bookData.author || "著者不明"}</div>
                    </div>
                    <div class="items2">
                        <div class="item">${bookData.borrowedDate || "未設定"}</div>
                    </div>
                    <div class="items2">
                        <div class="item">${bookData.returnDate || "未設定"}</div>
                    </div>
                </div>
                <button class="item-btn">本を返す</button>
            `;

            // 作成した要素をHTMLに追加
            bookList.appendChild(newItem);
        } else {
            console.log("指定されたドキュメントは存在しません！");
        }
    } catch (error) {
        console.error("データ取得中にエラーが発生しました:", error);
    }
}


///////////////////////////////////////////////////////////////////////////////////////////////////

// ====================== //
//// 「本を借りる」ボタン ////
// ====================== //

// 「本を借りる」ボタンのイベント設定
function setBorrowButtonEvents() {
    const borrowButtons = document.querySelectorAll(".Borrowbookbtn");
    borrowButtons.forEach((button) => {
        button.addEventListener("click", () => {
            
            // 親要素 .book-info を取得して本の『No.』を更に取得
            const bookInfo = button.closest(".book-info");
            const bookkeyElement = bookInfo.querySelector(".info-No")
            const bookkeytxt = bookkeyElement.textContent

            // 取得した文字列から『No.』を削除して、数値のみを取得して「No.」を削除した結果を表示
            const bookNo = bookkeytxt.replace("No.", "").trim();
            console.log(bookNo); 

            // 本のkeyを取得して、結果を表示
            const bookkey = `key${bookNo}`;
            console.log(bookkey); 

            // 本を借りた日を設定
            const today = new Date();
            const newBorrowedDate = formatDate(today); // フォーマットに合わせて表示
            console.log(newBorrowedDate);

            // 本を返す日を設定
            const newReturnDate = formatDate(DaysLater(today, 5)); // フォーマットに合わせて表示
            console.log(newReturnDate);

            // 更新処理を実行
            updateDates(bookkey, newBorrowedDate, newReturnDate);

            // 取得処理を実行
            getData(bookkey)

            // 検索欄を初期化して、モーダルを閉じる
            const searchInput = document.getElementById("searchInput");
            searchInput.value = ""
            modal_2.style.display = "none";
            
            // 本のタイトルを取得して、アラートとログを表示する
            const bookTitle = bookInfo.querySelector(".info-title").textContent;
            console.log(`"${bookTitle}" を借りました！`)
        });
    });
}


///////////////////////////////////////////////////////////////////////////////////////////////////

// ========================== //
//// 「新しい本を追加」ボタン ////
// ========================== //

// 「本を追加」ボタンのイベント
document.getElementById("addBookBtn").addEventListener("click", addNewBook);

// ============================== //
//// 新しい本を追加のポップアップ ////
// ============================== //

// モーダル１関連の閉じる操作
const closeModalBtn1 = document.getElementById("closeModal1");

// モーダル１関連の操作
const modal_1 = document.getElementById("addBookModal");
const showModalBtn = document.getElementById("showModalBtn");

// モーダル１を表示する
showModalBtn.addEventListener("click", () => {
    modal_1.style.display = "block";
});

// モーダル１を閉じる
closeModalBtn1.addEventListener("click", () => {
    modal_1.style.display = "none";
});

// モーダル１外をクリックしたときに閉じる
window.addEventListener("click", (event) => {
    if (event.target === modal_1) {
        modal_1.style.display = "none";
    }
});

// ============================ //
//// 新しい本を追加ボタンの処理 ////
// ============================ //

// 新しい本を追加する関数
async function addNewBook() {
    try {
        // コレクション参照
        const colRef = collection(db, "booksArray");
        
        // コレクション内のドキュメントをすべて取得
        const snapshot = await getDocs(colRef);
        const docCount = snapshot.size; // 現在のドキュメント数

        // 新しいkeyとnoを生成
        const newKey = `key${docCount + 1}`;
        const newNo = docCount + 1;

        // ユーザーが入力したデータを取得
        const title = document.getElementById("newTitle").value;
        const author = document.getElementById("newAuthor").value;

        // 必要なフィールドが入力されているか確認
        if (!title || !author) {
            alert("すべてのフィールドを入力してください！");
            return;
        }

        // 新しいドキュメントを追加
        await setDoc(doc(db, "booksArray", newKey), {
            no: newNo,
            title,
            author,
            borrowedDate: "",
            returnDate: "",
            BorrowBook_Flag: true,
        });

        console.log(`新しいドキュメントを追加しました！key: ${newKey},タイトル名 ${title}`);

        // モーダルを閉じる
        modal_1.style.display = "none";

        // 入力フィールドをリセット
        document.getElementById("newTitle").value = "";
        document.getElementById("newAuthor").value = "";
    } catch (error) {
        console.error("ドキュメント追加中にエラーが発生しました:", error);
        alert("ドキュメント追加中にエラーが発生しました。もう一度試してください！");
    }
}
