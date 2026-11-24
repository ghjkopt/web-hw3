
// app.js : 영화 배열을 다루는 함수와 카드 그리기
// 김수연(2651012) / 실습과제 #3

// 상세 팝업
const dialog = document.getElementById("detail");


// average : 영화 배열 ⇒ 평균 평점(숫자)
function average(list) {
    let sum = 0;

    for (const m of list) {
        sum += m.rating;
    }

    return sum / list.length;
}


// best : 영화 배열 ⇒ 평점이 가장 높은 영화 객체
function best(list) {
    let top = list[0];

    for (const m of list) {
        if (m.rating > top.rating) {
            top = m;
        }
    }

    return top;
}


// filterByRating : 영화 배열, 최소 평점 ⇒ 그 이상인 영화만 담은 새 배열
function filterByRating(list, min) {
    return list.filter(m => m.rating >= min);
}


// yearSince : 날짜 문자열 ⇒ 올해까지 몇 년(숫자)
function yearSince(dateStr) {
    return new Date().getFullYear() - new Date(dateStr).getFullYear();
}


// posterUrl : 포스터 경로, 크기 ⇒ TMDB 이미지 주소(문자열)
function posterUrl(path, size) {
    return "https://image.tmdb.org/t/p/" + size + path;
}


// search : 영화 배열, 검색어 ⇒ 제목에 검색어가 포함된 새 배열
function search(list, keyword) {
    const word = keyword.trim().toLowerCase();

    return list.filter(m => m.title.toLowerCase().includes(word));
}


// sortBy : 영화 배열, 키 이름, 내림차순 여부 ⇒ 정렬한 새 배열
function sortBy(list, key, desc) {
    const copy = [...list];

    copy.sort((a, b) => {
        if (typeof a[key] === "string") {
            return a[key].localeCompare(b[key]);
        }

        return a[key] - b[key];
    });

    if (desc) {
        copy.reverse();
    }

    return copy;
}


// renderCards : 영화 배열 ⇒ 보드에 카드 생성(반환값 없음)
function renderCards(list) {
    const board = document.getElementById("board");

    board.innerHTML = "";

    for (const m of list) {
        const card = document.createElement("article");

        card.className = "card";

        // 영화 종류와 제목 저장
        card.setAttribute("data-type", m.type);
        card.setAttribute("data-title", m.title);

        // 평점 8 이상 강조
        if (m.rating >= 8) {
            card.classList.add("hot");
        }

        // 포스터 또는 대체 표지
        let posterHTML = "";

        if (m.poster === null) {
            card.classList.add("no-poster");

            posterHTML = `<div class="poster-fallback">${m.title[0]}</div>`;
        } else {
            posterHTML = `<img class="poster" src="${posterUrl(m.poster, "w342")}" alt="${m.title} 포스터">`;
        }

        // 박스오피스 영화에만 순위 표시
        let rankHTML = "";

        if (m.type === "boxoffice") {
            rankHTML = `<span class="rank">${m.rank}</span>`;
        }

        // 찜한 영화의 버튼 클래스
        let likeClass = "like";

        if (liked.includes(m.title)) {
            likeClass = "like liked";
        }

        // 카드 내용
        card.innerHTML = `
            ${posterHTML}
            ${rankHTML}
            <span class="badge">${m.rating}</span>

            <div class="info">
                <h3>${m.title}</h3>
                <p class="year">${m.year}</p>
                <button class="${likeClass}" type="button">♥</button>
            </div>
        `;

        board.appendChild(card);
    }

    // 영화 개수 표시
    document.getElementById("count").textContent = list.length + "편";

    // 찜 개수 표시
    document.getElementById("likeCount").textContent = liked.length;

    // 검색 결과가 없을 때
    if (list.length === 0) {
        board.classList.add("is-empty");
    } else {
        board.classList.remove("is-empty");
    }
}


// getView : 없음 ⇒ 검색, 보기 필터, 정렬을 적용한 새 배열
function getView() {
    const keyword = document.getElementById("q").value;

    const type = document.querySelector('input[name="type"]:checked').value;

    const key = document.getElementById("sort").value;

    // 1. 검색
    let list = search(movies, keyword);

    // 2. 보기 필터
    if (type !== "all") {
        list = list.filter(m => m.type === type);
    }

    // 3. 정렬
    return sortBy(list, key, key !== "title");
}


// refresh : 없음 ⇒ 현재 조건에 맞게 카드 다시 그리기(반환값 없음)
function refresh() {
    renderCards(getView());
}


// openDetail : 영화 제목 ⇒ 영화 상세 팝업 열기(반환값 없음)
function openDetail(title) {
    const m = movies.find(m => m.title === title);

    if (!m) {
        return;
    }

    let posterHTML = "";

    if (m.poster === null) {
        posterHTML = `<div class="poster-fallback">${m.title[0]}</div>`;
    } else {
        posterHTML = `<img src="${posterUrl(m.poster, "w500")}" alt="${m.title} 포스터">`;
    }

    document.getElementById("detailBody").innerHTML = `
        ${posterHTML}
        <h2>${m.title}</h2>
        <p>개봉일: ${m.date}</p>
        <p>평점: ${m.rating}</p>
        <p>${m.overview}</p>
    `;

    dialog.showModal();
}


// 찜한 제목 배열을 브라우저에 저장하고 불러오기
// 교재에 없는 문법: localStorage, JSON
const liked = JSON.parse(localStorage.getItem("liked") || "[]");

// saveLiked : 없음 ⇒ 찜 배열을 브라우저에 저장(반환값 없음)
function saveLiked() {
    localStorage.setItem("liked", JSON.stringify(liked));
}


// 이벤트 리스너

// 검색
document.getElementById("q").addEventListener("input", refresh);

// 정렬
document.getElementById("sort").addEventListener("change", refresh);

// 보기 필터
document.getElementById("typeFilter").addEventListener("change", refresh);


// 보드 클릭 : 이벤트 위임
document.getElementById("board").addEventListener("click", (e) => {

    const card = e.target.closest(".card");

    if (!card) {
        return;
    }

    const title = card.getAttribute("data-title");

    // 찜 버튼을 클릭한 경우
    if (e.target.closest(".like")) {

        const i = liked.indexOf(title);

        if (i === -1) {
            liked.push(title);
        } else {
            liked.splice(i, 1);
        }

        saveLiked();

        refresh();

        return;
    }

    // 찜 버튼이 아닌 카드 부분을 클릭한 경우
    openDetail(title);
});


// 상세 팝업 닫기
document.getElementById("closeDetail").addEventListener("click", () => {
    dialog.close();
});


// 검색창에서 Esc를 누르면 검색어 초기화
document.getElementById("q").addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        e.target.value = "";
        refresh();
    }
});


// 첫 화면 그리기
refresh();
