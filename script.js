// Additional functionality for the resume builder

document.addEventListener('DOMContentLoaded', function() {
    // Mobile navigation toggle
    const navbarToggler = document.querySelector('.navbar-toggler-btn');
    const navbar = document.querySelector('.navbar');
    
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            
            // Add mobile menu functionality here if needed
            console.log('Mobile menu toggled');
        });
    }

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Add loading states to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            if (this.classList.contains('btn-primary') || this.classList.contains('btn-secondary')) {
                this.classList.add('loading');
                const originalText = this.innerHTML;
                this.innerHTML = '<span class="loading"></span> Loading...';
                
                // Remove loading state after a delay (simulate processing)
                setTimeout(() => {
                    this.classList.remove('loading');
                    this.innerHTML = originalText;
                }, 2000);
            }
        });
    });

    // Form field focus effects
    document.querySelectorAll('.form-control').forEach(field => {
        field.addEventListener('focus', function() {
            this.closest('.form-elem').classList.add('focused');
        });
        
        field.addEventListener('blur', function() {
            this.closest('.form-elem').classList.remove('focused');
        });
    });

    // Auto-resize textareas
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    });

    // File input styling
    document.querySelectorAll('input[type="file"]').forEach(fileInput => {
        fileInput.addEventListener('change', function() {
            const fileName = this.files[0]?.name || 'No file chosen';
            const label = this.closest('.form-elem').querySelector('.form-label');
            if (label) {
                const fileInfo = document.createElement('span');
                fileInfo.className = 'file-info';
                fileInfo.textContent = fileName;
                
                // Remove existing file info
                const existingInfo = label.querySelector('.file-info');
                if (existingInfo) {
                    existingInfo.remove();
                }
                
                label.appendChild(fileInfo);
            }
        });
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (typeof saveResume === 'function') {
                saveResume();
            }
        }
        
        // Ctrl/Cmd + P to print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            if (typeof printCV === 'function') {
                printCV();
            }
        }
    });

    // Add tooltips to buttons
    const tooltipButtons = document.querySelectorAll('[aria-label]');
    tooltipButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            const tooltip = document.createElement('div');
            tooltip.className = 'tooltip';
            tooltip.textContent = this.getAttribute('aria-label');
            document.body.appendChild(tooltip);
            
            const rect = this.getBoundingClientRect();
            tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
            tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        });
        
        button.addEventListener('mouseleave', function() {
            const tooltip = document.querySelector('.tooltip');
            if (tooltip) {
                tooltip.remove();
            }
        });
    });

    // Add confirmation for form reset
    const form = document.getElementById('cv-form');
    if (form) {
        form.addEventListener('reset', function(e) {
            if (!confirm('Are you sure you want to clear all form data? This action cannot be undone.')) {
                e.preventDefault();
            }
        });
    }

    // Performance optimization: Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // Add accessibility improvements
    document.querySelectorAll('.form-control').forEach(field => {
        // Add aria-describedby for error messages
        const errorSpan = field.nextElementSibling;
        if (errorSpan && errorSpan.classList.contains('form-text')) {
            field.setAttribute('aria-describedby', errorSpan.id || 'error-' + Math.random().toString(36).substr(2, 9));
        }
    });

    // Add form completion percentage
    function updateCompletionPercentage() {
        const requiredFields = form.querySelectorAll('[required]');
        const filledFields = Array.from(requiredFields).filter(field => field.value.trim() !== '');
        const percentage = Math.round((filledFields.length / requiredFields.length) * 100);
        
        // Update progress indicator if it exists
        const progressIndicator = document.querySelector('.progress-indicator');
        if (progressIndicator) {
            const percentageDisplay = progressIndicator.querySelector('.completion-percentage');
            if (!percentageDisplay) {
                const percentageElement = document.createElement('div');
                percentageElement.className = 'completion-percentage';
                percentageElement.innerHTML = `<span class="percentage-text">${percentage}% Complete</span>`;
                progressIndicator.appendChild(percentageElement);
            } else {
                percentageDisplay.querySelector('.percentage-text').textContent = `${percentage}% Complete`;
            }
        }
    }

    // Update completion percentage on form changes
    if (form) {
        form.addEventListener('input', updateCompletionPercentage);
        updateCompletionPercentage(); // Initial calculation
    }
});

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Export utility functions for global access
window.debounce = debounce;
window.throttle = throttle;

// form repeater
$(document).ready(function(){
    $('.repeater').repeater({
        initEmpty: false,
        defaultValues: {
            'text-input': ''
        },
        show:function(){
            $(this).slideDown();
        },
        hide: function(deleteElement){
            $(this).slideUp(deleteElement);
            setTimeout(() => {
                generateCV();
            }, 500);
        },
        isFirstItemUndeletable: true
    })
})