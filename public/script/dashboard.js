let expandButton = document.getElementById("expand-button");
expandButton.onclick = function(){
     let textDiv = document.getElementById('expandableText');

     if (textDiv.style.maxHeight <= '300px') {
         textDiv.style.maxHeight = 'none';
         expandButton.textContent = 'Read less';
     } 
     else {
         textDiv.style.maxHeight = '300px';
         expandButton.textContent = 'Read more';
     }
 };

   function showCommunityPage(){
       const churchCommunity = document.getElementById("churchCommunity");
       const devotionContainer = document.getElementById("devotionContainer");
       const todayQuote = document.getElementById("todayQuote");
       const communityContainer = document.getElementById("communityContainer");
       const dailyDevotion = document.getElementById("dailyDevotion");
       const today = document.getElementById("today");
     
       devotionContainer.style.display = "none";
       todayQuote.style.display = "none";
       communityContainer.style.display = "block";
       dailyDevotion.style.display = "block";
       churchCommunity.classList.add("churchCommunity");
       today.classList.remove("today");
   }
    
   function showTodayPage(){
       const today = document.getElementById("today");
       const devotionContainer = document.getElementById("devotionContainer");
       const todayQuote = document.getElementById("todayQuote");
       const communityContainer = document.getElementById("communityContainer");
       const dailyDevotion = document.getElementById("dailyDevotion");
       devotionContainer.style.display = "block";
       todayQuote.style.display = "block";
       communityContainer.style.display = "none";
       dailyDevotion.style.display = "none";
       churchCommunity.classList.remove("churchCommunity");
       today.classList.add("today");
   }