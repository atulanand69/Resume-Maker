// regex for validation
const strRegex =  /^[a-zA-Z\s]*$/; // containing only letters
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
/* supports following number formats - (123) 456-7890, (123)456-7890, 123-456-7890, 123.456.7890, 1234567890, +31636363634, 075-63546725 */
const digitRegex = /^\d+$/;

const mainForm = document.getElementById('cv-form');
const validType = {
    TEXT: 'text',
    TEXT_EMP: 'text_emp',
    EMAIL: 'email',
    DIGIT: 'digit',
    PHONENO: 'phoneno',
    ANY: 'any',
}

// user inputs elements
let firstnameElem = mainForm.firstname,
    middlenameElem = mainForm.middlename,
    lastnameElem = mainForm.lastname,
    imageElem = mainForm.image,
    designationElem = mainForm.designation,
    addressElem = mainForm.address,
    emailElem = mainForm.email,
    phonenoElem = mainForm.phoneno,
    summaryElem = mainForm.summary;

// display elements
let nameDsp = document.getElementById('fullname_dsp'),
    imageDsp = document.getElementById('image_dsp'),
    phonenoDsp = document.getElementById('phoneno_dsp'),
    emailDsp = document.getElementById('email_dsp'),
    addressDsp = document.getElementById('address_dsp'),
    designationDsp = document.getElementById('designation_dsp'),
    summaryDsp = document.getElementById('summary_dsp'),
    projectsDsp = document.getElementById('projects_dsp'),
    achievementsDsp = document.getElementById('achievements_dsp'),
    skillsDsp = document.getElementById('skills_dsp'),
    educationsDsp = document.getElementById('educations_dsp'),
    experiencesDsp = document.getElementById('experiences_dsp');

// Progress tracking
let currentStep = 1;
const totalSteps = 4;

// Auto-save functionality
let autoSaveTimer;
const AUTO_SAVE_DELAY = 3000; // 3 seconds

// Global variables
let currentTemplate = 'modern';
let autoSaveInterval;

// Initialize the application
$(document).ready(function() {
    initializeTemplateSelector();
    initializeRepeaters();
    initializeAutoSave();
    initializeFormValidation();
    initializeProgressTracking();
    initializeKeyboardShortcuts();
    initializeTooltips();
    loadSavedData();
    initializeLazyLoading();
    initializeAccessibility();
    initializeAutoResize();
    initializeFileInputs();
});

function initializeApp() {
    // Initialize jQuery repeater
    $('.repeater').repeater({
        initEmpty: false,
        show: function () {
            $(this).slideDown();
            updateProgress();
        },
        hide: function (deleteElement) {
            if(confirm('Are you sure you want to delete this item?')) {
                $(this).slideUp(deleteElement);
                updateProgress();
            }
        },
        ready: function (setIndexes) {
            // Callback after repeater is initialized
        }
    });
}

function setupAutoSave() {
    // Auto-save form data to localStorage
    const formInputs = mainForm.querySelectorAll('input, textarea');
    formInputs.forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                saveFormData();
            }, AUTO_SAVE_DELAY);
        });
    });
}

function saveFormData() {
    const formData = {};
    
    // Collect all form data
    $('#cv-form').find('input, textarea, select').each(function() {
        const name = $(this).attr('name');
        const value = $(this).val();
        if (name && value) {
            formData[name] = value;
        }
    });
    
    // Save repeater data
    $('.repeater').each(function() {
        const repeaterName = $(this).data('repeater-list');
        const repeaterData = $(this).repeaterVal();
        formData[repeaterName] = repeaterData;
    });
    
    // Add template preference
    formData.currentTemplate = currentTemplate;
    
    // Save to localStorage
    localStorage.setItem('resumeData', JSON.stringify(formData));
}

function loadSavedData() {
    const savedData = localStorage.getItem('resumeData');
    if (savedData) {
        const data = JSON.parse(savedData);
        
        // Restore form fields
        Object.keys(data).forEach(key => {
            if (key !== 'currentTemplate' && !key.startsWith('group-')) {
                $(`[name="${key}"]`).val(data[key]);
            }
        });
        
        // Restore template
        if (data.currentTemplate) {
            switchTemplate(data.currentTemplate);
        }
        
        // Restore repeater data
        Object.keys(data).forEach(key => {
            if (key.startsWith('group-')) {
                const repeaterElement = $(`[data-repeater-list="${key}"]`);
                if (repeaterElement.length && data[key]) {
                    repeaterElement.repeaterVal(data[key]);
                }
            }
        });
        
        // Generate CV with restored data
        generateCV();
        
        showNotification('Resume data restored', 'success');
    }
}

