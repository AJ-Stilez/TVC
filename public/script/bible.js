const book = document.getElementById("book");
const chapter = document.getElementById("chapter");
const verse = document.getElementById("verse");
const bookName = document.getElementById("bookName");
const getBook = document.getElementById("getBook");
const chapterNum = document.getElementById("chapterNum");
const verseNum = document.getElementById("verseNum");
// alert("Chapter cannot be zero 0")

book.onchange = function(){
    bookName.textContent = book.value;
//    alert(book.value);
}

chapter.onchange = function(){
    if(chapter.value <= 0){
        alert("Chapter cannot be less than 1");
        chapter.value = 1;
}
chapterNum.textContent =  `${chapter.value}`;
}
verse.onchange = function(){
    if(verse.value <= 0){
        alert("Verse cannot be less than 1");
        verse.value = 1;
    }
    verseNum.textContent =  `: ${verse.value}`;
}

function bible(event){
    event.preventDefault();
}