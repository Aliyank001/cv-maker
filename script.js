// CV Maker Application
class CVMaker {
    constructor() {
        this.currentTemplate = 'modern';
        this.hiddenSections = new Set();
        this.skills = [];
        this.experienceCount = 1;
        this.educationCount = 1;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updatePreview();
        this.initializeDragAndDrop();
    }

    setupEventListeners() {
        // Template selection
        document.querySelectorAll('.template-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.template-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTemplate = e.target.dataset.template;
                this.updatePreview();
            });
        });

        // Color and font customization
        document.getElementById('primaryColor').addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--primary-color', e.target.value);
            this.updatePreview();
        });

        document.getElementById('accentColor').addEventListener('input', (e) => {
            document.documentElement.style.setProperty('--accent-color', e.target.value);
            this.updatePreview();
        });

        document.getElementById('fontFamily').addEventListener('change', (e) => {
            document.documentElement.style.setProperty('--font-family', `'${e.target.value}', sans-serif`);
            this.updatePreview();
        });

        // Form inputs
        const formInputs = document.querySelectorAll('input, textarea, select');
        formInputs.forEach(input => {
            if (input.type !== 'file' && input.type !== 'color') {
                input.addEventListener('input', () => {
                    this.validateInput(input);
                    this.updatePreview();
                });
            }
        });

        // Profile picture upload
        document.getElementById('profilePicture').addEventListener('change', (e) => {
            this.handleImageUpload(e);
        });

        // Skills input
        document.getElementById('skillsInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addSkill(e.target.value.trim());
                e.target.value = '';
            }
        });

        // Dynamic sections
        document.querySelectorAll('.add-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.addDynamicItem(e.target.dataset.section);
            });
        });

        // Section toggle
        document.querySelectorAll('.toggle-section').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.toggleSection(e.target.dataset.section, e.target);
            });
        });

        // PDF download
        document.getElementById('downloadPDF').addEventListener('click', () => {
            this.downloadPDF();
        });

        // Dynamic item removal
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-item')) {
                e.target.closest('.dynamic-item').remove();
                this.updatePreview();
            }
            if (e.target.classList.contains('remove-skill')) {
                const skillText = e.target.parentElement.textContent.replace('×', '').trim();
                this.removeSkill(skillText);
            }
        });

        // Dynamic form updates
        document.addEventListener('input', (e) => {
            if (e.target.closest('.dynamic-item')) {
                this.updatePreview();
            }
        });

        // Current position checkbox
        document.addEventListener('change', (e) => {
            if (e.target.name === 'current') {
                const endDateInput = e.target.closest('.dynamic-item').querySelector('input[name="endDate"]');
                endDateInput.disabled = e.target.checked;
                if (e.target.checked) {
                    endDateInput.value = '';
                }
                this.updatePreview();
            }
        });
    }

    validateInput(input) {
        const errorElement = input.nextElementSibling;
        if (!errorElement || !errorElement.classList.contains('error-message')) return;

        let isValid = true;
        let errorMessage = '';

        if (input.hasAttribute('required') && !input.value.trim()) {
            isValid = false;
            errorMessage = 'This field is required';
        } else if (input.type === 'email' && input.value && !this.isValidEmail(input.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        } else if (input.type === 'url' && input.value && !this.isValidURL(input.value)) {
            isValid = false;
            errorMessage = 'Please enter a valid URL';
        }

        if (isValid) {
            input.classList.remove('error');
            errorElement.classList.remove('show');
        } else {
            input.classList.add('error');
            errorElement.textContent = errorMessage;
            errorElement.classList.add('show');
        }

        return isValid;
    }

    isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.profileImageData = e.target.result;
                this.updatePreview();
            };
            reader.readAsDataURL(file);
        }
    }

    addSkill(skill) {
        if (skill && !this.skills.includes(skill)) {
            this.skills.push(skill);
            this.renderSkills();
            this.updatePreview();
        }
    }

    removeSkill(skill) {
        this.skills = this.skills.filter(s => s !== skill);
        this.renderSkills();
        this.updatePreview();
    }

    renderSkills() {
        const skillsList = document.getElementById('skillsList');
        skillsList.innerHTML = this.skills.map(skill => 
            `<div class="skill-tag">
                ${skill}
                <button type="button" class="remove-skill">×</button>
            </div>`
        ).join('');
    }

    addDynamicItem(section) {
        const container = document.getElementById(`${section}Container`);
        const count = section === 'experience' ? ++this.experienceCount : ++this.educationCount;
        
        const template = this.getDynamicItemTemplate(section, count);
        container.insertAdjacentHTML('beforeend', template);
        this.updatePreview();
    }

    getDynamicItemTemplate(section, index) {
        if (section === 'experience') {
            return `
                <div class="dynamic-item" data-index="${index - 1}">
                    <div class="item-header">
                        <span class="drag-handle">⋮⋮</span>
                        <span class="item-title">Experience ${index}</span>
                        <button type="button" class="remove-item">×</button>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Job Title</label>
                            <input type="text" name="jobTitle">
                        </div>
                        <div class="form-group">
                            <label>Company</label>
                            <input type="text" name="company">
                        </div>
                        <div class="form-group">
                            <label>Start Date</label>
                            <input type="month" name="startDate">
                        </div>
                        <div class="form-group">
                            <label>End Date</label>
                            <input type="month" name="endDate">
                            <label class="checkbox-label">
                                <input type="checkbox" name="current"> Current Position
                            </label>
                        </div>
                        <div class="form-group full-width">
                            <label>Description</label>
                            <textarea name="description" rows="3" placeholder="Describe your responsibilities and achievements..."></textarea>
                        </div>
                    </div>
                </div>
            `;
        } else if (section === 'education') {
            return `
                <div class="dynamic-item" data-index="${index - 1}">
                    <div class="item-header">
                        <span class="drag-handle">⋮⋮</span>
                        <span class="item-title">Education ${index}</span>
                        <button type="button" class="remove-item">×</button>
                    </div>
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Degree</label>
                            <input type="text" name="degree">
                        </div>
                        <div class="form-group">
                            <label>Institution</label>
                            <input type="text" name="institution">
                        </div>
                        <div class="form-group">
                            <label>Start Date</label>
                            <input type="month" name="startDate">
                        </div>
                        <div class="form-group">
                            <label>End Date</label>
                            <input type="month" name="endDate">
                        </div>
                        <div class="form-group full-width">
                            <label>Description</label>
                            <textarea name="description" rows="2" placeholder="Relevant coursework, achievements, GPA..."></textarea>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    toggleSection(section, button) {
        if (this.hiddenSections.has(section)) {
            this.hiddenSections.delete(section);
            button.textContent = 'Hide';
        } else {
            this.hiddenSections.add(section);
            button.textContent = 'Show';
        }
        this.updatePreview();
    }

    initializeDragAndDrop() {
        const containers = document.querySelectorAll('.dynamic-container');
        containers.forEach(container => {
            new Sortable(container, {
                handle: '.drag-handle',
                animation: 150,
                ghostClass: 'dragging',
                onEnd: () => {
                    this.updatePreview();
                }
            });
        });
    }

    updatePreview() {
        const preview = document.getElementById('cvPreview');
        preview.className = `cv-preview ${this.currentTemplate}-template`;
        
        const data = this.collectFormData();
        preview.innerHTML = this.generateCVHTML(data);
    }

    collectFormData() {
        const data = {
            personal: {
                fullName: document.getElementById('fullName').value,
                jobTitle: document.getElementById('jobTitle').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                location: document.getElementById('location').value,
                website: document.getElementById('website').value,
                summary: document.getElementById('summary').value,
                profileImage: this.profileImageData || './public/assets/profile-placeholder.jpg'
            },
            experience: this.collectDynamicData('experience'),
            education: this.collectDynamicData('education'),
            skills: this.skills,
            hiddenSections: this.hiddenSections
        };
        
        return data;
    }

    collectDynamicData(section) {
        const container = document.getElementById(`${section}Container`);
        const items = container.querySelectorAll('.dynamic-item');
        
        return Array.from(items).map(item => {
            const data = {};
            const inputs = item.querySelectorAll('input, textarea');
            
            inputs.forEach(input => {
                if (input.type === 'checkbox') {
                    data[input.name] = input.checked;
                } else {
                    data[input.name] = input.value;
                }
            });
            
            return data;
        });
    }

    generateCVHTML(data) {
        switch (this.currentTemplate) {
            case 'modern':
                return this.generateModernTemplate(data);
            case 'classic':
                return this.generateClassicTemplate(data);
            case 'creative':
                return this.generateCreativeTemplate(data);
            default:
                return this.generateModernTemplate(data);
        }
    }

    generateModernTemplate(data) {
        const { personal, experience, education, skills, hiddenSections } = data;
        
        return `
            <div class="cv-sidebar">
                ${personal.profileImage ? `<img src="${personal.profileImage}" alt="Profile" class="cv-profile-img">` : ''}
                ${personal.fullName ? `<h1 class="cv-name">${personal.fullName}</h1>` : ''}
                ${personal.jobTitle ? `<p class="cv-title">${personal.jobTitle}</p>` : ''}
                
                <div class="cv-contact">
                    ${personal.email ? `<div class="cv-contact-item">📧 ${personal.email}</div>` : ''}
                    ${personal.phone ? `<div class="cv-contact-item">📞 ${personal.phone}</div>` : ''}
                    ${personal.location ? `<div class="cv-contact-item">📍 ${personal.location}</div>` : ''}
                    ${personal.website ? `<div class="cv-contact-item">🌐 ${personal.website}</div>` : ''}
                </div>
                
                ${!hiddenSections.has('skills') && skills.length > 0 ? `
                    <div class="cv-section">
                        <h3 class="cv-section-title">Skills</h3>
                        <div class="cv-skills-grid">
                            ${skills.map(skill => `<span class="cv-skill">${skill}</span>`).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
            
            <div class="cv-main">
                ${!hiddenSections.has('summary') && personal.summary ? `
                    <div class="cv-section">
                        <h3 class="cv-section-title">Professional Summary</h3>
                        <p class="cv-summary">${personal.summary}</p>
                    </div>
                ` : ''}
                
                ${!hiddenSections.has('experience') && experience.length > 0 ? `
                    <div class="cv-section">
                        <h3 class="cv-section-title">Work Experience</h3>
                        ${experience.map(exp => `
                            <div class="cv-item">
                                <div class="cv-item-header">
                                    <div>
                                        ${exp.jobTitle ? `<div class="cv-item-title">${exp.jobTitle}</div>` : ''}
                                        ${exp.company ? `<div class="cv-item-subtitle">${exp.company}</div>` : ''}
                                    </div>
                                    <div class="cv-item-date">
                                        ${this.formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                    </div>
                                </div>
                                ${exp.description ? `<p class="cv-item-description">${exp.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
                
                ${!hiddenSections.has('education') && education.length > 0 ? `
                    <div class="cv-section">
                        <h3 class="cv-section-title">Education</h3>
                        ${education.map(edu => `
                            <div class="cv-item">
                                <div class="cv-item-header">
                                    <div>
                                        ${edu.degree ? `<div class="cv-item-title">${edu.degree}</div>` : ''}
                                        ${edu.institution ? `<div class="cv-item-subtitle">${edu.institution}</div>` : ''}
                                    </div>
                                    <div class="cv-item-date">
                                        ${this.formatDateRange(edu.startDate, edu.endDate)}
                                    </div>
                                </div>
                                ${edu.description ? `<p class="cv-item-description">${edu.description}</p>` : ''}
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
    }

    generateClassicTemplate(data) {
        const { personal, experience, education, skills, hiddenSections } = data;
        
        return `
            <div class="cv-header">
                ${personal.profileImage ? `<img src="${personal.profileImage}" alt="Profile" class="cv-profile-img">` : ''}
                ${personal.fullName ? `<h1 class="cv-name">${personal.fullName}</h1>` : ''}
                ${personal.jobTitle ? `<p class="cv-title">${personal.jobTitle}</p>` : ''}
                
                <div class="cv-contact">
                    ${personal.email ? `<span class="cv-contact-item">${personal.email}</span>` : ''}
                    ${personal.phone ? `<span class="cv-contact-item">${personal.phone}</span>` : ''}
                    ${personal.location ? `<span class="cv-contact-item">${personal.location}</span>` : ''}
                    ${personal.website ? `<span class="cv-contact-item">${personal.website}</span>` : ''}
                </div>
            </div>
            
            ${!hiddenSections.has('summary') && personal.summary ? `
                <div class="cv-section">
                    <h3 class="cv-section-title">Professional Summary</h3>
                    <p class="cv-summary">${personal.summary}</p>
                </div>
            ` : ''}
            
            ${!hiddenSections.has('experience') && experience.length > 0 ? `
                <div class="cv-section">
                    <h3 class="cv-section-title">Work Experience</h3>
                    ${experience.map(exp => `
                        <div class="cv-item">
                            <div class="cv-item-header">
                                ${exp.jobTitle ? `<div class="cv-item-title">${exp.jobTitle}</div>` : ''}
                                ${exp.company ? `<div class="cv-item-subtitle">${exp.company}</div>` : ''}
                                <div class="cv-item-date">
                                    ${this.formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                </div>
                            </div>
                            ${exp.description ? `<p class="cv-item-description">${exp.description}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${!hiddenSections.has('education') && education.length > 0 ? `
                <div class="cv-section">
                    <h3 class="cv-section-title">Education</h3>
                    ${education.map(edu => `
                        <div class="cv-item">
                            <div class="cv-item-header">
                                ${edu.degree ? `<div class="cv-item-title">${edu.degree}</div>` : ''}
                                ${edu.institution ? `<div class="cv-item-subtitle">${edu.institution}</div>` : ''}
                                <div class="cv-item-date">
                                    ${this.formatDateRange(edu.startDate, edu.endDate)}
                                </div>
                            </div>
                            ${edu.description ? `<p class="cv-item-description">${edu.description}</p>` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            ${!hiddenSections.has('skills') && skills.length > 0 ? `
                <div class="cv-section">
                    <h3 class="cv-section-title">Skills</h3>
                    <div class="cv-skills-grid">
                        ${skills.map(skill => `<span class="cv-skill">${skill}</span>`).join('')}
                    </div>
                </div>
            ` : ''}
        `;
    }

    generateCreativeTemplate(data) {
        const { personal, experience, education, skills, hiddenSections } = data;
        
        return `
            <div class="cv-content">
                <div class="cv-left">
                    ${personal.profileImage ? `<img src="${personal.profileImage}" alt="Profile" class="cv-profile-img">` : ''}
                    ${personal.fullName ? `<h1 class="cv-name">${personal.fullName}</h1>` : ''}
                    ${personal.jobTitle ? `<p class="cv-title">${personal.jobTitle}</p>` : ''}
                    
                    <div class="cv-contact">
                        ${personal.email ? `<div class="cv-contact-item">📧 ${personal.email}</div>` : ''}
                        ${personal.phone ? `<div class="cv-contact-item">📞 ${personal.phone}</div>` : ''}
                        ${personal.location ? `<div class="cv-contact-item">📍 ${personal.location}</div>` : ''}
                        ${personal.website ? `<div class="cv-contact-item">🌐 ${personal.website}</div>` : ''}
                    </div>
                    
                    ${!hiddenSections.has('skills') && skills.length > 0 ? `
                        <div class="cv-section">
                            <h3 class="cv-section-title">Skills</h3>
                            <div class="cv-skills-grid">
                                ${skills.map(skill => `<span class="cv-skill">${skill}</span>`).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>
                
                <div class="cv-right">
                    ${!hiddenSections.has('summary') && personal.summary ? `
                        <div class="cv-section">
                            <h3 class="cv-section-title">Professional Summary</h3>
                            <p class="cv-summary">${personal.summary}</p>
                        </div>
                    ` : ''}
                    
                    ${!hiddenSections.has('experience') && experience.length > 0 ? `
                        <div class="cv-section">
                            <h3 class="cv-section-title">Work Experience</h3>
                            ${experience.map(exp => `
                                <div class="cv-item">
                                    <div class="cv-item-header">
                                        ${exp.jobTitle ? `<div class="cv-item-title">${exp.jobTitle}</div>` : ''}
                                        ${exp.company ? `<div class="cv-item-subtitle">${exp.company}</div>` : ''}
                                        <div class="cv-item-date">
                                            ${this.formatDateRange(exp.startDate, exp.endDate, exp.current)}
                                        </div>
                                    </div>
                                    ${exp.description ? `<p class="cv-item-description">${exp.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                    
                    ${!hiddenSections.has('education') && education.length > 0 ? `
                        <div class="cv-section">
                            <h3 class="cv-section-title">Education</h3>
                            ${education.map(edu => `
                                <div class="cv-item">
                                    <div class="cv-item-header">
                                        ${edu.degree ? `<div class="cv-item-title">${edu.degree}</div>` : ''}
                                        ${edu.institution ? `<div class="cv-item-subtitle">${edu.institution}</div>` : ''}
                                        <div class="cv-item-date">
                                            ${this.formatDateRange(edu.startDate, edu.endDate)}
                                        </div>
                                    </div>
                                    ${edu.description ? `<p class="cv-item-description">${edu.description}</p>` : ''}
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    formatDateRange(startDate, endDate, isCurrent = false) {
        if (!startDate) return '';
        
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            const [year, month] = dateStr.split('-');
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            return `${monthNames[parseInt(month) - 1]} ${year}`;
        };
        
        const start = formatDate(startDate);
        const end = isCurrent ? 'Present' : formatDate(endDate);
        
        return end ? `${start} - ${end}` : start;
    }

    async downloadPDF() {
        const button = document.getElementById('downloadPDF');
        const originalText = button.textContent;
        button.textContent = 'Generating PDF...';
        button.disabled = true;

        try {
            // Check if libraries are loaded
            if (typeof window.html2canvas === 'undefined') {
                throw new Error('html2canvas library not loaded');
            }

            const element = document.getElementById('cvPreview');
            const canvas = await window.html2canvas(element, {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            const imgData = canvas.toDataURL('image/png');
            
            // Get jsPDF from the global scope
            const jsPDF = window.jspdf?.jsPDF || window.jsPDF;
            if (!jsPDF) {
                throw new Error('jsPDF library not loaded');
            }
            
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210;
            const pageHeight = 297;
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            const fileName = document.getElementById('fullName').value || 'CV';
            pdf.save(`${fileName.replace(/\s+/g, '_')}_CV.pdf`);
        } catch (error) {
            console.error('Error generating PDF:', error);
            alert('Error generating PDF: ' + error.message + '\nPlease check the console for details.');
        } finally {
            button.textContent = originalText;
            button.disabled = false;
        }
    }
}

// Sortable functionality for drag and drop
class Sortable {
    constructor(container, options = {}) {
        this.container = container;
        this.options = options;
        this.init();
    }

    init() {
        this.container.addEventListener('dragstart', this.handleDragStart.bind(this));
        this.container.addEventListener('dragover', this.handleDragOver.bind(this));
        this.container.addEventListener('drop', this.handleDrop.bind(this));
        this.container.addEventListener('dragend', this.handleDragEnd.bind(this));

        // Make items draggable
        this.updateDraggableItems();
    }

    updateDraggableItems() {
        const items = this.container.querySelectorAll('.dynamic-item');
        items.forEach(item => {
            item.draggable = true;
        });
    }

    handleDragStart(e) {
        if (!e.target.closest('.drag-handle')) return;
        
        this.draggedElement = e.target.closest('.dynamic-item');
        this.draggedElement.classList.add(this.options.ghostClass || 'dragging');
        e.dataTransfer.effectAllowed = 'move';
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        const afterElement = this.getDragAfterElement(e.clientY);
        if (afterElement == null) {
            this.container.appendChild(this.draggedElement);
        } else {
            this.container.insertBefore(this.draggedElement, afterElement);
        }
    }

    handleDrop(e) {
        e.preventDefault();
    }

    handleDragEnd(e) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove(this.options.ghostClass || 'dragging');
            this.draggedElement = null;
            
            if (this.options.onEnd) {
                this.options.onEnd();
            }
        }
    }

    getDragAfterElement(y) {
        const draggableElements = [...this.container.querySelectorAll('.dynamic-item:not(.dragging)')];
        
        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    new CVMaker();
});