function setupProgressTracking() {
    // Update progress based on form completion
    updateProgress();
    
    // Add scroll to step functionality
    document.querySelectorAll('.step').forEach((step, index) => {
        step.addEventListener('click', () => {
            scrollToSection(index + 1);
        });
    });
}

function updateProgress() {
    let completedSections = 0;
    
    // Check personal info
    if (firstnameElem.value && lastnameElem.value && emailElem.value && designationElem.value) {
        completedSections++;
        document.querySelector('[data-step="1"]').classList.add('completed');
    } else {
        document.querySelector('[data-step="1"]').classList.remove('completed');
    }
    
    // Check experience
    const experienceItems = document.querySelectorAll('.exp_title');
    if (experienceItems.length > 0 && experienceItems[0].value) {
        completedSections++;
        document.querySelector('[data-step="2"]').classList.add('completed');
    } else {
        document.querySelector('[data-step="2"]').classList.remove('completed');
    }
    
    // Check education
    const educationItems = document.querySelectorAll('.edu_school');
    if (educationItems.length > 0 && educationItems[0].value) {
        completedSections++;
        document.querySelector('[data-step="3"]').classList.add('completed');
    } else {
        document.querySelector('[data-step="3"]').classList.remove('completed');
    }
    
    // Check skills
    const skillItems = document.querySelectorAll('.skill');
    if (skillItems.length > 0 && skillItems[0].value) {
        completedSections++;
        document.querySelector('[data-step="4"]').classList.add('completed');
    } else {
        document.querySelector('[data-step="4"]').classList.remove('completed');
    }
    
    // Update active step
    document.querySelectorAll('.step').forEach((step, index) => {
        step.classList.remove('active');
        if (index === completedSections) {
            step.classList.add('active');
        }
    });
}

function scrollToSection(stepNumber) {
    const sections = ['about-sc', 'experience-section', 'education-section', 'skills-section'];
    const targetSection = document.querySelector(`#${sections[stepNumber - 1]}`);
    if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function setupFormValidation() {
    // Add real-time validation feedback
    const requiredFields = mainForm.querySelectorAll('[required]');
    requiredFields.forEach(field => {
        field.addEventListener('blur', () => {
            validateField(field);
        });
        
        field.addEventListener('input', () => {
            if (field.classList.contains('error')) {
                validateField(field);
            }
        });
    });
}

function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.getAttribute('name');
    let isValid = true;
    let errorMessage = '';
    
    // Check if required field is empty
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = `${getFieldLabel(fieldName)} is required`;
    } else if (value) {
        // Validate based on field type
        switch (fieldName) {
            case 'email':
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address';
                }
                break;
            case 'phoneno':
                if (!phoneRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid phone number';
                }
                break;
            case 'firstname':
            case 'lastname':
                if (!strRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter only letters';
                }
                break;
        }
    }
    
    // Update field styling
    if (isValid) {
        field.classList.remove('error');
        field.classList.add('valid');
        removeErrMsg(field);
    } else {
        field.classList.remove('valid');
        field.classList.add('error');
        addErrMsg(field, errorMessage);
    }
    
    return isValid;
}

function getFieldLabel(fieldName) {
    const field = mainForm.querySelector(`[name="${fieldName}"]`);
    if (field) {
        const label = field.closest('.form-elem').querySelector('.form-label');
        return label ? label.textContent.replace('*', '').trim() : fieldName;
    }
    return fieldName;
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 3000);
}

// first value is for the attributes and second one passes the nodelists
const fetchValues = (attrs, ...nodeLists) => {
    let elemsAttrsCount = nodeLists.length;
    let elemsDataCount = nodeLists[0].length;
    let tempDataArr = [];

    // first loop deals with the no of repeaters value
    for(let i = 0; i < elemsDataCount; i++){
        let dataObj = {}; // creating an empty object to fill the data
        // second loop fetches the data for each repeaters value or attributes 
        for(let j = 0; j < elemsAttrsCount; j++){
            // setting the key name for the object and fill it with data
            dataObj[`${attrs[j]}`] = nodeLists[j][i].value;
        }
        tempDataArr.push(dataObj);
    }

    return tempDataArr;
}

