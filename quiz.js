// Sample Questions

function searchTopic() {
  let input = document.getElementById("searchInput").value.toLowerCase();
  let sections = document.querySelectorAll(".section-card");

  sections.forEach(sec => {
    let text = sec.innerText.toLowerCase();
    if (text.includes(input)) {
      sec.style.display = "block"; // show match
      sec.scrollIntoView({ behavior: "smooth", block: "center" });
      sec.style.border = "2px solid #0077cc"; // highlight match
    } else {
      sec.style.display = "none"; // hide non-match
    }
  });
}
