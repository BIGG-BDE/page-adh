document.addEventListener("DOMContentLoaded", function() {
    let scrollBtn = document.getElementById("scrollTopBtn");
    
    window.addEventListener("scroll", function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        scrollBtn.style.display = "none";
        if (scrollTop > 600) {
            scrollBtn.style.display = "flex";
        } else {
            scrollBtn.style.display = "none";
        }
    })
});

function scrollToTop() {
    window.scrollTo({ top: 0 });
}