const getUserInputs = () => {

    // achivements 
    let achievementsTitleElem = document.querySelectorAll('.achieve_title'),
    achievementsDescriptionElem = document.querySelectorAll('.achieve_description');

    // experiences
    let expTitleElem = document.querySelectorAll('.exp_title'),
    expOrganizationElem = document.querySelectorAll('.exp_organization'),
    expLocationElem = document.querySelectorAll('.exp_location'),
    expStartDateElem = document.querySelectorAll('.exp_start_date'),
    expEndDateElem = document.querySelectorAll('.exp_end_date'),
    expDescriptionElem = document.querySelectorAll('.exp_description');

    // education
    let eduSchoolElem = document.querySelectorAll('.edu_school'),
    eduDegreeElem = document.querySelectorAll('.edu_degree'),
    eduCityElem = document.querySelectorAll('.edu_city'),
    eduStartDateElem = document.querySelectorAll('.edu_start_date'),
    eduGraduationDateElem = document.querySelectorAll('.edu_graduation_date'),
    eduDescriptionElem = document.querySelectorAll('.edu_description');

    let projTitleElem = document.querySelectorAll('.proj_title'),
    projLinkElem = document.querySelectorAll('.proj_link'),
    projDescriptionElem = document.querySelectorAll('.proj_description');

    let skillElem = document.querySelectorAll('.skill');

    // event listeners for form validation
    firstnameElem.addEventListener('keyup', (e) => validateFormData(e.target, validType.TEXT, 'First Name'));
    middlenameElem.addEventListener('keyup', (e) => validateFormData(e.target, validType.TEXT_EMP, 'Middle Name'));
    lastnameElem.addEventListener('keyup', (e) => validateFormData(e.target, validType.TEXT, 'Last Name'));
    phonenoElem.addEventListener('keyup', (e) => validateFormData(e.target, validType.PHONENO, 'Phone Number'));
    emailElem.addEventListener('keyup', (e) => validateFormData(e.target, validType.EMAIL, 'Email'));
    addressElem.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Address'));
    designationElem.addEventListener('keyup', (e) => validateFormData(e.target, validType.TEXT, 'Designation'));

    achievementsTitleElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Title')));
    achievementsDescriptionElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Description')));
    expTitleElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Title')));
    expOrganizationElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Organization')));
    expLocationElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, "Location")));
    expStartDateElem.forEach(item => item.addEventListener('blur', (e) => validateFormData(e.target, validType.ANY, 'End Date')));
    expEndDateElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'End Date')));
    expDescriptionElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Description')));
    eduSchoolElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'School')));
    eduDegreeElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Degree')));
    eduCityElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'City')));
    eduStartDateElem.forEach(item => item.addEventListener('blur', (e) => validateFormData(e.target, validType.ANY, 'Start Date')));
    eduGraduationDateElem.forEach(item => item.addEventListener('blur', (e) => validateFormData(e.target, validType.ANY, 'Graduation Date')));
    eduDescriptionElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Description')));
    projTitleElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Title')));
    projLinkElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Link')));
    projDescriptionElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'Description')));
    skillElem.forEach(item => item.addEventListener('keyup', (e) => validateFormData(e.target, validType.ANY, 'skill')));

    return {
        firstname: firstnameElem.value,
        middlename: middlenameElem.value,
        lastname: lastnameElem.value,
        designation: designationElem.value,
        address: addressElem.value,
        email: emailElem.value,
        phoneno: phonenoElem.value,
        summary: summaryElem.value,
        achievements: fetchValues(['achieve_title', 'achieve_description'], achievementsTitleElem, achievementsDescriptionElem),
        experiences: fetchValues(['exp_title', 'exp_organization', 'exp_location', 'exp_start_date', 'exp_end_date', 'exp_description'], expTitleElem, expOrganizationElem, expLocationElem, expStartDateElem, expEndDateElem, expDescriptionElem),
        educations: fetchValues(['edu_school', 'edu_degree', 'edu_city', 'edu_start_date', 'edu_graduation_date', 'edu_description'], eduSchoolElem, eduDegreeElem, eduCityElem, eduStartDateElem, eduGraduationDateElem, eduDescriptionElem),
        projects: fetchValues(['proj_title', 'proj_link', 'proj_description'], projTitleElem, projLinkElem, projDescriptionElem),
        skills: fetchValues(['skill'], skillElem)
    }
};

