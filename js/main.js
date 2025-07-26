document.addEventListener('DOMContentLoaded', function() {
    // Menú lateral de temas
    const educationNav = document.querySelector('.education-nav');
    const navTitle = educationNav.querySelector('h3');
    
    // Alternar con clic
    navTitle.addEventListener('click', function() {
        educationNav.classList.toggle('collapsed');
    });
    
    // Alternar con hover
    educationNav.addEventListener('mouseenter', function() {
        if (educationNav.classList.contains('collapsed')) {
            educationNav.classList.remove('collapsed');
        }
    });
    
    // Menú móvil
    const mobileMenuBtn = document.querySelector('.mobile-menu');
    const mainNav = document.querySelector('nav ul');
    
    mobileMenuBtn.addEventListener('click', function() {
        mainNav.style.display = mainNav.style.display === 'flex' ? 'none' : 'flex';
    });
    
    // Ajustar menú en resize
    window.addEventListener('resize', function() {
        if (window.innerWidth > 768) {
            mainNav.style.display = 'flex';
        } else {
            mainNav.style.display = 'none';
        }
    });
});