module.exports = {
    'en': {
        page: 'Page',
        regexps: {
            languageProficiency: /proficiency\)$/
        },
        sectionHeaders: {
            'Summary': { text: 'Summary', section: 'bio' },
            'Languages': { text: 'Languages', section: 'languages' },
            'Education': { text: 'Education', section: 'educationExperience' },
            'Experience': { text: 'Experience', section: 'workExperience' },
            'Skills & Expertise': { text: 'Skills & Expertise', section: 'skills' },
            'Volunteer Experience': { text: 'Volunteer Experience', section: 'volunteerExperience' },
            'Unsupported': { text: 'Unsupported', section: 'unsupported' }
        },
        unSupportedSections: ['Publications', 'Projects', 'Certifications', 'Organizations', 'Test Scores', 'Specialties', 'Honors and Awards', 'Interests', 'Courses', 'recommendations', 'Patents']
    },
    'pt': {
        page: 'Página',
        regexps: {
            languageProficiency: /proficiency\)$/
        },
        sectionHeaders: {
            'Summary': { text: 'Resumo', section: 'bio' },
            'Languages': { text: 'Idiomas', section: 'languages' },
            'Education': { text: 'Formação acadêmica', section: 'educationExperience' },
            'Experience': { text: 'Experiência', section: 'workExperience' },
            'Skills & Expertise': { text: 'Competências e especialidades', section: 'skills' },
            'Volunteer Experience': { text: 'Experiência voluntária', section: 'volunteerExperience' },
            'Unsupported': { text: 'Sem suporte', section: 'unsupported' }
        },
        unSupportedSections: ['Publicações', 'Projetos', 'Certificações', 'Organizações', 'Resultados dos testes', 'Especialidades', 'Honras e Prêmios', 'Interesses', 'Cursos', 'recomendou', 'Patentes']
    },
    'es': {
        page: 'Página',
        regexps: {
            languageProficiency: /^\(Competencia/
        },
        sectionHeaders: {
            'Summary': { text: 'Resumen', section: 'bio' },
            'Languages': { text: 'Idiomas', section: 'languages' },
            'Education': { text: 'Educación', section: 'educationExperience' },
            'Experience': { text: 'Experiencia', section: 'workExperience' },
            'Skills & Expertise': { text: 'Aptitudes y conocimientos', section: 'skills' },
            'Volunteer Experience': { text: 'Experiencia como voluntario', section: 'volunteerExperience' },
            'Unsupported': { text: 'No admitido', section: 'unsupported' }
        },
        unSupportedSections: ['Publicaciones', 'Proyectos', 'Certificaciones', 'Organizaciones', 'Resultados de Prueba', 'Especialidades', 'Honores y Premios', 'Intereses', 'Cursos', 'recomendado', 'Patentes']
    }
};