function validateFormData(elem, elemType, elemName){
    // checking for text string and non empty string
    if(elemType == validType.TEXT){
        if(!strRegex.test(elem.value) || elem.value.trim().length == 0) addErrMsg(elem, elemName);
        else removeErrMsg(elem);
    }

    // checking for only text string
    if(elemType == validType.TEXT_EMP){
        if(!strRegex.test(elem.value)) addErrMsg(elem, elemName);
        else removeErrMsg(elem);
    }

    // checking for email
    if(elemType == validType.EMAIL){
        if(!emailRegex.test(elem.value) || elem.value.trim().length == 0) addErrMsg(elem, elemName);
        else removeErrMsg(elem);
    }

    // checking for phone number
    if(elemType == validType.PHONENO){
        if(!phoneRegex.test(elem.value) || elem.value.trim().length == 0) addErrMsg(elem, elemName);
        else removeErrMsg(elem);
    }

    // checking for only empty
    if(elemType == validType.ANY){
        if(elem.value.trim().length == 0) addErrMsg(elem, elemName);
        else removeErrMsg(elem);
    }
}

// adding the invalid text
function addErrMsg(formElem, formElemName){
    formElem.nextElementSibling.innerHTML = `${formElemName} is invalid`;
    formElem.classList.add('error');
}

// removing the invalid text 
function removeErrMsg(formElem){
    formElem.nextElementSibling.innerHTML = "";
    formElem.classList.remove('error');
}

// show the list data
const showListData = (listData, listContainer) => {
    listContainer.innerHTML = "";
    listData.forEach(listItem => {
        let itemElem = document.createElement('div');
        itemElem.classList.add('preview-item');
        
        for(const key in listItem){
            let subItemElem = document.createElement('span');
            subItemElem.classList.add('preview-item-val');
            subItemElem.innerHTML = `${listItem[key]}`;
            itemElem.appendChild(subItemElem);
        }

        listContainer.appendChild(itemElem);
    })
}

const displayCV = (userData) => {
    nameDsp.innerHTML = userData.firstname + " " + userData.middlename + " " + userData.lastname;
    phonenoDsp.innerHTML = userData.phoneno;
    emailDsp.innerHTML = userData.email;
    addressDsp.innerHTML = userData.address;
    designationDsp.innerHTML = userData.designation;
    summaryDsp.innerHTML = userData.summary;

    showListData(userData.achievements, achievementsDsp);
    showListData(userData.experiences, experiencesDsp);
    showListData(userData.educations, educationsDsp);
    showListData(userData.projects, projectsDsp);
    showListData(userData.skills, skillsDsp);
}

// Generate CV function
function generateCV() {
    // Generate for all templates
    generateModernTemplate();
    generateClassicTemplate();
    generateMinimalTemplate();
    generateExecutiveTemplate();
    
    // Update progress
    updateProgress();
}

function previewImage(){
    const oFReader = new FileReader();
    oFReader.readAsDataURL(imageElem.files[0]);
    oFReader.onload = function (oFREvent) {
        imageDsp.src = oFREvent.target.result;
    };
}

function printCV(){
    window.print();
}

function downloadPDF() {
    // This would require a PDF generation library like jsPDF or html2pdf
    showNotification('PDF download feature coming soon!', 'info');
}

function saveResume() {
    saveFormData();
    showNotification('Resume saved successfully!', 'success');
}

// Export functions for global access
window.generateCV = generateCV;
window.previewImage = previewImage;
window.printCV = printCV;
window.downloadPDF = downloadPDF;
window.saveResume = saveResume;

// Template selector functionality
function initializeTemplateSelector() {
    $('.template-card').on('click', function() {
        const template = $(this).data('template');
        switchTemplate(template);
    });
}

function switchTemplate(template) {
    // Update active template card
    $('.template-card').removeClass('active');
    $(`.template-card[data-template="${template}"]`).addClass('active');
    
    // Hide all templates
    $('.preview-cnt').hide();
    
    // Show selected template
    $(`#template-${template}`).show();
    
    // Update current template
    currentTemplate = template;
    
    // Regenerate CV with new template
    generateCV();
    
    // Show notification
    showNotification(`Switched to ${template.charAt(0).toUpperCase() + template.slice(1)} template`, 'success');
}

