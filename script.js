// Get the header, menu button, and all navigation links.
const header = document.querySelector("header");
const menuButton = document.querySelector(".menu");
const navLinks = document.querySelectorAll(".nav-items a");

// This function closes the mobile menu.
function closeMenu() {
  header.classList.remove("nav-open");
  menuButton.setAttribute("aria-expanded", "false");
  menuButton.setAttribute("aria-label", "Open navigation menu");
}

// Only run the menu code if the page has a menu button.
if (header && menuButton) {
  // Open or close the menu when the menu button is clicked.
  menuButton.addEventListener("click", function () {
    header.classList.toggle("nav-open");

    // Tell the browser if the menu is open or closed.
    const menuIsOpen = header.classList.contains("nav-open");
    menuButton.setAttribute("aria-expanded", String(menuIsOpen));
    menuButton.setAttribute(
      "aria-label",
      menuIsOpen ? "Close navigation menu" : "Open navigation menu",
    );
  });

  // Close the menu after clicking any navigation link.
  navLinks.forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  // Close the mobile menu if the screen becomes desktop size.
  window.addEventListener("resize", function () {
    if (window.innerWidth > 768) {
      closeMenu();
    }
  });
}