// Initialize jQuery repeaters
function initializeRepeaters() {
    $('.repeater').repeater({
        initEmpty: false,
        show: function() {
            $(this).slideDown();
            initializeFormValidation();
        },
        hide: function(deleteElement) {
            if (confirm('Are you sure you want to delete this item?')) {
                $(this).slideUp(deleteElement);
                generateCV();
            }
        },
        ready: function(setIndexes) {
            // Repeater is ready
        }
    });
}

// Auto-save functionality
function initializeAutoSave() {
    autoSaveInterval = setInterval(function() {
        saveFormData();
    }, 3000);
}

function generateModernTemplate() {
    // Personal Information
    const firstname = $('.firstname').val() || '';
    const middlename = $('.middlename').val() || '';
    const lastname = $('.lastname').val() || '';
    const fullname = [firstname, middlename, lastname].filter(Boolean).join(' ');
    
    $('#fullname_dsp').text(fullname);
    $('#designation_dsp').text($('.designation').val() || '');
    $('#phoneno_dsp').text($('.phoneno').val() || '');
    $('#email_dsp').text($('.email').val() || '');
    $('#address_dsp').text($('.address').val() || '');
    $('#summary_dsp').text($('.summary').val() || '');
    
    // Generate other sections
    generateAchievements('achievements_dsp');
    generateExperiences('experiences_dsp');
    generateEducations('educations_dsp');
    generateSkills('skills_dsp');
    generateProjects('projects_dsp');
}

function generateClassicTemplate() {
    // Personal Information
    const firstname = $('.firstname').val() || '';
    const middlename = $('.middlename').val() || '';
    const lastname = $('.lastname').val() || '';
    const fullname = [firstname, middlename, lastname].filter(Boolean).join(' ');
    
    $('#fullname_dsp_classic').text(fullname);
    $('#designation_dsp_classic').text($('.designation').val() || '');
    $('#phoneno_dsp_classic').text($('.phoneno').val() || '');
    $('#email_dsp_classic').text($('.email').val() || '');
    $('#address_dsp_classic').text($('.address').val() || '');
    $('#summary_dsp_classic').text($('.summary').val() || '');
    
    // Generate other sections
    generateAchievements('achievements_dsp_classic', 'classic');
    generateExperiences('experiences_dsp_classic', 'classic');
    generateEducations('educations_dsp_classic', 'classic');
    generateSkills('skills_dsp_classic', 'classic');
}

function generateMinimalTemplate() {
    // Personal Information
    const firstname = $('.firstname').val() || '';
    const middlename = $('.middlename').val() || '';
    const lastname = $('.lastname').val() || '';
    const fullname = [firstname, middlename, lastname].filter(Boolean).join(' ');
    
    $('#fullname_dsp_minimal').text(fullname);
    $('#designation_dsp_minimal').text($('.designation').val() || '');
    $('#phoneno_dsp_minimal').text($('.phoneno').val() || '');
    $('#email_dsp_minimal').text($('.email').val() || '');
    $('#address_dsp_minimal').text($('.address').val() || '');
    $('#summary_dsp_minimal').text($('.summary').val() || '');
    
    // Generate other sections
    generateExperiences('experiences_dsp_minimal', 'minimal');
    generateEducations('educations_dsp_minimal', 'minimal');
    generateSkills('skills_dsp_minimal', 'minimal');
}

function generateExecutiveTemplate() {
    // Personal Information
    const firstname = $('.firstname').val() || '';
    const middlename = $('.middlename').val() || '';
    const lastname = $('.lastname').val() || '';
    const fullname = [firstname, middlename, lastname].filter(Boolean).join(' ');
    
    $('#fullname_dsp_executive').text(fullname);
    $('#designation_dsp_executive').text($('.designation').val() || '');
    $('#phoneno_dsp_executive').text($('.phoneno').val() || '');
    $('#email_dsp_executive').text($('.email').val() || '');
    $('#address_dsp_executive').text($('.address').val() || '');
    $('#summary_dsp_executive').text($('.summary').val() || '');
    
    // Generate other sections
    generateAchievements('achievements_dsp_executive', 'executive');
    generateExperiences('experiences_dsp_executive', 'executive');
    generateEducations('educations_dsp_executive', 'executive');
    generateSkills('skills_dsp_executive', 'executive');
}

// Generate sections with template-specific formatting
function generateAchievements(containerId, template = 'modern') {
    const container = $(`#${containerId}`);
    container.empty();
    
    $('[data-repeater-list="group-a"] [data-repeater-item]').each(function() {
        const title = $(this).find('.achieve_title').val();
        const description = $(this).find('.achieve_description').val();
        
        if (title || description) {
            const item = createAchievementItem(title, description, template);
            container.append(item);
        }
    });
}

function generateExperiences(containerId, template = 'modern') {
    const container = $(`#${containerId}`);
    container.empty();
    
    $('[data-repeater-list="group-b"] [data-repeater-item]').each(function() {
        const title = $(this).find('.exp_title').val();
        const organization = $(this).find('.exp_organization').val();
        const location = $(this).find('.exp_location').val();
        const startDate = $(this).find('.exp_start_date').val();
        const endDate = $(this).find('.exp_end_date').val();
        const description = $(this).find('.exp_description').val();
        
        if (title || organization) {
            const item = createExperienceItem(title, organization, location, startDate, endDate, description, template);
            container.append(item);
        }
    });
}

function generateEducations(containerId, template = 'modern') {
    const container = $(`#${containerId}`);
    container.empty();
    
    $('[data-repeater-list="group-c"] [data-repeater-item]').each(function() {
        const school = $(this).find('.edu_school').val();
        const degree = $(this).find('.edu_degree').val();
        const city = $(this).find('.edu_city').val();
        const startDate = $(this).find('.edu_start_date').val();
        const graduationDate = $(this).find('.edu_graduation_date').val();
        const description = $(this).find('.edu_description').val();
        
        if (school || degree) {
            const item = createEducationItem(school, degree, city, startDate, graduationDate, description, template);
            container.append(item);
        }
    });
}

function generateSkills(containerId, template = 'modern') {
    const container = $(`#${containerId}`);
    container.empty();
    
    $('[data-repeater-list="group-e"] [data-repeater-item]').each(function() {
        const skill = $(this).find('.skill').val();
        
        if (skill) {
            const item = createSkillItem(skill, template);
            container.append(item);
        }
    });
}

function generateProjects(containerId, template = 'modern') {
    const container = $(`#${containerId}`);
    container.empty();
    
    $('[data-repeater-list="group-d"] [data-repeater-item]').each(function() {
        const title = $(this).find('.proj_title').val();
        const link = $(this).find('.proj_link').val();
        const description = $(this).find('.proj_description').val();
        
        if (title || description) {
            const item = createProjectItem(title, link, description, template);
            container.append(item);
        }
    });
}

// Create template-specific items
function createAchievementItem(title, description, template) {
    const item = $('<div class="preview-item"></div>');
    
    if (template === 'classic') {
        item.html(`
            <span class="fw-600">${title || ''}</span><br>
            <span>${description || ''}</span>
        `);
    } else if (template === 'minimal') {
        item.html(`
            <span class="fw-600">${title || ''}</span>
            <span>${description || ''}</span>
        `);
    } else if (template === 'executive') {
        item.html(`
            <span class="fw-600">${title || ''}</span><br>
            <span>${description || ''}</span>
        `);
    } else {
        // Modern template
        item.html(`
            <span class="fw-600">${title || ''}</span><br>
            <span>${description || ''}</span>
        `);
    }
    
    return item;
}

function createExperienceItem(title, organization, location, startDate, endDate, description, template) {
    const item = $('<div class="preview-item"></div>');
    const dateRange = formatDateRange(startDate, endDate);
    
    if (template === 'classic') {
        item.html(`
            <span class="fw-600">${title || ''}</span><br>
            <span>${organization || ''}${location ? `, ${location}` : ''}</span><br>
            <span class="text-grey">${dateRange}</span><br>
            <span>${description || ''}</span>
        `);
    } else if (template === 'minimal') {
        item.html(`
            <span class="fw-600">${title || ''}</span> at ${organization || ''}<br>
            <span class="text-grey">${dateRange}</span><br>
            <span>${description || ''}</span>
        `);
    } else if (template === 'executive') {
        item.html(`
            <span class="fw-600">${title || ''}</span><br>
            <span>${organization || ''}${location ? `, ${location}` : ''}</span><br>
            <span class="text-grey">${dateRange}</span><br>
            <span>${description || ''}</span>
        `);
    } else {
        // Modern template
        item.html(`
            <span class="fw-600">${title || ''}</span><br>
            <span>${organization || ''}${location ? `, ${location}` : ''}</span><br>
            <span class="text-grey">${dateRange}</span><br>
            <span>${description || ''}</span>
        `);
    }
    
    return item;
}

function createEducationItem(school, degree, city, startDate, graduationDate, description, template) {
    const item = $('<div class="preview-item"></div>');
    const dateRange = formatDateRange(startDate, graduationDate);
    
    if (template === 'classic') {
        item.html(`
            <span class="fw-600">${degree || ''}</span><br>
            <span>${school || ''}${city ? `, ${city}` : ''}</span><br>
            <span class="text-grey">${dateRange}</span><br>
            <span>${description || ''}</span>
        `);
    } else if (template === 'minimal') {
        item.html(`
            <span class="fw-600">${degree || ''}</span><br>
            <span>${school || ''} • ${dateRange}</span><br>
            <span>${description || ''}</span>
        `);
    } else if (template === 'executive') {
        item.html(`
            <span class="fw-600">${degree || ''}</span><br>
            <span>${school || ''}${city ? `, ${city}` : ''}</span><br>
            <span class="text-grey">${dateRange}</span><br>
            <span>${description || ''}</span>
        `);
    } else {
        // Modern template
        item.html(`
            <span class="fw-600">${degree || ''}</span><br>
            <span>${school || ''}${city ? `, ${city}` : ''}</span><br>
            <span class="text-grey">${dateRange}</span><br>
            <span>${description || ''}</span>
        `);
    }
    
    return item;
}

function createSkillItem(skill, template) {
    const item = $('<div class="preview-item"></div>');
    item.text(skill);
    return item;
}

function createProjectItem(title, link, description, template) {
    const item = $('<div class="preview-item"></div>');
    
    if (template === 'classic') {
        item.html(`
            <span class="fw-600">${title || ''}</span><br>
            ${link ? `<span class="text-grey">${link}</span><br>` : ''}
            <span>${description || ''}</span>
        `);
    } else if (template === 'minimal') {
        item.html(`
            <span class="fw-600">${title || ''}</span><br>
            <span>${description || ''}</span>
        `);
    } else if (template === 'executive') {
        item.html(`
            <span class="fw-600">${title || ''}</span><br>
            ${link ? `<span class="text-grey">${link}</span><br>` : ''}
            <span>${description || ''}</span>
        `);
    } else {
        // Modern template
        item.html(`
            <span class="fw-600">${title || ''}</span><br>
            ${link ? `<span class="text-grey">${link}</span><br>` : ''}
            <span>${description || ''}</span>
        `);
    }
    
    return item;
}

// Utility functions
function formatDateRange(startDate, endDate) {
    if (!startDate && !endDate) return '';
    
    const start = startDate ? new Date(startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
    const end = endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Present';
    
    if (start && end) {
        return `${start} - ${end}`;
    } else if (start) {
        return `${start} - Present`;
    } else if (end) {
        return end;
    }
    
    return '';
}

// Form validation
function initializeFormValidation() {
    $('.form-control').on('blur', function() {
        validateField($(this));
    });
    
    $('.form-control').on('input', function() {
        clearFieldError($(this));
    });
}

function validateField(field) {
    const value = field.val().trim();
    const isRequired = field.prop('required');
    
    if (isRequired && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Email validation
    if (field.attr('type') === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    // Phone validation
    if (field.attr('type') === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    showFieldSuccess(field);
    return true;
}

function showFieldError(field, message) {
    field.addClass('error');
    field.siblings('.form-text').text(message).addClass('text-danger');
}

function showFieldSuccess(field) {
    field.removeClass('error').addClass('valid');
    field.siblings('.form-text').text('').removeClass('text-danger');
}

function clearFieldError(field) {
    field.removeClass('error valid');
    field.siblings('.form-text').text('').removeClass('text-danger');
}

// Progress tracking
function initializeProgressTracking() {
    updateProgress();
}

function updateProgress() {
    const totalFields = $('.form-control[required]').length;
    let completedFields = 0;
    
    $('.form-control[required]').each(function() {
        if ($(this).val().trim()) {
            completedFields++;
        }
    });
    
    const percentage = Math.round((completedFields / totalFields) * 100);
    
    // Update progress steps
    updateProgressSteps(percentage);
    
    // Show completion percentage
    showCompletionPercentage(percentage);
}

function updateProgressSteps(percentage) {
    const steps = $('.step');
    
    if (percentage >= 25) {
        steps.eq(0).removeClass('active').addClass('completed');
        steps.eq(1).addClass('active');
    }
    if (percentage >= 50) {
        steps.eq(1).removeClass('active').addClass('completed');
        steps.eq(2).addClass('active');
    }
    if (percentage >= 75) {
        steps.eq(2).removeClass('active').addClass('completed');
        steps.eq(3).addClass('active');
    }
    if (percentage >= 100) {
        steps.eq(3).removeClass('active').addClass('completed');
    }
}

function showCompletionPercentage(percentage) {
    let completionElement = $('.completion-percentage');
    
    if (completionElement.length === 0) {
        completionElement = $(`
            <div class="completion-percentage">
                <div class="percentage-text">Resume Completion: ${percentage}%</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `);
        $('.progress-indicator').after(completionElement);
    } else {
        completionElement.find('.percentage-text').text(`Resume Completion: ${percentage}%`);
        completionElement.find('.progress-fill').css('width', `${percentage}%`);
    }
}

// Keyboard shortcuts
function initializeKeyboardShortcuts() {
    $(document).on('keydown', function(e) {
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveResume();
        }
        
        // Ctrl/Cmd + P to print
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            printCV();
        }
    });
}

// Tooltips
function initializeTooltips() {
    $('[data-tooltip]').on('mouseenter', function() {
        const tooltip = $(this).data('tooltip');
        showTooltip($(this), tooltip);
    }).on('mouseleave', function() {
        hideTooltip();
    });
}

function showTooltip(element, text) {
    const tooltip = $(`<div class="tooltip">${text}</div>`);
    $('body').append(tooltip);
    
    const rect = element[0].getBoundingClientRect();
    tooltip.css({
        top: rect.top - tooltip.outerHeight() - 10,
        left: rect.left + (rect.width / 2) - (tooltip.outerWidth() / 2)
    });
}

function hideTooltip() {
    $('.tooltip').remove();
}

// Action functions
function printCV() {
    window.print();
    showNotification('Print dialog opened', 'info');
}

function downloadPDF() {
    // Placeholder for PDF download functionality
    showNotification('PDF download feature coming soon!', 'info');
}

function saveResume() {
    saveFormData();
    showNotification('Resume saved successfully', 'success');
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = $(`
        <div class="notification notification-${type}">
            <div class="notification-content">
                <span class="notification-message">${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        </div>
    `);
    
    $('body').append(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
    
    // Manual close
    notification.find('.notification-close').on('click', function() {
        notification.remove();
    });
}

// Image preview
function previewImage() {
    const file = document.getElementById('image').files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            $('#image_dsp').attr('src', e.target.result);
        };
        reader.readAsDataURL(file);
    }
}

// Form reset confirmation
function resetForm() {
    if (confirm('Are you sure you want to reset the form? All data will be lost.')) {
        $('#cv-form')[0].reset();
        $('.repeater').repeaterVal([]);
        generateCV();
        localStorage.removeItem('resumeData');
        showNotification('Form reset successfully', 'success');
    }
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Accessibility improvements
function initializeAccessibility() {
    // Add ARIA labels
    $('.form-control').each(function() {
        const label = $(this).siblings('.form-label').text();
        $(this).attr('aria-label', label);
    });
    
    // Add focus indicators
    $('.form-control, .btn').on('focus', function() {
        $(this).addClass('focused');
    }).on('blur', function() {
        $(this).removeClass('focused');
    });
}

// Auto-resize textareas
function initializeAutoResize() {
    $('textarea').on('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
}

// File input styling
function initializeFileInputs() {
    $('input[type="file"]').on('change', function() {
        const fileName = this.files[0]?.name;
        if (fileName) {
            $(this).siblings('.file-info').text(`Selected: ${fileName}`);
        }
    });
}